/**
 * @fileoverview
 * Repository for managing Adaptive Quiz entities in the database.
 */
import { eq, inArray, asc, desc, and } from 'drizzle-orm';
import {
	adaptiveQuiz,
	type CreateAdaptiveQuizDto,
	type UpdateAdaptiveQuizDto,
	type AdaptiveQuizDto
} from '../db/schema';
import type { Transaction } from '../types';
import _getDbClient, { type GetDbClient } from './utils/getDbClient';

export class AdaptiveQuizRepository {
	constructor(private readonly getDbClient: GetDbClient = _getDbClient) {}

	/**
	 * Retrieves an Adaptive Quiz by its ID. 
	 * @param adaptiveQuizId 
	 * @param tx 
	 * @returns The Adaptive Quiz DTO if found, otherwise undefined. 
	 */
	async getById(adaptiveQuizId: string, tx?: Transaction): Promise<AdaptiveQuizDto | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(adaptiveQuiz)
			.where(eq(adaptiveQuiz.id, adaptiveQuizId));
		return result[0];
	}

	/**
	 * Retrieves multiple Adaptive Quizzes by their IDs.
	 * @param adaptiveQuizIds
	 * @param tx
	 * @returns An array of Adaptive Quiz DTOs.
	 */
	async getByIds(adaptiveQuizIds: string[], tx?: Transaction): Promise<AdaptiveQuizDto[]> {
		return await this.getDbClient(tx)
			.select()
			.from(adaptiveQuiz)
			.where(inArray(adaptiveQuiz.id, adaptiveQuizIds));
	}

	/**
	 * Creates a new Adaptive Quiz.
	 * @param newAdaptiveQuiz
	 * @param tx
	 * @returns The created Adaptive Quiz DTO.
	 */
	async create(newAdaptiveQuiz: CreateAdaptiveQuizDto, tx?: Transaction): Promise<AdaptiveQuizDto> {
		const result = await this.getDbClient(tx)
			.insert(adaptiveQuiz)
			.values(newAdaptiveQuiz)
			.returning();
		return result[0];
	}

	/**
	 * Updates an existing Adaptive Quiz.
	 * @param adaptiveQuizId
	 * @param updateAdaptiveQuiz
	 * @param tx
	 * @returns The updated Adaptive Quiz DTO if found, otherwise undefined.
	 */
	async update(
		adaptiveQuizId: string,
		updateAdaptiveQuiz: UpdateAdaptiveQuizDto,
		tx?: Transaction
	): Promise<AdaptiveQuizDto | undefined> {
		const result = await this.getDbClient(tx)
			.update(adaptiveQuiz)
			.set(updateAdaptiveQuiz)
			.where(eq(adaptiveQuiz.id, adaptiveQuizId))
			.returning();
		return result[0];
	}

	/**
	 * Deletes an Adaptive Quiz by its ID.
	 * @param adaptiveQuizId
	 * @param tx
	 * @returns The deleted Adaptive Quiz DTO if found, otherwise undefined.
	 */
	async delete(adaptiveQuizId: string, tx?: Transaction): Promise<AdaptiveQuizDto | undefined> {
		const result = await this.getDbClient(tx)
			.delete(adaptiveQuiz)
			.where(eq(adaptiveQuiz.id, adaptiveQuizId))
			.returning();
		return result[0];
	}

	/**
	 * Retrieves Adaptive Quizzes by User Block ID.
	 * @param userBlockId
	 * @param tx
	 * @returns An array of Adaptive Quiz DTOs.
	 */
	async getByUserBlockId(userBlockId: string, tx?: Transaction): Promise<AdaptiveQuizDto[]> {
		return await this.getDbClient(tx)
			.select()
			.from(adaptiveQuiz)
			.where(eq(adaptiveQuiz.userBlockId, userBlockId));
	}

	/**
	 * Retrieves the Adaptive Quiz with the lowest version for a given User Block ID.
	 * @param userBlockIds
	 * @param tx
	 * @returns The Adaptive Quiz DTO with the lowest version.
	 */
	async getByUserBlockIdLowerVersion(
		userBlockIds: string,
		tx?: Transaction
	): Promise<AdaptiveQuizDto> {
		const result = await this.getDbClient(tx)
			.select()
			.from(adaptiveQuiz)
			.where(eq(adaptiveQuiz.userBlockId, userBlockIds))
			.orderBy(asc(adaptiveQuiz.version));
		return result[0];
	}

	/**
	 * Retrieves an Adaptive Quiz by its Base Quiz ID.
	 * @param baseQuizId
	 * @param tx
	 * @returns The Adaptive Quiz DTO if found, otherwise undefined.
	 */
	async getByBaseQuizId(
		baseQuizId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizDto | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(adaptiveQuiz)
			.where(eq(adaptiveQuiz.baseQuizId, baseQuizId));
		return result[0];
	}

	/**
	 * Retrieves the last Adaptive Quiz by User Block ID.
	 * @param userBlockId
	 * @param tx
	 * @returns The last Adaptive Quiz DTO if found, otherwise undefined.
	 */
	async getLastAdaptiveQuizByUserBlockId(
		userBlockId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizDto | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(adaptiveQuiz)
			.where(eq(adaptiveQuiz.userBlockId, userBlockId))
			.orderBy(desc(adaptiveQuiz.version))
			.limit(1);
		return result[0];
	}

	/**
	 * Retrieves the last completed Adaptive Quizzes by User Block ID.
	 * @param userBlockId
	 * @param count
	 * @param tx
	 * @returns An array of the last completed Adaptive Quiz DTOs.
	 */
	async getLastVersionsByUserBlockId(
		userBlockId: string,
		count: number,
		tx?: Transaction
	): Promise<AdaptiveQuizDto[]> {
		return await this.getDbClient(tx)
			.select()
			.from(adaptiveQuiz)
			.where(
				and(
					eq(adaptiveQuiz.userBlockId, userBlockId),
					eq(adaptiveQuiz.isCompleted, true),
					eq(adaptiveQuiz.readyForAnswering, true)
				)
			)
			.orderBy(desc(adaptiveQuiz.version))
			.limit(count);
	}

	/**
	 * Retrieves the last incompleted Adaptive Quiz by User Block ID.
	 * @param userBlockId
	 * @param tx
	 * @returns The last incompleted Adaptive Quiz DTO if found, otherwise undefined.
	 */
	async getLastIncompletedByUserBlockId(
		userBlockId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizDto | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(adaptiveQuiz)
			.where(and(eq(adaptiveQuiz.userBlockId, userBlockId), eq(adaptiveQuiz.isCompleted, false)))
			.orderBy(desc(adaptiveQuiz.version))
			.limit(1);
		return result[0];
	}
}
