import Elysia from 'elysia';
import { AnswerRepository } from '../../../repositories/answerRepository';
import { AnswerService } from '../../../services/answerService';
import { createAnswerSchema } from '../../../schemas/answerSchema';
import { AnswerFacade } from '../../../facades/answerFacade';
import { UserQuizService } from '../../../services/userQuizService';
import { UserQuizRepository } from '../../../repositories/userQuizRepository';

const answerRepository = new AnswerRepository();
const answerService = new AnswerService(answerRepository);
const userQuizRepository = new UserQuizRepository();
const userQuizService = new UserQuizService(userQuizRepository);
const answerFacade = new AnswerFacade(answerService, userQuizService);

export const answerApi = new Elysia({ prefix: 'answer' })

	.get('/:id', async (req) => {
		return await answerService.getAnswerById(req.params.id);
	})
	.post(
		'/',
		async (req) => {
			return await answerFacade.createAnswer(req.body);
		},
		{ body: createAnswerSchema }
	)
	.delete('/:id', async (req) => {
		return await answerService.deleteAnswerById(req.params.id);
	});
