import { t } from 'elysia';
import { type Static } from 'elysia';

export const userQuizSchema = t.Object({
	id: t.Optional(t.String()),
	quizId: t.String(),
	userId: t.String()
});

export type UserQuiz = Static<typeof userQuizSchema>;
