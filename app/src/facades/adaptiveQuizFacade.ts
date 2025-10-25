import type { AdaptiveQuizAnswer } from '../schemas/adaptiveQuizAnswerSchema';
import type { AdaptiveQuiz, ComplexAdaptiveQuiz } from '../schemas/adaptiveQuizSchema';
import type {
	BaseQuizWithQuestionsAndOptions,
	BaseQuizWithQuestionsAndOptionsAndFirstUnanswered,
} from '../schemas/baseQuizSchema';
import { AdaptiveQuizAnswerService } from '../services/adaptiveQuizAnswerService';
import { AdaptiveQuizService } from '../services/adaptiveQuizService';
import { BaseQuizFacade } from './baseQuizFacade';

export class AdaptiveQuizFacade {
	private adaptiveQuizService: AdaptiveQuizService;
	private baseQuizFacade: BaseQuizFacade;
	private adaptiveQuizAnswerService: AdaptiveQuizAnswerService;

	constructor() {
		this.adaptiveQuizService = new AdaptiveQuizService();
		this.baseQuizFacade = new BaseQuizFacade();
		this.adaptiveQuizAnswerService = new AdaptiveQuizAnswerService();
	}

	async getComplexAdaptiveQuizById(adaptiveQuizId: string): Promise<ComplexAdaptiveQuiz> {
		const adaptiveQuiz: AdaptiveQuiz = await this.adaptiveQuizService.getById(adaptiveQuizId);
		const baseQuiz: BaseQuizWithQuestionsAndOptions =
			await this.baseQuizFacade.getQuestionsWithOptionsByBaseQuizId(adaptiveQuiz.baseQuizId);
		const adaptiveQuizAnswers: AdaptiveQuizAnswer[] =
			await this.adaptiveQuizAnswerService.getByAdaptiveQuizId(adaptiveQuizId);

		const questions = baseQuiz.questions.map((question) => {
			const answer = adaptiveQuizAnswers.find((answer) => answer.baseQuestionId === question.id);
			return {
				...question,
				userAnswerText: answer?.answerText || null,
				isCorrect: answer?.isCorrect || null
			};
		});
		return {
			...adaptiveQuiz,
			questions: questions
		};
	}

	async getNextQuiz(
		userBlockId: string
	): Promise<BaseQuizWithQuestionsAndOptionsAndFirstUnanswered> {
		const quiz = await this.adaptiveQuizService.getNextQuiz(userBlockId);
		const baseQuiz = await this.baseQuizFacade.getQuestionsWithOptionsByBaseQuizId(quiz.baseQuizId);

		const getFirstUnansweredQuestion = async () => {
			for (const question of baseQuiz.questions) {
				const isAnswered = await this.adaptiveQuizAnswerService.getByBaseQuestionId(question.id);
				if (!isAnswered) {
					console.log('First unanswered question found:', question);
					return question;
				}
			}
			return null;
		};
		const firstUnansweredQuestion = await getFirstUnansweredQuestion();
		return {
			...baseQuiz,
			firstUnansweredQuestionId: firstUnansweredQuestion ? firstUnansweredQuestion.id : null
		};
	}

	// async getSummary(adaptiveQuizId: string): Promise<SummaryQuiz> {
	// 	const adaptiveQuiz = await this.adaptiveQuizService.getById(adaptiveQuizId);
	// 	const baseQuiz = await this.baseQuizFacade.getQuestionsWithOptionsByBaseQuizId(
	// 		adaptiveQuiz.baseQuizId
	// 	);
	// 	const adaptiveQuizAnswers =
	// 		await this.adaptiveQuizAnswerService.getByAdaptiveQuizId(adaptiveQuizId);

	// 	const questions = baseQuiz.questions.map((question) => {
	// 		const answer = adaptiveQuizAnswers.find((answer) => answer.baseQuestionId === question.id);

	// 		return {
	// 			...question,
	// 			answerText: answer ? answer.answerText : '',
	// 			isCorrect: answer ? answer.isCorrect : false
	// 		};
	// 	});

	// 	const summaryQuiz: SummaryQuiz = {
	// 		...adaptiveQuiz,
	// 		questions
	// 	};

	// 	return summaryQuiz;
	// }
}
