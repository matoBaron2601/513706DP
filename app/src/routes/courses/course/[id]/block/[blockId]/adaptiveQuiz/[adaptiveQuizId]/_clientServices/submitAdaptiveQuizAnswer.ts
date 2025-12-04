import type { SubmitAdaptiveQuizAnswer } from '../../../../../../../../../schemas/adaptiveQuizAnswerSchema';

/**
 * Submit an adaptive quiz answer
 * @param adaptiveQuizAnswer 
 * @returns any 
 */
export const submitAdaptiveQuizAnswer = async (adaptiveQuizAnswer: SubmitAdaptiveQuizAnswer) => {
	const response = await fetch(`/api/adaptiveQuizAnswer`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(adaptiveQuizAnswer)
	});

	if (!response.ok) {
		throw new Error('Failed to submit adaptive quiz answer');
	}
	return await response.json();
};
