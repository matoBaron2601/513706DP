import { t } from 'elysia';
import { type Static } from 'elysia';

export const createQuizInitialRequestSchema = t.Object({
	email: t.String(),
	prompt: t.String(),
	technologies: t.Array(t.String())
});

export type CreateQuizInitialRequest = Static<typeof createQuizInitialRequestSchema>;

export const createQuizRequestSchema = t.Object({
	quiz: t.Object({
		creatorId: t.String(),
		timePerQuestion: t.Optional(t.Number()),
		canGoBack: t.Optional(t.Boolean())
	}),
	questions: t.Array(
		t.Object({
			text: t.String(),
			options: t.Array(
				t.Object({
					text: t.String(),
					isCorrect: t.Boolean()
				})
			)
		})
	)
});

export type CreateQuizRequest = Static<typeof createQuizRequestSchema>;

export const quizSchema = t.Object({
	quiz: t.Object({
		id: t.String(),
		creatorId: t.String(),
		timePerQuestion: t.Nullable(t.Number()),
		canGoBack: t.Nullable(t.Boolean()),
		createdAt: t.Date()
	}),
	questions: t.Array(
		t.Object({
			questionId: t.String(),
			text: t.String(),
			options: t.Array(
				t.Object({
					optionId: t.String(),
					text: t.String(),
					isCorrect: t.Boolean()
				})
			)
		})
	)
});

export type Quiz = Static<typeof quizSchema>;
