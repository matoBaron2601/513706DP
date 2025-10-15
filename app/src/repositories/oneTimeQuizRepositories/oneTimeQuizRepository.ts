import { eq, inArray } from 'drizzle-orm';
import {
	oneTimeQuiz,
	type OneTimeQuizDto,
	type CreateOneTimeQuizDto,
	type UpdateOneTimeQuizDto
} from '../../db/schema';
import type { Transaction } from '../../types';
import getDbClient from '../utils/getDbClient';

export class OneTimeQuizRepository {
	async getById(id: string, tx?: Transaction): Promise<OneTimeQuizDto | undefined> {
		const result = await getDbClient(tx).select().from(oneTimeQuiz).where(eq(oneTimeQuiz.id, id));
		return result[0];
	}

	async getByCreatorId(creatorId: string, tx?: Transaction): Promise<OneTimeQuizDto[]> {
		return await getDbClient(tx)
			.select()
			.from(oneTimeQuiz)
			.where(eq(oneTimeQuiz.creatorId, creatorId));
	}

	async getByBaseQuizId(baseQuizId: string, tx?: Transaction): Promise<OneTimeQuizDto[]> {
		return await getDbClient(tx)
			.select()
			.from(oneTimeQuiz)
			.where(eq(oneTimeQuiz.baseQuizId, baseQuizId));
	}

	async create(newQuiz: CreateOneTimeQuizDto, tx?: Transaction): Promise<OneTimeQuizDto> {
		const result = await getDbClient(tx).insert(oneTimeQuiz).values(newQuiz).returning();
		return result[0];
	}

	async update(
		id: string,
		updateQuiz: UpdateOneTimeQuizDto,
		tx?: Transaction
	): Promise<OneTimeQuizDto | undefined> {
		const result = await getDbClient(tx)
			.update(oneTimeQuiz)
			.set(updateQuiz)
			.where(eq(oneTimeQuiz.id, id))
			.returning();
		return result[0];
	}

	async delete(id: string, tx?: Transaction): Promise<OneTimeQuizDto | undefined> {
		const result = await getDbClient(tx)
			.delete(oneTimeQuiz)
			.where(eq(oneTimeQuiz.id, id))
			.returning();
		return result[0];
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<OneTimeQuizDto[]> {
		return await getDbClient(tx).select().from(oneTimeQuiz).where(inArray(oneTimeQuiz.id, ids));
	}
}
