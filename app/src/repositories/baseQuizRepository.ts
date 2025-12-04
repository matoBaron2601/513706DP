/**
 * @fileoverview
 * Repository for managing BaseQuiz entities in the database.
 */
import { eq, inArray } from 'drizzle-orm';
import {
	baseQuiz,
	type BaseQuizDto,
	type CreateBaseQuizDto,
	type UpdateBaseQuizDto
} from '../db/schema';
import _getDbClient from './utils/getDbClient';
import type { Transaction } from '../types';

type GetDbClient = (tx?: Transaction) => any;

export class BaseQuizRepository {
	constructor(private readonly getDbClient: GetDbClient = _getDbClient) {}

	/**
	 * Retrieves a Base Quiz by its ID.
	 * @param id - The ID of the Base Quiz.
	 * @param tx - Optional transaction object.
	 * @returns The Base Quiz DTO if found, otherwise undefined.
	 */
	async getById(id: string, tx?: Transaction): Promise<BaseQuizDto | undefined> {
		const result = await this.getDbClient(tx).select().from(baseQuiz).where(eq(baseQuiz.id, id));
		return result[0];
	}

	/**
	 * Creates a new Base Quiz.
	 * @param data - The data for the new Base Quiz.
	 * @param tx - Optional transaction object.
	 * @returns The created Base Quiz DTO.
	 */
	async create(data: CreateBaseQuizDto, tx?: Transaction): Promise<BaseQuizDto> {
		const result = await this.getDbClient(tx).insert(baseQuiz).values(data).returning();
		return result[0];
	}

	/**
	 * Updates an existing Base Quiz.
	 * @param id - The ID of the Base Quiz to update.
	 * @param data - The updated data for the Base Quiz.
	 * @param tx - Optional transaction object.
	 * @returns The updated Base Quiz DTO if found, otherwise undefined.
	 */
	async update(
		id: string,
		data: UpdateBaseQuizDto,
		tx?: Transaction
	): Promise<BaseQuizDto | undefined> {
		const result = await this.getDbClient(tx)
			.update(baseQuiz)
			.set(data)
			.where(eq(baseQuiz.id, id))
			.returning();
		return result[0];
	}

	/**
	 * Deletes a Base Quiz by its ID.
	 * @param id - The ID of the Base Quiz to delete.
	 * @param tx - Optional transaction object.
	 * @returns The deleted Base Quiz DTO if found, otherwise undefined.
	 */
	async deleteById(id: string, tx?: Transaction): Promise<BaseQuizDto | undefined> {
		const result = await this.getDbClient(tx)
			.delete(baseQuiz)
			.where(eq(baseQuiz.id, id))
			.returning();
		return result[0];
	}

	/**
	 * Retrieves multiple Base Quizzes by their IDs.
	 * @param ids - An array of Base Quiz IDs.
	 * @param tx - Optional transaction object.
	 * @returns An array of Base Quiz DTOs.
	 */
	async getByIds(ids: string[], tx?: Transaction): Promise<BaseQuizDto[]> {
		return await this.getDbClient(tx).select().from(baseQuiz).where(inArray(baseQuiz.id, ids));
	}
}
