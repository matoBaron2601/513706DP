import { Elysia } from 'elysia';
import { submitAdaptiveQuizAnswerSchema } from '../../../schemas/adaptiveQuizAnswerSchema';
import { AdaptiveQuizAnswerFacade } from '../../../facades/adaptiveQuizAnswerFacade';

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
