/**
 * @fileoverview
 * This file defines the AdaptiveQuizAnswerFacade class, which serves as a facade
 * for handling operations related to adaptive quiz answers. It utilizes the
 * AdaptiveQuizAnswerService to create and manage adaptive quiz answers and
 * the BaseQuizFacade to check the correctness of answers.
 */

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

	/**
	 * Submits an answer for an adaptive quiz question.
	 * @param createAdaptiveQuizAnswer
	 * @returns AdaptiveQuizAnswer
	 */
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
