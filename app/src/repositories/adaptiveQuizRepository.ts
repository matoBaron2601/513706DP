import { eq, inArray, asc, desc, and } from 'drizzle-orm';
import {
	adaptiveQuiz,
	type CreateAdaptiveQuizDto,
	type UpdateAdaptiveQuizDto,
	type AdaptiveQuizDto,
	baseQuestion,
	adaptiveQuizAnswer
} from '../db/schema';
import type { Transaction } from '../types';
import getDbClient from './utils/getDbClient';
import { db } from '../db/client';

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

	async getByUserBlockIdLowerVersion(
		userBlockIds: string,
		tx?: Transaction
	): Promise<AdaptiveQuizDto> {
		const result = await getDbClient(tx)
			.select()
			.from(adaptiveQuiz)
			.where(eq(adaptiveQuiz.userBlockId, userBlockIds))
			.orderBy(asc(adaptiveQuiz.version));
		return result[0];
	}

	async getByBaseQuizId(
		baseQuizId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizDto | undefined> {
		const result = await getDbClient(tx)
			.select()
			.from(adaptiveQuiz)
			.where(eq(adaptiveQuiz.baseQuizId, baseQuizId));
		return result[0];
	}

	async getLastAdaptiveQuizByUserBlockId(
		userBlockId: string
	): Promise<AdaptiveQuizDto | undefined> {
		const result = await getDbClient()
			.select()
			.from(adaptiveQuiz)
			.where(eq(adaptiveQuiz.userBlockId, userBlockId))
			.orderBy(desc(adaptiveQuiz.version))
			.limit(1);
		return result[0];
	}

	async getLastVersionsByUserBlockId(
		userBlockId: string,
		count: number,
		tx?: Transaction
	): Promise<AdaptiveQuizDto[]> {
		return await getDbClient(tx)
			.select()
			.from(adaptiveQuiz)
			.where(
				and(
					eq(adaptiveQuiz.userBlockId, userBlockId),
					eq(adaptiveQuiz.isCompleted, true),
					eq(adaptiveQuiz.readyForAnswering, true)
				)
			)
			.orderBy(desc(adaptiveQuiz.version))
			.limit(count);
	}

	async getLastIncompletedByUserBlockId(
		userBlockId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizDto | undefined> {
		const result = await getDbClient(tx)
			.select()
			.from(adaptiveQuiz)
			.where(and(eq(adaptiveQuiz.userBlockId, userBlockId), eq(adaptiveQuiz.isCompleted, false)))
			.orderBy(desc(adaptiveQuiz.version))
			.limit(1);
		return result[0];
	}


}
