import type { CreateCourseDto, UpdateCourseDto, CourseDto } from '../db/schema';
import { CourseRepository } from '../repositories/courseRepository';
import type { Transaction } from '../types';
import { NotFoundError } from './utils/notFoundError';

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

	async create(data: CreateCourseDto, tx?: Transaction): Promise<CourseDto> {
		return await this.repo.create(data, tx);
	}

	async update(id: string, data: UpdateCourseDto, tx?: Transaction): Promise<CourseDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`Course with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<CourseDto> {
		const item = await this.repo.update(id, { deletedAt: new Date() }, tx);
		if (!item) throw new NotFoundError(`Course with id ${id} not found`);
		return item;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<CourseDto[]> {
		return await this.repo.getByIds(ids, tx);
	}

	async getManyByCreatorId(creatorId: string, tx?: Transaction): Promise<CourseDto[]> {
		return await this.repo.getManyByCreatorId(creatorId, tx);
	}

	async getAll(tx?: Transaction): Promise<CourseDto[]> {
		return await this.repo.getAll(tx);
	}

}
