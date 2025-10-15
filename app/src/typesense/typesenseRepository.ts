import typesenseClient from './client';
import type { CollectionSchema } from 'typesense/lib/Typesense/Collection';
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import type { DocumentSearchParams } from './types';

export class TypesenseRepository {
	async getCollections(): Promise<CollectionSchema[]> {
		return await typesenseClient.collections().retrieve();
	}

	async createCollection(schema: CollectionCreateSchema): Promise<CollectionSchema> {
		return await typesenseClient.collections().create(schema);
	}

	async deleteCollection(name: string): Promise<CollectionSchema> {
		return await typesenseClient.collections(name).delete();
	}

	async populateCollection(collectionName: string, document: object): Promise<object> {
		return await typesenseClient.collections(collectionName).documents().create(document);
	}

	async getDocuments(collectionName: string, searchParams: DocumentSearchParams): Promise<object> {
		return await typesenseClient.collections(collectionName).documents().search(searchParams);
	}
}
