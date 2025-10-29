import { db } from '../db/client';
import type { ConceptDto } from '../db/schema';
import type { CreatePlacementQuizRequest } from '../schemas/placementQuizSchema';
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

	async createPlacementQuiz(data: CreatePlacementQuizRequest) {
		return db.transaction(async (tx) => {
			const conceptsData = await this.conceptService.getManyByBlockId(data.blockId, tx);
			const concepts = conceptsData.sort((a, b) => a.difficultyIndex - b.difficultyIndex);
			const contentToChunksMap = await this.typesenseService.createContentToChunksMap(
				concepts,
				data.blockId
			);
			const { id: baseQuizId } = await this.baseQuizService.create({}, tx);
			const { id: placementQuizId } = await this.placementQuizService.create(
				{
					blockId: data.blockId,
					baseQuizId
				},
				tx
			);

			let questionOrder = 0;
			for (const [conceptId, chunks] of Object.entries(contentToChunksMap)) {
				console.log('Creating questions for conceptId:', conceptId);
				const conceptName = concepts.find((c) => c.id === conceptId)?.name;
				if (!conceptName || !chunks) continue;
				const placementQuestions = await this.openAiService.createPlacementQuestions(
					conceptName,
					concepts.map((c) => c.name),
					chunks,
					data.questionsPerConcept
				);
				console.log('Generated placement questions:', placementQuestions);
				const numberOfQuestions = placementQuestions.questions.length;

				await this.baseQuizFacade.createQuestionsAndOptions(
					{
						questions: placementQuestions,
						baseQuizId,
						conceptId,
						initialOrderIndex: questionOrder
					},
					tx
				);
				questionOrder += numberOfQuestions;
			}
			return { baseQuizId, placementQuizId };
		});
	}
}
