import type { AdaptiveQuizAnswer } from '../schemas/adaptiveQuizAnswerSchema';
import type { AdaptiveQuiz, ComplexAdaptiveQuiz } from '../schemas/adaptiveQuizSchema';
import type {
	BaseQuizWithQuestionsAndOptions,
	BaseQuizWithQuestionsAndOptionsAndFirstUnanswered
} from '../schemas/baseQuizSchema';
import { AdaptiveQuizAnswerService } from '../services/adaptiveQuizAnswerService';
import { AdaptiveQuizService } from '../services/adaptiveQuizService';
import { ConceptProgressRecordService } from '../services/conceptProgressRecordService';
import { ConceptProgressService } from '../services/conceptProgressService';
import { BaseQuizFacade } from './baseQuizFacade';

export class AdaptiveQuizFacade {
	private adaptiveQuizService: AdaptiveQuizService;
	private baseQuizFacade: BaseQuizFacade;
	private adaptiveQuizAnswerService: AdaptiveQuizAnswerService;
	private conceptProgressService: ConceptProgressService;
	private conceptProgressRecordService: ConceptProgressRecordService;
	constructor() {
		this.adaptiveQuizService = new AdaptiveQuizService();
		this.baseQuizFacade = new BaseQuizFacade();
		this.adaptiveQuizAnswerService = new AdaptiveQuizAnswerService();
		this.conceptProgressService = new ConceptProgressService();
		this.conceptProgressRecordService = new ConceptProgressRecordService();
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

	async finishAdaptiveQuiz(adaptiveQuizId: string) : Promise<AdaptiveQuiz> {
		const updatedAdaptiveQuiz = await this.adaptiveQuizService.update(adaptiveQuizId, {
			isCompleted: true
		});

		const complexAdaptiveQuiz = await this.getComplexAdaptiveQuizById(adaptiveQuizId);
		const conceptIdToQuestionsMap = complexAdaptiveQuiz.questions.reduce<
			Record<string, typeof complexAdaptiveQuiz.questions>
		>((acc, question) => {
			if (!acc[question.conceptId]) {
				acc[question.conceptId] = [];
			}
			acc[question.conceptId].push(question);
			return acc;
		}, {});

		for (const conceptId in conceptIdToQuestionsMap) {
			const questions = conceptIdToQuestionsMap[conceptId];
			const conceptProgress = await this.conceptProgressService.create({
				userBlockId: updatedAdaptiveQuiz.userBlockId,
				conceptId: conceptId,
				completed: questions.every((q) => q.isCorrect)
			});
			const conceptProgressRecord = await this.conceptProgressRecordService.create({
				conceptProgressId: conceptProgress.id,
				adaptiveQuizId: adaptiveQuizId,
				correctCount: questions.filter((q) => q.isCorrect).length,
				count: questions.length
			});
		}

		return updatedAdaptiveQuiz;
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
}
