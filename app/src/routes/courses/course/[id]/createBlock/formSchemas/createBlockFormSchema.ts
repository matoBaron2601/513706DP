import { z } from 'zod';

export const createBlockFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	chunkingStrategy: z.enum(['rtc', 'semantic']).default('rtc'),
	retrievalMethod: z.enum(['sparse', 'hybrid']).default('sparse'),
	useLLMTransformation: z.boolean().default(false)
});
export type CreateBlockFormSchema = typeof createBlockFormSchema;
