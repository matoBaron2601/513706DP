import type { CreateCourseDto, UpdateCourseDto, CourseDto } from '../db/schema';
import { BadRequestError, ConflictError } from '../errors/AppError';
import { BlockRepository } from '../repositories/blockRepository';
import { CourseRepository } from '../repositories/courseRepository';
import type { GetCoursesRequest, GetCoursesResponse } from '../schemas/courseSchema';
import type { Transaction } from '../types';
import { NotFoundError } from './utils/notFoundError';

export class CourseService {
	private repo: CourseRepository;
	private blockRepo: BlockRepository;

	constructor() {
		this.repo = new CourseRepository();
		this.blockRepo = new BlockRepository();
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

	async getAll(filter?: GetCoursesRequest, tx?: Transaction): Promise<GetCoursesResponse[]> {
		return await this.repo.getAll(filter, tx);
	}

	async publishCourse(id: string, tx?: Transaction): Promise<CourseDto> {
		const blocks = await this.blockRepo.getManyByCourseId(id, tx);
		if (blocks.length === 0) {
			throw new ConflictError('Course must have at least one block to be published', { courseId: id });
		}

		const item = await this.repo.update(id, { published: true }, tx);
		if (!item) throw new NotFoundError(`Course with id ${id} not found`);

		return item;
	}

	async unpublishCourse(id: string, tx?: Transaction): Promise<CourseDto> {
		const item = await this.repo.update(id, { published: false }, tx);
		if (!item) throw new NotFoundError(`Course with id ${id} not found`);
		return item;
	}
}
