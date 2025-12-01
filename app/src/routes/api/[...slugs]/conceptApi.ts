import { Elysia } from 'elysia';
import { ConceptFacade } from '../../../facades/conceptFacade';
import { ConceptService } from '../../../services/conceptService';

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
