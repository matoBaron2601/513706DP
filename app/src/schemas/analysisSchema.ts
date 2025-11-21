import { t, type Static } from 'elysia';

export const analysisSchema = t.Object({
	courseId: t.String(),
	questionId: t.String(),//
	userId: t.String(),
	version: t.Number(),//
	questionText: t.String(),//
	codeSnippet: t.Nullable(t.String()),//
	questionType: t.String(),//
	options: t.Array(//
		t.Object({//
			optionId: t.String(),//
			optionText: t.String(),//
			isCorrect: t.Boolean()//
		})
	),
	isCorrect: t.Nullable(t.Boolean()),//
	time: t.Number()//
});

export type AnalysisDto = Static<typeof analysisSchema>;

export const analysisGetRequestSchema = t.Object({
	count: t.Number(),
	courseId: t.String()
});
export type AnalysisGetRequest = Static<typeof analysisGetRequestSchema>;
