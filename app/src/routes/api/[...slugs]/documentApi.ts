import { Elysia } from 'elysia';

import { BucketService } from '../../../services/bucketService';
import { DocumentService } from '../../../services/documentService';
import { createDocumentRequestSchema } from '../../../schemas/documentSchema';

const documentService = new DocumentService();
const bucketService = new BucketService();

export const documentApi = new Elysia({ prefix: 'document' })
	.get('/:id', async (req) => {
		return await documentService.getById(req.params.id);
	})
	.post(
		'/',
		async (req) => {
			const documentName = await bucketService.uploadBlockDataFile(req.body.document);
			return await documentService.create({
				blockId: req.body.blockId,
				filePath: documentName,
				isMain: req.body.isMain
			});
		},
		{ body: createDocumentRequestSchema }
	)
    .get('blockId/:blockId', async (req) => {
        return await documentService.getByBlockId(req.params.blockId);
    });

export default documentApi;
