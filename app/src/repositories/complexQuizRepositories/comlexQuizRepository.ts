import { eq, inArray } from 'drizzle-orm';
import {
	complexQuiz,
	type ComplexQuizDto,
	type CreateComplexQuizDto,
	type UpdateComplexQuizDto
} from '../../db/schema';
import type { Transaction } from '../../types';
import getDbClient from '../utils/getDbClient';

export class ComplexQuizRepository {
	async getById(id: string, tx?: Transaction): Promise<ComplexQuizDto | undefined> {
		const result = await getDbClient(tx).select().from(complexQuiz).where(eq(complexQuiz.id, id));
		return result[0];
	}

	async getByBaseQuizId(baseQuizId: string, tx?: Transaction): Promise<ComplexQuizDto[]> {
		return await getDbClient(tx)
			.select()
			.from(complexQuiz)
			.where(eq(complexQuiz.baseQuizId, baseQuizId));
	}

	async getByCourseBlockId(courseBlockId: string, tx?: Transaction): Promise<ComplexQuizDto[]> {
		return await getDbClient(tx)
			.select()
			.from(complexQuiz)
			.where(eq(complexQuiz.courseBlockId, courseBlockId));
	}

	async create(newQuiz: CreateComplexQuizDto, tx?: Transaction): Promise<ComplexQuizDto> {
		const result = await getDbClient(tx).insert(complexQuiz).values(newQuiz).returning();
		return result[0];
	}

	async update(
		id: string,
		updateQuiz: UpdateComplexQuizDto,
		tx?: Transaction
	): Promise<ComplexQuizDto | undefined> {
		const result = await getDbClient(tx)
			.update(complexQuiz)
			.set(updateQuiz)
			.where(eq(complexQuiz.id, id))
			.returning();
		return result[0];
	}

	async delete(id: string, tx?: Transaction): Promise<ComplexQuizDto | undefined> {
		const result = await getDbClient(tx)
			.delete(complexQuiz)
			.where(eq(complexQuiz.id, id))
			.returning();
		return result[0];
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<ComplexQuizDto[]> {
		return await getDbClient(tx).select().from(complexQuiz).where(inArray(complexQuiz.id, ids));
	}
}
