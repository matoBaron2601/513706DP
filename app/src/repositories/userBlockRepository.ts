import { eq, inArray } from 'drizzle-orm';
import { userBlock, type CreateUserBlockDto, type UpdateUserBlockDto, type UserBlockDto } from '../db/schema';
import type { Transaction } from '../types';
import getDbClient from './utils/getDbClient';

export class UserBlockRepository {
	async getById(userBlockId: string, tx?: Transaction): Promise<UserBlockDto | undefined> {
		const result = await getDbClient(tx).select().from(userBlock).where(eq(userBlock.id, userBlockId));
		return result[0];
	}

	async getByIds(userBlockIds: string[], tx?: Transaction): Promise<UserBlockDto[]> {
		return await getDbClient(tx).select().from(userBlock).where(inArray(userBlock.id, userBlockIds));
	}

	async create(newUserBlock: CreateUserBlockDto, tx?: Transaction): Promise<UserBlockDto> {
		const result = await getDbClient(tx).insert(userBlock).values(newUserBlock).returning();
		return result[0];
	}

	async update(userBlockId: string, updateUserBlock: UpdateUserBlockDto, tx?: Transaction): Promise<UserBlockDto | undefined> {
		const result = await getDbClient(tx)
			.update(userBlock)
			.set(updateUserBlock)
			.where(eq(userBlock.id, userBlockId))
			.returning();
		return result[0];
	}

	async delete(userBlockId: string, tx?: Transaction): Promise<UserBlockDto | undefined> {
		const result = await getDbClient(tx).delete(userBlock).where(eq(userBlock.id, userBlockId)).returning();
		return result[0];
	}
}