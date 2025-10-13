import { t } from 'elysia';
import { type Static } from 'elysia';
import { QuestionType } from './questionSchema';

export const createQuizInitialRequestSchema = t.Object({
	isDefaultDataset: t.Boolean(),
	documents: t.Array(t.String()),
	prompt: t.String(),
	numberOfQuestions: t.Number(),
	name: t.String(),
	canGoBack: t.Boolean(),
	email: t.String()
});

export type CreateQuizInitialRequest = Static<typeof createQuizInitialRequestSchema>;

export const createQuizRequestSchema = t.Object({
	quiz: t.Object({
		name: t.String(),
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
		name: t.String(),
		creatorId: t.String(),
		timePerQuestion: t.Nullable(t.Number()),
		canGoBack: t.Nullable(t.Boolean()),
		createdAt: t.Date()
	}),
	questions: t.Array(
		t.Object({
			questionId: t.String(),
			text: t.String(),
			type: t.Enum(QuestionType),
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

export const quizHistorySchema = t.Object({
	userQuiz: t.Object({
		id: t.String(),
		userId: t.String(),
		quizId: t.String()
	}),
	quiz: quizSchema
});
export type QuizHistory = Static<typeof quizHistorySchema>;

export const quizHistoryListSchema = t.Object({
	userQuizId: t.String(),
	name: t.String(),
	creatorName: t.String(),
	submissionDate: t.Nullable(t.Date())
});

export type QuizHistoryList = Static<typeof quizHistoryListSchema>;
