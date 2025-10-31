import { db } from '../db/client';
import type { AdaptiveQuizAnswer } from '../schemas/adaptiveQuizAnswerSchema';
import type { AdaptiveQuiz, ComplexAdaptiveQuiz } from '../schemas/adaptiveQuizSchema';
import type {
	BaseQuizWithQuestionsAndOptions,
	BaseQuizWithQuestionsAndOptionsBlank
} from '../schemas/baseQuizSchema';
import type {
	ConceptProgressRecord,
	CreateConceptProgressRecord
} from '../schemas/conceptProgressRecordSchema';
import type { Concept } from '../schemas/conceptSchema';
import { AdaptiveQuizAnswerService } from '../services/adaptiveQuizAnswerService';
import { AdaptiveQuizService } from '../services/adaptiveQuizService';
import { BaseQuizService } from '../services/baseQuizService';
import { ConceptProgressRecordService } from '../services/conceptProgressRecordService';
import { ConceptProgressService } from '../services/conceptProgressService';
import { ConceptService } from '../services/conceptService';
import { OpenAiService } from '../services/openAIService';
import { UserBlockService } from '../services/userBlockService';
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
	private userBlockService: UserBlockService;
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
		this.userBlockService = new UserBlockService();
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

			const conceptProgressRecords: CreateConceptProgressRecord[] = [];
			for (const conceptId in conceptIdToQuestionsMap) {
				const questions = conceptIdToQuestionsMap[conceptId];

				const conceptProgress = await this.conceptProgressService.getOrCreateConceptProgress(
					{
						userBlockId: updatedAdaptiveQuiz.userBlockId,
						conceptId
					},
					tx
				);

				conceptProgressRecords.push({
					conceptProgressId: conceptProgress.id,
					adaptiveQuizId,
					correctCount: questions.filter((q) => q.isCorrect).length,
					count: questions.length
				});
			}
			await this.conceptProgressRecordService.createMany(conceptProgressRecords, tx);

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

		this.generateAdaptiveQuiz(
			finishAdaptiveQuiz.userBlockId,
			createNewAdaptiveQuiz.baseQuizId,
			createNewAdaptiveQuiz.adaptiveQuizId
		);
		return finishAdaptiveQuiz;
	}

	async generateAdaptiveQuiz(userBlockId: string, baseQuizId: string, adaptiveQuizId: string) {
		return await db.transaction(async (tx) => {
			const conceptProgresses = await this.conceptProgressService.getManyByUserBlockId(
				userBlockId,
				tx
			);
			const filteredConceptProgresses = conceptProgresses.filter((cp) => !cp.completed);
			const lastAdaptiveQuizzes = await this.adaptiveQuizService.getLastVersionsByUserBlockId(
				userBlockId,
				3,
				tx
			);
			const conceptProgressRecords =
				await this.conceptProgressRecordService.getManyByProgressIdsByAdaptiveQuizIds(
					filteredConceptProgresses.map((cp) => cp.id),
					lastAdaptiveQuizzes.map((aq) => aq.id),
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

			const generatedQuestions = await this.generateAdaptiveQuizQuestions(conceptProgressMap);
			const questionsIds = await this.baseQuizFacade.createBaseQuestionsAndOptions({
				data: generatedQuestions,
				baseQuizId
			});

			await this.adaptiveQuizService.update(adaptiveQuizId, { readyForAnswering: true }, tx);

			return { baseQuizId, adaptiveQuizId };
		});
	}

	async generateAdaptiveQuizQuestions(
		conceptProgressMap: Record<string, { percentage: number; difference: number; concept: Concept }>
	): Promise<Map<string, BaseQuizWithQuestionsAndOptionsBlank>> {
		const concepts = Object.values(conceptProgressMap).map((c) => c.concept);

		const conceptIdChunksMap = new Map(
			await Promise.all(
				concepts.map(async (c) => {
					const chunks = await this.typesenseService.getChunksByConcept(c.name, c.blockId);
					return [c.id, chunks] as const;
				})
			)
		);

		return new Map(
			await Promise.all(
				concepts.map(async (concept) => {
					const chunks = conceptIdChunksMap.get(concept.id) || [];
					const placementQuestions = await this.openAiService.createAdaptiveQuizQuestions(
						concept.name,
						concepts.map((c) => c.name),
						chunks,
						conceptProgressMap[concept.id].difference
					);

					return [concept.id, placementQuestions] as const;
				})
			)
		);
	}
}
