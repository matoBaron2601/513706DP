import type { AnalysisGetRequest } from '../../../schemas/analysisSchema';
import type { Course } from '../../../schemas/courseSchema';

const getRandomQuestions = async (body: AnalysisGetRequest): Promise<Course> => {
	const response = await fetch(`/api/analysis`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});
	if (!response.ok) {
		throw new Error('Failed to delete course');
	}
	const data = await response.json();
	return data;
};

export default getRandomQuestions;
