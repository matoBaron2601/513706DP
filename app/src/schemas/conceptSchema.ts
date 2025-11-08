import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from './baseSchema';
import { conceptProgressSchema } from './conceptProgressSchema';

export const baseConceptSchema = t.Object({
	blockId: t.String(),
	name: t.String(),
	difficultyIndex: t.Number()
});

export const conceptSchema = t.Intersect([baseSchema, baseConceptSchema]);
export type Concept = Static<typeof conceptSchema>;

export const createConceptSchema = t.Intersect([baseConceptSchema]);
export type CreateConcept = Static<typeof createConceptSchema>;

export const updateConceptSchema = t.Partial(createConceptSchema);
export type UpdateConcept = Static<typeof updateConceptSchema>;

// EXTENDED
export const getConceptProgressByUserBlockIdRequestSchema = t.Object({
	userBlockId: t.String()
});
export type GetConceptProgressByUserBlockIdRequest = Static<
	typeof getConceptProgressByUserBlockIdRequestSchema
>;

export const complexConceptSchema = t.Object({
	concept: conceptSchema,
	conceptProgress: conceptProgressSchema,
});
export type ComplexConcept = Static<typeof complexConceptSchema>;

export const getConceptProgressByUserBlockIdResponseSchema = t.Array(complexConceptSchema);
export type GetConceptProgressByUserBlockIdResponse = Static<
	typeof getConceptProgressByUserBlockIdResponseSchema
>;
