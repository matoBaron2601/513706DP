/**
 * @fileoverview
 * This file defines the API endpoint for submitting answers to adaptive quizzes.
 * It uses the Elysia framework to create a POST route that accepts quiz answers
 * and processes them using the AdaptiveQuizAnswerFacade.
 */

import { Elysia } from 'elysia';
import { submitAdaptiveQuizAnswerSchema } from '../../../schemas/adaptiveQuizAnswerSchema';
import { AdaptiveQuizAnswerFacade } from '../../../facades/adaptiveQuizAnswerFacade';

/**
 *  Creates the Adaptive Quiz Answer API endpoint.
 * @param deps
 * @returns Elysia instance with the adaptive quiz answer route.
 */
export const createAdaptiveQuizAnswerApi = (deps?: {
	adaptiveQuizAnswerFacade?: AdaptiveQuizAnswerFacade;
}) => {
	const adaptiveQuizAnswerFacade = deps?.adaptiveQuizAnswerFacade ?? new AdaptiveQuizAnswerFacade();

	return new Elysia({ prefix: 'adaptiveQuizAnswer' }).post(
		'/',
		async (req) => {
			return await adaptiveQuizAnswerFacade.submitAnswer(req.body);
		},
		{
			body: submitAdaptiveQuizAnswerSchema
		}
	);
};

export const adaptiveQuizAnswerApi = createAdaptiveQuizAnswerApi();
export default adaptiveQuizAnswerApi;
