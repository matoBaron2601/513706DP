/**
 * @fileoverview
 * Course Facade - provides a simplified interface for managing courses and their block counts.
 */
import { CourseService } from '../services/courseService';
import { BlockService } from '../services/blockService';
import type { GetCoursesResponse } from '../schemas/courseSchema';

export class CourseFacade {
	private courseService: CourseService;
	private blockService: BlockService;
	constructor() {
		this.courseService = new CourseService();
		this.blockService = new BlockService();
	}
	/**
	 * Get available courses with their block counts for a specific creator
	 * @param creatorId
	 * @returns List of courses with block counts
	 */
	async getAvailableCoursesWithBlockCount(creatorId: string): Promise<GetCoursesResponse[]> {
		console.log(
			'CourseFacade: Getting available courses with block count for creatorId:',
			creatorId
		);
		const courses = await this.courseService.getAvailableCourses(creatorId);
		const coursesWithBlockCount = await Promise.all(
			courses.map(async (course) => {
				const blocks = await this.blockService.getManyByCourseId(course.id);
				return {
					...course,
					blocksCount: blocks.length
				};
			})
		);
		return coursesWithBlockCount;
	}
}
