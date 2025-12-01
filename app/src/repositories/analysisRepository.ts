import type { AnalysisDto } from '../schemas/analysisSchema';
import type { Transaction } from '../types';

import _getDbClient, { type GetDbClient } from './utils/getDbClient';

import {
	baseQuestion,
	baseOption,
	adaptiveQuiz,
	adaptiveQuizAnswer,
	concept,
	block,
	userBlock
} from '../db/schema';

import { eq, sql } from 'drizzle-orm';

export class AnalysisRepository {
	constructor(private readonly getDbClient: GetDbClient = _getDbClient) {}

	async getRandomQuestions(
		count: number,
		courseId: string,
		tx?: Transaction
	): Promise<AnalysisDto[]> {
		const result = await this.getDbClient(tx)
			.select({
				questionId: baseQuestion.id,
				questionText: baseQuestion.questionText,
				codeSnippet: baseQuestion.codeSnippet,
				questionType: baseQuestion.questionType,
				time: adaptiveQuizAnswer.time,
				optionId: baseOption.id,
				optionText: baseOption.optionText,
				isCorrect: baseOption.isCorrect,
				version: adaptiveQuiz.version,
				courseId: block.courseId,
				userId: userBlock.userId,
				conceptName: concept.name
			})
			.from(adaptiveQuizAnswer)
			.innerJoin(adaptiveQuiz, eq(adaptiveQuizAnswer.adaptiveQuizId, adaptiveQuiz.id))
			.innerJoin(baseQuestion, eq(adaptiveQuizAnswer.baseQuestionId, baseQuestion.id))
			.leftJoin(baseOption, eq(baseOption.baseQuestionId, baseQuestion.id))
			.innerJoin(userBlock, eq(userBlock.id, adaptiveQuiz.userBlockId))
			.innerJoin(block, eq(userBlock.blockId, block.id))
			.innerJoin(concept, eq(baseQuestion.conceptId, concept.id))
			.where(eq(block.courseId, courseId))
			.orderBy(sql`RANDOM()`)
		const questionsMap = new Map<
			string,
			{
				questionText: string;
				codeSnippet: string | null;
				questionType: string;
				time: number;
				questionId: string;
				isCorrect: boolean;
				version: number;
				options: {
					isCorrect: boolean;
					optionText: string;
					optionId: string;
				}[];
				courseId: string;
				userId: string;
				conceptName: string;
			}
		>();

		for (const row of result) {
			let question = questionsMap.get(row.questionId);

			if (!question) {
				question = {
					questionId: row.questionId,
					isCorrect: row.isCorrect ?? false,
					courseId: row.courseId,
					version: row.version,
					questionText: row.questionText,
					codeSnippet: row.codeSnippet ?? null,
					questionType: row.questionType,
					time: row.time,
					options: [],
					userId: row.userId,
					conceptName: row.conceptName
				};
				questionsMap.set(row.questionId, question);
			}
			if (row.optionId && row.optionText !== null && row.isCorrect !== null) {
				question.options.push({
					optionId: row.optionId,
					optionText: row.optionText,
					isCorrect: row.isCorrect
				});
			}
		}

		return Array.from(questionsMap.values()).slice(0, count);
	}
}
