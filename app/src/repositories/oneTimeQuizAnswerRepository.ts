import { eq, inArray } from 'drizzle-orm';

import type { Transaction } from '../types';
import getDbClient from './utils/getDbClient';
import {
	oneTimeQuizAnswer,
	type CreateOneTimeQuizAnswerDto,
	type OneTimeQuizAnswerDto,
	type UpdateOneTimeQuizAnswerDto
} from '../db/schema';

export class OneTimeQuizAnswerRepository {
	async getById(id: string, tx?: Transaction): Promise<OneTimeQuizAnswerDto | undefined> {
		const result = await getDbClient(tx)
			.select()
			.from(oneTimeQuizAnswer)
			.where(eq(oneTimeQuizAnswer.id, id));
		return result[0];
	}

	async getByBaseQuestionId(
		baseQuestionId: string,
		tx?: Transaction
	): Promise<OneTimeQuizAnswerDto[]> {
		return await getDbClient(tx)
			.select()
			.from(oneTimeQuizAnswer)
			.where(eq(oneTimeQuizAnswer.baseQuestionId, baseQuestionId));
	}

	async create(
		newAnswer: CreateOneTimeQuizAnswerDto,
		tx?: Transaction
	): Promise<OneTimeQuizAnswerDto> {
		const result = await getDbClient(tx).insert(oneTimeQuizAnswer).values(newAnswer).returning();
		return result[0];
	}

	async update(
		id: string,
		updateAnswer: UpdateOneTimeQuizAnswerDto,
		tx?: Transaction
	): Promise<OneTimeQuizAnswerDto | undefined> {
		const result = await getDbClient(tx)
			.update(oneTimeQuizAnswer)
			.set(updateAnswer)
			.where(eq(oneTimeQuizAnswer.id, id))
			.returning();
		return result[0];
	}

	async delete(id: string, tx?: Transaction): Promise<OneTimeQuizAnswerDto | undefined> {
		const result = await getDbClient(tx)
			.delete(oneTimeQuizAnswer)
			.where(eq(oneTimeQuizAnswer.id, id))
			.returning();
		return result[0];
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<OneTimeQuizAnswerDto[]> {
		return await getDbClient(tx)
			.select()
			.from(oneTimeQuizAnswer)
			.where(inArray(oneTimeQuizAnswer.id, ids));
	}
}
