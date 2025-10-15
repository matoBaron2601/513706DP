import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from '../baseSchema';

const baseCourseBlockSchema = t.Object({
	courseId: t.String(),
	name: t.String()
});

export const courseBlockSchema = t.Intersect([baseSchema, baseCourseBlockSchema]);
export type CourseBlock = Static<typeof courseBlockSchema>;

export const createCourseBlockSchema = t.Intersect([baseCourseBlockSchema]);
export type CreateCourseBlock = Static<typeof createCourseBlockSchema>;

export const updateCourseBlockSchema = t.Partial(createCourseBlockSchema);
export type UpdateCourseBlock = Static<typeof updateCourseBlockSchema>;


//EXTENDED
export const courseBlockExtendedSchema = t.Intersect([
	courseBlockSchema,
	t.Object({
		concepts: t.Array(t.String())
	})
]);
export type CourseBlockExtended = Static<typeof courseBlockExtendedSchema>;

export const createCourseBlockExtendedSchema = t.Intersect([
	createCourseBlockSchema,
	t.Object({
		document: t.String()
	})
]);
export type CreateCourseBlockExtended = Static<typeof createCourseBlockExtendedSchema>;
