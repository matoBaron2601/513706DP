import { eq, inArray, isNull, SQL, ilike, sql, and, asc, desc, or } from 'drizzle-orm';
import {
	course,
	type CreateCourseDto,
	type UpdateCourseDto,
	type CourseDto,
	block
} from '../db/schema';
import type { Transaction } from '../types';
import getDbClient from './utils/getDbClient';
import type { GetCoursesRequest, GetCoursesResponse } from '../schemas/courseSchema';

export type CourseWithBlocksCount = CourseDto & { blocksCount: number };

export class CourseRepository {
	async getById(courseId: string, tx?: Transaction): Promise<CourseDto | undefined> {
		const result = await getDbClient(tx).select().from(course).where(eq(course.id, courseId));
		return result[0];
	}

	async create(newCourse: CreateCourseDto, tx?: Transaction): Promise<CourseDto> {
		const result = await getDbClient(tx).insert(course).values(newCourse).returning();
		return result[0];
	}

	async update(
		courseId: string,
		updateCourse: UpdateCourseDto,
		tx?: Transaction
	): Promise<CourseDto | undefined> {
		const result = await getDbClient(tx)
			.update(course)
			.set(updateCourse)
			.where(eq(course.id, courseId))
			.returning();
		return result[0];
	}

	async delete(courseId: string, tx?: Transaction): Promise<CourseDto | undefined> {
		const result = await getDbClient(tx).delete(course).where(eq(course.id, courseId)).returning();
		return result[0];
	}

	async getByIds(courseIds: string[], tx?: Transaction): Promise<CourseDto[]> {
		return await getDbClient(tx).select().from(course).where(inArray(course.id, courseIds));
	}

	async getManyByCreatorId(creatorId: string, tx?: Transaction): Promise<CourseDto[]> {
		return await getDbClient(tx).select().from(course).where(eq(course.creatorId, creatorId));
	}
	async getAll(
		{
			name,
			creatorId,
			minBlocks,
			maxBlocks,
			sortBy = 'createdAt',
			sortDir = 'desc'
		}: GetCoursesRequest = {},
		tx?: Transaction
	): Promise<GetCoursesResponse[]> {
		const db = getDbClient(tx);
		const where = and(
			isNull(course.deletedAt),
			or(eq(course.published, true), creatorId ? eq(course.creatorId, creatorId) : undefined),
			creatorId ? eq(course.creatorId, creatorId) : undefined,
			name ? ilike(course.name, `%${name}%`) : undefined
		);

		const having = and(
			minBlocks ? sql`count(${block.id}) >= ${minBlocks}` : undefined,
			maxBlocks ? sql`count(${block.id}) <= ${maxBlocks}` : undefined
		);

		const base = db
			.select({
				id: course.id,
				name: course.name,
				creatorId: course.creatorId,
				createdAt: course.createdAt,
				updatedAt: course.updatedAt,
				deletedAt: course.deletedAt,
				published: course.published,
				blocksCount: sql<number>`count(${block.id})`
			})
			.from(course)
			.leftJoin(block, eq(block.courseId, course.id))
			.where(where)
			.groupBy(course.id);

		const withHaving = having ? base.having(having) : base;

		const orderExpr =
			sortBy === 'name'
				? sortDir === 'asc'
					? asc(course.name)
					: desc(course.name)
				: sortBy === 'blocksCount'
					? sortDir === 'asc'
						? sql`count(${block.id}) asc`
						: sql`count(${block.id}) desc`
					: sortDir === 'asc'
						? asc(course.createdAt)
						: desc(course.createdAt);

		const rows = await withHaving.orderBy(orderExpr);

		return rows;
	}
}
