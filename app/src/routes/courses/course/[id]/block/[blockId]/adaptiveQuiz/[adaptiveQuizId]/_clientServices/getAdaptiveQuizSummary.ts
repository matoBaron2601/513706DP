import type { ComplexAdaptiveQuiz } from "../../../../../../../../../schemas/adaptiveQuizSchema";

export const getComplexAdaptiveQuizById = async (adaptiveQuizId: string): Promise<ComplexAdaptiveQuiz> => {
    const response = await fetch(`/api/adaptiveQuiz/summary/${adaptiveQuizId}`);
    if (!response.ok) {
        throw new Error('Failed to get adaptive quizzes');
    }
    const data = await response.json();
    return data;
};
