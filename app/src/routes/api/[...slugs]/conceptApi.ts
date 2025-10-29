import { Elysia, t } from 'elysia';
import { ConceptFacade } from '../../../facades/conceptFacade';

const conceptFacade = new ConceptFacade();
export const conceptApi = new Elysia({ prefix: 'concept' }).get(
	'/progress/:userBlockId',
	async (req) => {
		return await conceptFacade.getConceptProgressByUserBlockId({
			userBlockId: req.params.userBlockId
		});
	}
);

export default conceptApi;
  