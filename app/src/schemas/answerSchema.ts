import { t } from 'elysia';
import { type Static } from 'elysia';
import { QuestionType } from './questionSchema';

export const answerSchema = t.Object({
	answers: t.Array(
		t.Object({
			questionId: t.String(),
			optionId: t.String()
		})
	)
});

export const createAnswerSchema = t.Object({
	userQuizId: t.String(),
	answers: t.Array(
		t.Object({
			questionId: t.String(),
			optionId: t.String()
		})
	)
});

export type Answer = Static<typeof answerSchema>;
export type CreateAnswer = Static<typeof createAnswerSchema>;
