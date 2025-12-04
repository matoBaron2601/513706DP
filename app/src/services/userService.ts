/**
 * @fileoverview
 * User service to handle business logic related to users.
 */
import type { CreateUserDto, UpdateUserDto, UserDto } from '../db/schema';
import { NotFoundError } from '../errors/AppError';
import { UserRepository } from '../repositories/userRepository';
import type { Transaction } from '../types';

export class UserService {
	constructor(private repo: UserRepository = new UserRepository()) {}

	/**
	 * Get a user by their ID.
	 * @param userId - The ID of the user.
	 * @param tx - Optional transaction object.
	 * @returns The user DTO.
	 * @throws NotFoundError if the user is not found.
	 */
	async getById(userId: string, tx?: Transaction): Promise<UserDto> {
		const item = await this.repo.getById(userId, tx);
		if (!item) throw new NotFoundError(`User with id ${userId} not found`);
		return item;
	}

	/**
	 * Get a user by their email.
	 * @param email - The email of the user.
	 * @param tx - Optional transaction object.
	 * @returns The user DTO.
	 * @throws NotFoundError if the user is not found.
	 */
	async getByEmail(email: string, tx?: Transaction): Promise<UserDto> {
		const item = await this.repo.getByEmail(email, tx);
		if (!item) throw new NotFoundError(`User with email ${email} not found`);
		return item;
	}

	/**
	 * Create a new user.
	 * @param newUser - The data for the new user.
	 * @param tx - Optional transaction object.
	 * @returns The created user DTO.
	 */
	async create(newUser: CreateUserDto, tx?: Transaction): Promise<UserDto> {
		return this.repo.create(newUser, tx);
	}

	/**
	 * Update an existing user.
	 * @param id - The ID of the user to update.
	 * @param patch - The data to update.
	 * @param tx - Optional transaction object.
	 * @returns The updated user DTO.
	 * @throws NotFoundError if the user is not found.
	 */
	async update(id: string, patch: UpdateUserDto, tx?: Transaction): Promise<UserDto> {
		const u = await this.repo.update(id, patch, tx);
		if (!u) throw new NotFoundError(`User with id ${id} not found`);
		return u;
	}

	/**
	 * Delete a user by their ID.
	 * @param id - The ID of the user to delete.
	 * @param tx - Optional transaction object.
	 * @returns The deleted user DTO.
	 * @throws NotFoundError if the user is not found.
	 */
	async delete(id: string, tx?: Transaction): Promise<UserDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`User with id ${id} not found`);
		return item;
	}

	/**
	 * Get multiple users by their IDs.
	 * @param ids - The IDs of the users.
	 * @param tx - Optional transaction object.
	 * @returns An array of user DTOs.
	 */
	async getByIds(ids: string[], tx?: Transaction): Promise<UserDto[]> {
		return this.repo.getByIds(ids, tx);
	}

	/**
	 * Get or create a user by their email.
	 * @param data - The data for the user.
	 * @returns The existing or newly created user DTO.
	 */
	async getOrCreateUser(data: CreateUserDto): Promise<UserDto> {
		try {
			const existing = await this.repo.getByEmail(data.email);
			if (!existing) return this.repo.create(data);
			return existing;
		} catch (e) {
			if (e instanceof NotFoundError) return this.repo.create(data);
			return this.repo.create(data);
		}
	}
}
