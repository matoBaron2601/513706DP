/**
 * @fileoverview
 * Repository for managing blocks in the database.
 */
import { eq, inArray } from 'drizzle-orm';
import { block, type CreateBlockDto, type UpdateBlockDto, type BlockDto } from '../db/schema';
import type { Transaction } from '../types';
import _getDbClient, { type GetDbClient } from './utils/getDbClient';

export class BlockRepository {
	constructor(private readonly getDbClient: GetDbClient = _getDbClient) {}

	/**
	 * Retrieves a Block by its ID.
	 * @param blockId - The ID of the Block.
	 * @param tx - Optional transaction object.
	 * @returns The Block DTO if found, otherwise undefined.
	 */
	async getById(blockId: string, tx?: Transaction): Promise<BlockDto | undefined> {
		const result = await this.getDbClient(tx).select().from(block).where(eq(block.id, blockId));
		return result[0];
	}

	/**
	 * Creates a new Block.
	 * @param newBlock - The data for the new Block.
	 * @param tx - Optional transaction object.
	 * @returns The created Block DTO.
	 */
	async create(newBlock: CreateBlockDto, tx?: Transaction): Promise<BlockDto> {
		const result = await this.getDbClient(tx).insert(block).values(newBlock).returning();
		return result[0];
	}

	/**
	 * Updates an existing Block.
	 * @param blockId - The ID of the Block to update.
	 * @param updateBlock - The data to update the Block with.
	 * @param tx - Optional transaction object.
	 * @returns The updated Block DTO if found, otherwise undefined.
	 */
	async update(
		blockId: string,
		updateBlock: UpdateBlockDto,
		tx?: Transaction
	): Promise<BlockDto | undefined> {
		const result = await this.getDbClient(tx)
			.update(block)
			.set(updateBlock)
			.where(eq(block.id, blockId))
			.returning();
		return result[0];
	}

	/**
	 * Deletes a Block by its ID.
	 * @param blockId - The ID of the Block to delete.
	 * @param tx - Optional transaction object.
	 * @returns The deleted Block DTO if found, otherwise undefined.
	 */
	async delete(blockId: string, tx?: Transaction): Promise<BlockDto | undefined> {
		const result = await this.getDbClient(tx).delete(block).where(eq(block.id, blockId)).returning();
		return result[0];
	}

	/**
	 * Retrieves multiple Blocks by their IDs.
	 * @param blockIds - An array of Block IDs.
	 * @param tx - Optional transaction object.
	 * @returns An array of Block DTOs.
	 */
	async getManyByIds(blockIds: string[], tx?: Transaction): Promise<BlockDto[]> {
		return await this.getDbClient(tx).select().from(block).where(inArray(block.id, blockIds));
	}

	/**
	 * Retrieves all Blocks.
	 * @param tx - Optional transaction object.
	 * @returns An array of all Block DTOs.
	 */
	async getAll(tx?: Transaction): Promise<BlockDto[]> {
		return await this.getDbClient(tx).select().from(block);
	}

	/**
	 * Retrieves multiple Blocks by their Course ID.
	 * @param courseId - The ID of the Course.
	 * @param tx - Optional transaction object.
	 * @returns An array of Block DTOs.
	 */
	async getManyByCourseId(courseId: string, tx?: Transaction): Promise<BlockDto[]> {
		return await this.getDbClient(tx).select().from(block).where(eq(block.courseId, courseId));
	}

	/**
	 * Soft deletes Blocks by their Course ID.
	 * @param courseId - The ID of the Course.
	 * @param tx - Optional transaction object.
	 * @returns An array of soft-deleted Block DTOs.
	 */
	async deleteByCourseId(courseId: string, tx?: Transaction): Promise<BlockDto[]> {
		return await this.getDbClient(tx)
			.update(block)
			.set({ deletedAt: new Date() })
			.where(eq(block.courseId, courseId))
			.returning();
	}
}
