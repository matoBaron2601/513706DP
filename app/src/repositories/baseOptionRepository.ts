/**
 * @fileoverview
 * Repository for base option-related database operations.
 */

import { eq, inArray } from 'drizzle-orm';
import {
	baseOption,
	type BaseOptionDto,
	type CreateBaseOptionDto,
	type UpdateBaseOptionDto
} from '../db/schema';
import type { Transaction } from '../types';
import _getDbClient, { type GetDbClient } from './utils/getDbClient';

export class BaseOptionRepository {
	constructor(private readonly getDbClient: GetDbClient = _getDbClient) {}

	/**
	 * Retrieves a Base Option by its ID.
	 * @param id - The ID of the Base Option.
	 * @param tx - Optional transaction object.
	 * @returns The Base Option DTO if found, otherwise undefined.
	 */
	async getById(id: string, tx?: Transaction): Promise<BaseOptionDto | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(baseOption)
			.where(eq(baseOption.id, id));
		return result[0];
	}

	/**
	 * Creates a new Base Option.
	 * @param data - The data for the new Base Option.
	 * @param tx - Optional transaction object.
	 * @returns The created Base Option DTO.
	 */
	async create(data: CreateBaseOptionDto, tx?: Transaction): Promise<BaseOptionDto> {
		const result = await this.getDbClient(tx).insert(baseOption).values(data).returning();
		return result[0];
	}

	/**
	 * Updates an existing Base Option.
	 * @param id - The ID of the Base Option to update.
	 * @param data - The updated data for the Base Option.
	 * @param tx - Optional transaction object.
	 * @returns The updated Base Option DTO if found, otherwise undefined.
	 */
	async update(
		id: string,
		data: UpdateBaseOptionDto,
		tx?: Transaction
	): Promise<BaseOptionDto | undefined> {
		const result = await this.getDbClient(tx)
			.update(baseOption)
			.set(data)
			.where(eq(baseOption.id, id))
			.returning();
		return result[0];
	}

	/**
	 * Deletes a Base Option by its ID.
	 * @param id - The ID of the Base Option to delete.
	 * @param tx - Optional transaction object.
	 * @returns The deleted Base Option DTO if found, otherwise undefined.
	 */
	async deleteById(id: string, tx?: Transaction): Promise<BaseOptionDto | undefined> {
		const result = await this.getDbClient(tx)
			.delete(baseOption)
			.where(eq(baseOption.id, id))
			.returning();
		return result[0];
	}

	/**
	 * Retrieves multiple Base Options by their IDs.
	 * @param ids - An array of Base Option IDs.
	 * @param tx - Optional transaction object.
	 * @returns An array of Base Option DTOs.
	 */
	async getByIds(ids: string[], tx?: Transaction): Promise<BaseOptionDto[]> {
		return await this.getDbClient(tx).select().from(baseOption).where(inArray(baseOption.id, ids));
	}

	/**
	 * Creates multiple Base Options.
	 * @param data - An array of data for the new Base Options.
	 * @param tx - Optional transaction object.
	 * @returns An array of created Base Option DTOs.
	 */
	async createMany(data: CreateBaseOptionDto[], tx?: Transaction): Promise<BaseOptionDto[]> {
		return await this.getDbClient(tx).insert(baseOption).values(data).returning();
	}

	/**
	 * Retrieves Base Options by Base Question ID.
	 * @param baseQuestionId - The ID of the Base Question.
	 * @param tx - Optional transaction object.
	 * @returns An array of Base Option DTOs.
	 */
	async getByBaseQuestionId(baseQuestionId: string, tx?: Transaction): Promise<BaseOptionDto[]> {
		return await this.getDbClient(tx)
			.select()
			.from(baseOption)
			.where(eq(baseOption.baseQuestionId, baseQuestionId));
	}

	/**
	 * Retrieves Base Options by multiple Base Question IDs.
	 * @param baseQuestionIds - An array of Base Question IDs.
	 * @param tx - Optional transaction object.
	 * @returns An array of Base Option DTOs.
	 */
	async getManyByBaseQuestionIds(
		baseQuestionIds: string[],
		tx?: Transaction
	): Promise<BaseOptionDto[]> {
		return await this.getDbClient(tx)
			.select()
			.from(baseOption)
			.where(inArray(baseOption.baseQuestionId, baseQuestionIds));
	}
}
