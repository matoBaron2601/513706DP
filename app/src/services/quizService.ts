import type { CreateQuizDto, QuizDto } from '../db/schema';
import type { OptionRepository } from '../repositories/optionRepository';
import type { QuestionRepository } from '../repositories/questionRepository';
import type { QuizRepository } from '../repositories/quizRepository';
import type { UserQuizRepository } from '../repositories/userQuizRepository';
import { OpenAiService, type OpenAIChatCompletionResponse } from './openAiService';
import { db } from '../db/client';
import { createQuizRequestSchema } from '../schemas/quizSchema';
import { type Static } from 'elysia';
import { getDocumentsByPrompt } from '../typesense/typesenseService';
import type { UserQuizService } from './userQuizService';
import { type NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { type ExtractTablesWithRelations } from 'drizzle-orm/relations';
import { type PgTransaction } from 'drizzle-orm/pg-core';
import type { QuestionService } from './questionService';
import type { OptionService } from './optionService';
import type { Transaction } from '../types';
export class QuizNotFoundError extends Error {
	constructor(message: string = 'Quiz not found') {
		super(message);
		this.name = 'QuizNotFoundError';
	}
}
export type ComplexQuiz = Static<typeof createQuizRequestSchema>;

export class QuizService {
	constructor(private quizRepository: QuizRepository) {}

	async getQuizById(quizId: string): Promise<QuizDto> {
		const result = await this.quizRepository.getQuizById(quizId);
		if (!result) {
			throw new QuizNotFoundError(`Quiz with id ${quizId} not found`);
		}
		return result;
	}

	async createQuiz(create: CreateQuizDto, tx?: Transaction): Promise<QuizDto> {
		return await this.quizRepository.createQuiz(create, tx);
	}
	async deleteQuizById(quizId: string, tx?: Transaction): Promise<QuizDto> {
		const result = await this.quizRepository.deleteQuizById(quizId, tx);
		if (!result) {
			throw new QuizNotFoundError(`Quiz with id ${quizId} could not be deleted`);
		}
		return result;
	}

	async updateQuiz(quizId: string, newQuiz: QuizDto): Promise<QuizDto> {
		const result = await this.quizRepository.updateQuiz(newQuiz);
		if (!result) {
			throw new QuizNotFoundError(`Quiz with id ${quizId} was not found`);
		}
		return result;
	}

	async getQuizzesByCreatorId(creatorId: string): Promise<QuizDto[]> {
		const result = await this.quizRepository.getQuizzesByCreatorId(creatorId);
		return result;
	}

	async getQuizzesByUserId(userId: string): Promise<QuizDto[]> {
		return await this.quizRepository.getQuizzesByUserId(userId);
	}

	async getQuizzesByIds(quizIds: string[]): Promise<QuizDto[]> {
		return await this.quizRepository.getQuizzesByIds(quizIds);
	}
}
