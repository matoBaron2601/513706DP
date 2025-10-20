import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from './baseSchema';

const baseConceptSchema = t.Object({
	courseBlockId: t.String(),
	name: t.String()
});

export const conceptSchema = t.Intersect([baseSchema, baseConceptSchema]);
export type Concept = Static<typeof conceptSchema>;

export const createConceptSchema = t.Intersect([baseConceptSchema]);
export type CreateConcept = Static<typeof createConceptSchema>;

export const updateConceptSchema = t.Partial(createConceptSchema);
export type UpdateConcept = Static<typeof updateConceptSchema>;
