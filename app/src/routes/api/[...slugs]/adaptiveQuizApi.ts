import { Elysia } from 'elysia';
import { AdaptiveQuizFacade } from '../../../facades/adaptiveQuizFacade';
import { AdaptiveQuizService } from '../../../services/adaptiveQuizService';

export const createAdaptiveQuizApi = (deps?: {
	adaptiveQuizFacade?: AdaptiveQuizFacade;
	adaptiveQuizService?: AdaptiveQuizService;
}) => {
	const adaptiveQuizFacade = deps?.adaptiveQuizFacade ?? new AdaptiveQuizFacade();
	const adaptiveQuizService = deps?.adaptiveQuizService ?? new AdaptiveQuizService();

	return new Elysia({ prefix: 'adaptiveQuiz' })
		.get('/:userBlockId', async (req) => {
			return await adaptiveQuizService.getByUserBlockId(req.params.userBlockId);
		})
		.post('/complete/:adaptiveQuizId', async (req) => {
			return await adaptiveQuizFacade.finishAdaptiveQuiz(req.params.adaptiveQuizId);
		})
		.get('/complexQuiz/:adaptiveQuizId', async (req) => {
			return await adaptiveQuizFacade.getComplexAdaptiveQuizById(req.params.adaptiveQuizId);
		})
		.get('/last/:userBlockId', async (req) => {
			return await adaptiveQuizService.getLastAdaptiveQuizByUserBlockId(req.params.userBlockId);
		})
		.post('/regenerate/:adaptiveQuizId', async (req) => {
			return await adaptiveQuizFacade.regenerateAdaptiveQuiz(req.params.adaptiveQuizId);
		});
};

export const adaptiveQuizApi = createAdaptiveQuizApi();
export default adaptiveQuizApi;
