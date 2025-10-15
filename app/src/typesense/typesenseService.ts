import { TypesenseRepository } from './typesenseRepository';
import oneTimeQuizCollectionSchema from './schemas/oneTimeQuizCollectionSchema.json';
import complexQuizCollectionSchema from './schemas/complexQuizCollectionSchema.json';
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import type { CollectionSchema } from 'typesense/lib/Typesense/Collection';
import { ONE_TIME_QUIZ, COMPLEX_QUIZ, type DocumentSearchParams } from './types';

export class TypesenseService {
	private repo: TypesenseRepository;
	constructor() {
		this.repo = new TypesenseRepository();
	}

	async getCollections(): Promise<CollectionSchema[]> {
		return this.repo.getCollections();
	}

	async createOneTimeQuizCollection(): Promise<CollectionSchema> {
		return this.repo.createCollection(oneTimeQuizCollectionSchema as CollectionCreateSchema);
	}

	async createComplexQuizCollection(): Promise<CollectionSchema> {
		return this.repo.createCollection(complexQuizCollectionSchema as CollectionCreateSchema);
	}

	async deleteOneTimeQuizCollection(): Promise<CollectionSchema> {
		return this.repo.deleteCollection(ONE_TIME_QUIZ);
	}

	async deleteComplexQuizCollection(): Promise<CollectionSchema> {
		return this.repo.deleteCollection(COMPLEX_QUIZ);
	}

	async populateOneTimeQuizCollection(document: object): Promise<object> {
		return this.repo.populateCollection(ONE_TIME_QUIZ, document);
	}

	async populateComplexQuizCollection(document: object): Promise<object> {
		return this.repo.populateCollection(COMPLEX_QUIZ, document);
	}

	async getOneTimeQuizDocuments(searchParams: DocumentSearchParams): Promise<object> {
		return this.repo.getDocuments(ONE_TIME_QUIZ, searchParams);
	}

	async getComplexQuizDocuments(searchParams: DocumentSearchParams): Promise<object> {
		return this.repo.getDocuments(COMPLEX_QUIZ, searchParams);
	}
}
