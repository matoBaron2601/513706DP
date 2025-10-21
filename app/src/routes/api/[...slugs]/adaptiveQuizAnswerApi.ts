import { Elysia } from 'elysia';
import { createAdaptiveQuizAnswerSchema } from '../../../schemas/adaptiveQuizAnswerSchema';
import { AdaptiveQuizAnswerFacade } from '../../../facades/adaptiveQuizAnswerFacade';

const adaptiveQuizAnswerFacade = new AdaptiveQuizAnswerFacade();

export const adaptiveQuizAnswerApi = new Elysia({ prefix: 'adaptiveQuizAnswer' }).post(
	'/',
	async (req) => {
		return await adaptiveQuizAnswerFacade.submitAnswer(req.body);
	},
	{
		body: createAdaptiveQuizAnswerSchema
	}
);

export default adaptiveQuizAnswerApi;
