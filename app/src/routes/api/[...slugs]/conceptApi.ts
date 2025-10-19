import { Elysia, t } from 'elysia';
import { ConceptService } from '../../../services/complexQuizServices/conceptService';

const conceptService = new ConceptService();
export const conceptApi = new Elysia({ prefix: 'concept' }).get(
	'/courseBlock/:courseBlockId',
	async (req) => {
		return await conceptService.getByCourseBlockId(req.params.courseBlockId);
	}
);

export default conceptApi;
