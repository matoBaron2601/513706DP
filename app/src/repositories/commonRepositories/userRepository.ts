import { eq, inArray } from 'drizzle-orm';
import { user, type CreateUserDto, type UpdateUserDto, type UserDto } from '../../db/schema';
import type { Transaction } from '../../types';
import getDbClient from '../utils/getDbClient';

export class UserRepository {
	async getById(userId: string, tx?: Transaction): Promise<UserDto | undefined> {
		const result = await getDbClient(tx).select().from(user).where(eq(user.id, userId));
		return result[0];
	}

	async getByEmail(email: string, tx?: Transaction): Promise<UserDto | undefined> {
		const result = await getDbClient(tx).select().from(user).where(eq(user.email, email));
		return result[0];
	}

	async create(newUser: CreateUserDto, tx?: Transaction): Promise<UserDto> {
		const result = await getDbClient(tx).insert(user).values(newUser).returning();
		return result[0];
	}

	async delete(userId: string, tx?: Transaction): Promise<UserDto | undefined> {
		const result = await getDbClient(tx).delete(user).where(eq(user.id, userId)).returning();
		return result[0];
	}

	async update(
		userId: string,
		updateUser: UpdateUserDto,
		tx?: Transaction
	): Promise<UserDto | undefined> {
		const result = await getDbClient(tx)
			.update(user)
			.set(updateUser)
			.where(eq(user.id, userId))
			.returning();
		return result[0];
	}

	async getByIds(userIds: string[], tx?: Transaction): Promise<UserDto[]> {
		return await getDbClient(tx).select().from(user).where(inArray(user.id, userIds));
	}
}
