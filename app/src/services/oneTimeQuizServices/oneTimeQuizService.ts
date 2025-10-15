import type { CreateOneTimeQuizDto, UpdateOneTimeQuizDto, OneTimeQuizDto } from '../../db/schema';
import { OneTimeQuizRepository } from '../../repositories/oneTimeQuizRepositories/oneTimeQuizRepository';
import type { Transaction } from '../../types';
import { NotFoundError } from '../utils/notFoundError';

export class OneTimeQuizService {
	private repo: OneTimeQuizRepository;

	constructor() {
		this.repo = new OneTimeQuizRepository();
	}

	async getById(id: string, tx?: Transaction): Promise<OneTimeQuizDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`OneTimeQuiz with id ${id} not found`);
		return item;
	}

	async getByCreatorId(creatorId: string, tx?: Transaction): Promise<OneTimeQuizDto[]> {
		return await this.repo.getByCreatorId(creatorId, tx);
	}

	async getByBaseQuizId(baseQuizId: string, tx?: Transaction): Promise<OneTimeQuizDto[]> {
		return await this.repo.getByBaseQuizId(baseQuizId, tx);
	}

	async create(data: CreateOneTimeQuizDto, tx?: Transaction): Promise<OneTimeQuizDto> {
		return await this.repo.create(data, tx);
	}

	async update(id: string, data: UpdateOneTimeQuizDto, tx?: Transaction): Promise<OneTimeQuizDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`OneTimeQuiz with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<OneTimeQuizDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`OneTimeQuiz with id ${id} not found`);
		return item;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<OneTimeQuizDto[]> {
		return await this.repo.getByIds(ids, tx);
	}
}
