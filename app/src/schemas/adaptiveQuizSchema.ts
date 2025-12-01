import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from './baseSchema';
import { baseQuestionWithOptionsSchema } from './baseQuestionSchema';

// BASE

export const baseAdaptiveQuizSchema = t.Object({
	baseQuizId: t.String(),
	userBlockId: t.String(),
	version: t.Number(),
	placementQuizId: t.Nullable(t.String()),
	isCompleted: t.Boolean(),
	readyForAnswering: t.Boolean()
});

export const adaptiveQuizSchema = t.Intersect([baseSchema, baseAdaptiveQuizSchema]);
export type AdaptiveQuiz = Static<typeof adaptiveQuizSchema>;

export const createAdaptiveQuizSchema = t.Intersect([baseAdaptiveQuizSchema]);
export type CreateAdaptiveQuiz = Static<typeof createAdaptiveQuizSchema>;

export const updateAdaptiveQuizSchema = t.Partial(createAdaptiveQuizSchema);
export type UpdateAdaptiveQuiz = Static<typeof updateAdaptiveQuizSchema>;

// EXTENDED

export const ComplexAdaptiveQuizSchema = t.Intersect([
	adaptiveQuizSchema,
	t.Object({
		questions: t.Array(
			t.Intersect([
				baseQuestionWithOptionsSchema,
				t.Object({ userAnswerText: t.Nullable(t.String()), isCorrect: t.Nullable(t.Boolean()) })
			])
		)
	})
]);

export type ComplexAdaptiveQuiz = Static<typeof ComplexAdaptiveQuizSchema>;
