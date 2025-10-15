import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from '../baseSchema';

const baseComplexQuizUserAnswerSchema = t.Object({
	complexQuizUserId: t.String(),
	complexQuizQuestionId: t.String(),
	baseAnswerId: t.String(),
	answerText: t.String()
});

export const complexQuizUserAnswerSchema = t.Intersect([
	baseSchema,
	baseComplexQuizUserAnswerSchema
]);
export type ComplexQuizUserAnswer = Static<typeof complexQuizUserAnswerSchema>;

export const createComplexQuizUserAnswerSchema = t.Intersect([baseComplexQuizUserAnswerSchema]);
export type CreateComplexQuizUserAnswer = Static<typeof createComplexQuizUserAnswerSchema>;

export const updateComplexQuizUserAnswerSchema = t.Partial(createComplexQuizUserAnswerSchema);
export type UpdateComplexQuizUserAnswer = Static<typeof updateComplexQuizUserAnswerSchema>;
