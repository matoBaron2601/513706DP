import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from '../baseSchema';

const baseOneTimeQuizUserSchema = t.Object({
	oneTimeQuizId: t.String(),
	userId: t.String()
});

export const oneTimeQuizUserSchema = t.Intersect([baseSchema, baseOneTimeQuizUserSchema]);
export type OneTimeQuizUser = Static<typeof oneTimeQuizUserSchema>;

export const createOneTimeQuizUserSchema = t.Intersect([baseOneTimeQuizUserSchema]);
export type CreateOneTimeQuizUser = Static<typeof createOneTimeQuizUserSchema>;

export const updateOneTimeQuizUserSchema = t.Partial(createOneTimeQuizUserSchema);
export type UpdateOneTimeQuizUser = Static<typeof updateOneTimeQuizUserSchema>;
