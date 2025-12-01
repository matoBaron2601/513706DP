import { db } from '../db/client';
import type { AdaptiveQuizAnswer } from '../schemas/adaptiveQuizAnswerSchema';
import type { AdaptiveQuiz, ComplexAdaptiveQuiz } from '../schemas/adaptiveQuizSchema';
import type {
	BaseQuizWithQuestionsAndOptions,
	BaseQuizWithQuestionsAndOptionsBlank
} from '../schemas/baseQuizSchema';

import { AdaptiveQuizAnswerService } from '../services/adaptiveQuizAnswerService';
import { AdaptiveQuizService } from '../services/adaptiveQuizService';
import { BaseQuizService } from '../services/baseQuizService';
import { ConceptProgressService } from '../services/conceptProgressService';
import { ConceptService } from '../services/conceptService';
import { OpenAiService } from '../services/openAIService';
import { UserBlockService } from '../services/userBlockService';
import { TypesenseService } from '../typesense/typesenseService';
import { BaseQuizFacade } from './baseQuizFacade';
import { ConceptFacade } from './conceptFacade';
import type { ConceptProgress } from '../schemas/conceptProgressSchema';

export class AdaptiveQuizFacade {
	private adaptiveQuizService: AdaptiveQuizService;
	private baseQuizFacade: BaseQuizFacade;
	private adaptiveQuizAnswerService: AdaptiveQuizAnswerService;
	private conceptProgressService: ConceptProgressService;
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
		this.baseQuizService = new BaseQuizService();
		this.openAiService = new OpenAiService();
		this.conceptService = new ConceptService();
		this.typesenseService = new TypesenseService();
		this.conceptFacade = new ConceptFacade();
		this.userBlockService = new UserBlockService();
	}

	// Get a complex adaptive quiz by its ID, including user answers and correctness
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

	// Finish an adaptive quiz and potentially generate a new one
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

	// Generate an adaptive quiz based on user performance and concept priorities
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
			const lowNumberOfConceptsIndex = (3 - prioritizedConcepts.length) * 2;
			const numberOfQuestions =
				Math.ceil(Math.min(Math.max(8 * deficit, 2), 6)) + lowNumberOfConceptsIndex;

			const scoreA1 = concept.correctA1 / (concept.askedA1 || 1);
			const scoreA2 = concept.correctA2 / (concept.askedA2 || 1);
			const scoreB1 = concept.correctB1 / (concept.askedB1 || 1);
			const scoreB2 = concept.correctB2 / (concept.askedB2 || 1);

			const deficitA1 = Math.max(0, 0.8 - scoreA1);
			const deficitA2 = Math.max(0, 0.8 - scoreA2);
			const deficitB1 = Math.max(0, 0.8 - scoreB1);
			const deficitB2 = Math.max(0, 0.8 - scoreB2);

			const indicatorA1 = concept.askedA1 < 5 ? 1 : 0;
			const indicatorA2 = concept.askedA2 < 5 ? 1 : 0;
			const indicatorB1 = concept.askedB1 < 5 ? 1 : 0;
			const indicatorB2 = concept.askedB2 < 5 ? 1 : 0;

			const weightA1 = deficitA1 + 0.2 * indicatorA1;
			const weightA2 = deficitA2 + 0.2 * indicatorA2;
			const weightB1 = deficitB1 + 0.2 * indicatorB1;
			const weightB2 = deficitB2 + 0.2 * indicatorB2;

			const numberOfQuestionsA1 = Math.round(
				numberOfQuestions * (weightA1 / (weightA1 + weightA2 + weightB1 + weightB2))
			);
			const numberOfQuestionsA2 = Math.round(
				numberOfQuestions * (weightA2 / (weightA1 + weightA2 + weightB1 + weightB2))
			);
			const numberOfQuestionsB1 = Math.round(
				numberOfQuestions * (weightB1 / (weightA1 + weightA2 + weightB1 + weightB2))
			);
			const numberOfQuestionsB2 =
				numberOfQuestions - numberOfQuestionsA1 - numberOfQuestionsA2 - numberOfQuestionsB1;
			const currentConcept = concepts.find((c) => c.id === concept.conceptId);

			let questions: BaseQuizWithQuestionsAndOptionsBlank | undefined; // Initialize to undefined

			try {
				questions = await this.generateAdaptiveQuizQuestions(
					blockId,
					currentConcept?.id ?? '',
					concepts.map((c) => c.name).filter((name) => name !== currentConcept?.name),
					numberOfQuestionsA1,
					numberOfQuestionsA2,
					numberOfQuestionsB1,
					numberOfQuestionsB2,
					userBlockId
				);
			} catch (error) {
				console.error(`Failed to generate questions for concept ${concept.conceptId}:`, error);
			}

			if (questions) {
				await this.baseQuizFacade.createBaseQuestionsAndOptions({
					data: new Map([[concept.conceptId, questions]]),
					baseQuizId: baseQuizId
				});
			} else {
				console.warn(
					`Skipping quiz creation for concept ${concept.conceptId} because question generation failed.`
				);
				await this.adaptiveQuizService.update(adaptiveQuizId, { version: 9999 });

				return false;
			}
		}
		await this.adaptiveQuizService.update(adaptiveQuizId, { readyForAnswering: true });
		return true;
	}

	// Generate adaptive quiz questions for a specific concept
	private async generateAdaptiveQuizQuestions(
		blockId: string,
		conceptId: string,
		conceptNames: string[],
		numberOfQuestionsA1: number,
		numberOfQuestionsA2: number,
		numberOfQuestionsB1: number,
		numberOfQuestionsB2: number,
		userBlockId: string
	): Promise<BaseQuizWithQuestionsAndOptionsBlank> {
		const { name: conceptName } = await this.conceptService.getById(conceptId);
		const questionHistory = await this.getQuestionHistory(userBlockId, conceptId);
		const chunks = await this.typesenseService.getChunksByConcept(conceptName, blockId);

		let lastError: unknown;

		for (let attempt = 1; attempt <= 3; attempt++) {
			try {
				const questions = await this.openAiService.createAdaptiveQuizQuestions(
					conceptName,
					conceptNames,
					chunks,
					numberOfQuestionsA1,
					numberOfQuestionsA2,
					numberOfQuestionsB1,
					numberOfQuestionsB2,
					questionHistory
				);

				await this.questionsValidations(questions);

				return questions;
			} catch (error) {
				lastError = error;
				console.warn(`Attempt ${attempt} failed for ${conceptName}. Retrying...`, error);

				if (attempt === 3) {
					console.log(`All attempts failed for ${conceptName}.`);
				}

				await new Promise((res) => setTimeout(res, 500));
			}
		}

		throw new Error(`Unexpected state while generating quiz questions for ${conceptName}.`);
	}

	async regenerateAdaptiveQuiz(adaptiveQuizId: string): Promise<boolean> {
		const adaptiveQuiz = await this.adaptiveQuizService.getById(adaptiveQuizId);
		const baseQuizId = adaptiveQuiz.baseQuizId;
		const userBlockId = adaptiveQuiz.userBlockId;
		const adaptiveQuizzes = await this.adaptiveQuizService.getByUserBlockId(userBlockId);
		await this.adaptiveQuizService.update(adaptiveQuizId, { version: adaptiveQuizzes.length - 1 });
		return this.generateAdaptiveQuiz(userBlockId, baseQuizId, adaptiveQuizId);
	}

	// Calculate the priority of concepts based on user progress
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

	// Get the question history for a user and concept
	private async getQuestionHistory(userBlockId: string, conceptId: string) {
		const adaptiveQuizzes = await this.adaptiveQuizService.getByUserBlockId(userBlockId);
		const questionHistory = await this.adaptiveQuizAnswerService.getQuestionHistory(
			adaptiveQuizzes.map((quiz) => quiz.id),
			conceptId
		);
		return questionHistory;
	}

	// Validate the questions in a quiz
	private async questionsValidations(quiz: BaseQuizWithQuestionsAndOptionsBlank): Promise<void> {
		if (!quiz || !quiz.questions || quiz.questions.length === 0) {
			throw new Error('Quiz must contain at least one question.');
		}

		const orderIndexes = new Set<number>();

		quiz.questions.forEach((q, i) => {
			const questionNumber = i + 1;

			if (!q.questionText?.trim()) {
				throw new Error(`Question ${questionNumber}: questionText cannot be empty.`);
			}

			if (!q.correctAnswerText?.trim()) {
				throw new Error(`Question ${questionNumber}: correctAnswerText cannot be empty.`);
			}

			if (orderIndexes.has(q.orderIndex)) {
				throw new Error(`Duplicate orderIndex found for question: ${q.orderIndex}`);
			}
			orderIndexes.add(q.orderIndex);

			if (
				q.questionType !== 'A1' &&
				q.questionType !== 'A2' &&
				q.questionType !== 'B1' &&
				q.questionType !== 'B2'
			) {
				throw new Error(`Question ${questionNumber}: Invalid questionType ${q.questionType}.`);
			}

			if (q.questionType === 'B1' || q.questionType === 'B2') {
				if (!q.codeSnippet?.trim()) {
					throw new Error(
						`Question ${questionNumber}: codeSnippet is required for ${q.questionType} question types.`
					);
				}
			}

			if (q.questionType === 'A1' || q.questionType === 'B1') {
				let hasCorrectOption = false;
				let correctOptionMatchesAnswerText = false;
				const normalizedCorrectAnswerText = q.correctAnswerText.trim();

				q.options.forEach((opt, j) => {
					if (!opt.optionText?.trim()) {
						throw new Error(
							`Question ${questionNumber}, Option ${j + 1}: optionText cannot be empty.`
						);
					}

					if (opt.isCorrect) {
						hasCorrectOption = true;
						if (opt.optionText.trim() === normalizedCorrectAnswerText) {
							correctOptionMatchesAnswerText = true;
						}
					}
				});

				if (!hasCorrectOption) {
					throw new Error(`Question ${questionNumber}: must contain at least one correct option.`);
				}

				if (!correctOptionMatchesAnswerText) {
					throw new Error(
						`Question ${questionNumber}: correctAnswerText (${normalizedCorrectAnswerText}) must match the optionText of at least one correct option for ${q.questionType} types.`
					);
				}
			}
		});
	}
}
