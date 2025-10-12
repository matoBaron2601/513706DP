import type { Quiz } from '../../../../schemas/quizSchema';

const createComplexQuiz = async (
	prompt: string,
	technologies: string[],
	email: string
): Promise<Quiz> => {
	const quiz = await fetch('/api/quiz', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ prompt, technologies, email })
	});
	return await quiz.json();
};

export default createComplexQuiz;
