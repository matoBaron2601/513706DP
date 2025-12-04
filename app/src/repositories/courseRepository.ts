/**
 * @fileoverview
 * Course repository for managing course data in the database.
 */
import { eq, inArray, isNull, and, or } from 'drizzle-orm';
import { course, type CreateCourseDto, type UpdateCourseDto, type CourseDto } from '../db/schema';
import type { Transaction } from '../types';
import _getDbClient, { type GetDbClient } from './utils/getDbClient';

export type CourseWithBlocksCount = CourseDto & { blocksCount: number };

export class CourseRepository {
	constructor(private readonly getDbClient: GetDbClient = _getDbClient) {}

	/**
	 * Get a course by its ID.
	 * @param courseId 
	 * @param tx 
	 * @returns The course with the specified ID, or undefined if not found.
	 */
	async getById(courseId: string, tx?: Transaction): Promise<CourseDto | undefined> {
		const result = await this.getDbClient(tx).select().from(course).where(eq(course.id, courseId));
		return result[0];
	}

	/**
	 * Create a new course.
	 * @param newCourse 
	 * @param tx 
	 * @returns The created course.
	 */
	async create(newCourse: CreateCourseDto, tx?: Transaction): Promise<CourseDto> {
		const result = await this.getDbClient(tx).insert(course).values(newCourse).returning();
		return result[0];
	}

	/**
	 * Update an existing course.
	 * @param courseId 
	 * @param updateCourse 
	 * @param tx 
	 * @returns The updated course, or undefined if not found.
	 */
	async update(
		courseId: string,
		updateCourse: UpdateCourseDto,
		tx?: Transaction
	): Promise<CourseDto | undefined> {
		const result = await this.getDbClient(tx)
			.update(course)
			.set(updateCourse)
			.where(eq(course.id, courseId))
			.returning();
		return result[0];
	}

	/**
	 * Delete a course by its ID.
	 * @param courseId 
	 * @param tx 
	 * @returns The deleted course, or undefined if not found.
	 */
	async delete(courseId: string, tx?: Transaction): Promise<CourseDto | undefined> {
		const result = await this.getDbClient(tx)
			.delete(course)
			.where(eq(course.id, courseId))
			.returning();
		return result[0];
	}

	/**
	 * Get multiple courses by their IDs.
	 * @param courseIds 
	 * @param tx 
	 * @returns An array of courses with the specified IDs.
	 */
	async getByIds(courseIds: string[], tx?: Transaction): Promise<CourseDto[]> {
		return await this.getDbClient(tx).select().from(course).where(inArray(course.id, courseIds));
	}

	/**
	 * Get multiple courses by the creator's ID.
	 * @param creatorId 
	 * @param tx 
	 * @returns An array of courses created by the specified creator.
	 */
	async getManyByCreatorId(creatorId: string, tx?: Transaction): Promise<CourseDto[]> {
		return await this.getDbClient(tx).select().from(course).where(eq(course.creatorId, creatorId));
	}

	/**
	 * Get available courses for a creator.
	 * @param creatorId 
	 * @param tx 
	 * @returns An array of available courses for the specified creator.
	 */
	async getAvailableCourses(creatorId: string, tx?: Transaction): Promise<CourseDto[]> {
		return await this.getDbClient(tx)
			.select()
			.from(course)
			.where(
				and(
					isNull(course.deletedAt),
					or(eq(course.published, true), eq(course.creatorId, creatorId))
				)
			);
	}
}
