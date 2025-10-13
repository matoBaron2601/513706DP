import { get } from 'http';
import { db } from '../db/client';
import type { QuizDto } from '../db/schema';
import type {
	CreateQuizRequest,
	Quiz,
	CreateQuizInitialRequest,
	QuizHistory,
	QuizHistoryList
} from '../schemas/quizSchema';
import type { OpenAiService } from '../services/openAiService';
import type { OptionService } from '../services/optionService';
import type { QuestionService } from '../services/questionService';
import type { QuizService } from '../services/quizService';
import type { UserQuizService } from '../services/userQuizService';
import type { UserService } from '../services/userService';
import { getDocumentsByPrompt } from '../typesense/typesenseService';

export class QuizFacade {
	constructor(
		private quizService: QuizService,
		private userQuizService: UserQuizService,
		private questionService: QuestionService,
		private optionService: OptionService,
		private openAiService: OpenAiService,
		private userService: UserService
	) {}

	async initialCreateQuiz(initialCreateQuiz: CreateQuizInitialRequest): Promise<Quiz> {
		const typeSenseChunks = await getDocumentsByPrompt(
			initialCreateQuiz.prompt,
			initialCreateQuiz.documents
		);
		const chunks =
			typeSenseChunks.hits?.map((hit) => (hit.document as { content: string }).content) ?? [];
		const openaiResult = await this.openAiService.callOpenAI(
			chunks,
			initialCreateQuiz.numberOfQuestions,
			initialCreateQuiz.prompt
		);
		const cleanedString = openaiResult.choices[0].message.content
			.replace(/```json|```/g, '')
			.trim();
		const parsedJson: CreateQuizRequest = JSON.parse(cleanedString);
		const user = await this.userService.getUserByEmail(initialCreateQuiz.email);
		const quizId = await this.createQuiz({
			...parsedJson,
			quiz: { ...parsedJson.quiz, creatorId: user.id, name: initialCreateQuiz.name }
		});

		const actualQuiz = await this.getQuizById(quizId);
		return actualQuiz;
	}


	async createQuiz(createQuiz: CreateQuizRequest): Promise<string> {
		return await db.transaction(async (tx) => {
			const createdQuiz = await this.quizService.createQuiz(createQuiz.quiz, tx);
			for (const question of createQuiz.questions) {
				const createdQuestion = await this.questionService.createQuestion(
					{
						quizId: createdQuiz.id,
						text: question.text
					},
					tx
				);
				const shuffledOptions = shuffleOptions(question.options);
				for (const option of shuffledOptions) {
					await this.optionService.createOption(
						{
							text: option.text,
							isCorrect: option.isCorrect,
							questionId: createdQuestion.id
						},
						tx
					);
				}
			}
			return createdQuiz.id;
		});
	}

	async getQuizById(quizId: string): Promise<Quiz> {
		const quiz = await this.quizService.getQuizById(quizId);
		const questionsData = await this.questionService.getQuestionsByQuizId(quizId);

		const questions: Quiz['questions'] = [];

		for (const question of questionsData) {
			const optionsData = await this.optionService.getOptionsByQuestionId(question.id);

			const questionItem = {
				questionId: question.id,
				text: question.text,
				type: question.type,
				options: optionsData.map((option) => ({
					optionId: option.id,
					text: option.text,
					isCorrect: option.isCorrect
				}))
			};

			questions.push(questionItem);
		}

		return {
			quiz,
			questions
		};
	}

	async deleteQuizById(quizId: string): Promise<void> {
		await db.transaction(async (tx) => {
			await this.userQuizService.deleteUserQuizzesByQuizId(quizId, tx);
			const questions = await this.questionService.getQuestionsByQuizId(quizId, tx);
			for (const question of questions) {
				const options = await this.optionService.getOptionsByQuestionId(question.id, tx);
				for (const option of options) {
					await this.optionService.deleteOptionById(option.id, tx);
				}
				await this.questionService.deleteQuestionById(question.id, tx);
			}
			await this.quizService.deleteQuizById(quizId, tx);
		});
	}

	async getQuizzesByCreatorEmail(creatorEmail: string): Promise<Quiz[]> {
		const creator = await this.userService.getUserByEmail(creatorEmail);
		const quizzesData = await this.quizService.getQuizzesByCreatorId(creator.id);
		return await Promise.all(
			quizzesData.map(async (quiz) => ({
				...(await this.getQuizById(quiz.id))
			}))
		);
	}

	async getQuizHistoryListByUserEmail(userEmail: string): Promise<QuizHistoryList[]> {
		const quizHistories: QuizHistoryList[] = [];
		const userQuizzes = await this.userQuizService.getUserQuizzesByUserEmail(userEmail);

		const quizIds = userQuizzes.map((uq) => uq.quizId);
		const quizzes = await this.quizService.getQuizzesByIds(quizIds);
		const users = await this.userService.getUsersByIds(quizzes.map((q) => q.creatorId));

		for (const userQuiz of userQuizzes) {
			const quiz = quizzes.find((quiz) => quiz.id === userQuiz.quizId);
			const creator = users.find((user) => user.id === quiz?.creatorId);
			if (!quiz || !creator) continue;
			quizHistories.push({
				userQuizId: userQuiz.id,
				name: quiz?.name,
				creatorName: creator.name,
				submissionDate: userQuiz?.submittedAt
			});
		}
		return quizHistories;
	}

	async getQuizHistoryByUserEmail(userEmail: string): Promise<QuizHistory[]> {
		const quizHistories: QuizHistory[] = [];
		const userQuizzes = await this.userQuizService.getUserQuizzesByUserEmail(userEmail);
		for (const userQuiz of userQuizzes) {
			const quiz = await this.getQuizById(userQuiz.quizId);
			quizHistories.push({ userQuiz, quiz });
		}
		return quizHistories;
	}
}
function shuffleOptions(array: { text: string; isCorrect: boolean; }[]): { text: string; isCorrect: boolean; }[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

