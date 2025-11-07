import { db } from '../db/client';
import type { block, ConceptDto } from '../db/schema';
import type {
	BaseQuizWithQuestionsAndOptions,
	BaseQuizWithQuestionsAndOptionsBlank
} from '../schemas/baseQuizSchema';
import type { Concept } from '../schemas/conceptSchema';
import type {
	CreatePlacementQuizRequest,
	CreatePlacementQuizResponse
} from '../schemas/placementQuizSchema';
import { BaseQuizService } from '../services/baseQuizService';
import { ConceptService } from '../services/conceptService';
import { OpenAiService } from '../services/openAIService';
import { PlacementQuizService } from '../services/placementQuizService';
import type { Transaction } from '../types';
import { TypesenseService } from '../typesense/typesenseService';
import { BaseQuizFacade } from './baseQuizFacade';

export class PlacementQuizFacade {
	private conceptService: ConceptService;
	private typesenseService: TypesenseService;
	private baseQuizService: BaseQuizService;
	private placementQuizService: PlacementQuizService;
	private openAiService: OpenAiService;
	private baseQuizFacade: BaseQuizFacade;

	constructor() {
		this.conceptService = new ConceptService();
		this.typesenseService = new TypesenseService();
		this.baseQuizService = new BaseQuizService();
		this.placementQuizService = new PlacementQuizService();
		this.baseQuizFacade = new BaseQuizFacade();
		this.openAiService = new OpenAiService();
	}

	async createPlacementQuiz(
		data: CreatePlacementQuizRequest
	): Promise<BaseQuizWithQuestionsAndOptions> {
		const { baseQuizId } = await db.transaction(async (tx) => {
			const { id: baseQuizId } = await this.baseQuizService.create({}, tx);
			const { id: placementQuizId } = await this.placementQuizService.create(
				{ blockId: data.blockId, baseQuizId },
				tx
			);
			return { baseQuizId, placementQuizId };
		});

		const generatedQuestions = await this.generatePlacementQuizQuestions(
			data.questionsPerConcept,
			data.blockId
		);

		const questionsIds = await this.baseQuizFacade.createBaseQuestionsAndOptions({
			data: generatedQuestions,
			baseQuizId
		});

		const placementQuiz = await this.baseQuizFacade.getQuestionsWithOptionsByBaseQuizId(baseQuizId);
		return placementQuiz;
	}

	async generatePlacementQuizQuestions(
		questionsPerConcept: number,
		blockId: string
	): Promise<Map<string, BaseQuizWithQuestionsAndOptionsBlank>> {
		const conceptsData = await this.conceptService.getManyByBlockId(blockId);
		const concepts = conceptsData.sort((a, b) => a.difficultyIndex - b.difficultyIndex);

		const conceptIdChunksMap = new Map(
			await Promise.all(
				concepts.map(async (c) => {
					const chunks = await this.typesenseService.getChunksByConcept(c.name, blockId);
					return [c.id, chunks] as const;
				})
			)
		);
		return new Map(
			await Promise.all(
				concepts.map(async (concept) => {
					const chunks = conceptIdChunksMap.get(concept.id) || [];
					const placementQuestions = await this.openAiService.createPlacementQuestions(
						concept.name,
						concepts.map((c) => c.name),
						chunks,
						questionsPerConcept
					);

					return [concept.id, placementQuestions] as const;
				})
			)
		);
	}
}
