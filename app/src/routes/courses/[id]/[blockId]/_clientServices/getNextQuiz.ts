import type { BaseQuestionWithOptions } from '../../../../../schemas/baseQuestionSchema';

const getNextQuiz = async (courseBlockId: string): Promise<BaseQuestionWithOptions[]> => {
	const response = await fetch(`/api/complexQuiz/nextQuiz/${courseBlockId}`);
	if (!response.ok) {
		throw new Error('Failed to get next quiz');
	}
	return await response.json();
};

export default getNextQuiz;
