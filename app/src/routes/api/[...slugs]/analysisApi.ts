import { Elysia } from 'elysia';
import { AnalysisService } from '../../../services/analysisService';
import { analysisGetRequestSchema } from '../../../schemas/analysisSchema';

export const createAnalysisApi = (analysisService: AnalysisService = new AnalysisService()) =>
	new Elysia({ prefix: 'analysis' }).post(
		'/',
		async (req) => {
			return await analysisService.getRandomQuestions(req.body.count, req.body.courseId);
		},
		{
			body: analysisGetRequestSchema
		}
	);

export const analysisApi = createAnalysisApi();
export default analysisApi;
