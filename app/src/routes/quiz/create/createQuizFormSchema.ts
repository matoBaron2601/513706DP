import { number, z } from 'zod';
import { Dataset } from '../../types';

export const createQuizFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	activeTab: z.nativeEnum(Dataset).default(Dataset.DEFAULT),
	documents: z.array(z.string()).default([]),
	numberOfQuestions: z
		.number()
		.min(1, 'At least one question is required')
		.max(50, 'Maximum 50 questions allowed'),
	canGoBack: z.boolean().default(false),
	timePerQuestion: z.number().min(5, 'Time per question must be at least 5 seconds'),
	instructions: z.string().default(''),
	prompt: z.string().default('')
});
export type CreateQuizFormSchema = typeof createQuizFormSchema;
