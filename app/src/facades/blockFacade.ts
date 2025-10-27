import { ChunkerService } from '../chunker/chunkerService';
import { db } from '../db/client';
import type {
	CreateBlockRequest,
	CreateBlockResponse,
	GetManyByCourseIdResponse,
	IdentifyConceptsInternal,
	IdentifyConceptsRequest,
	IdentifyConceptsResponse
} from '../schemas/blockSchema';
import { OpenAiService, type EmbeddingData } from '../services/openAIService';
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

	async getManyByCourseId(courseId: string): Promise<GetManyByCourseIdResponse> {
		const blocks = await this.blockService.getManyByCourseId(courseId);
		const concepts = await this.conceptService.getManyByBlockIds(blocks.map((cb) => cb.id));
		return blocks.map((cb) => ({
			...cb,
			concepts: concepts.filter((c) => c.blockId === cb.id).map((c) => c.name)
		}));
	}

	async identifyConcepts(documentPath: string): Promise<IdentifyConceptsResponse> {
		const fileText = await this.blockService.getFileTextByPath(documentPath);
		if (!fileText) {
			throw new Error('Failed to load file text for concept identification');
		}
		const identifiedConcepts = await this.openAiService.identifyConcepts(fileText);
		return {
			concepts: identifiedConcepts,
			documentPath: documentPath
		};
	}

	async createBlock(data: CreateBlockRequest): Promise<CreateBlockResponse> {
		return await db.transaction(async (tx) => {
			const block = await this.blockService.create(
				{
					name: data.name,
					courseId: data.courseId,
					documentPath: data.documentPath
				},
				tx
			);

			await this.conceptService.createMany(
				data.concepts.map((concept) => ({
					name: concept.name,
					blockId: block.id,
					difficultyIndex: concept.difficultyIndex
				})),
				tx
			);

			const blockDataExists = await this.typesenseService.checkDocumentExists(block.id);
			if (blockDataExists) {
				throw new Error(`Typesense document for block with id ${block.id} does already exist`);
			}
			const fileText = await this.blockService.getFileTextByPath(data.documentPath);
			if (!fileText) {
				throw new Error('Failed to load file text for block creation');
			}

			const chunks = await this.chunkerService.chunk(data.chunkingStrategy, fileText);

			const chunksReadyForIndexing = data.useLLMTransformation
				? await Promise.all(
						chunks.map(async (chunk) => {
							if (data.useLLMTransformation) {
								return await this.openAiService.preRetrievalTransform(chunk);
							} else {
								return chunk;
							}
						})
					)
				: chunks;

			if (data.retrievalMethod === 'hybrid') {
				const embeddings = await this.openAiService.createEmbeddings(chunksReadyForIndexing);
				if (!embeddings.data || embeddings.data.length !== chunksReadyForIndexing.length) {
					throw new Error(
						`Embedding count mismatch: got ${embeddings.data?.length} vs ${chunksReadyForIndexing.length}`
					);
				}
				const docs = embeddings.data
					.sort((a: EmbeddingData, b: EmbeddingData) => a.index - b.index)
					.map((item: EmbeddingData, i: number) => ({
						block_id: block.id,
						chunk_index: i,
						content: chunksReadyForIndexing[i],
						vector: item.embedding
					}));
				await this.typesenseService.createMany(docs);
			} else {
				await this.typesenseService.createMany(
					chunksReadyForIndexing.map((chunk, i) => ({
						block_id: block.id,
						chunk_index: i,
						content: chunk
					}))
				);
			}
			return {
				...block,
				concepts: data.concepts.map((concept) => ({
					...concept,
					blockId: block.id
				}))
			};
		});
	}

	async getById(id: string) {
		const block = await this.blockService.getById(id);
		const concepts = await this.conceptService.getManyByBlockId(id);
		return {
			...block,
			concepts: concepts.map((c) => c.name)
		};
	}
}
