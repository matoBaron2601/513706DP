import { Elysia, t } from 'elysia';
import { ConceptService } from '../../../services/conceptService';

const conceptService = new ConceptService();
export const conceptApi = new Elysia({ prefix: 'concept' }).get('/block/:blockId', async (req) => {
	return await conceptService.getManyByBlockId(req.params.blockId);
});

export default conceptApi;
