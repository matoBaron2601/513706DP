import { Elysia } from 'elysia';
import { createAdaptiveQuizAnswerSchema, submitAdaptiveQuizAnswerSchema } from '../../../schemas/adaptiveQuizAnswerSchema';
import { AdaptiveQuizAnswerFacade } from '../../../facades/adaptiveQuizAnswerFacade';

const adaptiveQuizAnswerFacade = new AdaptiveQuizAnswerFacade();

export const adaptiveQuizAnswerApi = new Elysia({ prefix: 'adaptiveQuizAnswer' }).post(
	'/',
	async (req) => {
		return await adaptiveQuizAnswerFacade.submitAnswer(req.body);
	},
	{
		body: submitAdaptiveQuizAnswerSchema
	}
);

export default adaptiveQuizAnswerApi;
