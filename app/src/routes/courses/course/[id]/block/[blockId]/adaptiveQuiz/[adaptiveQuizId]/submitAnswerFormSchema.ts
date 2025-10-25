import { z } from 'zod';

export const submitAnswerFormSchema = z.object({
	text: z.string()
});
export type SubmitAnswerForm = typeof submitAnswerFormSchema;
