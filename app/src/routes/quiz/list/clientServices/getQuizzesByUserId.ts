import type { Quiz } from '../../../../schemas/quizSchema';

const getQuizzesByUserEmail = async (userEmail: string): Promise<Quiz[]> => {
	const quizzes = await fetch(`/api/quiz/list/${userEmail}`);
	return quizzes.json();
};

export default getQuizzesByUserEmail;
