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

	async getById(userBlockId: string, tx?: Transaction): Promise<UserBlockDto | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(userBlock)
			.where(eq(userBlock.id, userBlockId));
		return result[0];
	}

	async getByIds(userBlockIds: string[], tx?: Transaction): Promise<UserBlockDto[]> {
		return await this.getDbClient(tx)
			.select()
			.from(userBlock)
			.where(inArray(userBlock.id, userBlockIds));
	}

	async create(newUserBlock: CreateUserBlockDto, tx?: Transaction): Promise<UserBlockDto> {
		const result = await this.getDbClient(tx).insert(userBlock).values(newUserBlock).returning();
		return result[0];
	}

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

	async delete(userBlockId: string, tx?: Transaction): Promise<UserBlockDto | undefined> {
		const result = await this.getDbClient(tx)
			.delete(userBlock)
			.where(eq(userBlock.id, userBlockId))
			.returning();
		return result[0];
	}

	async getByBothIds(
		newUserBlock: CreateUserBlockDto,
		tx?: Transaction
	): Promise<UserBlockDto | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(userBlock)
			.where(
				and(eq(userBlock.userId, newUserBlock.userId), eq(userBlock.blockId, newUserBlock.blockId))
			);
		return result[0];
	}
}
