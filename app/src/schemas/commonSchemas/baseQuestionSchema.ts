import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from '../baseSchema';

const baseBaseQuestionSchema = t.Object({
	baseQuizId: t.String(),
	questionText: t.String(),
	correctAnswerText: t.String()
});

export const baseQuestionSchema = t.Intersect([baseSchema, baseBaseQuestionSchema]);
export type BaseQuestion = Static<typeof baseQuestionSchema>;

export const createBaseQuestionSchema = t.Intersect([baseBaseQuestionSchema]);
export type CreateBaseQuestion = Static<typeof createBaseQuestionSchema>;

export const updateBaseQuestionSchema = t.Partial(createBaseQuestionSchema);
export type UpdateBaseQuestion = Static<typeof updateBaseQuestionSchema>;
