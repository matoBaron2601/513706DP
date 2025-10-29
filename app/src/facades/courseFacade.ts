import { db } from '../db/client';
import type { Course } from '../schemas/courseSchema';
import { BlockService } from '../services/blockService';
import { CourseService } from '../services/courseService';

export class CourseFacade {
	private courseService: CourseService;
	private blockService: BlockService;
	constructor() {
		this.courseService = new CourseService();
		this.blockService = new BlockService();
	}

	async deleteCourse(courseId: string): Promise<Course> {
		return db.transaction(async (tx) => {
			const course = await this.courseService.delete(courseId);
			await this.blockService.deleteByCourseId(courseId, tx);
			return course;
		});
	}
}
