/**
 * @fileoverview
 * Repository for managing PlacementQuiz entities in the database.
 */

import { eq, inArray } from 'drizzle-orm';
import {
	placementQuiz,
	type CreatePlacementQuizDto,
	type UpdatePlacementQuizDto,
	type PlacementQuizDto
} from '../db/schema';
import type { Transaction } from '../types';
import _getDbClient, { type GetDbClient } from './utils/getDbClient';

export class PlacementQuizRepository {
	constructor(private readonly getDbClient: GetDbClient = _getDbClient) {}

	/**
	 * Get a placement quiz by its ID.
	 * @param placementQuizId 
	 * @param tx 
	 * @returns The placement quiz with the specified ID, or undefined if not found.
	 */
	async getById(placementQuizId: string, tx?: Transaction): Promise<PlacementQuizDto | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(placementQuiz)
			.where(eq(placementQuiz.id, placementQuizId));
		return result[0];
	}

	/**
	 * Get multiple placement quizzes by their IDs.
	 * @param placementQuizIds 
	 * @param tx 
	 * @returns An array of placement quizzes with the specified IDs.
	 */
	async getByIds(placementQuizIds: string[], tx?: Transaction): Promise<PlacementQuizDto[]> {
		return await this.getDbClient(tx)
			.select()
			.from(placementQuiz)
			.where(inArray(placementQuiz.id, placementQuizIds));
	}

	/**
	 * Create a new placement quiz.
	 * @param newPlacementQuiz 
	 * @param tx 
	 * @returns The created placement quiz.
	 */
	async create(
		newPlacementQuiz: CreatePlacementQuizDto,
		tx?: Transaction
	): Promise<PlacementQuizDto> {
		const result = await this.getDbClient(tx).insert(placementQuiz).values(newPlacementQuiz).returning();
		return result[0];
	}

	/**
	 * Update an existing placement quiz.
	 * @param placementQuizId 
	 * @param updatePlacementQuiz 
	 * @param tx 
	 * @returns The updated placement quiz, or undefined if not found.
	 */
	async update(
		placementQuizId: string,
		updatePlacementQuiz: UpdatePlacementQuizDto,
		tx?: Transaction
	): Promise<PlacementQuizDto | undefined> {
		const result = await this.getDbClient(tx)
			.update(placementQuiz)
			.set(updatePlacementQuiz)
			.where(eq(placementQuiz.id, placementQuizId))
			.returning();
		return result[0];
	}

	/**
	 * Delete a placement quiz by its ID.
	 * @param placementQuizId 
	 * @param tx 
	 * @returns The deleted placement quiz, or undefined if not found.
	 */
	async delete(placementQuizId: string, tx?: Transaction): Promise<PlacementQuizDto | undefined> {
		const result = await this.getDbClient(tx)
			.delete(placementQuiz)
			.where(eq(placementQuiz.id, placementQuizId))
			.returning();
		return result[0];
	}

	/**
	 * Get a placement quiz by its associated block ID.
	 * @param blockId 
	 * @param tx 
	 * @returns The placement quiz associated with the specified block ID, or undefined if not found.
	 */
	async getByBlockId(blockId: string, tx?: Transaction): Promise<PlacementQuizDto | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(placementQuiz)
			.where(eq(placementQuiz.blockId, blockId));
		return result[0];
	}
}
