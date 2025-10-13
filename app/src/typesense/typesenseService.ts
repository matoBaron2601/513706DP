import { DEFAULT_COLLECTION_NAME } from './constants';
import {
	createCollection,
	deleteCollection,
	getCollection,
	getDocuments,
	populateCollection
} from './typesenseRepository';
import collectionSchema from './collectionSchema.json';
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import type { PopulateCollectionService, UniqueDataset } from './types';
import type { SearchResponse } from 'typesense/lib/Typesense/Documents';

export const getCollectionService = async () => {
	return await getCollection();
};

export const createCollectionService = async () => {
	return await createCollection({ schema: collectionSchema as CollectionCreateSchema });
};

export const deleteCollectionService = async () => {
	return await deleteCollection({ name: DEFAULT_COLLECTION_NAME });
};

export const populateDocumentsService = async ({
	contentChunks,
	is_default,
	name,
	source_file
}: PopulateCollectionService) => {
	for (const content of contentChunks) {
		await populateCollection({
			collectionName: DEFAULT_COLLECTION_NAME,
			content,
			is_default,
			name,
			source_file
		});
	}
	return { message: 'Collection populated' }; //TODO - improve this response
};

export const getUniqueDatasetsService = async ({
	isDefault
}: {
	isDefault: boolean;
}): Promise<UniqueDataset[]> => {
	const response = await getDocuments({
		collectionName: DEFAULT_COLLECTION_NAME,
		searchParams: {
			q: '*',
			query_by: 'name',
			facet_by: 'name',
			per_page: 0,
			filter_by: `is_default:=${isDefault}`
		}
	});
	return (
		response.facet_counts?.[0]?.counts.map((c) => ({
			name: c.value,
			count: c.count
		})) ?? []
	);
};

export const getDocumentsByPrompt = async (
	prompt: string,
	documents: string[]
): Promise<SearchResponse<object>> => {
	const tags = prompt
		.split(' ')
		.map((tag) => tag.trim())
		.filter((tag) => tag.length > 0);
	const searchParameters = {
		q: tags.join(' '),
		query_by: 'content',
		per_page: 25,
		sort_by: '_text_match:desc',
		filter_by: "name:=[" + documents.map((doc) => `"${doc}"`).join(',') + "]",
	};

	return await getDocuments({
		collectionName: DEFAULT_COLLECTION_NAME,
		searchParams: searchParameters
	});
};
