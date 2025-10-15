import type { CreateCourseBlockDto, UpdateCourseBlockDto, CourseBlockDto } from '../../db/schema';
import { CourseBlockRepository } from '../../repositories/complexQuizRepositories/courseBlockRepository';
import type { Transaction } from '../../types';
import { NotFoundError } from '../utils/notFoundError';

export class CourseBlockService {
	private repo: CourseBlockRepository;

	constructor() {
		this.repo = new CourseBlockRepository();
	}

	async getById(id: string, tx?: Transaction): Promise<CourseBlockDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`CourseBlock with id ${id} not found`);
		return item;
	}

	async getByCourseId(courseId: string, tx?: Transaction): Promise<CourseBlockDto[]> {
		return await this.repo.getByCourseId(courseId, tx);
	}

	async create(data: CreateCourseBlockDto, tx?: Transaction): Promise<CourseBlockDto> {
		return await this.repo.create(data, tx);
	}

	async update(id: string, data: UpdateCourseBlockDto, tx?: Transaction): Promise<CourseBlockDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`CourseBlock with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<CourseBlockDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`CourseBlock with id ${id} not found`);
		return item;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<CourseBlockDto[]> {
		return await this.repo.getByIds(ids, tx);
	}
	
}
