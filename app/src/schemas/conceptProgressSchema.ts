import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from './baseSchema';

const baseConceptProgressSchema = t.Object({
	userBlockId: t.String(),
	conceptId: t.String(),
	correctA1: t.Number(),
	askedA1: t.Number(),
	correctA2: t.Number(),
	askedA2: t.Number(),
	correctB1: t.Number(),
	askedB1: t.Number(),
	correctB2: t.Number(),
	askedB2: t.Number(),
	alfa: t.Number(),
	beta: t.Number(),
	score: t.Number(),
	variance: t.Number(),
	streak: t.Number(),
	mastered: t.Boolean()
});

export const conceptProgressSchema = t.Intersect([baseSchema, baseConceptProgressSchema]);
export type ConceptProgress = Static<typeof conceptProgressSchema>;

export const createConceptProgressSchema = t.Intersect([baseConceptProgressSchema]);
export type CreateConceptProgress = Static<typeof createConceptProgressSchema>;

export const updateConceptProgressSchema = t.Partial(createConceptProgressSchema);
export type UpdateConceptProgress = Static<typeof updateConceptProgressSchema>;


export const questionTypeEnum = t.Union([t.Literal('A1'), t.Literal('A2'), t.Literal('B1'), t.Literal('B2')]);
export type QuestionType = Static<typeof questionTypeEnum>;