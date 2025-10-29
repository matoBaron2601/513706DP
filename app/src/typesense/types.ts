export const COLLECTION_NAME = 'typesenseSchema';

export type DocumentSearchParams = {
	q: string;
	query_by: string;
	facet_by?: string;
	filter_by?: string;
	sort_by?: string;
	page?: number;
	per_page?: number;
	prefix?: boolean;
};

export type QuizDocument = {
	block_id: string;
	content: string;
};

