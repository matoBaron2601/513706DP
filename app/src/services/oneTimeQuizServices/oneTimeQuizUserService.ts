import type { CreateOneTimeUserQuizDto, UpdateOneTimeUserQuizDto, oneTimeUserQuizDto } from '../../db/schema';
import { OneTimeQuizUserRepository } from '../../repositories/oneTimeQuizRepositories/oneTimeQuizUserRepository';
import type { Transaction } from '../../types';
import { NotFoundError } from '../utils/notFoundError';

export class OneTimeQuizUserService {
	private repo: OneTimeQuizUserRepository;

	constructor() {
		this.repo = new OneTimeQuizUserRepository();
	}

	async getById(id: string, tx?: Transaction): Promise<oneTimeUserQuizDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`OneTimeQuizUser with id ${id} not found`);
		return item;
	}

	async getByOneTimeQuizId(oneTimeQuizId: string, tx?: Transaction): Promise<oneTimeUserQuizDto[]> {
		return await this.repo.getByOneTimeQuizId(oneTimeQuizId, tx);
	}

	async getByUserId(userId: string, tx?: Transaction): Promise<oneTimeUserQuizDto[]> {
		return await this.repo.getByUserId(userId, tx);
	}

	async create(data: CreateOneTimeUserQuizDto, tx?: Transaction): Promise<oneTimeUserQuizDto> {
		return await this.repo.create(data, tx);
	}

	async update(id: string, data: UpdateOneTimeUserQuizDto, tx?: Transaction): Promise<oneTimeUserQuizDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`OneTimeQuizUser with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<oneTimeUserQuizDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`OneTimeQuizUser with id ${id} not found`);
		return item;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<oneTimeUserQuizDto[]> {
		return await this.repo.getByIds(ids, tx);
	}
}
