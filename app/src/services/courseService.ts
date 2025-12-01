import type { CreateCourseDto, UpdateCourseDto, CourseDto } from '../db/schema';
import { ConflictError, UnauthorizedError } from '../errors/AppError';
import { BlockRepository } from '../repositories/blockRepository';
import { CourseRepository } from '../repositories/courseRepository';
import type { Transaction } from '../types';
import { NotFoundError } from '../errors/AppError';
import { UserRepository } from '../repositories/userRepository';

export class CourseService {
	constructor(
		private repo: CourseRepository = new CourseRepository(),
		private blockRepo: BlockRepository = new BlockRepository(),
		private userRepo: UserRepository = new UserRepository()
	) {}

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

	async delete(id: string, userEmail: string, tx?: Transaction): Promise<CourseDto> {
		await this.checkUserCreatorOfCourse(id, userEmail, tx);
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

	async getAvailableCourses(creatorId: string, tx?: Transaction): Promise<CourseDto[]> {
		return await this.repo.getAvailableCourses(creatorId, tx);
	}

	async checkUserCreatorOfCourse(courseId: string, userEmail: string, tx?: Transaction) {
		const user = await this.userRepo.getByEmail(userEmail, tx);
		if (!user) {
			throw new NotFoundError('User not found', { email: userEmail });
		}
		const course = await this.repo.getById(courseId, tx);
		if (!course) {
			throw new NotFoundError(`Course with id ${courseId} not found`);
		}
		if (course.creatorId !== user.id) {
			throw new UnauthorizedError('User is not the creator of the course', {
				courseId: courseId,
				userId: user.id
			});
		}
	}

	async publishCourse(id: string, userEmail: string, tx?: Transaction): Promise<CourseDto> {
		await this.checkUserCreatorOfCourse(id, userEmail, tx);
		const blocks = await this.blockRepo.getManyByCourseId(id, tx);
		if (blocks.length === 0) {
			throw new ConflictError('Course must have at least one block to be published', {
				courseId: id
			});
		}

		const item = await this.repo.update(id, { published: true }, tx);
		if (!item) throw new NotFoundError(`Course with id ${id} not found`);

		return item;
	}

	async unpublishCourse(id: string, userEmail: string, tx?: Transaction): Promise<CourseDto> {
		await this.checkUserCreatorOfCourse(id, userEmail, tx);
		const item = await this.repo.update(id, { published: false }, tx);
		if (!item) throw new NotFoundError(`Course with id ${id} not found`);
		return item;
	}
}
