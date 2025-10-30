import { db } from '../db/client';
import type { AdaptiveQuizAnswer } from '../schemas/adaptiveQuizAnswerSchema';
import type { AdaptiveQuiz, ComplexAdaptiveQuiz } from '../schemas/adaptiveQuizSchema';
import type { BaseQuizWithQuestionsAndOptions } from '../schemas/baseQuizSchema';
import type { Concept } from '../schemas/conceptSchema';
import { AdaptiveQuizAnswerService } from '../services/adaptiveQuizAnswerService';
import { AdaptiveQuizService } from '../services/adaptiveQuizService';
import { BaseQuizService } from '../services/baseQuizService';
import { ConceptProgressRecordService } from '../services/conceptProgressRecordService';
import { ConceptProgressService } from '../services/conceptProgressService';
import { ConceptService } from '../services/conceptService';
import { OpenAiService } from '../services/openAIService';
import { TypesenseService } from '../typesense/typesenseService';
import { BaseQuizFacade } from './baseQuizFacade';
import { ConceptFacade } from './conceptFacade';

export class AdaptiveQuizFacade {
	private adaptiveQuizService: AdaptiveQuizService;
	private baseQuizFacade: BaseQuizFacade;
	private adaptiveQuizAnswerService: AdaptiveQuizAnswerService;
	private conceptProgressService: ConceptProgressService;
	private conceptProgressRecordService: ConceptProgressRecordService;
	private baseQuizService: BaseQuizService;
	private openAiService: OpenAiService;
	private conceptService: ConceptService;
	private typesenseService: TypesenseService;
	private conceptFacade: ConceptFacade;
	constructor() {
		this.adaptiveQuizService = new AdaptiveQuizService();
		this.baseQuizFacade = new BaseQuizFacade();
		this.adaptiveQuizAnswerService = new AdaptiveQuizAnswerService();
		this.conceptProgressService = new ConceptProgressService();
		this.conceptProgressRecordService = new ConceptProgressRecordService();
		this.baseQuizService = new BaseQuizService();
		this.openAiService = new OpenAiService();
		this.conceptService = new ConceptService();
		this.typesenseService = new TypesenseService();
		this.conceptFacade = new ConceptFacade();
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
				userAnswerText: answer?.answerText === '' ? '' : (answer?.answerText ?? null),
				isCorrect: answer?.isCorrect || null
			};
		});
		return {
			...adaptiveQuiz,
			questions: questions
		};
	}

	async finishAdaptiveQuiz(adaptiveQuizId: string): Promise<AdaptiveQuiz> {
		const finishAdaptiveQuiz = await db.transaction(async (tx) => {
			const updatedAdaptiveQuiz = await this.adaptiveQuizService.update(
				adaptiveQuizId,
				{
					isCompleted: true
				},
				tx
			);

			const complexAdaptiveQuiz = await this.getComplexAdaptiveQuizById(adaptiveQuizId);
			const isPlacementQuiz = complexAdaptiveQuiz.version === 0;
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
				const completed = isPlacementQuiz ? questions.every((q) => q.isCorrect) : false;

				const conceptProgress = await this.conceptProgressService.getOrCreateConceptProgress(
					{
						userBlockId: updatedAdaptiveQuiz.userBlockId,
						conceptId: conceptId,
						completed
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

			await this.conceptFacade.updateConceptProgress(updatedAdaptiveQuiz.userBlockId);

			return updatedAdaptiveQuiz;
		});
		const createNewAdaptiveQuiz = await db.transaction(async (tx) => {
			const lastAdaptiveQuizzes = await this.adaptiveQuizService.getLastVersionsByUserBlockId(
				finishAdaptiveQuiz.userBlockId,
				3,
				tx
			);
			const { id: baseQuizId } = await this.baseQuizService.create({}, tx);
			const { id: adaptiveQuizId } = await this.adaptiveQuizService.create(
				{
					userBlockId: finishAdaptiveQuiz.userBlockId,
					baseQuizId,
					version: lastAdaptiveQuizzes.length
						? Math.max(...lastAdaptiveQuizzes.map((aq) => aq.version)) + 1
						: 1,
					isCompleted: false,
					readyForAnswering: false
				},
				tx
			);
			return { baseQuizId, adaptiveQuizId };
		});

		this.generateAdaptiveQuiz(finishAdaptiveQuiz.userBlockId, createNewAdaptiveQuiz.baseQuizId, createNewAdaptiveQuiz.adaptiveQuizId);
		return finishAdaptiveQuiz;
	}

	async generateAdaptiveQuiz(userBlockId: string, baseQuizId:string, adaptiveQuizId:string) {
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
			if (lastAdaptiveQuizzes.find((aq) => aq.isCompleted === false)) {
				throw new Error('There is already an ongoing adaptive quiz for this user block.');
			}
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

			for (const conceptProgress of conceptProgresses) {
				const records = conceptProgressRecords.filter(
					(record) => record.conceptProgressId === conceptProgress.id
				);
				const concept = await this.conceptService.getById(conceptProgress.conceptId, tx);
				const totalCount = records.reduce((sum, record) => sum + record.count, 0);
				const correctCount = records.reduce((sum, record) => sum + record.correctCount, 0);
				conceptProgressMap[conceptProgress.conceptId] = {
					concept,
					difference: totalCount - correctCount,
					percentage: 8
				};
			}

			let questionOrder = 0;
			for (const [conceptId, progress] of Object.entries(conceptProgressMap)) {
				if (progress.percentage >= 80) {
					await this.conceptProgressService.update(conceptId, { completed: true }, tx);
				} else {
					const questions = await this.openAiService.createAdaptiveQuizQuestions(
						progress.concept.name,
						Object.values(conceptProgressMap).map((c) => c.concept.name),
						await this.typesenseService.getChunksByConcept(
							progress.concept.name,
							progress.concept.blockId
						),
						progress.difference
					);
					const numberOfQuestions = questions.questions.length;
					await this.baseQuizFacade.createQuestionsAndOptions(
						{
							questions: questions,
							baseQuizId,
							conceptId: progress.concept.id,
							initialOrderIndex: questionOrder
						},
						tx
					);
					questionOrder += numberOfQuestions;
				}
			}
			await this.adaptiveQuizService.update(adaptiveQuizId, { readyForAnswering: true }, tx);

			return { baseQuizId, adaptiveQuizId };
		});
	}
}
