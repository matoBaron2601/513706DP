import type {
	PlacementQuizDto,
	CreatePlacementQuizDto,
	UpdatePlacementQuizDto,
	CreateUserBlockDto,
	UpdateUserBlockDto,
	UserBlockDto
} from '../db/schema';

import { PlacementQuizRepository } from '../repositories/placementQuizRepository';
import { UserBlockRepository } from '../repositories/userBlockRepository';
import type { Transaction } from '../types';
import { NotFoundError } from './utils/notFoundError';

export class UserBlockService {
	private repo: UserBlockRepository;

	constructor() {
		this.repo = new UserBlockRepository();
	}

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

	async delete(id: string, tx?: Transaction): Promise<UserBlockDto> {
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

}
