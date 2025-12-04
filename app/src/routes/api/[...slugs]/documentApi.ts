/**
 * @fileoverview
 * This file defines the API endpoints for managing documents.
 * It uses the Elysia framework to create routes for retrieving documents by ID or block ID,
 * uploading new documents, and deleting documents by file path.
 */

import { Elysia } from 'elysia';
import { BucketService } from '../../../services/bucketService';
import { DocumentService } from '../../../services/documentService';
import {
	createDocumentRequestSchema,
	deleteDocumentRequestSchema
} from '../../../schemas/documentSchema';
import { DocumentFacade } from '../../../facades/documentFacade';

/**
 *  Creates an Elysia application with routes for document management.
 * @param deps
 * @returns  An Elysia application with document routes.
 */
export const createDocumentApi = (deps?: {
	documentFacade?: DocumentFacade;
	documentService?: DocumentService;
	bucketService?: BucketService;
}) => {
	const documentFacade = deps?.documentFacade ?? new DocumentFacade();
	const documentService = deps?.documentService ?? new DocumentService();
	const bucketService = deps?.bucketService ?? new BucketService();

	return new Elysia({ prefix: 'document' })
		.get('/:id', async (req) => {
			return await documentService.getById(req.params.id);
		})
		.post(
			'/',
			async (req) => {
				const filePath = await bucketService.uploadBlockDataFile(req.body.document);
				return await documentFacade.uploadDocument({
					blockId: req.body.blockId,
					filePath,
					isMain: false
				});
			},
			{ body: createDocumentRequestSchema }
		)
		.get('/blockId/:blockId', async (req) => {
			return await documentService.getByBlockId(req.params.blockId);
		})
		.delete(
			'/',
			async (req) => {
				return await documentFacade.deleteDocumentByFilePath(req.body.documentPath);
			},
			{ body: deleteDocumentRequestSchema }
		);
};

export const documentApi = createDocumentApi();
export default documentApi;
