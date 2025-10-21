import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from './baseSchema';

export const baseAdaptiveQuizAnswerSchema = t.Object({
	adaptiveQuizId: t.String(),
	baseQuestionId: t.String(),
	answerText: t.String(),
	isCorrect: t.Boolean()
});

export const adaptiveQuizAnswerSchema = t.Intersect([baseSchema, baseAdaptiveQuizAnswerSchema]);
export type AdaptiveQuizAnswer = Static<typeof adaptiveQuizAnswerSchema>;

export const createAdaptiveQuizAnswerSchema = t.Intersect([baseAdaptiveQuizAnswerSchema]);
export type CreateAdaptiveQuizAnswer = Static<typeof createAdaptiveQuizAnswerSchema>;

export const updateAdaptiveQuizAnswerSchema = t.Partial(createAdaptiveQuizAnswerSchema);
export type UpdateAdaptiveQuizAnswer = Static<typeof updateAdaptiveQuizAnswerSchema>;
