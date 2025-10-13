export type PopulateCollectionService = {
	contentChunks: string[];
	is_default: boolean;
	name: string;
	source_file: string;
};

export type PopulateCollection = {
	collectionName: string;
	content: string;
	is_default: boolean;
	name: string;
	source_file: string;
};

export type DocumentSearchParams = {
	q: string;
	query_by: string;
	facet_by?: string;
	filter_by?: string;
	sort_by?: string;
	page?: number;
	per_page?: number;
};

export type UniqueDataset = {
	name: string;
	count: number;
};
