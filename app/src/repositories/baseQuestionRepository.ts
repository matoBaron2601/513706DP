/**
 * @fileoverview
 * Repository for managing BaseQuestion entities in the database.
 */
import { eq, inArray } from 'drizzle-orm';
import {
	baseQuestion,
	type BaseQuestionDto,
	type CreateBaseQuestionDto,
	type UpdateBaseQuestionDto
} from '../db/schema';
import type { Transaction } from '../types';
import _getDbClient, { type GetDbClient } from './utils/getDbClient';

export class BaseQuestionRepository {
	constructor(private readonly getDbClient: GetDbClient = _getDbClient) {}

	/**
	 * Retrieves a Base Question by its ID.
	 * @param id - The ID of the Base Question.
	 * @param tx - Optional transaction object.
	 * @returns The Base Question DTO if found, otherwise undefined.
	 */
	async getById(id: string, tx?: Transaction): Promise<BaseQuestionDto | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(baseQuestion)
			.where(eq(baseQuestion.id, id));
		return result[0];
	}

	/**
	 * Creates a new Base Question.
	 * @param data - The data for the new Base Question.
	 * @param tx - Optional transaction object.
	 * @returns The created Base Question DTO.
	 */
	async create(data: CreateBaseQuestionDto, tx?: Transaction): Promise<BaseQuestionDto> {
		const result = await this.getDbClient(tx).insert(baseQuestion).values(data).returning();
		return result[0];
	}

	/**
	 * Updates an existing Base Question.
	 * @param id - The ID of the Base Question to update.
	 * @param data - The updated data for the Base Question.
	 * @param tx - Optional transaction object.
	 * @returns The updated Base Question DTO if found, otherwise undefined.
	 */
	async update(
		id: string,
		data: UpdateBaseQuestionDto,
		tx?: Transaction
	): Promise<BaseQuestionDto | undefined> {
		const result = await this.getDbClient(tx)
			.update(baseQuestion)
			.set(data)
			.where(eq(baseQuestion.id, id))
			.returning();
		return result[0];
	}

	/**
	 * Deletes a Base Question by its ID.
	 * @param id - The ID of the Base Question to delete.
	 * @param tx - Optional transaction object.
	 * @returns The deleted Base Question DTO if found, otherwise undefined.
	 */
	async deleteById(id: string, tx?: Transaction): Promise<BaseQuestionDto | undefined> {
		const result = await this.getDbClient(tx)
			.delete(baseQuestion)
			.where(eq(baseQuestion.id, id))
			.returning();
		return result[0];
	}

	/**
	 * Retrieves multiple Base Questions by their IDs.
	 * @param ids - An array of Base Question IDs.
	 * @param tx - Optional transaction object.
	 * @returns An array of Base Question DTOs.
	 */
	async getByIds(ids: string[], tx?: Transaction): Promise<BaseQuestionDto[]> {
		return await this.getDbClient(tx)
			.select()
			.from(baseQuestion)
			.where(inArray(baseQuestion.id, ids));
	}

	/**
	 * Creates multiple Base Questions.
	 * @param data - An array of data for the new Base Questions.
	 * @param tx - Optional transaction object.
	 * @returns An array of created Base Question DTOs.
	 */
	async createMany(data: CreateBaseQuestionDto[], tx?: Transaction): Promise<BaseQuestionDto[]> {
		return await this.getDbClient(tx).insert(baseQuestion).values(data).returning();
	}

	/**
	 * Retrieves Base Questions by Base Quiz ID.
	 * @param baseQuizId - The ID of the Base Quiz.
	 * @param tx - Optional transaction object.
	 * @returns An array of Base Question DTOs.
	 */
	async getByBaseQuizId(baseQuizId: string, tx?: Transaction): Promise<BaseQuestionDto[]> {
		return await this.getDbClient(tx)
			.select()
			.from(baseQuestion)
			.where(eq(baseQuestion.baseQuizId, baseQuizId));
	}

	/**
	 * Retrieves the Base Quiz ID associated with a given Base Question ID.
	 * @param questionId - The ID of the Base Question.
	 * @param tx - Optional transaction object.
	 * @returns The Base Quiz ID if found, otherwise undefined.
	 */
	async getBaseQuizIdByQuestionId(
		questionId: string,
		tx?: Transaction
	): Promise<string | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(baseQuestion)
			.where(eq(baseQuestion.id, questionId))
			.limit(1);
		return result[0]?.baseQuizId;
	}
}
