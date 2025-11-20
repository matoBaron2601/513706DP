import { check } from 'drizzle-orm/gel-core';
import type {
	PlacementQuizDto,
	CreatePlacementQuizDto,
	UpdatePlacementQuizDto,
	CreateUserBlockDto,
	UpdateUserBlockDto,
	UserBlockDto
} from '../db/schema';
import { NotFoundError, UnauthorizedError } from '../errors/AppError';

import { PlacementQuizRepository } from '../repositories/placementQuizRepository';
import { UserBlockRepository } from '../repositories/userBlockRepository';
import { UserRepository } from '../repositories/userRepository';
import type { Transaction } from '../types';

export class UserBlockService {
	constructor(
		private repo: UserBlockRepository = new UserBlockRepository(),
		private userRepo: UserRepository = new UserRepository()
	) {}

	async getById(id: string, tx?: Transaction): Promise<UserBlockDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`UserBlock with id ${id} not found`);
		return item;
	}

	async create(data: CreateUserBlockDto, tx?: Transaction): Promise<UserBlockDto> {
		return await this.repo.create(data, tx);
	}

	async update(id: string, data: UpdateUserBlockDto, tx?: Transaction): Promise<UserBlockDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`UserBlock with id ${id} not found`);
		return item;
	}

	async delete(id: string, userEmail: string, tx?: Transaction): Promise<UserBlockDto> {
		await this.checkUserIsOwnerOfUserBlock(id, userEmail, tx);
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`UserBlock with id ${id} not found`);
		return item;
	}

	async getByBothIdsOrUndefined(
		data: { userId: string; blockId: string },
		tx?: Transaction
	): Promise<UserBlockDto | undefined> {
		const item = await this.repo.getByBothIds(data, tx);
		if (!item) return undefined;
		return item;
	}

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
