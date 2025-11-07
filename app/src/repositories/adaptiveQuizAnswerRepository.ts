import { eq, inArray, desc } from 'drizzle-orm';
import {
	adaptiveQuizAnswer,
	type CreateAdaptiveQuizAnswerDto,
	type UpdateAdaptiveQuizAnswerDto,
	type AdaptiveQuizAnswerDto
} from '../db/schema';
import type { Transaction } from '../types';
import getDbClient from './utils/getDbClient';

export class AdaptiveQuizAnswerRepository {
	async getById(
		adaptiveQuizAnswerId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto | undefined> {
		const result = await getDbClient(tx)
			.select()
			.from(adaptiveQuizAnswer)
			.where(eq(adaptiveQuizAnswer.id, adaptiveQuizAnswerId));
		return result[0];
	}

	async getByIds(
		adaptiveQuizAnswerIds: string[],
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto[]> {
		return await getDbClient(tx)
			.select()
			.from(adaptiveQuizAnswer)
			.where(inArray(adaptiveQuizAnswer.id, adaptiveQuizAnswerIds));
	}

	async create(
		newAdaptiveQuizAnswer: CreateAdaptiveQuizAnswerDto,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto> {
		const result = await getDbClient(tx)
			.insert(adaptiveQuizAnswer)
			.values(newAdaptiveQuizAnswer)
			.returning();
		return result[0];
	}

	async update(
		adaptiveQuizAnswerId: string,
		updateAdaptiveQuizAnswer: UpdateAdaptiveQuizAnswerDto,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto | undefined> {
		const result = await getDbClient(tx)
			.update(adaptiveQuizAnswer)
			.set(updateAdaptiveQuizAnswer)
			.where(eq(adaptiveQuizAnswer.id, adaptiveQuizAnswerId))
			.returning();
		return result[0];
	}

	async delete(
		adaptiveQuizAnswerId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto | undefined> {
		const result = await getDbClient(tx)
			.delete(adaptiveQuizAnswer)
			.where(eq(adaptiveQuizAnswer.id, adaptiveQuizAnswerId))
			.returning();
		return result[0];
	}

	async getByBaseQuestionId(
		baseQuestionId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto | undefined> {
		const result = await getDbClient(tx)
			.select()
			.from(adaptiveQuizAnswer)
			.where(eq(adaptiveQuizAnswer.baseQuestionId, baseQuestionId));
		return result[0];
	}

	async getByAdaptiveQuizId(
		adaptiveQuizId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto[]> {
		return await getDbClient(tx)
			.select()
			.from(adaptiveQuizAnswer)
			.where(eq(adaptiveQuizAnswer.adaptiveQuizId, adaptiveQuizId))
			.orderBy(desc(adaptiveQuizAnswer.createdAt));
	}
}
