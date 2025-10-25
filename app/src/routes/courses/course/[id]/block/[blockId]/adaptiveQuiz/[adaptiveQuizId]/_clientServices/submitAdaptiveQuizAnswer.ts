import type { SubmitAdaptiveQuizAnswer } from '../../../../../../../../../schemas/adaptiveQuizAnswerSchema';

const submitAdaptiveQuizAnswer = async (adaptiveQuizAnswer: SubmitAdaptiveQuizAnswer) => {
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

export default submitAdaptiveQuizAnswer;
