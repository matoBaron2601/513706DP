import { eq, inArray } from 'drizzle-orm';
import {
	oneTimeUserAnswer,
	type OneTimeUserAnswerDto,
	type CreateOneTimeUserAnswerDto,
	type UpdateOneTimeUserAnswerDto
} from '../../db/schema';
import type { Transaction } from '../../types';
import getDbClient from '../utils/getDbClient';

export class OneTimeUserAnswerRepository {
	async getById(id: string, tx?: Transaction): Promise<OneTimeUserAnswerDto | undefined> {
		const result = await getDbClient(tx)
			.select()
			.from(oneTimeUserAnswer)
			.where(eq(oneTimeUserAnswer.id, id));
		return result[0];
	}

	async getByOneTimeUserQuizId(
		oneTimeUserQuizId: string,
		tx?: Transaction
	): Promise<OneTimeUserAnswerDto[]> {
		return await getDbClient(tx)
			.select()
			.from(oneTimeUserAnswer)
			.where(eq(oneTimeUserAnswer.oneTimeUserQuizId, oneTimeUserQuizId));
	}

	async getByBaseQuestionId(
		baseQuestionId: string,
		tx?: Transaction
	): Promise<OneTimeUserAnswerDto[]> {
		return await getDbClient(tx)
			.select()
			.from(oneTimeUserAnswer)
			.where(eq(oneTimeUserAnswer.baseQuestionId, baseQuestionId));
	}

	async getByBaseAnswerId(baseAnswerId: string, tx?: Transaction): Promise<OneTimeUserAnswerDto[]> {
		return await getDbClient(tx)
			.select()
			.from(oneTimeUserAnswer)
			.where(eq(oneTimeUserAnswer.baseAnswerId, baseAnswerId));
	}

	async create(
		newAnswer: CreateOneTimeUserAnswerDto,
		tx?: Transaction
	): Promise<OneTimeUserAnswerDto> {
		const result = await getDbClient(tx).insert(oneTimeUserAnswer).values(newAnswer).returning();
		return result[0];
	}

	async update(
		id: string,
		updateAnswer: UpdateOneTimeUserAnswerDto,
		tx?: Transaction
	): Promise<OneTimeUserAnswerDto | undefined> {
		const result = await getDbClient(tx)
			.update(oneTimeUserAnswer)
			.set(updateAnswer)
			.where(eq(oneTimeUserAnswer.id, id))
			.returning();
		return result[0];
	}

	async delete(id: string, tx?: Transaction): Promise<OneTimeUserAnswerDto | undefined> {
		const result = await getDbClient(tx)
			.delete(oneTimeUserAnswer)
			.where(eq(oneTimeUserAnswer.id, id))
			.returning();
		return result[0];
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<OneTimeUserAnswerDto[]> {
		return await getDbClient(tx)
			.select()
			.from(oneTimeUserAnswer)
			.where(inArray(oneTimeUserAnswer.id, ids));
	}
}
