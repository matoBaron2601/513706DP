import type { UserQuiz } from "../../../../schemas/userQuizSchema";

const createUserQuiz = async (quizId: string, userId: string): Promise<UserQuiz> => {
	const response = await fetch(`/api/userQuiz`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ quizId, userId })
	});
	if (!response.ok) {
		throw new Error('Failed to create user quiz');
	}
	const data = await response.json();
	return data;
};


export default createUserQuiz;