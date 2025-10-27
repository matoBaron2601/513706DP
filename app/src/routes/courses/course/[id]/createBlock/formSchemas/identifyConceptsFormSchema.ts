import { z } from 'zod';

export const identifyConceptsFormSchema = z.object({
	file: z.instanceof(File)
});
export type IdentifyConceptsFormSchema = typeof identifyConceptsFormSchema;
