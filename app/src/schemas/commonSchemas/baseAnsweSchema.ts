import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from '../baseSchema';

const baseBaseAnswerSchema = t.Object({
	baseQuestionId: t.String(),
	answerText: t.String()
});

export const baseAnswerSchema = t.Intersect([baseSchema, baseBaseAnswerSchema]);
export type BaseAnswer = Static<typeof baseAnswerSchema>;

export const createBaseAnswerSchema = t.Intersect([baseBaseAnswerSchema]);
export type CreateBaseAnswer = Static<typeof createBaseAnswerSchema>;

export const updateBaseAnswerSchema = t.Partial(createBaseAnswerSchema);
export type UpdateBaseAnswer = Static<typeof updateBaseAnswerSchema>;
