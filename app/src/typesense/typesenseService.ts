import { TypesenseRepository } from './typesenseRepository';
import quizCollectionSchema from './schemas/quizCollectionSchema.json';
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import type { CollectionSchema } from 'typesense/lib/Typesense/Collection';
import { COLLECTION_NAME, type DocumentSearchParams, type QuizDocument } from './types';
import type { SearchResponse } from 'typesense/lib/Typesense/Documents';
import type { ConceptDto } from '../db/schema';

export class TypesenseService {
	private repo: TypesenseRepository;
	constructor() {
		this.repo = new TypesenseRepository();
	}

	async getCollections(): Promise<CollectionSchema[]> {
		return this.repo.getCollections();
	}

	async createQuizCollection(): Promise<CollectionSchema> {
		return this.repo.createCollection(quizCollectionSchema as CollectionCreateSchema);
	}

	async deleteQuizCollection(): Promise<CollectionSchema> {
		return this.repo.deleteCollection(COLLECTION_NAME);
	}

	async getDocuments({
		q,
		query_by,
		filter_by,
		sort_by,
		per_page,
		page
	}: DocumentSearchParams): Promise<SearchResponse<object>> {
		return this.repo.getDocuments(COLLECTION_NAME, {
			q,
			query_by,
			filter_by,
			sort_by,
			per_page,
			page
		});
	}

	async checkDocumentExists(courseBlockId: string): Promise<boolean> {
		const searchParams: DocumentSearchParams = {
			q: '*',
			query_by: 'course_block_id',
			filter_by: `course_block_id:=${courseBlockId}`,
			per_page: 1
		};
		const result = await this.getDocuments(searchParams);
		return result.found > 0;
	}

	async populateManyQuizCollection(documents: QuizDocument[]) {
		for (const document of documents) {
			await this.repo.populateCollection(COLLECTION_NAME, document);
		}
	}

	async createContentToDocumentsMap(
		concepts: ConceptDto[],
		blockId: string
	): Promise<Record<string, string[]>> {
		const contentToDocumentsMap: Record<string, string[]> = {};
		for (const concept of concepts) {
			const typeSenseChunks = await this.getDocuments({
				q: concept.name,
				query_by: 'content',
				filter_by: `course_block_id:=${blockId}`,
				per_page: 50
			});

			const chunks =
				typeSenseChunks.hits?.map((hit) => (hit.document as { content: string }).content) ?? [];
			for (const chunk of chunks) {
				if (!contentToDocumentsMap[concept.id]) {
					contentToDocumentsMap[concept.id] = [];
				}
				contentToDocumentsMap[concept.id].push(chunk);
			}
		}

		return contentToDocumentsMap;
	}
}
