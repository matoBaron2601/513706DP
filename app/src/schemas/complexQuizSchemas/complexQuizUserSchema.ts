import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from '../baseSchema';

const baseComplexQuizUserSchema = t.Object({
	complexQuizId: t.String(),
	userId: t.String()
});

export const complexQuizUserSchema = t.Intersect([baseSchema, baseComplexQuizUserSchema]);
export type ComplexQuizUser = Static<typeof complexQuizUserSchema>;

export const createComplexQuizUserSchema = t.Intersect([baseComplexQuizUserSchema]);
export type CreateComplexQuizUser = Static<typeof createComplexQuizUserSchema>;

export const updateComplexQuizUserSchema = t.Partial(createComplexQuizUserSchema);
export type UpdateComplexQuizUser = Static<typeof updateComplexQuizUserSchema>;
