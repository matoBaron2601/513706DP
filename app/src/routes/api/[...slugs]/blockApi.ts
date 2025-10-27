import { Elysia } from 'elysia';
import { BlockFacade } from '../../../facades/blockFacade';
import {
	createBlockRequestSchema,
	identifyConceptsRequestSchema
} from '../../../schemas/blockSchema';
import { BlockService } from '../../../services/blockService';

const blockFacade = new BlockFacade();
const blockService = new BlockService()

export const blockApi = new Elysia({ prefix: 'block' })
	.get('/courseId/:id', async (req) => {
		return await blockFacade.getManyByCourseId(req.params.id);
	})
	.post(
		'/identifyConcepts',
		async (req) => {
			const documentName = await blockService.saveFile(req.body.document);
			return await blockFacade.identifyConcepts(documentName);
		},
		{
			body: identifyConceptsRequestSchema
		}
	)
	.post(
		'/createBlock',
		async (req) => {
			console.log('Received createBlock request with body:', req.body);
			return await blockFacade.createBlock(req.body);
		},
		{ body: createBlockRequestSchema }
	);

export default blockApi;
