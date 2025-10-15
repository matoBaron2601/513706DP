export const ONE_TIME_QUIZ = 'oneTimeQuizSchema';
export const COMPLEX_QUIZ = 'complexQuizSchema';

export type DocumentSearchParams = {
	q: string;
	query_by: string;
	facet_by?: string;
	filter_by?: string;
	sort_by?: string;
	page?: number;
	per_page?: number;
};
