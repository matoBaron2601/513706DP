import { db } from '../db/client';
import { eq, and, isNull, inArray } from 'drizzle-orm';
import { quiz, userQuiz, type CreateQuizDto, type QuizDto } from '../db/schema';
import { type NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { type ExtractTablesWithRelations } from 'drizzle-orm/relations';
import { type PgTransaction } from 'drizzle-orm/pg-core';
import type { Transaction } from '../types';
import getDbClient from './utils/getDbClient';

export class QuizRepository {
	async getQuizById(quizId: string): Promise<QuizDto | undefined> {
		const result = await db.select().from(quiz).where(eq(quiz.id, quizId));
		return result[0];
	}

	async createQuiz(newQuiz: CreateQuizDto, tx?: Transaction): Promise<QuizDto> {
		const result = await getDbClient(tx).insert(quiz).values(newQuiz).returning();
		return result[0];
	}

	async deleteQuizById(quizId: string, tx?: Transaction): Promise<QuizDto | undefined> {
		const result = await getDbClient(tx)
			.update(quiz)
			.set({ deletedAt: new Date() })
			.where(eq(quiz.id, quizId))
			.returning();
		return result[0];
	}

	async updateQuiz(newQuiz: QuizDto): Promise<QuizDto | undefined> {
		const result = await db.update(quiz).set(newQuiz).where(eq(quiz.id, newQuiz.id)).returning();
		return result[0];
	}

	async getQuizzesByCreatorId(creatorId: string): Promise<QuizDto[]> {
		return await db
			.select()
			.from(quiz)
			.where(and(eq(quiz.creatorId, creatorId), isNull(quiz.deletedAt)));
	}

	async getQuizzesByUserId(userId: string): Promise<QuizDto[]> {
		const result = await db
			.select()
			.from(quiz)
			.innerJoin(userQuiz, eq(quiz.id, userQuiz.quizId))
			.where(and(eq(userQuiz.userId, userId), isNull(quiz.deletedAt)));
		return result.map((row) => row.quiz);
	}

	async getQuizzesByIds(quizIds: string[]): Promise<QuizDto[]> {
		const result = await db
			.select()
			.from(quiz)
			.where(and(inArray(quiz.id, quizIds), isNull(quiz.deletedAt)));
		return result;
	}
}
