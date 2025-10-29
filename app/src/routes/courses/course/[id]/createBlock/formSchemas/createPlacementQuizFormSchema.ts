import { z } from 'zod';

export const createPlacementQuizFormSchema = z.object({
    blockId: z.string(),
    questionsPerConcept: z.number().min(1).max(10).optional()

});
export type CreatePlacementQuizFormSchema = typeof createPlacementQuizFormSchema;
