import { eq, inArray } from 'drizzle-orm';
import { block, type CreateBlockDto, type UpdateBlockDto, type BlockDto } from '../db/schema';
import type { Transaction } from '../types';
import getDbClient from './utils/getDbClient';

export class BlockRepository {
	async getById(blockId: string, tx?: Transaction): Promise<BlockDto | undefined> {
		const result = await getDbClient(tx).select().from(block).where(eq(block.id, blockId));
		return result[0];
	}

	async create(newBlock: CreateBlockDto, tx?: Transaction): Promise<BlockDto> {
		const result = await getDbClient(tx).insert(block).values(newBlock).returning();
		return result[0];
	}

	async update(
		blockId: string,
		updateBlock: UpdateBlockDto,
		tx?: Transaction
	): Promise<BlockDto | undefined> {
		const result = await getDbClient(tx)
			.update(block)
			.set(updateBlock)
			.where(eq(block.id, blockId))
			.returning();
		return result[0];
	}

	async delete(blockId: string, tx?: Transaction): Promise<BlockDto | undefined> {
		const result = await getDbClient(tx).delete(block).where(eq(block.id, blockId)).returning();
		return result[0];
	}

	async getManyByIds(blockIds: string[], tx?: Transaction): Promise<BlockDto[]> {
		return await getDbClient(tx).select().from(block).where(inArray(block.id, blockIds));
	}

	async getAll(tx?: Transaction): Promise<BlockDto[]> {
		return await getDbClient(tx).select().from(block);
	}

	async getManyByCourseId(courseId: string, tx?: Transaction): Promise<BlockDto[]> {
		return await getDbClient(tx).select().from(block).where(eq(block.courseId, courseId));
	}
}
