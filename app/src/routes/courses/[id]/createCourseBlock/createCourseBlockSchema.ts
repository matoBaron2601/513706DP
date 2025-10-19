import { z } from 'zod';

export const createCourseBlockFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	file: z.instanceof(File),
});
export type CreateCourseBlockFormSchema = typeof createCourseBlockFormSchema;
