import type { UserBlock } from '../../../../../../../schemas/userBlockSchema';

export const regenerateAdaptiveQuiz = async (adaptiveQuizId: string): Promise<UserBlock> => {
	const response = await fetch(`/api/adaptiveQuiz/regenerate/${adaptiveQuizId}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error('Failed to regenerate adaptive quiz');
	}
	return await response.json();
};