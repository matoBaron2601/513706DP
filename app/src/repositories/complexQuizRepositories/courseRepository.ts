import { eq, inArray } from 'drizzle-orm';
import {
	course,
	type CourseDto,
	type CreateCourseDto,
	type UpdateCourseDto
} from '../../db/schema';
import type { Transaction } from '../../types';
import getDbClient from '../utils/getDbClient';

export class CourseRepository {
	async getById(id: string, tx?: Transaction): Promise<CourseDto | undefined> {
		const result = await getDbClient(tx).select().from(course).where(eq(course.id, id));
		return result[0];
	}

	async getByCreatorId(creatorId: string, tx?: Transaction): Promise<CourseDto[]> {
		return await getDbClient(tx).select().from(course).where(eq(course.creatorId, creatorId));
	}

	async create(newCourse: CreateCourseDto, tx?: Transaction): Promise<CourseDto> {
		const result = await getDbClient(tx).insert(course).values(newCourse).returning();
		return result[0];
	}

	async update(
		id: string,
		updateCourse: UpdateCourseDto,
		tx?: Transaction
	): Promise<CourseDto | undefined> {
		const result = await getDbClient(tx)
			.update(course)
			.set(updateCourse)
			.where(eq(course.id, id))
			.returning();
		return result[0];
	}

	async delete(id: string, tx?: Transaction): Promise<CourseDto | undefined> {
		const result = await getDbClient(tx).delete(course).where(eq(course.id, id)).returning();
		return result[0];
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<CourseDto[]> {
		return await getDbClient(tx).select().from(course).where(inArray(course.id, ids));
	}

	async getAll(tx?: Transaction): Promise<CourseDto[]> {
		return await getDbClient(tx).select().from(course);
	}
}
