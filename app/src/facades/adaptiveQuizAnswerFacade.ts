import type {
	AdaptiveQuizAnswer,
	SubmitAdaptiveQuizAnswer
} from '../schemas/adaptiveQuizAnswerSchema';
import { AdaptiveQuizAnswerService } from '../services/adaptiveQuizAnswerService';
import { BaseQuizFacade } from './baseQuizFacade';

export class AdaptiveQuizAnswerFacade {
	private adaptiveQuizAnswerService: AdaptiveQuizAnswerService;
	private baseQuizFacade: BaseQuizFacade;

	constructor() {
		this.adaptiveQuizAnswerService = new AdaptiveQuizAnswerService();
		this.baseQuizFacade = new BaseQuizFacade();
	}

	// Submits an answer, checks correctness, and stores the result
	async submitAnswer(
		createAdaptiveQuizAnswer: SubmitAdaptiveQuizAnswer
	): Promise<AdaptiveQuizAnswer> {
		const { baseQuestionId, answerText } = createAdaptiveQuizAnswer;
		const isAnswerCorrect = await this.baseQuizFacade.isAnswerCorrect(baseQuestionId, answerText);
		const adaptiveQuizAnswer = await this.adaptiveQuizAnswerService.create({
			answerText,
			isCorrect: isAnswerCorrect,
			baseQuestionId,
			adaptiveQuizId: createAdaptiveQuizAnswer.adaptiveQuizId,
			time: createAdaptiveQuizAnswer.time
		});
		return adaptiveQuizAnswer;
	}
}
