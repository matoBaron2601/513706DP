import { Elysia, t } from 'elysia';
import { createCourseSchema } from '../../../schemas/complexQuizSchemas/courseSchema';
import { CourseService } from '../../../services/complexQuizServices/courseService';

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
	);

export default courseApi;
