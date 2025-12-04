/**
 * @fileoverview
 * Facade for managing base quizzes, questions, and options.
 * It provides methods to create questions with options,
 * retrieve quizzes with their questions and options,
 * and validate answers.
 */

import { db } from '../db/client';
import type { CreateBaseOptionDto } from '../db/schema';
import type { BaseQuestionWithOptions } from '../schemas/baseQuestionSchema';
import type {
	BaseQuizWithQuestionsAndOptions,
	BaseQuizWithQuestionsAndOptionsBlank
} from '../schemas/baseQuizSchema';
import { BaseOptionService } from '../services/baseOptionService';
import { BaseQuestionService } from '../services/baseQuestionService';
import { BaseQuizService } from '../services/baseQuizService';
import { OpenAiService } from '../services/openAIService';
import type { Transaction } from '../types';

export class BaseQuizFacade {
	private baseQuizService: BaseQuizService;
	private baseQuestionService: BaseQuestionService;
	private baseOptionsService: BaseOptionService;
	private openAiService: OpenAiService;
	constructor() {
		this.baseQuizService = new BaseQuizService();
		this.baseQuestionService = new BaseQuestionService();
		this.baseOptionsService = new BaseOptionService();
		this.openAiService = new OpenAiService();
	}

	/**
	 *  Creates base questions and options for a given base quiz.
	 * @param data
	 * @param baseQuizId
	 * @returns  string[]
	 */
	async createBaseQuestionsAndOptions({
		data,
		baseQuizId
	}: {
		data: Map<string, BaseQuizWithQuestionsAndOptionsBlank>;
		baseQuizId: string;
	}): Promise<string[]> {
		return db.transaction(async (tx) => {
			const questionIds: string[] = [];
			let orderIndex = 0;

			for (const [conceptId, questions] of data) {
				for (const question of questions.questions) {
					orderIndex += 1;
					const { id: baseQuestionId } = await this.baseQuestionService.create(
						{
							questionText: question.questionText,
							correctAnswerText: question.correctAnswerText,
							baseQuizId: baseQuizId,
							conceptId: conceptId,
							orderIndex: orderIndex,
							codeSnippet: question.codeSnippet,
							questionType: question.questionType
						},
						tx
					);
					questionIds.push(baseQuestionId);
					if (question.options === undefined || question.options.length === 0) {
						continue;
					}
					await this.baseOptionsService.createMany(
						question.options.map(
							(option): CreateBaseOptionDto => ({
								optionText: option.optionText,
								baseQuestionId: baseQuestionId,
								isCorrect: option.isCorrect
							})
						),
						tx
					);
				}
			}
			return questionIds;
		});
	}

	/**
	 * Get questions with options by base quiz ID
	 * @param baseQuizId
	 * @returns BaseQuizWithQuestionsAndOptions
	 */

	async getQuestionsWithOptionsByBaseQuizId(
		baseQuizId: string
	): Promise<BaseQuizWithQuestionsAndOptions> {
		const baseQuiz = await this.baseQuizService.getById(baseQuizId);
		const baseQuizQuestion = await this.baseQuestionService.getByBaseQuizId(baseQuizId);
		const baseQuizOptions = await this.baseOptionsService.getManyByBaseQuestionIds(
			baseQuizQuestion.map((q) => q.id)
		);

		const questionsWithOptions: BaseQuestionWithOptions[] = baseQuizQuestion.map((question) => ({
			...question,
			options: baseQuizOptions.filter((option) => option.baseQuestionId === question.id)
		}));

		return {
			...baseQuiz,
			questions: questionsWithOptions
		};
	}

	/**
	 * Checks if the provided answer is correct for the given question ID.
	 * @param questionId
	 * @param answer
	 * @param tx
	 * @returns boolean
	 */
	async isAnswerCorrect(questionId: string, answer: string, tx?: Transaction): Promise<boolean> {
		const question = await this.baseQuestionService.getById(questionId, tx);
		const options = await this.baseOptionsService.getByBaseQuestionId(questionId, tx);
		if (options.length > 0) {
			return answer === options.find((opt) => opt.isCorrect)?.optionText;
		}
		return this.openAiService.isAnswerCorrect(
			question.questionText,
			question.correctAnswerText,
			answer
		);
	}
}
