import { TypesenseRepository } from './typesenseRepository';
import quizCollectionSchema from './schemas/quizCollectionSchema.json';
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import type { CollectionSchema } from 'typesense/lib/Typesense/Collection';
import { COLLECTION_NAME, type DocumentSearchParams, type QuizDocument } from './types';
import type { SearchResponse } from 'typesense/lib/Typesense/Documents';

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

	async getDocuments(searchParams: DocumentSearchParams): Promise<SearchResponse<object>> {
		return this.repo.getDocuments(COLLECTION_NAME, searchParams);
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
}
