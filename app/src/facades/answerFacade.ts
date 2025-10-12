import { db } from '../db/client';
import type { Answer, CreateAnswer } from '../schemas/answerSchema';
import type { AnswerService } from '../services/answerService';
import type { UserQuizService } from '../services/userQuizService';

export class AnswerFacade {
	constructor(
		private answerService: AnswerService,
		private userQuizService: UserQuizService
	) {}

	async createAnswer(createAnswer: CreateAnswer) {
		await db.transaction(async (tx) => {
			const userQuiz = await this.userQuizService.updateUserQuiz(
				createAnswer.userQuizId,
				{
					submittedAt: new Date()
				},
				tx
			);
			for (const answer of createAnswer.answers) {
				await this.answerService.createAnswer(
					{
						userQuizId: createAnswer.userQuizId,
						questionId: answer.questionId,
						optionId: answer.optionId
					},
					tx
				);
			}
		});
	}
}
