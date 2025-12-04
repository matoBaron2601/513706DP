/**
 * @fileoverview
 * This file defines the API endpoints for managing blocks.
 * It uses the Elysia framework to create routes for retrieving blocks by ID or course ID,
 * identifying concepts in a document, and creating new blocks.
 */

import { Elysia } from 'elysia';
import { BlockFacade } from '../../../facades/blockFacade';
import {
	createBlockRequestSchema,
	identifyConceptsRequestSchema
} from '../../../schemas/blockSchema';
import { BucketService } from '../../../services/bucketService';
import { BlockService } from '../../../services/blockService';

/**
 * Creates an Elysia application with routes for block management.
 * @param deps
 * @returns  An Elysia application with block routes.
 */
export const createBlockApi = (deps?: {
	blockFacade?: BlockFacade;
	blockService?: BlockService;
	bucketService?: BucketService;
}) => {
	const blockFacade = deps?.blockFacade ?? new BlockFacade();
	const blockService = deps?.blockService ?? new BlockService();
	const bucketService = deps?.bucketService ?? new BucketService();

	return new Elysia({ prefix: 'block' })
		.get('/:id', async (req) => {
			return await blockService.getById(req.params.id);
		})
		.get('/courseId/:id', async (req) => {
			return await blockFacade.getManyByCourseId(req.params.id);
		})
		.post(
			'/identifyConcepts',
			async (req) => {
				const documentName = await bucketService.uploadBlockDataFile(req.body.document);
				return await blockFacade.identifyConcepts(documentName);
			},
			{
				body: identifyConceptsRequestSchema
			}
		)
		.post(
			'/createBlock',
			async (req) => {
				return await blockFacade.createBlock(req.body);
			},
			{ body: createBlockRequestSchema }
		);
};

export const blockApi = createBlockApi();
export default blockApi;
