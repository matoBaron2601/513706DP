import type { AdaptiveQuiz } from '../../../../../../../../schemas/adaptiveQuizSchema';

const getAdaptiveQuizzesByUserBlockId = async (userBlockId: string): Promise<AdaptiveQuiz[]> => {
	const response = await fetch(`/api/adaptiveQuiz/${userBlockId}`);
	if (!response.ok) {
		throw new Error('Failed to get adaptive quizzes');
	}
	const data = await response.json();
	return data;
};

export default getAdaptiveQuizzesByUserBlockId;
