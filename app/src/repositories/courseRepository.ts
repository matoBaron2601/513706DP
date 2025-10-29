import { eq, inArray, isNull } from 'drizzle-orm';
import { course, type CreateCourseDto, type UpdateCourseDto, type CourseDto } from '../db/schema';
import type { Transaction } from '../types';
import getDbClient from './utils/getDbClient';

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

	async getAll(tx?: Transaction): Promise<CourseDto[]> {
		return await getDbClient(tx).select().from(course).where(isNull(course.deletedAt));
	}
}
