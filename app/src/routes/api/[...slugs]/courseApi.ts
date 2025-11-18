import { Elysia, t } from 'elysia';
import {
	getCoursesRequestSchema,
	createCourseSchema,
	updateCourseSchema
} from '../../../schemas/courseSchema';
import { CourseService } from '../../../services/courseService';

const courseService = new CourseService();

export const courseApi = new Elysia({ prefix: 'course' })
	.get('/:id', async (req) => {
		return await courseService.getById(req.params.id);
	})
	.post(
		'/filtered',
		async (req) => {
			return await courseService.getAll(req.body);
		},
		{
			body: getCoursesRequestSchema
		}
	)
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
export default courseApi;
