import type { ChoiceMessage, Role } from '../openAIService';

export const isAnswerCorrectMessage = (
	question: string,
	correctAnswer: string,
	answer: string
): ChoiceMessage => {
	return {
		role: 'user' as Role,
		content: `
			You are an expert in evaluating answers to questions.
			Given the question, the correct answer, and a user's answer, determine if the user's answer is correct.
			Respond with a simple "Yes" if the answer is correct or "No" if it is incorrect.
			Do not be hard on users, if the answer is close enough or partially correct, consider it correct. Allow for typos and small mistakes.

			Here are the details:

			Question: ${question}
			Correct Answer: ${correctAnswer} // But not strictly
			User's Answer: ${answer}

			If users answer is blank, respond with "No".
			Is the user's answer correct? Respond with only "Yes" or "No".

			
		`
	};
};
