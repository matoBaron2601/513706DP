import type {  QuizHistory, QuizHistoryList } from '../../../../schemas/quizSchema';

const getQuizHistoryListByUserEmail = async (userEmail: string): Promise<QuizHistoryList[]> => {
	const response = await fetch(`/api/quiz/history/${userEmail}`);
	if (!response.ok) {
		throw new Error('Failed to fetch quizzes');
	}
	return await response.json();
};

export default getQuizHistoryListByUserEmail;
