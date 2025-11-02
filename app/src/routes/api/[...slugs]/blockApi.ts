import { Elysia } from 'elysia';
import { BlockFacade } from '../../../facades/blockFacade';
import {
	createBlockRequestSchema,
	identifyConceptsRequestSchema
} from '../../../schemas/blockSchema';
import { BucketService } from '../../../services/bucketService';
import { BlockService } from '../../../services/blockService';

const blockFacade = new BlockFacade();
const blockService = new BlockService();
const bucketService = new BucketService();

export const blockApi = new Elysia({ prefix: 'block' })
	.get('/:id', async (req) => {
		return await blockService.getById(req.params.id);
	})
	.get('/courseId/:id', async (req) => {
		return await blockFacade.getManyByCourseId(req.params.id);
	})
	.post(
		'/identifyConcepts',
		async (req) => {
			const documentName = await bucketService.uploadFile(req.body.document);
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

export default blockApi;
