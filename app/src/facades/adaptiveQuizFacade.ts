import type { BaseQuizWithQuestionsAndOptions } from '../schemas/baseQuizSchema';
import { AdaptiveQuizService } from '../services/adaptiveQuizService';
import { BaseQuizFacade } from './baseQuizFacade';

export class AdaptiveQuizFacade {
	private adaptiveQuizService: AdaptiveQuizService;
	private baseQuizFacade : BaseQuizFacade

	constructor() {
		this.adaptiveQuizService = new AdaptiveQuizService();
		this.baseQuizFacade = new BaseQuizFacade();
	}

	public async getNextQuiz(userBlockId: string) : Promise<BaseQuizWithQuestionsAndOptions> {
		const quiz = await this.adaptiveQuizService.getNextQuiz(userBlockId);
		const baseQuiz = await this.baseQuizFacade.getQuestionsWithOptionsByBaseQuizId(quiz.baseQuizId);
		return {
			...baseQuiz
		};
	}
}
