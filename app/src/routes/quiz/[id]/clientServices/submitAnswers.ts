import type { Answer } from '../../../../schemas/answerSchema';

const submitAnswers = async (userQuizId: string, answers: Answer) : Promise<void> => {
	const response = await fetch(`/api/answer`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ userQuizId, answers : answers.answers })
	});
	if (!response.ok) {
		throw new Error('Failed to submit answers');
	}
	const data = await response.json();
	return data;
};

export default submitAnswers;
