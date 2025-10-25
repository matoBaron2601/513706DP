import type { CreateComplexQuizExtended } from '../../../../schemas/complexQuizSchemas/complexQuizSchema';

const createInitialComplexQuiz = async (
	data: CreateComplexQuizExtended
): Promise<{ baseQuizId: string; complexQuizId: string }> => {
	const response = await fetch('/api/complexQuiz/placement', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});
	if (!response.ok) {
		throw new Error('Failed to create initial complex quiz');
	}
	return await response.json();
};

export default createInitialComplexQuiz;
