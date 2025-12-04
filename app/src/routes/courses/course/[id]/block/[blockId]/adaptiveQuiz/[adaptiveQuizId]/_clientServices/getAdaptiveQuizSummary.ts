import type { ComplexAdaptiveQuiz } from '../../../../../../../../../schemas/adaptiveQuizSchema';

/**
 * Fetch a complex adaptive quiz summary for a given adaptive quiz ID
 * @param adaptiveQuizId 
 * @returns ComplexAdaptiveQuiz 
 */
export const getComplexAdaptiveQuizById = async (
	adaptiveQuizId: string
): Promise<ComplexAdaptiveQuiz> => {
	const response = await fetch(`/api/adaptiveQuiz/summary/${adaptiveQuizId}`);
	if (!response.ok) {
		throw new Error('Failed to get adaptive quizzes');
	}
	const data = await response.json();
	return data;
};
