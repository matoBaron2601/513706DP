import type { CreateCourseDto, UpdateCourseDto, CourseDto } from '../../db/schema';
import { CourseRepository } from '../../repositories/complexQuizRepositories/courseRepository';
import type { Transaction } from '../../types';
import { NotFoundError } from '../utils/notFoundError';

export class CourseService {
	private repo: CourseRepository;

	constructor() {
		this.repo = new CourseRepository();
	}

	async getById(id: string, tx?: Transaction): Promise<CourseDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`Course with id ${id} not found`);
		return item;
	}

	async getByCreatorId(creatorId: string, tx?: Transaction): Promise<CourseDto[]> {
		return await this.repo.getByCreatorId(creatorId, tx);
	}

	async create(data: CreateCourseDto, tx?: Transaction): Promise<CourseDto> {
		return await this.repo.create(data, tx);
	}

	async update(id: string, data: UpdateCourseDto, tx?: Transaction): Promise<CourseDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`Course with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<CourseDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`Course with id ${id} not found`);
		return item;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<CourseDto[]> {
		return await this.repo.getByIds(ids, tx);
	}
}
