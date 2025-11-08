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

// EXTENDED

export const submitAdaptiveQuizAnswerSchema = t.Omit(createAdaptiveQuizAnswerSchema, [
	'adaptiveQuizId',
	'isCorrect'
]);
export type SubmitAdaptiveQuizAnswer = Static<typeof submitAdaptiveQuizAnswerSchema>;

export const GetQuestionHistoryRequestSchema = t.Object({
	adaptiveQuizId: t.String(),
	conceptId: t.String()
});
export type GetQuestionHistoryRequest = Static<typeof GetQuestionHistoryRequestSchema>;

export const GetQuestionHistoryResponseSchema = t.Array(
	t.Object({
		questionText: t.String(),
		correctAnswerText: t.String(),
		isCorrect: t.Boolean()
	})
);

export type GetQuestionHistoryResponse = Static<typeof GetQuestionHistoryResponseSchema>;
