import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from '../baseSchema';

const baseBaseQuizSchema = t.Object({});

export const baseQuizSchema = t.Intersect([baseSchema, baseBaseQuizSchema]);
export type BaseQuiz = Static<typeof baseQuizSchema>;

export const createBaseQuizSchema = t.Intersect([baseBaseQuizSchema]);
export type CreateBaseQuiz = Static<typeof createBaseQuizSchema>;

export const updateBaseQuizSchema = t.Partial(createBaseQuizSchema);
export type UpdateBaseQuiz = Static<typeof updateBaseQuizSchema>;
