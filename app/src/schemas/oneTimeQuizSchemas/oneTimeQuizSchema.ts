import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from '../baseSchema';

const baseOneTimeQuizSchema = t.Object({
	creatorId: t.String(),
	baseQuizId: t.String(),
	name: t.String()
});

export const oneTimeQuizSchema = t.Intersect([baseSchema, baseOneTimeQuizSchema]);
export type OneTimeQuiz = Static<typeof oneTimeQuizSchema>;

export const createOneTimeQuizSchema = t.Intersect([baseOneTimeQuizSchema]);
export type CreateOneTimeQuiz = Static<typeof createOneTimeQuizSchema>;

export const updateOneTimeQuizSchema = t.Partial(createOneTimeQuizSchema);
export type UpdateOneTimeQuiz = Static<typeof updateOneTimeQuizSchema>;
