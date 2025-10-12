import { t } from 'elysia';
import { type Static } from 'elysia';

export enum QuestionType {
	SingleChoice = 'single-choice',
	MultipleChoice = 'multiple-choice'
}

export const questionSchema = t.Object({
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
});

export type Question = Static<typeof questionSchema>;
