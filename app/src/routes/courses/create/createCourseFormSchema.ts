import { z } from 'zod';

export const createCourseFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    published: z.boolean()
});
export type CreateCourseFormSchema = typeof createCourseFormSchema;
