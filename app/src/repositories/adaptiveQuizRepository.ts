import { eq, inArray } from 'drizzle-orm';
import {
	adaptiveQuiz,
	type CreateAdaptiveQuizDto,
	type UpdateAdaptiveQuizDto,
	type AdaptiveQuizDto
} from '../db/schema';
import type { Transaction } from '../types';
import getDbClient from './utils/getDbClient';

export class AdaptiveQuizRepository {
	async getById(adaptiveQuizId: string, tx?: Transaction): Promise<AdaptiveQuizDto | undefined> {
		const result = await getDbClient(tx)
			.select()
			.from(adaptiveQuiz)
			.where(eq(adaptiveQuiz.id, adaptiveQuizId));
		return result[0];
	}

	async getByIds(adaptiveQuizIds: string[], tx?: Transaction): Promise<AdaptiveQuizDto[]> {
		return await getDbClient(tx)
			.select()
			.from(adaptiveQuiz)
			.where(inArray(adaptiveQuiz.id, adaptiveQuizIds));
	}

	async create(newAdaptiveQuiz: CreateAdaptiveQuizDto, tx?: Transaction): Promise<AdaptiveQuizDto> {
		const result = await getDbClient(tx).insert(adaptiveQuiz).values(newAdaptiveQuiz).returning();
		return result[0];
	}

	async update(
		adaptiveQuizId: string,
		updateAdaptiveQuiz: UpdateAdaptiveQuizDto,
		tx?: Transaction
	): Promise<AdaptiveQuizDto | undefined> {
		const result = await getDbClient(tx)
			.update(adaptiveQuiz)
			.set(updateAdaptiveQuiz)
			.where(eq(adaptiveQuiz.id, adaptiveQuizId))
			.returning();
		return result[0];
	}

	async delete(adaptiveQuizId: string, tx?: Transaction): Promise<AdaptiveQuizDto | undefined> {
		const result = await getDbClient(tx)
			.delete(adaptiveQuiz)
			.where(eq(adaptiveQuiz.id, adaptiveQuizId))
			.returning();
		return result[0];
	}

	async getByUserBlockId(userBlockId: string, tx?: Transaction): Promise<AdaptiveQuizDto[]> {
		return await getDbClient(tx)
			.select()
			.from(adaptiveQuiz)
			.where(eq(adaptiveQuiz.userBlockId, userBlockId));
	}
}
