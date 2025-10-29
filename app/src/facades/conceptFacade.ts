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
import { ConceptProgressRecordService } from '../services/conceptProgressRecordService';
import { ConceptProgressService } from '../services/conceptProgressService';
import { ConceptService } from '../services/conceptService';
import { UserBlockService } from '../services/userBlockService';

export class ConceptFacade {
	private conceptService: ConceptService;
	private conceptProgressService: ConceptProgressService;
	private conceptProgressRecordService: ConceptProgressRecordService;
	private adaptiveQuizService: AdaptiveQuizService;
	private userBlockService: UserBlockService;

	constructor() {
		this.conceptService = new ConceptService();
		this.conceptProgressService = new ConceptProgressService();
		this.conceptProgressRecordService = new ConceptProgressRecordService();
		this.adaptiveQuizService = new AdaptiveQuizService();
		this.userBlockService = new UserBlockService();
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

		const conceptProgressRecords =
			await this.conceptProgressRecordService.getManyByProgressIdsByAdaptiveQuizIds(
				conceptsProgresses.map((cp) => cp.id),
				lastAdaptiveQuizzes.map((aq) => aq.id)
			);
		const complexConcepts = concepts.map((concept) => {
			const conceptProgress = conceptsProgresses.find((cp) => cp.conceptId === concept.id);

			if (!conceptProgress) {
				throw new Error(`Concept progress not found for concept ID: ${concept.id}`);
			}

			const conceptProgressRecordsData = conceptProgressRecords.filter(
				(cpr) => cpr.conceptProgressId === conceptProgress.id
			);

			return {
				concept: concept,
				conceptProgress: conceptProgress,
				conceptProgressRecords: conceptProgressRecordsData
			};
		});
		return complexConcepts;
	}

	async updateConceptProgress(userBlockId: string): Promise<void> {
		const lastAdaptiveQuizzes = await this.adaptiveQuizService.getLastVersionsByUserBlockId(
			userBlockId,
			3
		);

		const conceptsProgresses: ConceptProgress[] =
			await this.conceptProgressService.getManyByUserBlockId(userBlockId);

		const conceptProgressRecords =
			await this.conceptProgressRecordService.getManyByProgressIdsByAdaptiveQuizIds(
				conceptsProgresses.map((cp) => cp.id),
				lastAdaptiveQuizzes.map((aq) => aq.id)
			);

		const conceptStats = new Map<string, { correctCount: number; totalCount: number }>();

		for (const record of conceptProgressRecords) {
			const id = record.conceptProgressId;
			const current = conceptStats.get(id) ?? { correctCount: 0, totalCount: 0 };
			conceptStats.set(id, {
				correctCount: current.correctCount + (record.correctCount ?? 0),
				totalCount: current.totalCount + (record.count ?? 0)
			});
		}

		for (const stat of conceptStats.entries()) {
			const [conceptProgressId, stats] = stat;
			if (stats.correctCount / stats.totalCount > 0.8) {
				await this.conceptProgressService.update(conceptProgressId, { completed: true });
			}
		}
	}

	async getConceptProgressPercentage(
		userBlockId: string,
		conceptProgressId: string
	): Promise<number> {
		const lastAdaptiveQuizzes = await this.adaptiveQuizService.getLastVersionsByUserBlockId(
			userBlockId,
			3
		);

		const conceptProgressRecords =
			await this.conceptProgressRecordService.getManyByProgressIdsByAdaptiveQuizIds(
				[conceptProgressId],
				lastAdaptiveQuizzes.map((aq) => aq.id)
			);

		let correctCount = 0;
		let totalCount = 0;

		for (const record of conceptProgressRecords) {
			correctCount += record.correctCount ?? 0;
			totalCount += record.count ?? 0;
		}

		if (totalCount === 0) return 0;

		const percentage = (correctCount / totalCount) * 100;
		return Math.round(percentage * 100) / 100;
	}
}
