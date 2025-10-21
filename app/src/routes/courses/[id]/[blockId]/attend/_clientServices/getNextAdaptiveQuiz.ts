import type { BaseQuizWithQuestionsAndOptions, BaseQuizWithQuestionsAndOptionsBlank } from '../../../../../../schemas/baseQuizSchema';

const getNextAdaptiveQuiz = async (
	courseBlockId: string
): Promise<BaseQuizWithQuestionsAndOptions> => {
	const response = await fetch(`/api/adaptiveQuiz/nextQuiz/${courseBlockId}`);
	if (!response.ok) {
		throw new Error('Failed to get next adaptive quiz');
	}
	const data = await response.json();
	return data;
};

export default getNextAdaptiveQuiz;
