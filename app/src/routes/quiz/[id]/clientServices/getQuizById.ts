import type { Quiz } from "../../../../schemas/quizSchema";

const getQuizById = async (quizId: string) : Promise<Quiz> => {
	const response = await fetch(`/api/quiz/${quizId}`);
	if (!response.ok) {
		throw new Error('Failed to fetch quiz');
	}
	const data = await response.json();
	return data;
};

export default getQuizById;