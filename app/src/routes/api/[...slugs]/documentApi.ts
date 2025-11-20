// src/api/document/documentApi.ts
import { Elysia } from 'elysia';

import { BucketService } from '../../../services/bucketService';
import { DocumentService } from '../../../services/documentService';
import {
	createDocumentRequestSchema,
	deleteDocumentRequestSchema
} from '../../../schemas/documentSchema';
import { DocumentFacade } from '../../../facades/documentFacade';

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
				return await documentFacade.deleteDocument(req.body.documentPath);
			},
			{ body: deleteDocumentRequestSchema }
		);
};

export const documentApi = createDocumentApi();
export default documentApi;
