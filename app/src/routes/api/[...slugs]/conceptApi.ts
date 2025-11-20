// src/api/concept/conceptApi.ts
import { Elysia } from 'elysia';
import { ConceptFacade } from '../../../facades/conceptFacade';

export const createConceptApi = (conceptFacade: ConceptFacade = new ConceptFacade()) =>
	new Elysia({ prefix: 'concept' }).get('/progress/:userBlockId', async (req) => {
		return await conceptFacade.getConceptProgressByUserBlockId({
			userBlockId: req.params.userBlockId
		});
	});

export const conceptApi = createConceptApi();
export default conceptApi;
