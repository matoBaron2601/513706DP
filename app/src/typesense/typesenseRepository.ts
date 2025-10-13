import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import typesenseClient from './client';
import type { DocumentSearchParams, PopulateCollection } from './types';

export const getCollection = async () => {
	const collections = await typesenseClient.collections().retrieve();
	return collections;
};

export const createCollection = async ({ schema }: { schema: CollectionCreateSchema }) => {
	const newCollection = await typesenseClient.collections().create(schema);
	return newCollection;
};

export const deleteCollection = async ({ name }: { name: string }) => {
	return await typesenseClient.collections(name).delete();
};

export const populateCollection = async ({
	collectionName,
	content,
	is_default,
	name,
	source_file
}: PopulateCollection) => {
	return await typesenseClient.collections(collectionName).documents().create({
		content,
		is_default,
		name,
		source_file
	});
};

export const getDocuments = async ({
	collectionName,
	searchParams
}: {
	collectionName: string;
	searchParams: DocumentSearchParams;
}) => {
	return await typesenseClient.collections(collectionName).documents().search(searchParams);
};
