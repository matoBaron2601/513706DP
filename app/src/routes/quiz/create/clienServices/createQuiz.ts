import type { CreateQuizInitialRequest, Quiz } from '../../../../schemas/quizSchema';

const createQuiz = async (createQuizInitialRequest: CreateQuizInitialRequest): Promise<Quiz> => {
	const quiz = await fetch('/api/quiz', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(createQuizInitialRequest)
	});
	return await quiz.json();
};

export default createQuiz;
