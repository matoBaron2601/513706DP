import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from '../baseSchema';

const baseComplexQuizQuestionSchema = t.Object({
	baseQuestionId: t.String(),
	complexQuizId: t.String(),
	conceptId: t.String()
});

export const complexQuizQuestionSchema = t.Intersect([baseSchema, baseComplexQuizQuestionSchema]);
export type ComplexQuizQuestion = Static<typeof complexQuizQuestionSchema>;

export const createComplexQuizQuestionSchema = t.Intersect([baseComplexQuizQuestionSchema]);
export type CreateComplexQuizQuestion = Static<typeof createComplexQuizQuestionSchema>;

export const updateComplexQuizQuestionSchema = t.Partial(createComplexQuizQuestionSchema);
export type UpdateComplexQuizQuestion = Static<typeof updateComplexQuizQuestionSchema>;
