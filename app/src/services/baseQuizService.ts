import type { CreateBaseQuizDto, UpdateBaseQuizDto, BaseQuizDto } from '../db/schema';
import { BaseQuizRepository } from '../repositories/baseQuizRepository';
import type { Transaction } from '../types';
import { NotFoundError } from './utils/notFoundError';

export class BaseQuizService {
	constructor(private repo: BaseQuizRepository = new BaseQuizRepository()) {}

	async getById(id: string, tx?: Transaction): Promise<BaseQuizDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`BaseQuiz with id ${id} not found`);
		return item;
	}

	async create(data: CreateBaseQuizDto, tx?: Transaction): Promise<BaseQuizDto> {
		return await this.repo.create(data, tx);
	}

	async update(id: string, data: UpdateBaseQuizDto, tx?: Transaction): Promise<BaseQuizDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`BaseQuiz with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<BaseQuizDto> {
		const item = await this.repo.deleteById(id, tx);
		if (!item) throw new NotFoundError(`BaseQuiz with id ${id} not found`);
		return item;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<BaseQuizDto[]> {
		return await this.repo.getByIds(ids, tx);
	}
}
