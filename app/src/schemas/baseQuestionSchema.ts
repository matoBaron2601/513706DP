import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from './baseSchema';
import { baseBaseOptionSchema, baseOptionSchema } from './baseOptionSchema';

const baseBaseQuestionSchema = t.Object({
	baseQuizId: t.String(),
	questionText: t.String(),
	correctAnswerText: t.String(),
	conceptId: t.String(),
	orderIndex: t.Number(),
	codeSnippet: t.String()
});

export const baseQuestionSchema = t.Intersect([baseSchema, baseBaseQuestionSchema]);
export type BaseQuestion = Static<typeof baseQuestionSchema>;

export const createBaseQuestionSchema = t.Intersect([baseBaseQuestionSchema]);
export type CreateBaseQuestion = Static<typeof createBaseQuestionSchema>;

export const updateBaseQuestionSchema = t.Partial(createBaseQuestionSchema);
export type UpdateBaseQuestion = Static<typeof updateBaseQuestionSchema>;

// EXTENDED
export const baseQuestionWithOptionsBlankSchema = t.Intersect([
	t.Object({
		questionText: t.String(),
		correctAnswerText: t.String(),
		orderIndex: t.Number(),
		codeSnippet: t.String(),
		questionType: t.String()
	}),
	t.Object({
		options: t.Array(
			t.Object({
				optionText: t.Nullable(t.String())
			})
		)
	})
]);

export type BaseQuestionWithOptionsBlank = Static<typeof baseQuestionWithOptionsBlankSchema>;

export const baseQuestionWithOptionsSchema = t.Intersect([
	baseQuestionSchema,
	t.Object({
		options: t.Array(baseOptionSchema)
	})
]);

export type BaseQuestionWithOptions = Static<typeof baseQuestionWithOptionsSchema>;


