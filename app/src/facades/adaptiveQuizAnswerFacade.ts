import type {
	AdaptiveQuizAnswer,
	CreateAdaptiveQuizAnswer,
	SubmitAdaptiveQuizAnswer
} from '../schemas/adaptiveQuizAnswerSchema';
import type { BaseQuestion } from '../schemas/baseQuestionSchema';
import { AdaptiveQuizAnswerService } from '../services/adaptiveQuizAnswerService';
import { AdaptiveQuizService } from '../services/adaptiveQuizService';
import { BaseQuestionService } from '../services/baseQuestionService';
import { BaseQuizFacade } from './baseQuizFacade';

export class AdaptiveQuizAnswerFacade {
	private adaptiveQuizAnswerService: AdaptiveQuizAnswerService;
	private baseQuizFacade: BaseQuizFacade;
	private baseQuestionService: BaseQuestionService;
	private adaptiveQuizService: AdaptiveQuizService;

	constructor() {
		this.adaptiveQuizAnswerService = new AdaptiveQuizAnswerService();
		this.baseQuizFacade = new BaseQuizFacade();
		this.baseQuestionService = new BaseQuestionService();
		this.adaptiveQuizService = new AdaptiveQuizService();
	}

	async submitAnswer(
		createAdaptiveQuizAnswer: SubmitAdaptiveQuizAnswer
	): Promise<AdaptiveQuizAnswer> {
		const { baseQuestionId, answerText } = createAdaptiveQuizAnswer;
		const isAnswerCorrect = await this.baseQuizFacade.isAnswerCorrect(baseQuestionId, answerText);
		const baseQuizId = await this.baseQuestionService.getBaseQuizIdByQuestionId(baseQuestionId);
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
