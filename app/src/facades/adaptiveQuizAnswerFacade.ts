import type {
	AdaptiveQuizAnswer,
	CreateAdaptiveQuizAnswer
} from '../schemas/adaptiveQuizAnswerSchema';
import { AdaptiveQuizAnswerService } from '../services/adaptiveQuizAnswerService';
import { AdaptiveQuizService } from '../services/adaptiveQuizService';
import { BaseQuizFacade } from './baseQuizFacade';

export class AdaptiveQuizAnswerFacade {
	private adaptiveQuizAnswerService: AdaptiveQuizAnswerService;
	private baseQuizFacade: BaseQuizFacade;

	constructor() {
		this.adaptiveQuizAnswerService = new AdaptiveQuizAnswerService();
		this.baseQuizFacade = new BaseQuizFacade();
	}

	async submitAnswer(
		createAdaptiveQuizAnswer: CreateAdaptiveQuizAnswer
	): Promise<AdaptiveQuizAnswer> {
		const { adaptiveQuizId, baseQuestionId, answerText } = createAdaptiveQuizAnswer;
		const isAnswerCorrect = await this.baseQuizFacade.isAnswerCorrect(baseQuestionId, answerText);
		const adaptiveQuizAnswer = await this.adaptiveQuizAnswerService.create({
			answerText,
			isCorrect: isAnswerCorrect,
			baseQuestionId,
			adaptiveQuizId
		});
		return adaptiveQuizAnswer;
	}
}
