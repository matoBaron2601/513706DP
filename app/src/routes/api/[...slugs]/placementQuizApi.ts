/**
 * @fileoverview
 * This file defines the API endpoint for creating placement quizzes.
 * It uses the Elysia framework to create a POST route that accepts
 * placement quiz creation requests and processes them using the PlacementQuizFacade.
 */

import { Elysia } from 'elysia';
import { PlacementQuizFacade } from '../../../facades/placementQuizFacade';
import { createPlacementQuizRequestSchema } from '../../../schemas/placementQuizSchema';

/**
 *	Creates an Elysia application with routes for placement quiz management.
 * @param deps
 * @returns  An Elysia application with placement quiz routes.
 */
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
