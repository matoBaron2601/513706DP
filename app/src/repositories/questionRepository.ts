import { db } from '../db/client';
import { eq } from 'drizzle-orm';
import { type QuestionDto, question, type CreateQuestionDto } from '../db/schema';
import { type NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { type ExtractTablesWithRelations } from 'drizzle-orm/relations';
import { type PgTransaction } from 'drizzle-orm/pg-core';
import type { Transaction } from '../types';
import getDbClient from './utils/getDbClient';
export class QuestionRepository {
	async getQuestionById(questionId: string): Promise<QuestionDto | undefined> {
		const result = await db.select().from(question).where(eq(question.id, questionId));
		return result[0];
	}

	async createQuestion(newQuestion: CreateQuestionDto, tx?: Transaction): Promise<QuestionDto> {
		const result = await getDbClient(tx).insert(question).values(newQuestion).returning();
		return result[0];
	}

	async deleteQuestionById(questionId: string, tx?: Transaction): Promise<QuestionDto | undefined> {
		const result = await getDbClient(tx)
			.update(question)
			.set({ deletedAt: new Date() })
			.where(eq(question.id, questionId))
			.returning();
		return result[0];
	}

	async updateQuestion(newQuestion: QuestionDto): Promise<QuestionDto | undefined> {
		const result = await db
			.update(question)
			.set(newQuestion)
			.where(eq(question.id, newQuestion.id))
			.returning();
		return result[0];
	}

	async getQuestionsByQuizId(quizId: string, tx?: Transaction): Promise<QuestionDto[]> {
		return await getDbClient(tx).select().from(question).where(eq(question.quizId, quizId));
	}
}
