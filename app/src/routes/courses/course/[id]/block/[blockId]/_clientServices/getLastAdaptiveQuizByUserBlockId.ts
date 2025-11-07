import type { AdaptiveQuiz } from '../../../../../../../schemas/adaptiveQuizSchema';

const getLastAdaptiveQuizByUserBlockId = async (
	userBlockId: string
): Promise<AdaptiveQuiz> => {
	const response = await fetch(`/api/adaptiveQuiz/last/${userBlockId}`);

	if (!response.ok) {
		throw new Error('Failed to get last incomplete adaptive quiz by user block id');
	}
	return await response.json();
};

export default getLastAdaptiveQuizByUserBlockId;
