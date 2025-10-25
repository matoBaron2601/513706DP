import type { AdaptiveQuiz } from "../../../../../../../../../schemas/adaptiveQuizSchema";

const finishAdaptiveQuiz = async (adaptiveQuizId: string) : Promise<AdaptiveQuiz> => {
	const response = await fetch(`/api/adaptiveQuiz/complete/${adaptiveQuizId}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error('Failed to submit adaptive quiz answer');
	}
	return await response.json();
};

export default finishAdaptiveQuiz;
