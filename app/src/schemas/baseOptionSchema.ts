import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from './baseSchema';

export const baseBaseOptionSchema = t.Object({
	baseQuestionId: t.String(),
	optionText: t.Nullable(t.String()),
	isCorrect: t.Boolean()
});

export const baseOptionSchema = t.Intersect([baseSchema, baseBaseOptionSchema]);
export type BaseOption = Static<typeof baseOptionSchema>;

export const createBaseOptionSchema = t.Intersect([baseBaseOptionSchema]);
export type CreateBaseOption = Static<typeof createBaseOptionSchema>;

export const updateBaseOptionSchema = t.Partial(createBaseOptionSchema);
export type UpdateBaseOption = Static<typeof updateBaseOptionSchema>;
