import { Elysia } from 'elysia';
import { PlacementQuizFacade } from '../../../facades/placementQuizFacade';
import { createPlacementQuizRequestSchema } from '../../../schemas/placementQuizSchema';

export const createPlacementQuizApi = (deps?: { placementQuizFacade?: PlacementQuizFacade }) => {
	const placementQuizFacade = deps?.placementQuizFacade ?? new PlacementQuizFacade();

	return new Elysia({ prefix: 'placementQuiz' }).post(
		'/',
		async (req) => {
			return await placementQuizFacade.createPlacementQuiz(req.body);
		},
		{
			body: createPlacementQuizRequestSchema
		}
	);
};

export const placementQuizApi = createPlacementQuizApi();
export default placementQuizApi;
