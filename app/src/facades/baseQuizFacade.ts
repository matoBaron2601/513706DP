import { db } from '../db/client';
import type { CreateBaseOptionDto, CreateBaseQuestionDto } from '../db/schema';
import type { BaseQuestion, BaseQuestionWithOptions } from '../schemas/baseQuestionSchema';
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

	async createBaseQuestionsAndOptions({
		data,
		baseQuizId
	}: {
		data: Map<string, BaseQuizWithQuestionsAndOptionsBlank>;
		baseQuizId: string;
	}): Promise<string[]> {
		return db.transaction(async (tx) => {
			console.log('Creating base questions and options...');
			const questionIds: string[] = [];
			for (const [conceptId, questions] of data) {
				for (const question of questions.questions) {
					const { id: baseQuestionId } = await this.baseQuestionService.create(
						{
							questionText: question.questionText,
							correctAnswerText: question.correctAnswerText,
							baseQuizId: baseQuizId,
							conceptId: conceptId,
							orderIndex: question.orderIndex,
							codeSnippet: question.codeSnippet,
							questionType: question.questionType
						},
						tx
					);
					questionIds.push(baseQuestionId);
					if (question.options.length === 0 || question.options === undefined) {
						continue;
					}
					await this.baseOptionsService.createMany(
						question.options.map(
							(option): CreateBaseOptionDto => ({
								optionText: option.optionText,
								baseQuestionId: baseQuestionId
							})
						),
						tx
					);
				}
			}
			return questionIds;
		});
	}

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

	async isAnswerCorrect(questionId: string, answer: string, tx?: Transaction): Promise<boolean> {
		const question = await this.baseQuestionService.getById(questionId, tx);
		const options = await this.baseOptionsService.getByBaseQuestionId(questionId, tx);
		if (options.length > 0) {
			return answer === question.correctAnswerText;
		}
		return this.openAiService.isAnswerCorrect(
			question.questionText,
			question.correctAnswerText,
			answer
		);
	}
}
