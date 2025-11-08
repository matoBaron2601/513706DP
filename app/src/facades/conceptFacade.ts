import { stat } from 'fs';
import type { AdaptiveQuiz } from '../schemas/adaptiveQuizSchema';
import type { ConceptProgress } from '../schemas/conceptProgressSchema';
import type {
	Concept,
	GetConceptProgressByUserBlockIdRequest,
	GetConceptProgressByUserBlockIdResponse
} from '../schemas/conceptSchema';
import type { UserBlock } from '../schemas/userBlockSchema';
import { AdaptiveQuizService } from '../services/adaptiveQuizService';
import { ConceptProgressService } from '../services/conceptProgressService';
import { ConceptService } from '../services/conceptService';
import { UserBlockService } from '../services/userBlockService';
import { userBlock } from '../db/schema';
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
			.reduce<Record<string, typeof adaptiveQuizAnswers>>((acc, answer) => {
				const baseQuestion = baseQuestions.find((bq) => bq.id === answer.baseQuestionId);
				if (!baseQuestion) return acc;

				const conceptProgressId = conceptIdToProgressId.get(baseQuestion.conceptId);
				if (!conceptProgressId) return acc;

				if (!acc[conceptProgressId]) acc[conceptProgressId] = [];
				acc[conceptProgressId].push(answer);

				return acc;
			}, {});

		for (const [conceptProgressId, answers] of Object.entries(conceptProgressAnswersMap)) {
			const conceptProgress = conceptsProgresses.find((cp) => cp.id === conceptProgressId);
			if (!conceptProgress) continue; //ERROR?
			const correct = conceptProgress.correct + answers.filter((a) => a.isCorrect).length;
			const asked = conceptProgress.asked + answers.length;
			const alfa = +((conceptProgress?.alfa ?? 1) + correct).toFixed(2);
			const beta = +((conceptProgress?.beta ?? 1) + asked - correct).toFixed(2);
			const score = +(alfa / (alfa + beta)).toFixed(2);
			const variance = +((alfa * beta) / ((alfa + beta) ** 2 * (alfa + beta + 1))).toFixed(2);

			let streak = conceptProgress.streak;
			for (let i = answers.length - 1; i >= 0; i--) {
				if (answers[i].isCorrect) {
					streak++;
				} else {
					streak = 0;
					break;
				}
			}
			await this.conceptProgressService.update(conceptProgress.id, {
				correct,
				asked,
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

	async checkAllConceptsCompleted(userBlockId: string): Promise<boolean> {
		const conceptsProgressesAfterUpdate: ConceptProgress[] =
			await this.conceptProgressService.getManyByUserBlockId(userBlockId);
		const allCompleted = conceptsProgressesAfterUpdate.every((cp) => cp.completed);
		if (allCompleted) {
			await this.userBlockService.update(userBlockId, { completed: true });
		}
		return allCompleted;
	}

	async updateCompleteness(userBlockId: string) {
		const conceptsProgresses =
			await this.conceptProgressService.getManyIncompleteByUserBlockId(userBlockId);

		const idsToComplete: string[] = [];

		for (const cp of conceptsProgresses) {
			const criterium1 = cp.score >= 0.8; //0.8
			const criterium2 = cp.streak >= 0; //3
			const criterium4 = cp.asked >= 5; //5

			const a = cp.alfa,
				b = cp.beta;
			const variance = (a * b) / ((a + b) ** 2 * (a + b + 1));
			const width = 2 * 1.96 * Math.sqrt(variance);
			const criterium3 = width <= 0.15; //0.15

			if (criterium1 && criterium2 && criterium3 && criterium4) {
				idsToComplete.push(cp.id);
			}
		}

		if (idsToComplete.length > 0) {
			await this.conceptProgressService.updateMany(idsToComplete, { completed: true });
		}

		return true;
	}
}
