import { db } from '../db/client';
import type { CreateUserBlock, UserBlock } from '../schemas/userBlockSchema';
import { AdaptiveQuizService } from '../services/adaptiveQuizService';
import { ConceptProgressService } from '../services/conceptProgressService';
import { PlacementQuizService } from '../services/placementQuizService';
import { UserBlockService } from '../services/userBlockService';
import { ConceptService } from '../services/conceptService';
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

	async getAvailableCoursesWithBlockCount(creatorId: string): Promise<GetCoursesResponse[]> {
		console.log('CourseFacade: Getting available courses with block count for creatorId:', creatorId);
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
