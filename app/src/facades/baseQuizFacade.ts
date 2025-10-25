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

	async createQuestionsAndOptions(
		{
			questions,
			baseQuizId,
			conceptId,
			initialOrderIndex
		}: {
			questions: BaseQuizWithQuestionsAndOptionsBlank;
			baseQuizId: string;
			conceptId: string;
			initialOrderIndex: number;
		},
		tx: Transaction
	): Promise<string[]> {
		const questionIds: string[] = [];
		let orderIndex = initialOrderIndex;

		for (const question of questions.questions.sort((a, b) => Number(a.orderIndex) - Number(b.orderIndex))) {
			const { id: baseQuestionId } = await this.baseQuestionService.create(
				{
					questionText: question.questionText,
					correctAnswerText: question.correctAnswerText,
					baseQuizId: baseQuizId,
					conceptId: conceptId,
					orderIndex: orderIndex
				},
				tx
			);
			orderIndex += 1;

			questionIds.push(baseQuestionId);

			if (question.options.length === 0 || question.options === undefined) {
				continue;
			}
			const options = question.options.map((option) => ({
				optionText: option.optionText,
				baseQuestionId: baseQuestionId
			}));
			await this.baseOptionsService.createMany(options, tx);
		}
		return questionIds;
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
