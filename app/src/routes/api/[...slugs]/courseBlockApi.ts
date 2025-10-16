import { Elysia, t } from 'elysia';
import { CourseBlockService } from '../../../services/complexQuizServices/courseBlockService';
import { createCourseBlockSchema } from '../../../schemas/complexQuizSchemas/courseBlockSchema';

const courseBlockService = new CourseBlockService();

export const courseBlockApi = new Elysia({ prefix: 'courseBlock' })
.get(
	'/courseId/:id',
	async (req) => {
		return await courseBlockService.getByCourseId(req.params.id);
	}
)
.post(
    '/',
    async (req) => {
        return await courseBlockService.create(req.body);
    },{
        body: createCourseBlockSchema
    }
);

export default courseBlockApi;
