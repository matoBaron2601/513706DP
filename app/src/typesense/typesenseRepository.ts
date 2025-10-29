import typesenseClient from './client';
import type { CollectionSchema } from 'typesense/lib/Typesense/Collection';
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import type { DocumentSearchParams, QuizDocument } from './types';
import type { Search } from '@lucide/svelte';
import type { SearchResponse } from 'typesense/lib/Typesense/Documents';

export class TypesenseRepository {
	async getCollections(): Promise<CollectionSchema[]> {
		return await typesenseClient.collections().retrieve();
	}

	async createCollection(schema: CollectionCreateSchema): Promise<CollectionSchema> {
		const result = await typesenseClient.collections().create(schema);
		return result;
	}

	async deleteCollection(name: string): Promise<CollectionSchema> {
		return await typesenseClient.collections(name).delete();
	}

	async populateCollection(collectionName: string, document: QuizDocument) {
		return await typesenseClient.collections(collectionName).documents().create(document);
	}

	async createMany(collectionName: string, docs: QuizDocument[]) {
		return await typesenseClient
			.collections(collectionName)
			.documents()
			.import(docs, { action: 'create' });
	}

	async getDocuments(
		collectionName: string,
		searchParams: DocumentSearchParams
	): Promise<SearchResponse<object>> {
		return await typesenseClient.collections(collectionName).documents().search(searchParams);
	}
}
