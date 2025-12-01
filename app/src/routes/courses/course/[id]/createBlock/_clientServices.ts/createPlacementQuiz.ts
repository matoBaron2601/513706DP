import type {
	CreatePlacementQuizRequest,
	CreatePlacementQuizResponse
} from '../../../../../../schemas/placementQuizSchema';

export const createPlacementQuiz = async (
	data: CreatePlacementQuizRequest
): Promise<CreatePlacementQuizResponse> => {
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