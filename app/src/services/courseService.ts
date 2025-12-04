/**
 * @fileoverview
 * Service layer for managing Course entities.
 * This layer handles business logic and interacts with the CourseRepository for data operations.
 */
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

	/**
	 * Retrieve a Course by its ID.
	 * @param id
	 * @param tx
	 * @returns The CourseDto if found.
	 * @throws NotFoundError if the Course does not exist.
	 */
	async getById(id: string, tx?: Transaction): Promise<CourseDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`Course with id ${id} not found`);
		return item;
	}

	/**
	 * Create a new Course.
	 * @param data
	 * @param tx
	 * @returns The newly created CourseDto.
	 */
	async create(data: CreateCourseDto, tx?: Transaction): Promise<CourseDto> {
		return await this.repo.create(data, tx);
	}

	/**
	 * Update an existing Course by its ID.
	 * @param id
	 * @param data
	 * @param tx
	 * @returns The updated CourseDto.
	 * @throws NotFoundError if the Course does not exist.
	 */
	async update(id: string, data: UpdateCourseDto, tx?: Transaction): Promise<CourseDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`Course with id ${id} not found`);
		return item;
	}

	/**
	 * Soft delete a Course by its ID.
	 * @param id
	 * @param userEmail
	 * @param tx
	 * @returns The deleted CourseDto.
	 * @throws NotFoundError if the Course does not exist.
	 */
	async delete(id: string, userEmail: string, tx?: Transaction): Promise<CourseDto> {
		await this.checkUserCreatorOfCourse(id, userEmail, tx);
		const item = await this.repo.update(id, { deletedAt: new Date() }, tx);
		if (!item) throw new NotFoundError(`Course with id ${id} not found`);
		return item;
	}

	/**
	 * Retrieve multiple Courses by their IDs.
	 * @param ids
	 * @param tx
	 * @returns An array of CourseDto.
	 */
	async getByIds(ids: string[], tx?: Transaction): Promise<CourseDto[]> {
		return await this.repo.getByIds(ids, tx);
	}

	/**
	 * Retrieve multiple Courses by the creator's ID.
	 * @param creatorId
	 * @param tx
	 * @returns An array of CourseDto.
	 */
	async getManyByCreatorId(creatorId: string, tx?: Transaction): Promise<CourseDto[]> {
		return await this.repo.getManyByCreatorId(creatorId, tx);
	}

	/**
	 * Retrieve available Courses for a specific creator.
	 * @param creatorId
	 * @param tx
	 * @returns An array of available CourseDto.
	 */
	async getAvailableCourses(creatorId: string, tx?: Transaction): Promise<CourseDto[]> {
		return await this.repo.getAvailableCourses(creatorId, tx);
	}

	/**
	 * Check if a user is the creator of a specific Course.
	 * @param courseId
	 * @param userEmail
	 * @param tx
	 * @throws NotFoundError if the User or Course does not exist.
	 * @throws UnauthorizedError if the User is not the creator of the Course.
	 */
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

	/**
	 * Publish a Course by its ID.
	 * @param id
	 * @param userEmail
	 * @param tx
	 * @returns The published CourseDto.
	 * @throws NotFoundError if the Course does not exist.
	 * @throws ConflictError if the Course has no blocks.
	 */
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

	/**
	 * Unpublish a Course by its ID.
	 * @param id
	 * @param userEmail
	 * @param tx
	 * @returns The unpublished CourseDto.
	 * @throws NotFoundError if the Course does not exist.
	 */
	async unpublishCourse(id: string, userEmail: string, tx?: Transaction): Promise<CourseDto> {
		await this.checkUserCreatorOfCourse(id, userEmail, tx);
		const item = await this.repo.update(id, { published: false }, tx);
		if (!item) throw new NotFoundError(`Course with id ${id} not found`);
		return item;
	}
}
