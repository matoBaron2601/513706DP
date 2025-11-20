import { Elysia } from 'elysia';
import { BlockFacade } from '../../../facades/blockFacade';
import {
	createBlockRequestSchema,
	identifyConceptsRequestSchema
} from '../../../schemas/blockSchema';
import { BucketService } from '../../../services/bucketService';
import { BlockService } from '../../../services/blockService';

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
