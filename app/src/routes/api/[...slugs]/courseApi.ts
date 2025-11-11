import { Elysia, t } from 'elysia';
import { getCoursesRequestSchema, createCourseSchema } from '../../../schemas/courseSchema';
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
		return await courseService.delete(req.params.id);
	});

export default courseApi;
