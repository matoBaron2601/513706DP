import { db } from '../db/client';
import { answer, type AnswerDto, type CreateAnswerDto } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { Transaction } from '../types';
import getDbClient from './utils/getDbClient';

export class AnswerRepository {
	async getAnswerById(answerId: string, tx?: Transaction): Promise<AnswerDto | undefined> {
		const result = await getDbClient(tx).select().from(answer).where(eq(answer.id, answerId));
		return result[0];
	}

	async createAnswer(newAnswer: CreateAnswerDto, tx?: Transaction): Promise<AnswerDto> {
		const result = await getDbClient(tx).insert(answer).values(newAnswer).returning();
		return result[0];
	}

	async deleteAnswerById(answerId: string, tx?: Transaction): Promise<AnswerDto | undefined> {
		const result = await getDbClient(tx)
			.update(answer)
			.set({ deletedAt: new Date() })
			.where(eq(answer.id, answerId))
			.returning();
		return result[0];
	}

	async updateAnswer(newAnswer: AnswerDto, tx?: Transaction): Promise<AnswerDto | undefined> {
		const result = await getDbClient(tx)
			.update(answer)
			.set(newAnswer)
			.where(eq(answer.id, newAnswer.id))
			.returning();
		return result[0];
	}
}
