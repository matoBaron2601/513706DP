import type { BaseQuizWithQuestionsAndOptions } from '../schemas/baseQuizSchema';
import { BaseOptionService } from '../services/baseOptionService';
import { BaseQuestionService } from '../services/baseQuestionService';
import type { Transaction } from '../types';

export class BaseQuizFacade {
	private baseQuestionService: BaseQuestionService;
	private baseOptionsService: BaseOptionService;
	constructor() {
		this.baseQuestionService = new BaseQuestionService();
		this.baseOptionsService = new BaseOptionService();
	}

	async createQuestionsAndOptions(
		{
			questions,
			baseQuizId
		}: {
			questions: BaseQuizWithQuestionsAndOptions;
			baseQuizId: string;
		},
		tx: Transaction
	): Promise<string[]> {
		const questionIds: string[] = [];

		for (const question of questions.questions) {
			const { id: baseQuestionId } = await this.baseQuestionService.create(
				{
					questionText: question.questionText,
					correctAnswerText: question.correctAnswerText,
					baseQuizId: baseQuizId
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
}
