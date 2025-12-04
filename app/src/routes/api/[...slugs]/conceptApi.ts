/**
 * @fileoverview
 * This file defines the API endpoints for managing concepts.
 * It uses the Elysia framework to create routes for retrieving concept progress
 * by user block ID and fetching concepts by block ID.
 */

import { Elysia } from 'elysia';
import { ConceptFacade } from '../../../facades/conceptFacade';
import { ConceptService } from '../../../services/conceptService';

/**
 *  Creates an Elysia application with routes for concept management.
 * @param conceptFacade
 * @param conceptService
 * @returns An Elysia application with concept routes.
 */
export const createConceptApi = (
	conceptFacade: ConceptFacade = new ConceptFacade(),
	conceptService: ConceptService = new ConceptService()
) =>
	new Elysia({ prefix: 'concept' })
		.get('/progress/:userBlockId', async (req) => {
			return await conceptFacade.getConceptProgressByUserBlockId({
				userBlockId: req.params.userBlockId
			});
		})
		.get('/blockId/:blockId', async (req) => {
			return await conceptService.getManyByBlockId(req.params.blockId);
		});

export const conceptApi = createConceptApi();
export default conceptApi;
