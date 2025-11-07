import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from './baseSchema';

const baseConceptProgressSchema = t.Object({
	userBlockId: t.String(),
	conceptId: t.String(),
	correct: t.Number(),
	asked: t.Number(),
	alfa: t.Number(),
	beta: t.Number(),
	score: t.Number(),
	variance: t.Number(),
	streak: t.Number(),
	completed: t.Boolean()
});

export const conceptProgressSchema = t.Intersect([baseSchema, baseConceptProgressSchema]);
export type ConceptProgress = Static<typeof conceptProgressSchema>;

export const createConceptProgressSchema = t.Intersect([baseConceptProgressSchema]);
export type CreateConceptProgress = Static<typeof createConceptProgressSchema>;

export const updateConceptProgressSchema = t.Partial(createConceptProgressSchema);
export type UpdateConceptProgress = Static<typeof updateConceptProgressSchema>;
