import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from '../baseSchema';

const baseComplexQuizSchema = t.Object({
	baseQuizId: t.String(),
	courseBlockId: t.String(),
	version: t.Number()
});

export const complexQuizSchema = t.Intersect([baseSchema, baseComplexQuizSchema]);
export type ComplexQuiz = Static<typeof complexQuizSchema>;

export const createComplexQuizSchema = t.Intersect([baseComplexQuizSchema]);
export type CreateComplexQuiz = Static<typeof createComplexQuizSchema>;

export const updateComplexQuizSchema = t.Partial(createComplexQuizSchema);
export type UpdateComplexQuiz = Static<typeof updateComplexQuizSchema>;

//EXTENDED

export const createComplexQuizExtendedSchema = t.Object({
	courseBlockId: t.String()
});
export type CreateComplexQuizExtended = Static<typeof createComplexQuizExtendedSchema>;
