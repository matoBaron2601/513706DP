import { Elysia } from 'elysia';
import { getCoursesRequestSchema, createCourseSchema } from '../../../schemas/courseSchema';
import { CourseService } from '../../../services/courseService';
import { CourseFacade } from '../../../facades/courseFacade';

export const createCourseApi = (
	courseFacade: CourseFacade = new CourseFacade(),
	courseService: CourseService = new CourseService()
) =>
	new Elysia({ prefix: 'course' })
		.get('/:id', async (req) => {
			return await courseService.getById(req.params.id);
		})
		.post(
			'/available',
			async (req) => {
				console.log('API - get available courses called');
				return await courseFacade.getAvailableCoursesWithBlockCount(req.body.creatorId);
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

export const courseApi = createCourseApi();
export default courseApi;
