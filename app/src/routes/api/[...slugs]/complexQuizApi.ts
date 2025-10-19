import { Elysia, t } from 'elysia';
import { ComplexQuizFacade } from '../../../facades/complexQuizFacades/complexQuizFacade';
import { createComplexQuizExtendedSchema } from '../../../schemas/complexQuizSchemas/complexQuizSchema';

const complexQuizFacade = new ComplexQuizFacade();
export const complexQuizApi = new Elysia({ prefix: 'complexQuiz' }).post(
	'/placement',
	async (req) => {
		return await complexQuizFacade.createPlacementComplexQuiz(req.body);
	},
	{
		body: createComplexQuizExtendedSchema
	}
)
.get(
	'/nextQuiz/:courseBlockId',
	async (req) => {
		return await complexQuizFacade.getNextQuiz(req.params.courseBlockId);
	}
);

export default complexQuizApi;
