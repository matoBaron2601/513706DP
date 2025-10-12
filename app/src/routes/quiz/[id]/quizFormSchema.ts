import { z } from 'zod';

export const quizFormSchema = z.object({
	answers: z.array(
		z.object({
			questionId: z.string(),
			optionId: z.string()
		})
	)
});
export type QuizFormSchema = typeof quizFormSchema;
