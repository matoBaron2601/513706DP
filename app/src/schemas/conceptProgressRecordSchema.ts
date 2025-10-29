import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from './baseSchema';

const baseConceptProgressRecordSchema = t.Object({
	conceptProgressId: t.String(),
	adaptiveQuizId: t.String(),
	correctCount: t.Number(),
	count: t.Number()
});

export const conceptProgressRecordSchema = t.Intersect([
	baseSchema,
	baseConceptProgressRecordSchema
]);
export type ConceptProgressRecord = Static<typeof conceptProgressRecordSchema>;

export const createConceptProgressRecordSchema = t.Intersect([baseConceptProgressRecordSchema]);
export type CreateConceptProgressRecord = Static<typeof createConceptProgressRecordSchema>;

export const updateConceptProgressRecordSchema = t.Partial(createConceptProgressRecordSchema);
export type UpdateConceptProgressRecord = Static<typeof updateConceptProgressRecordSchema>;
