import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from '../baseSchema';

const baseCourseSchema = t.Object({
	name: t.String(),
	creatorId: t.String()
});

export const courseSchema = t.Intersect([baseSchema, baseCourseSchema]);
export type Course = Static<typeof courseSchema>;

export const createCourseSchema = t.Intersect([baseCourseSchema]);
export type CreateCourse = Static<typeof createCourseSchema>;

export const updateCourseSchema = t.Partial(createCourseSchema);
export type UpdateCourse = Static<typeof updateCourseSchema>;
