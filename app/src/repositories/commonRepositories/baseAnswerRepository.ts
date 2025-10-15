import { eq, inArray } from 'drizzle-orm';
import {
	baseAnswer,
	type CreateBaseAnswerDto,
	type UpdateBaseAnswerDto,
	type BaseAnswerDto
} from '../../db/schema';
import type { Transaction } from '../../types';
import getDbClient from '../utils/getDbClient';

export class BaseAnswerRepository {
	async getBaseAnswerById(answerId: string, tx?: Transaction): Promise<BaseAnswerDto | undefined> {
		const result = await getDbClient(tx)
			.select()
			.from(baseAnswer)
			.where(eq(baseAnswer.id, answerId));
		return result[0];
	}

	async createBaseAnswer(newAnswer: CreateBaseAnswerDto, tx?: Transaction): Promise<BaseAnswerDto> {
		const result = await getDbClient(tx).insert(baseAnswer).values(newAnswer).returning();
		return result[0];
	}

	async deleteBaseAnswerById(
		answerId: string,
		tx?: Transaction
	): Promise<BaseAnswerDto | undefined> {
		const result = await getDbClient(tx)
			.delete(baseAnswer)
			.where(eq(baseAnswer.id, answerId))
			.returning();
		return result[0];
	}

	async updateBaseAnswer(
		answerId: string,
		updateAnswer: UpdateBaseAnswerDto,
		tx?: Transaction
	): Promise<BaseAnswerDto | undefined> {
		const result = await getDbClient(tx)
			.update(baseAnswer)
			.set(updateAnswer)
			.where(eq(baseAnswer.id, answerId))
			.returning();
		return result[0];
	}

	async getBaseAnswersByIds(answerIds: string[], tx?: Transaction): Promise<BaseAnswerDto[]> {
		return await getDbClient(tx).select().from(baseAnswer).where(inArray(baseAnswer.id, answerIds));
	}
}
