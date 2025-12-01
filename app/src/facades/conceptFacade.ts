import type { AdaptiveQuiz } from '../schemas/adaptiveQuizSchema';
import type { ConceptProgress, QuestionType } from '../schemas/conceptProgressSchema';
import type {
	Concept,
	GetConceptProgressByUserBlockIdRequest,
	GetConceptProgressByUserBlockIdResponse
} from '../schemas/conceptSchema';
import { AdaptiveQuizService } from '../services/adaptiveQuizService';
import { ConceptProgressService } from '../services/conceptProgressService';
import { ConceptService } from '../services/conceptService';
import { UserBlockService } from '../services/userBlockService';
import { AdaptiveQuizAnswerService } from '../services/adaptiveQuizAnswerService';
import { BaseQuestionService } from '../services/baseQuestionService';

export class ConceptFacade {
	private conceptService: ConceptService;
	private conceptProgressService: ConceptProgressService;
	private adaptiveQuizService: AdaptiveQuizService;
	private userBlockService: UserBlockService;
	private adaptiveQuizAnswerService: AdaptiveQuizAnswerService;
	private baseQuestionService: BaseQuestionService;
	constructor() {
		this.conceptService = new ConceptService();
		this.conceptProgressService = new ConceptProgressService();
		this.adaptiveQuizService = new AdaptiveQuizService();
		this.userBlockService = new UserBlockService();
		this.adaptiveQuizAnswerService = new AdaptiveQuizAnswerService();
		this.baseQuestionService = new BaseQuestionService();
	}

	// Get concept progress by user block ID
	async getConceptProgressByUserBlockId(
		data: GetConceptProgressByUserBlockIdRequest
	): Promise<GetConceptProgressByUserBlockIdResponse> {
		const { blockId } = await this.userBlockService.getById(data.userBlockId);
		const concepts: Concept[] = await this.conceptService.getManyByBlockId(blockId);
		const conceptsProgresses: ConceptProgress[] =
			await this.conceptProgressService.getManyByUserBlockId(data.userBlockId);
		const lastAdaptiveQuizzes: AdaptiveQuiz[] =
			await this.adaptiveQuizService.getLastVersionsByUserBlockId(data.userBlockId, 3);

		const complexConcepts = concepts.map((concept) => {
			const conceptProgress = conceptsProgresses.find((cp) => cp.conceptId === concept.id);

			if (!conceptProgress) {
				throw new Error(`Concept progress not found for concept ID: ${concept.id}`);
			}

			return {
				concept: concept,
				conceptProgress: conceptProgress
			};
		});
		return complexConcepts;
	}

	// Update concept progress based on user block ID and adaptive quiz ID
	async updateConceptProgress(userBlockId: string, adaptiveQuizId: string): Promise<boolean> {
		const conceptsProgresses =
			await this.conceptProgressService.getManyIncompleteByUserBlockId(userBlockId);

		const adaptiveQuizAnswers =
			await this.adaptiveQuizAnswerService.getManyByAdaptiveQuizId(adaptiveQuizId);
		const baseQuestionIds = adaptiveQuizAnswers.map((a) => a.baseQuestionId);
		const baseQuestions = await this.baseQuestionService.getManyByIds(baseQuestionIds);

		const conceptIdToProgressId = new Map(conceptsProgresses.map((cp) => [cp.conceptId, cp.id]));

		const conceptProgressAnswersMap = adaptiveQuizAnswers
			.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
			.reduce<
				Record<
					string,
					{ answer: (typeof adaptiveQuizAnswers)[number]; questionType: QuestionType }[]
				>
			>((acc, answer) => {
				const baseQuestion = baseQuestions.find((bq) => bq.id === answer.baseQuestionId);
				if (!baseQuestion) return acc;

				const conceptProgressId = conceptIdToProgressId.get(baseQuestion.conceptId);
				if (!conceptProgressId) return acc;

				if (!acc[conceptProgressId]) acc[conceptProgressId] = [];

				acc[conceptProgressId].push({
					answer,
					questionType: baseQuestion.questionType as QuestionType
				});

				return acc;
			}, {});

		for (const [conceptProgressId, answers] of Object.entries(conceptProgressAnswersMap)) {
			const conceptProgress = conceptsProgresses.find((cp) => cp.id === conceptProgressId);
			if (!conceptProgress) continue;

			const questionTypeStats = answers.reduce<
				Partial<Record<QuestionType, { correct: number; asked: number }>>
			>((acc, { questionType, answer }) => {
				if (!acc[questionType]) {
					acc[questionType] = { correct: 0, asked: 0 };
				}

				acc[questionType]!.asked += 1;
				if (answer.isCorrect) acc[questionType]!.correct += 1;

				return acc;
			}, {});

			const correctA1 = questionTypeStats['A1']?.correct ?? 0;
			const askedA1 = questionTypeStats['A1']?.asked ?? 0;
			const correctA2 = questionTypeStats['A2']?.correct ?? 0;
			const askedA2 = questionTypeStats['A2']?.asked ?? 0;
			const correctB1 = questionTypeStats['B1']?.correct ?? 0;
			const askedB1 = questionTypeStats['B1']?.asked ?? 0;
			const correctB2 = questionTypeStats['B2']?.correct ?? 0;
			const askedB2 = questionTypeStats['B2']?.asked ?? 0;

			const correctNow = correctA1 + correctA2 + correctB1 + correctB2;
			const askedNow = askedA1 + askedA2 + askedB1 + askedB2;

			const alfa = +((conceptProgress?.alfa ?? 1) + correctNow).toFixed(2);
			const beta = +(+(conceptProgress?.beta ?? 1) + askedNow - correctNow).toFixed(2);
			const score = +(alfa / (alfa + beta)).toFixed(2);
			const variance = +((alfa * beta) / ((alfa + beta) ** 2 * (alfa + beta + 1))).toFixed(2);

			let streak = conceptProgress.streak;

			for (let i = answers.length - 1; i >= 0; i--) {
				if (answers[i].answer.isCorrect) {
					streak++;
				} else {
					streak = 0;
					break;
				}
			}
			await this.conceptProgressService.update(conceptProgress.id, {
				correctA1: conceptProgress.correctA1 + correctA1,
				askedA1: conceptProgress.askedA1 + askedA1,
				correctA2: conceptProgress.correctA2 + correctA2,
				askedA2: conceptProgress.askedA2 + askedA2,
				correctB1: conceptProgress.correctB1 + correctB1,
				askedB1: conceptProgress.askedB1 + askedB1,
				correctB2: conceptProgress.correctB2 + correctB2,
				askedB2: conceptProgress.askedB2 + askedB2,
				alfa,
				beta,
				score,
				variance,
				streak
			});
		}
		await this.updateCompleteness(userBlockId);
		return await this.checkAllConceptsCompleted(userBlockId);
	}

	// Check if all concepts in a user block are completed
	async checkAllConceptsCompleted(userBlockId: string): Promise<boolean> {
		const conceptsProgressesAfterUpdate: ConceptProgress[] =
			await this.conceptProgressService.getManyByUserBlockId(userBlockId);
		const allCompleted = conceptsProgressesAfterUpdate.every((cp) => cp.mastered);
		if (allCompleted) {
			await this.userBlockService.update(userBlockId, { completed: true });
		}
		return allCompleted;
	}

	// Update completeness of concepts based on criteria
	async updateCompleteness(userBlockId: string) {
		const conceptsProgresses =
			await this.conceptProgressService.getManyIncompleteByUserBlockId(userBlockId);
		const asked = conceptsProgresses.reduce(
			(sum, cp) => sum + cp.askedA1 + cp.askedA2 + cp.askedB1 + cp.askedB2,
			0
		);

		const idsToComplete: string[] = [];

		for (const cp of conceptsProgresses) {
			const criterium1 = cp.score >= 0.8;
			const criterium2 = cp.streak >= 5;
			const criterium4 = asked >= 5;

			const a = cp.alfa,
				b = cp.beta;
			const variance = (a * b) / ((a + b) ** 2 * (a + b + 1));
			const width = 2 * 1.96 * Math.sqrt(variance);
			const criterium3 = width <= 0.15;

			if (criterium1 && criterium2 && criterium3 && criterium4) {
				idsToComplete.push(cp.id);
			}
		}

		if (idsToComplete.length > 0) {
			await this.conceptProgressService.updateMany(idsToComplete, { mastered: true });
		}

		return true;
	}
}
