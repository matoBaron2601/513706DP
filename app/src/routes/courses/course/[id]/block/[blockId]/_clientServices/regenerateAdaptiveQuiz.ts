import type { UserBlock } from '../../../../../../../schemas/userBlockSchema';

/**
 * Regenerate an adaptive quiz for a given adaptive quiz ID
 * @param adaptiveQuizId 
 * @returns UserBlock 
 */
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