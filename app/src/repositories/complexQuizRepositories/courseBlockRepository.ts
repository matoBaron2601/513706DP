import { eq, inArray } from 'drizzle-orm';
import {
	courseBlock,
	type CourseBlockDto,
	type CreateCourseBlockDto,
	type UpdateCourseBlockDto
} from '../../db/schema';
import type { Transaction } from '../../types';
import getDbClient from '../utils/getDbClient';

export class CourseBlockRepository {
	async getById(id: string, tx?: Transaction): Promise<CourseBlockDto | undefined> {
		const result = await getDbClient(tx).select().from(courseBlock).where(eq(courseBlock.id, id));
		return result[0];
	}

	async getByCourseId(courseId: string, tx?: Transaction): Promise<CourseBlockDto[]> {
		return await getDbClient(tx)
			.select()
			.from(courseBlock)
			.where(eq(courseBlock.courseId, courseId));
	}

	async create(newBlock: CreateCourseBlockDto, tx?: Transaction): Promise<CourseBlockDto> {
		const result = await getDbClient(tx).insert(courseBlock).values(newBlock).returning();
		return result[0];
	}

	async update(
		id: string,
		updateBlock: UpdateCourseBlockDto,
		tx?: Transaction
	): Promise<CourseBlockDto | undefined> {
		const result = await getDbClient(tx)
			.update(courseBlock)
			.set(updateBlock)
			.where(eq(courseBlock.id, id))
			.returning();
		return result[0];
	}

	async delete(id: string, tx?: Transaction): Promise<CourseBlockDto | undefined> {
		const result = await getDbClient(tx)
			.delete(courseBlock)
			.where(eq(courseBlock.id, id))
			.returning();
		return result[0];
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<CourseBlockDto[]> {
		return await getDbClient(tx).select().from(courseBlock).where(inArray(courseBlock.id, ids));
	}

	async getAll(tx?: Transaction): Promise<CourseBlockDto[]> {
		return await getDbClient(tx).select().from(courseBlock);
	}
}
