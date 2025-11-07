import { get } from 'http';
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
import type { ConceptProgress } from '../schemas/conceptProgressSchema';
import { adaptiveQuiz } from '../db/schema';

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
			await this.adaptiveQuizAnswerService.getManyByAdaptiveQuizId(adaptiveQuizId);

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
		const updatedAdaptiveQuiz = await this.adaptiveQuizService.update(adaptiveQuizId, {
			isCompleted: true
		});
		const userBlockId = updatedAdaptiveQuiz.userBlockId;
		const allConceptsCompleted = await this.conceptFacade.updateConceptProgress(
			userBlockId,
			adaptiveQuizId
		);
		if (allConceptsCompleted) {
			return updatedAdaptiveQuiz;
		}

		const { baseQuizId, newAdaptiveQuizId } = await db.transaction(async (tx) => {
			const lastAdaptiveQuiz =
				await this.adaptiveQuizService.getLastAdaptiveQuizByUserBlockId(userBlockId);

			const { id: baseQuizId } = await this.baseQuizService.create({}, tx);
			const { id: adaptiveQuizId } = await this.adaptiveQuizService.create(
				{
					userBlockId,
					baseQuizId,
					version: lastAdaptiveQuiz.version + 1,
					isCompleted: false,
					readyForAnswering: false
				},
				tx
			);
			return { baseQuizId, newAdaptiveQuizId: adaptiveQuizId };
		});

		this.generateAdaptiveQuiz(userBlockId, baseQuizId, newAdaptiveQuizId);

		return updatedAdaptiveQuiz;
	}

	async generateAdaptiveQuiz(
		userBlockId: string,
		baseQuizId: string,
		adaptiveQuizId: string
	): Promise<boolean> {
		const { blockId: blockId } = await this.userBlockService.getById(userBlockId);
		const concepts = await this.conceptService.getManyByBlockId(blockId);
		const prioritizedConcepts = await this.calculateConceptPriority(userBlockId);
		for (const concept of prioritizedConcepts) {
			const deficit = Math.max(0, 0.8 - concept.score);
			const numberOfQuestions = Math.ceil(Math.min(Math.max(8 * deficit, 2), 6));
			const currentConcept = concepts.find((c) => c.id === concept.conceptId);
			const questions = await this.generateAdaptiveQuizQuestions(
				blockId,
				currentConcept?.name ?? '',
				concepts.map((c) => c.name).filter((name) => name !== currentConcept?.name),
				numberOfQuestions
			);
			await this.baseQuizFacade.createBaseQuestionsAndOptions({
				data: new Map([[concept.conceptId, questions]]),
				baseQuizId: baseQuizId
			});
		}
		await this.adaptiveQuizService.update(adaptiveQuizId, { readyForAnswering: true });
		return true;
	}

	private async generateAdaptiveQuizQuestions(
		blockId: string,
		conceptName: string,
		conceptNames: string[],
		numberOfQuestions: number
	): Promise<BaseQuizWithQuestionsAndOptionsBlank> {
		const chunks = await this.typesenseService.getChunksByConcept(conceptName, blockId);
		const questions = await this.openAiService.createAdaptiveQuizQuestions(
			conceptName,
			conceptNames,
			chunks,
			numberOfQuestions
		);
		return questions;
	}

	private async calculateConceptPriority(userBlockId: string): Promise<ConceptProgress[]> {
		const conceptProgresses =
			await this.conceptProgressService.getManyIncompleteByUserBlockId(userBlockId);

		if (!conceptProgresses.length) return [];

		const topConceptProgresses = conceptProgresses
			.map((cp) => ({
				...cp,
				priority: 0.6 * (1 - cp.score) + 0.3 * Math.sqrt(cp.variance ?? 0)
			}))
			.sort((a, b) => b.priority - a.priority)
			.slice(0, 3);

		return topConceptProgresses;
	}
}
