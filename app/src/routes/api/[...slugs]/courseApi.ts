import { Elysia, t } from 'elysia';
import { createCourseSchema } from '../../../schemas/courseSchema';
import { CourseService } from '../../../services/courseService';

const courseService = new CourseService();

export const courseApi = new Elysia({ prefix: 'course' })
	.get('/', async () => {
		return await courseService.getAll();
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
		return await courseService.delete(req.params.id);
	});

export default courseApi;
