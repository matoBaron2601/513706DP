import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from './baseSchema';

// BASE

const baseCourseSchema = t.Object({
	name: t.String(),
	creatorId: t.String(),
	published: t.Boolean()
});

export const courseSchema = t.Intersect([baseSchema, baseCourseSchema]);
export type Course = Static<typeof courseSchema>;

export const createCourseSchema = t.Intersect([baseCourseSchema]);
export type CreateCourse = Static<typeof createCourseSchema>;

export const updateCourseSchema = t.Partial(createCourseSchema);
export type UpdateCourse = Static<typeof updateCourseSchema>;

// EXTENDED

export const getCoursesRequestSchema = t.Object({
	creatorId: t.String(),
});

export type GetCoursesRequest = Static<typeof getCoursesRequestSchema>;

export const getCoursesResponseSchema = t.Intersect([
	courseSchema,
	t.Object({
		blocksCount: t.Number()
	})
]);

export type GetCoursesResponse = Static<typeof getCoursesResponseSchema>;
