import { TypesenseRepository } from './typesenseRepository';
import typesenseSchema from './schemas/typesenseSchema.json';
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import type { CollectionSchema } from 'typesense/lib/Typesense/Collection';
import { COLLECTION_NAME, type DocumentSearchParams, type QuizDocument } from './types';
import type { SearchResponse } from 'typesense/lib/Typesense/Documents';
import type { ConceptDto } from '../db/schema';

export class TypesenseError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'TypesenseError';
	}
}

export class TypesenseService {
	private repo: TypesenseRepository;
	constructor() {
		this.repo = new TypesenseRepository();
	}

	async getCollections(): Promise<CollectionSchema[]> {
		return this.repo.getCollections();
	}

	async createQuizCollection(): Promise<CollectionSchema> {
		return this.repo.createCollection(typesenseSchema as CollectionCreateSchema);
	}

	async deleteQuizCollection(): Promise<CollectionSchema> {
		return this.repo.deleteCollection(COLLECTION_NAME);
	}

	async createMany(documents: QuizDocument[]) {
		return await this.repo.createMany(COLLECTION_NAME, documents);
	}

	async chunkForThisBlockIdAlreadyExists(blockId: string): Promise<boolean> {
		const searchParams: DocumentSearchParams = {
			q: '*',
			query_by: 'block_id',
			filter_by: `block_id:=${blockId}`,
			per_page: 1
		};
		try {
			const result = await this.getDocuments(searchParams);
			return result.found > 0;
		} catch (error) {
			throw new TypesenseError('Error checking document existence');
		}
	}

	async createContentToChunksMap(
		concepts: ConceptDto[],
		blockId: string
	): Promise<Record<string, string[]>> {
		const contentToChunksMap: Record<string, string[]> = {};
		for (const concept of concepts) {
			const typeSenseChunks = await this.getDocuments({
				q: concept.name,
				query_by: 'content',
				filter_by: `block_id:=${blockId}`,
				per_page: 50
			});

			const chunks =
				typeSenseChunks.hits?.map((hit) => (hit.document as { content: string }).content) ?? [];
			for (const chunk of chunks) {
				if (!contentToChunksMap[concept.id]) {
					contentToChunksMap[concept.id] = [];
				}
				contentToChunksMap[concept.id].push(chunk);
			}
		}

		return contentToChunksMap;
	}

	async getChunksByConcept(conceptName: string, blockId: string): Promise<string[]> {
		const chunks = await this.getDocuments({
			q: conceptName,
			query_by: 'content,vector',
			filter_by: `block_id:=${blockId}`,
			per_page: 50,
			sort_by: '_text_match:desc',
			prefix:false,
		});
		return chunks.hits?.map((hit) => (hit.document as { content: string }).content) ?? [];
	}

	private async getDocuments({
		q,
		query_by,
		filter_by,
		sort_by,
		per_page,
		prefix,
		page
	}: DocumentSearchParams): Promise<SearchResponse<object>> {
		return this.repo.getDocuments(COLLECTION_NAME, {
			q,
			query_by,
			filter_by,
			sort_by,
			per_page,
			page,
			prefix
		});
	}
}
