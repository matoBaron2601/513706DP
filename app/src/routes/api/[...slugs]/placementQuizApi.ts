import { Elysia} from 'elysia';
import { PlacementQuizFacade } from '../../../facades/placementQuizFacade';
import { createPlacementQuizRequestSchema } from '../../../schemas/placementQuizSchema';

const placementQuizFacade = new PlacementQuizFacade();
export const placementQuizApi = new Elysia({ prefix: 'placementQuiz' }).post(
	'/',
	async (req) => {
		return placementQuizFacade.createPlacementQuiz(req.body);
	},
	{
		body: createPlacementQuizRequestSchema
	}
);

export default placementQuizApi;
