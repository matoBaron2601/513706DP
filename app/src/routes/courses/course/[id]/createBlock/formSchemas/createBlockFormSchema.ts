import { z } from 'zod';

export const createBlockFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	chunkingStrategy: z.enum(['rtc', 'semantic']).default('rtc'),
	useLLMTransformation: z.boolean().default(false)
});
export type CreateBlockFormSchema = typeof createBlockFormSchema;
