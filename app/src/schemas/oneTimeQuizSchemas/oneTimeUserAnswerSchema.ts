import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from '../baseSchema';

const baseOneTimeUserAnswerSchema = t.Object({
	oneTimeUserQuizId: t.String(),
	baseQuestionId: t.String(),
	baseAnswerId: t.String()
});

export const oneTimeUserAnswerSchema = t.Intersect([baseSchema, baseOneTimeUserAnswerSchema]);
export type OneTimeUserAnswer = Static<typeof oneTimeUserAnswerSchema>;

export const createOneTimeUserAnswerSchema = t.Intersect([baseOneTimeUserAnswerSchema]);
export type CreateOneTimeUserAnswer = Static<typeof createOneTimeUserAnswerSchema>;

export const updateOneTimeUserAnswerSchema = t.Partial(createOneTimeUserAnswerSchema);
export type UpdateOneTimeUserAnswer = Static<typeof updateOneTimeUserAnswerSchema>;
