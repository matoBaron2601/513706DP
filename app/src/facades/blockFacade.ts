import { ChunkerService } from '../chunker/chunkerService';
import { db } from '../db/client';
import type { BlockWithConcepts, CreateBlockWithDocumentPath } from '../schemas/blockSchema';
import { OpenAiService } from '../services/openAIService';
import { BlockService } from '../services/blockService';
import { ConceptService } from '../services/conceptService';
import { TypesenseService } from '../typesense/typesenseService';
import { PlacementQuizFacade } from './placementQuizFacade';

export class BlockFacade {
	private blockService: BlockService;
	private conceptService: ConceptService;
	private typesenseService: TypesenseService;
	private openAiService: OpenAiService;
	private chunkerService: ChunkerService;
	private placementQuizFacade: PlacementQuizFacade;

	constructor() {
		this.blockService = new BlockService();
		this.conceptService = new ConceptService();
		this.typesenseService = new TypesenseService();
		this.openAiService = new OpenAiService();
		this.chunkerService = new ChunkerService();
		this.placementQuizFacade = new PlacementQuizFacade();
	}

	async getManyByCourseId(courseId: string): Promise<BlockWithConcepts[]> {
		const blocks = await this.blockService.getManyByCourseId(courseId);
		const concepts = await this.conceptService.getManyByBlockIds(blocks.map((cb) => cb.id));
		return blocks.map((cb) => ({
			...cb,
			concepts: concepts.filter((c) => c.blockId === cb.id).map((c) => c.name)
		}));
	}

	async createBlockWithDocument(data: CreateBlockWithDocumentPath): Promise<BlockWithConcepts> {
		return await db.transaction(async (tx) => {
			const block = await this.blockService.create(data, tx);
			const blockDataExists = await this.typesenseService.checkDocumentExists(block.id);
			if (blockDataExists) {
				throw new Error(`Typesense document for block with id ${block.id} does already exist`);
			}
			const loadFile = await this.blockService.getFileTextByPath(data.document);
			const identifiedConcepts = await this.openAiService.identifyConcepts(loadFile ?? 'Unknown');
			await this.conceptService.createMany(
				identifiedConcepts.map((concept, index) => ({
					name: concept,
					blockId: block.id,
					difficultyIndex: index
				})),
				tx
			);
			const chunks = await this.chunkerService.chunkRTC(loadFile ?? 'Unknown');
			await this.typesenseService.populateManyQuizCollection(
				chunks.map((chunk) => ({
					course_block_id: block.id,
					content: chunk
				}))
			);
			await this.placementQuizFacade.createPlacementQuiz(block.id, tx);

			return {
				...block,
				concepts: identifiedConcepts
			};
		});
	}

	async getById(id: string): Promise<BlockWithConcepts> {
		const block = await this.blockService.getById(id);
		const concepts = await this.conceptService.getManyByBlockId(id);
		return {
			...block,
			concepts: concepts.map((c) => c.name)
		};
	}
}
