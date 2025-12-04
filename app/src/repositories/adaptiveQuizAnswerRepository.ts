/**
 * @fileoverview
 * Repository for managing Adaptive Quiz Answers in the database.
 */
import { eq, inArray, desc, and } from 'drizzle-orm';
import {
	adaptiveQuizAnswer,
	type CreateAdaptiveQuizAnswerDto,
	type UpdateAdaptiveQuizAnswerDto,
	type AdaptiveQuizAnswerDto,
	baseQuestion
} from '../db/schema';
import type { Transaction } from '../types';
import _getDbClient, { type GetDbClient } from './utils/getDbClient';

export class AdaptiveQuizAnswerRepository {
	constructor(private readonly getDbClient: GetDbClient = _getDbClient) {}

	/**
	 * Retrieves an Adaptive Quiz Answer by its ID.
	 * @param adaptiveQuizAnswerId
	 * @param tx
	 * @returns The Adaptive Quiz Answer DTO or undefined if not found.
	 */
	async getById(
		adaptiveQuizAnswerId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(adaptiveQuizAnswer)
			.where(eq(adaptiveQuizAnswer.id, adaptiveQuizAnswerId));
		return result[0];
	}

	/**
	 * Retrieves multiple Adaptive Quiz Answers by their IDs.
	 * @param adaptiveQuizAnswerIds
	 * @param tx
	 * @returns An array of Adaptive Quiz Answer DTOs.
	 */
	async getByIds(
		adaptiveQuizAnswerIds: string[],
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto[]> {
		return await this.getDbClient(tx)
			.select()
			.from(adaptiveQuizAnswer)
			.where(inArray(adaptiveQuizAnswer.id, adaptiveQuizAnswerIds));
	}

	/**
	 * Creates a new Adaptive Quiz Answer.
	 * @param newAdaptiveQuizAnswer
	 * @param tx
	 * @returns The created Adaptive Quiz Answer DTO.
	 */
	async create(
		newAdaptiveQuizAnswer: CreateAdaptiveQuizAnswerDto,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto> {
		const result = await this.getDbClient(tx)
			.insert(adaptiveQuizAnswer)
			.values(newAdaptiveQuizAnswer)
			.returning();
		return result[0];
	}

	/**
	 * Updates an existing Adaptive Quiz Answer.
	 * @param adaptiveQuizAnswerId
	 * @param updateAdaptiveQuizAnswer
	 * @param tx
	 * @returns The updated Adaptive Quiz Answer DTO or undefined if not found.
	 */
	async update(
		adaptiveQuizAnswerId: string,
		updateAdaptiveQuizAnswer: UpdateAdaptiveQuizAnswerDto,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto | undefined> {
		const result = await this.getDbClient(tx)
			.update(adaptiveQuizAnswer)
			.set(updateAdaptiveQuizAnswer)
			.where(eq(adaptiveQuizAnswer.id, adaptiveQuizAnswerId))
			.returning();
		return result[0];
	}

	/**
	 * Deletes an Adaptive Quiz Answer by its ID.
	 * @param adaptiveQuizAnswerId
	 * @param tx
	 * @returns The deleted Adaptive Quiz Answer DTO or undefined if not found.
	 */
	async delete(
		adaptiveQuizAnswerId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto | undefined> {
		const result = await this.getDbClient(tx)
			.delete(adaptiveQuizAnswer)
			.where(eq(adaptiveQuizAnswer.id, adaptiveQuizAnswerId))
			.returning();
		return result[0];
	}

	/**
	 * Retrieves an Adaptive Quiz Answer by its Base Question ID.
	 * @param baseQuestionId
	 * @param tx
	 * @returns The Adaptive Quiz Answer DTO or undefined if not found.
	 */
	async getByBaseQuestionId(
		baseQuestionId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(adaptiveQuizAnswer)
			.where(eq(adaptiveQuizAnswer.baseQuestionId, baseQuestionId));
		return result[0];
	}

	/**
	 * Retrieves all Adaptive Quiz Answers for a given Adaptive Quiz ID.
	 * @param adaptiveQuizId
	 * @param tx
	 * @returns An array of Adaptive Quiz Answer DTOs.
	 */
	async getByAdaptiveQuizId(
		adaptiveQuizId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto[]> {
		return await this.getDbClient(tx)
			.select()
			.from(adaptiveQuizAnswer)
			.where(eq(adaptiveQuizAnswer.adaptiveQuizId, adaptiveQuizId))
			.orderBy(desc(adaptiveQuizAnswer.createdAt));
	}

	/**
	 * Retrieves the question history for given Adaptive Quiz IDs and a concept ID.
	 * @param adaptiveQuizIds
	 * @param conceptId
	 * @param tx
	 * @returns An array of question history objects.
	 */
	async getQuestionHistory(adaptiveQuizIds: string[], conceptId: string, tx?: Transaction) {
		return await this.getDbClient(tx)
			.select({
				questionText: baseQuestion.questionText,
				correctAnswerText: baseQuestion.correctAnswerText,
				isCorrect: adaptiveQuizAnswer.isCorrect
			})
			.from(adaptiveQuizAnswer)
			.innerJoin(baseQuestion, eq(adaptiveQuizAnswer.baseQuestionId, baseQuestion.id))
			.where(
				and(
					eq(baseQuestion.conceptId, conceptId),
					inArray(adaptiveQuizAnswer.adaptiveQuizId, adaptiveQuizIds)
				)
			)
			.limit(20);
	}
}
