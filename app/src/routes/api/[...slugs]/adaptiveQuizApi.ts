import { Elysia, t } from 'elysia';
import { AdaptiveQuizFacade } from '../../../facades/adaptiveQuizFacade';
import { AdaptiveQuizService } from '../../../services/adaptiveQuizService';

const adaptiveQuizFacade = new AdaptiveQuizFacade();
const adaptiveQuizService = new AdaptiveQuizService();

export const adaptiveQuizApi = new Elysia({ prefix: 'adaptiveQuiz' })
	.get('/:userBlockId', async (req) => {
		return await adaptiveQuizService.getByUserBlockId(req.params.userBlockId);
	})
	.get('/nextQuiz/:userBlockId', async (req) => {
		return await adaptiveQuizFacade.getNextQuiz(req.params.userBlockId);
	})
	// .get('/summary/:adaptiveQuizId', async (req) => {
	// 	return await adaptiveQuizFacade.getSummary(req.params.adaptiveQuizId);
	// })
	.get('/complexQuiz/:adaptiveQuizId', async (req) => {
		return await adaptiveQuizFacade.getComplexAdaptiveQuizById(req.params.adaptiveQuizId);
	});

export default adaptiveQuizApi;
