import { Elysia, t } from 'elysia';

import { QuizRepository } from '../../../repositories/quizRepository';
import { QuizService } from '../../../services/quizService';
import { question } from '../../../db/schema';
import { QuestionRepository } from '../../../repositories/questionRepository';
import { OptionRepository } from '../../../repositories/optionRepository';
import { UserQuizRepository } from '../../../repositories/userQuizRepository';
import { OpenAiService } from '../../../services/openAiService';
import { UserQuizService } from '../../../services/userQuizService';
import { QuestionService } from '../../../services/questionService';
import { OptionService } from '../../../services/optionService';
import { QuizFacade } from '../../../facades/quizFacade';
import {
	createQuizInitialRequestSchema,
	quizHistoryListSchema,
	quizHistorySchema,
	quizSchema
} from '../../../schemas/quizSchema';
import { UserService } from '../../../services/userService';
import { UserRepository } from '../../../repositories/userRepository';

const quizRepository = new QuizRepository();
const questionRepository = new QuestionRepository();
const optionRepository = new OptionRepository();
const userQuizRepository = new UserQuizRepository();
const userRepository = new UserRepository();
const openAiService = new OpenAiService();

const userQuizService = new UserQuizService(userQuizRepository);
const questionService = new QuestionService(questionRepository);
const optionService = new OptionService(optionRepository);
const quizService = new QuizService(quizRepository);
const userService = new UserService(userRepository);
const quizFacade = new QuizFacade(
	quizService,
	userQuizService,
	questionService,
	optionService,
	openAiService,
	userService
);

export const quizApi = new Elysia({ prefix: 'quiz' })
	.onError(({ code, error, set }) => {
		switch (true) {
			default:
				set.status = 500;
				return { message: 'Internal Server Error' };
		}
	})

	.get(
		'/:id',
		async (req) => {
			return await quizFacade.getQuizById(req.params.id);
		},
		{
			response: quizSchema
		}
	)
	.post(
		'/',
		async (req) => {
			console.log('Initial quiz creation request:', req.body);
			const final = await quizFacade.initialCreateQuiz(req.body);
			console.log('Final quiz created:', final, typeof final);
			return final;
		},
		{
			body: createQuizInitialRequestSchema
			// response: quizSchema
		}
	)
	.get(
		'/created/:creatorEmail',
		async (req) => {
			return await quizFacade.getQuizzesByCreatorEmail(req.params.creatorEmail);
		},
		{
			response: t.Array(quizSchema)
		}
	)
	.get(
		'/history/:userEmail',
		async (req) => {
			return await quizFacade.getQuizHistoryListByUserEmail(req.params.userEmail);
		},
		{
			response: t.Array(quizHistoryListSchema)
		}
	)
	.delete('/:id', async (req) => {
		return await quizFacade.deleteQuizById(req.params.id);
	});

export default quizApi;
