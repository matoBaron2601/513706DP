import type { BaseQuestionWithOptions } from '../schemas/baseQuestionSchema';
import type {
	BaseQuizWithQuestionsAndOptions,
	BaseQuizWithQuestionsAndOptionsBlank
} from '../schemas/baseQuizSchema';
import { BaseOptionService } from '../services/baseOptionService';
import { BaseQuestionService } from '../services/baseQuestionService';
import { BaseQuizService } from '../services/baseQuizService';
import type { Transaction } from '../types';

export class BaseQuizFacade {
	private baseQuizService: BaseQuizService;
	private baseQuestionService: BaseQuestionService;
	private baseOptionsService: BaseOptionService;
	constructor() {
		this.baseQuizService = new BaseQuizService();
		this.baseQuestionService = new BaseQuestionService();
		this.baseOptionsService = new BaseOptionService();
	}

	async createQuestionsAndOptions(
		{
			questions,
			baseQuizId,
			conceptId
		}: {
			questions: BaseQuizWithQuestionsAndOptionsBlank;
			baseQuizId: string;
			conceptId: string;
		},
		tx: Transaction
	): Promise<string[]> {
		const questionIds: string[] = [];

		for (const question of questions.questions) {
			const { id: baseQuestionId } = await this.baseQuestionService.create(
				{
					questionText: question.questionText,
					correctAnswerText: question.correctAnswerText,
					baseQuizId: baseQuizId,
					conceptId: conceptId
				},
				tx
			);
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
		return true /// OPEN AI ANSWER MATCHING LOGIC CAN BE ADDED HERE IN THE FUTURE
	}
}
