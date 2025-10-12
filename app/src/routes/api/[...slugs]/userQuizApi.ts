import { Elysia, t } from 'elysia';
import { UserQuizRepository } from '../../../repositories/userQuizRepository';
import { UserQuizService } from '../../../services/userQuizService';
import { userQuizSchema } from '../../../schemas/userQuizSchema';

const userQuizRepository = new UserQuizRepository();
const userQuizService = new UserQuizService(userQuizRepository);

export const userQuizApi = new Elysia({ prefix: 'userQuiz' })
	.get('/:id', async (req) => {
		return await userQuizService.getUserQuizById(req.params.id);
	})
	.post(
		'/',
		async (req) => {
			return await userQuizService.createUserQuiz(req.body);
		},
		{
			body: userQuizSchema
		}
	);
