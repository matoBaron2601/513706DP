import type { AnalysisDto, AnalysisGetRequest } from '../../../schemas/analysisSchema';

const getRandomQuestions = async (body: AnalysisGetRequest): Promise<AnalysisDto[]> => {
	const response = await fetch(`/api/analysis`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});
	if (!response.ok) {
		throw new Error('Failed to fetch analysis data');
	}
	const data = await response.json();
	return data;
};

export default getRandomQuestions;
