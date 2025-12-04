/**
 * @fileoverview
 * Service for managing user blocks.
 */
import type { CreateUserBlockDto, UpdateUserBlockDto, UserBlockDto } from '../db/schema';
import { NotFoundError, UnauthorizedError } from '../errors/AppError';

import { UserBlockRepository } from '../repositories/userBlockRepository';
import { UserRepository } from '../repositories/userRepository';
import type { Transaction } from '../types';

export class UserBlockService {
	constructor(
		private repo: UserBlockRepository = new UserBlockRepository(),
		private userRepo: UserRepository = new UserRepository()
	) {}

	/**
	 * Get a user block by its ID.
	 * @param id - The ID of the user block.
	 * @param tx - Optional transaction object.
	 * @returns The user block DTO.
	 * @throws NotFoundError if the user block is not found.
	 */
	async getById(id: string, tx?: Transaction): Promise<UserBlockDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`UserBlock with id ${id} not found`);
		return item;
	}

	/**
	 * Create a new user block.
	 * @param data - The data for the new user block.
	 * @param tx - Optional transaction object.
	 * @returns The created user block DTO.
	 */
	async create(data: CreateUserBlockDto, tx?: Transaction): Promise<UserBlockDto> {
		return await this.repo.create(data, tx);
	}

	/**
	 * Update an existing user block.
	 * @param id - The ID of the user block to update.
	 * @param data - The data to update.
	 * @param tx - Optional transaction object.
	 * @returns The updated user block DTO.
	 * @throws NotFoundError if the user block is not found.
	 */
	async update(id: string, data: UpdateUserBlockDto, tx?: Transaction): Promise<UserBlockDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`UserBlock with id ${id} not found`);
		return item;
	}

	/**
	 * Delete a user block.
	 * @param id - The ID of the user block to delete.
	 * @param userEmail - The email of the user attempting to delete the block.
	 * @param tx - Optional transaction object.
	 * @returns The deleted user block DTO.
	 * @throws NotFoundError if the user block is not found.
	 * @throws UnauthorizedError if the user is not the owner of the user block.
	 */
	async delete(id: string, userEmail: string, tx?: Transaction): Promise<UserBlockDto> {
		await this.checkUserIsOwnerOfUserBlock(id, userEmail, tx);
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`UserBlock with id ${id} not found`);
		return item;
	}

	/**
	 * Get a user block by user ID and block ID, or return undefined if not found.
	 * @param data - An object containing userId and blockId.
	 * @param tx - Optional transaction object.
	 * @returns The user block DTO or undefined.
	 */
	async getByUserIdAndBlockIdOrUndefined(
		data: { userId: string; blockId: string },
		tx?: Transaction
	): Promise<UserBlockDto | undefined> {
		const item = await this.repo.getByUserIdAndBlockId(data.userId, data.blockId, tx);
		if (!item) return undefined;
		return item;
	}

	/**
	 * Check if a user is the owner of a user block.
	 * @param userBlockId - The ID of the user block.
	 * @param userEmail - The email of the user.
	 * @param tx - Optional transaction object.
	 * @throws NotFoundError if the user or user block is not found.
	 * @throws UnauthorizedError if the user is not the owner of the user block.
	 */
	async checkUserIsOwnerOfUserBlock(
		userBlockId: string,
		userEmail: string,
		tx?: Transaction
	): Promise<void> {
		const user = await this.userRepo.getByEmail(userEmail, tx);
		if (!user) throw new NotFoundError(`User with email ${userEmail} not found`);
		const userBlock = await this.repo.getById(userBlockId, tx);
		if (!userBlock) throw new NotFoundError(`UserBlock with id ${userBlockId} not found`);

		if (user.id !== userBlock.userId)
			throw new UnauthorizedError(`User is not the owner of UserBlock ${userBlockId}`);
	}
}
