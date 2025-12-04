/**
 * @fileoverview
 * This repository provides methods to interact with the 'user' table in the database.
 */
import { eq, inArray } from 'drizzle-orm';
import { user, type CreateUserDto, type UpdateUserDto, type UserDto } from '../db/schema';
import type { Transaction } from '../types';
import _getDbClient from './utils/getDbClient';

type GetDbClient = (tx?: Transaction) => any;

export class UserRepository {
	constructor(private readonly getDbClient: GetDbClient = _getDbClient) {}

	/**
	 * Retrieves a user by their unique identifier.
	 * @param userId
	 * @param tx
	 * @returns A promise that resolves to the user data transfer object or undefined if not found.
	 */
	async getById(userId: string, tx?: Transaction): Promise<UserDto | undefined> {
		const result = await this.getDbClient(tx).select().from(user).where(eq(user.id, userId));
		return result[0];
	}

	/**
	 * Retrieves a user by their email address.
	 * @param email
	 * @param tx
	 * @returns A promise that resolves to the user data transfer object or undefined if not found.
	 */
	async getByEmail(email: string, tx?: Transaction): Promise<UserDto | undefined> {
		const result = await this.getDbClient(tx).select().from(user).where(eq(user.email, email));
		return result[0];
	}

	/**
	 * Creates a new user in the database.
	 * @param newUser
	 * @param tx
	 * @returns A promise that resolves to the newly created user data transfer object.
	 */
	async create(newUser: CreateUserDto, tx?: Transaction): Promise<UserDto> {
		const result = await this.getDbClient(tx).insert(user).values(newUser).returning();
		return result[0];
	}

	/**
	 * Deletes a user by their unique identifier.
	 * @param userId
	 * @param tx
	 * @returns A promise that resolves to the deleted user data transfer object or undefined if not found.
	 */
	async delete(userId: string, tx?: Transaction): Promise<UserDto | undefined> {
		const result = await this.getDbClient(tx).delete(user).where(eq(user.id, userId)).returning();
		return result[0];
	}

	/**
	 * Updates an existing user by their unique identifier.
	 * @param userId
	 * @param updateUser
	 * @param tx
	 * @returns A promise that resolves to the updated user data transfer object or undefined if not found.
	 */
	async update(
		userId: string,
		updateUser: UpdateUserDto,
		tx?: Transaction
	): Promise<UserDto | undefined> {
		const result = await this.getDbClient(tx)
			.update(user)
			.set(updateUser)
			.where(eq(user.id, userId))
			.returning();
		return result[0];
	}

	/**
	 * Retrieves multiple users by their unique identifiers.
	 * @param userIds
	 * @param tx
	 * @returns A promise that resolves to an array of user data transfer objects.
	 */
	async getByIds(userIds: string[], tx?: Transaction): Promise<UserDto[]> {
		return await this.getDbClient(tx).select().from(user).where(inArray(user.id, userIds));
	}
}
