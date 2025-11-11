import { z } from 'zod';

export const uploadDocumentFormSchema = z.object({
	file: z.instanceof(File)
});
export type UploadDocumentFormSchema = typeof uploadDocumentFormSchema;
