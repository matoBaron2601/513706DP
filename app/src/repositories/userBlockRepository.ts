/**
 * @fileoverview
 * Repository for managing UserBlock entities in the database.
 */
import { eq, inArray, and } from 'drizzle-orm';
import {
	userBlock,
	type CreateUserBlockDto,
	type UpdateUserBlockDto,
	type UserBlockDto
} from '../db/schema';
import type { Transaction } from '../types';
import _getDbClient, { type GetDbClient } from './utils/getDbClient';

export class UserBlockRepository {
	constructor(private readonly getDbClient: GetDbClient = _getDbClient) {}

	/**
	 * Get a user block by its ID.
	 * @param userBlockId 
	 * @param tx 
	 * @returns The user block with the specified ID, or undefined if not found.
	 */
	async getById(userBlockId: string, tx?: Transaction): Promise<UserBlockDto | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(userBlock)
			.where(eq(userBlock.id, userBlockId));
		return result[0];
	}

	/**
	 * Get multiple user blocks by their IDs.
	 * @param userBlockIds 
	 * @param tx 
	 * @returns An array of user blocks with the specified IDs.
	 */
	async getByIds(userBlockIds: string[], tx?: Transaction): Promise<UserBlockDto[]> {
		return await this.getDbClient(tx)
			.select()
			.from(userBlock)
			.where(inArray(userBlock.id, userBlockIds));
	}

	/**
	 * Create a new user block.
	 * @param newUserBlock 
	 * @param tx 
	 * @returns The created user block.
	 */
	async create(newUserBlock: CreateUserBlockDto, tx?: Transaction): Promise<UserBlockDto> {
		const result = await this.getDbClient(tx).insert(userBlock).values(newUserBlock).returning();
		return result[0];
	}

	/**
	 * Update an existing user block.
	 * @param userBlockId 
	 * @param updateUserBlock 
	 * @param tx 
	 * @returns The updated user block, or undefined if not found.
	 */
	async update(
		userBlockId: string,
		updateUserBlock: UpdateUserBlockDto,
		tx?: Transaction
	): Promise<UserBlockDto | undefined> {
		const result = await this.getDbClient(tx)
			.update(userBlock)
			.set(updateUserBlock)
			.where(eq(userBlock.id, userBlockId))
			.returning();
		return result[0];
	}

	/**
	 * Delete a user block by its ID.
	 * @param userBlockId 
	 * @param tx 
	 * @returns The deleted user block, or undefined if not found.
	 */
	async delete(userBlockId: string, tx?: Transaction): Promise<UserBlockDto | undefined> {
		const result = await this.getDbClient(tx)
			.delete(userBlock)
			.where(eq(userBlock.id, userBlockId))
			.returning();
		return result[0];
	}

	/**
	 * Get a user block by user ID and block ID.
	 * @param userId 
	 * @param blockId 
	 * @param tx 
	 * @returns The user block for the specified user and block IDs, or undefined if not found.
	 */
	async getByUserIdAndBlockId(
		userId: string,
		blockId: string,
		tx?: Transaction
	): Promise<UserBlockDto | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(userBlock)
			.where(and(eq(userBlock.userId, userId), eq(userBlock.blockId, blockId)));
		return result[0];
	}
}
