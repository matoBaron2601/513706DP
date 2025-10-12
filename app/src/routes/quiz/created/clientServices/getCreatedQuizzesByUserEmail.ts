import type { Quiz } from '../../../../schemas/quizSchema';

const getCreatedQuizzesByUserEmail = async (userEmail: string): Promise<Quiz[]> => {
	const response = await fetch(`/api/quiz/created/${userEmail}`);
	if (!response.ok) {
		throw new Error('Failed to fetch quizzes');
	}
	return await response.json();
};

export default getCreatedQuizzesByUserEmail;
