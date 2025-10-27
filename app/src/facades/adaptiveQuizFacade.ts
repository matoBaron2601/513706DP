import { db } from '../db/client';
import type { AdaptiveQuizAnswer } from '../schemas/adaptiveQuizAnswerSchema';
import type { AdaptiveQuiz, ComplexAdaptiveQuiz } from '../schemas/adaptiveQuizSchema';
import type {
	BaseQuizWithQuestionsAndOptions,
	BaseQuizWithQuestionsAndOptionsAndFirstUnanswered
} from '../schemas/baseQuizSchema';
import type { Concept } from '../schemas/conceptSchema';
import { AdaptiveQuizAnswerService } from '../services/adaptiveQuizAnswerService';
import { AdaptiveQuizService } from '../services/adaptiveQuizService';
import { BaseQuizService } from '../services/baseQuizService';
import { ConceptProgressRecordService } from '../services/conceptProgressRecordService';
import { ConceptProgressService } from '../services/conceptProgressService';
import { ConceptService } from '../services/conceptService';
import { OpenAiService } from '../services/openAIService';
import { BaseQuizFacade } from './baseQuizFacade';

export class AdaptiveQuizFacade {
	private adaptiveQuizService: AdaptiveQuizService;
	private baseQuizFacade: BaseQuizFacade;
	private adaptiveQuizAnswerService: AdaptiveQuizAnswerService;
	private conceptProgressService: ConceptProgressService;
	private conceptProgressRecordService: ConceptProgressRecordService;
	private baseQuizService: BaseQuizService;
	private openAiService: OpenAiService;
	private conceptService: ConceptService;
	constructor() {
		this.adaptiveQuizService = new AdaptiveQuizService();
		this.baseQuizFacade = new BaseQuizFacade();
		this.adaptiveQuizAnswerService = new AdaptiveQuizAnswerService();
		this.conceptProgressService = new ConceptProgressService();
		this.conceptProgressRecordService = new ConceptProgressRecordService();
		this.baseQuizService = new BaseQuizService();
		this.openAiService = new OpenAiService();
		this.conceptService = new ConceptService();
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

	async finishAdaptiveQuiz(adaptiveQuizId: string): Promise<AdaptiveQuiz> {
		return await db.transaction(async (tx) => {
			const updatedAdaptiveQuiz = await this.adaptiveQuizService.update(
				adaptiveQuizId,
				{
					isCompleted: true
				},
				tx
			);

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
				const conceptProgress = await this.conceptProgressService.create(
					{
						userBlockId: updatedAdaptiveQuiz.userBlockId,
						conceptId: conceptId,
						completed: questions.every((q) => q.isCorrect)
					},
					tx
				);
				await this.conceptProgressRecordService.create(
					{
						conceptProgressId: conceptProgress.id,
						adaptiveQuizId: adaptiveQuizId,
						correctCount: questions.filter((q) => q.isCorrect).length,
						count: questions.length
					},
					tx
				);
			}

			return updatedAdaptiveQuiz;
		});
	}

	async generateAdaptiveQuiz(userBlockId: string) {
		return await db.transaction(async (tx) => {
			const conceptProgresses = await this.conceptProgressService.getManyByUserBlockId(
				userBlockId,
				tx
			);
			const lastAdaptiveQuizzes = await this.adaptiveQuizService.getLastVersionsByUserBlockId(
				userBlockId,
				3,
				tx
			);
			const conceptProgressIds = conceptProgresses.map((cp) => cp.id);
			const lastAdaptiveQuizzesIds = lastAdaptiveQuizzes.map((aq) => aq.id);
			const conceptProgressRecords =
				await this.conceptProgressRecordService.getManyByProgressIdsByAdaptiveQuizIds(
					conceptProgressIds,
					lastAdaptiveQuizzesIds,
					tx
				);
			const conceptProgressMap: Record<
				string,
				{ percentage: number; difference: number; concept: Concept }
			> = {};

			for (const record of conceptProgressRecords) {
				const percentage = Math.round((record.correctCount / record.count) * 100);
				const difference = record.count - record.correctCount;
				const conceptId =
					conceptProgresses.find((cp) => cp.id === record.conceptProgressId)?.conceptId ?? '';
				const concept = await this.conceptService.getById(conceptId);

				conceptProgressMap[record.conceptProgressId] = {
					percentage,
					difference,
					concept
				};
			}

			const { id: baseQuizId } = await this.baseQuizService.create({}, tx);
			const { id: adaptiveQuizId } = await this.adaptiveQuizService.create(
				{
					userBlockId,
					baseQuizId
				},
				tx
			);

			let questionOrder = 0;
			for (const [conceptId, progress] of Object.entries(conceptProgressMap)) {
				if (progress.percentage >= 80) {
					await this.conceptProgressService.update(conceptId, { completed: true }, tx);
				} else {
					for (let i = 0; i < progress.difference; i++) {
						const questions = await this.openAiService.createAdaptiveQuizQuestions(
							progress.concept.name,
							Object.values(conceptProgressMap).map((c) => c.concept.name),
							[],
							progress.difference
						);
						const numberOfQuestions = questions.questions.length;

						await this.baseQuizFacade.createQuestionsAndOptions(
							{
								questions: questions,
								baseQuizId,
								conceptId,
								initialOrderIndex: questionOrder
							},
							tx
						);
						questionOrder += numberOfQuestions;
					}
				}
			}
			return { baseQuizId, adaptiveQuizId };
		});
	}
}
