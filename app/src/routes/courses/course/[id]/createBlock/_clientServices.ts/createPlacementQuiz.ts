import type { IdentifyConceptsResponse } from '../../../../../../schemas/blockSchema';
import type { CreatePlacementQuizRequest } from '../../../../../../schemas/placementQuizSchema';

const createPlacementQuiz = async (
	data: CreatePlacementQuizRequest
): Promise<IdentifyConceptsResponse> => {
	const response = await fetch(`/api/placementQuiz`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});

	if (!response.ok) {
		throw new Error('Failed to create placement quiz');
	}
	return await response.json();
};

export default createPlacementQuiz;
