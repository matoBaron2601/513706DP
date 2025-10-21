import { Elysia, t } from 'elysia';
import { AdaptiveQuizFacade } from '../../../facades/adaptiveQuizFacade';

const adaptiveQuizFacade = new AdaptiveQuizFacade();

export const adaptiveQuizApi = new Elysia({ prefix: 'adaptiveQuiz' })
.get(
	'/nextQuiz/:userBlockId',
	async (req) => {
		return await adaptiveQuizFacade.getNextQuiz(req.params.userBlockId);
	}
);

export default adaptiveQuizApi;
