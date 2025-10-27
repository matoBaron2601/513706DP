import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from './baseSchema';

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
