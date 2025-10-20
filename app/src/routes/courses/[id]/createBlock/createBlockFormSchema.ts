import { z } from 'zod';

export const createBlockFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	file: z.instanceof(File)
});
export type CreateBlockFormSchema = typeof createBlockFormSchema;
