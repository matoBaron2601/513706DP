/**
 * @fileoverview
 * This file defines the API endpoints for managing courses.
 * It uses the Elysia framework to create routes for retrieving,
 * creating, deleting, publishing, and unpublishing courses.
 */

import { Elysia } from 'elysia';
import { createCourseSchema } from '../../../schemas/courseSchema';
import { CourseService } from '../../../services/courseService';
import { CourseFacade } from '../../../facades/courseFacade';

/**
 *  Creates an Elysia application with routes for course management.
 * @param courseFacade
 * @param courseService
 * @returns  An Elysia application with course routes.
 */
export const createCourseApi = (
	courseFacade: CourseFacade = new CourseFacade(),
	courseService: CourseService = new CourseService()
) =>
	new Elysia({ prefix: 'course' })
		.get('/:id', async (req) => {
			return await courseService.getById(req.params.id);
		})
		.get('/available/:id', async (req) => {
			return await courseFacade.getAvailableCoursesWithBlockCount(req.params.id);
		})
		.post(
			'/',
			async (req) => {
				return await courseService.create(req.body);
			},
			{
				body: createCourseSchema
			}
		)
		.delete('/:id', async (req) => {
			const email = req.headers['x-user-email'] as string;
			return await courseService.delete(req.params.id, email);
		})
		.put('/:id/publish', async (req) => {
			const email = req.headers['x-user-email'] as string;
			return await courseService.publishCourse(req.params.id, email);
		})
		.put('/:id/unpublish', async (req) => {
			const email = req.headers['x-user-email'] as string;
			return await courseService.unpublishCourse(req.params.id, email);
		});

export const courseApi = createCourseApi();
export default courseApi;
