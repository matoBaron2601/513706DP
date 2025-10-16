import type { CreateBaseOptionDto, UpdateBaseOptionDto, BaseOptionDto } from '../../db/schema';
import { BaseOptionRepository } from '../../repositories/commonRepositories/baseOptionRepository';
import type { Transaction } from '../../types';
import { NotFoundError } from '../utils/notFoundError';

export class BaseOptionService {
	private repo: BaseOptionRepository;

	constructor() {
		this.repo = new BaseOptionRepository();
	}

	async getById(id: string, tx?: Transaction): Promise<BaseOptionDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`BaseOption with id ${id} not found`);
		return item;
	}

	async create(data: CreateBaseOptionDto, tx?: Transaction): Promise<BaseOptionDto> {
		return await this.repo.create(data, tx);
	}

	async update(id: string, data: UpdateBaseOptionDto, tx?: Transaction): Promise<BaseOptionDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`BaseOption with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<BaseOptionDto> {
		const item = await this.repo.deleteById(id, tx);
		if (!item) throw new NotFoundError(`BaseOption with id ${id} not found`);
		return item;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<BaseOptionDto[]> {
		return await this.repo.getByIds(ids, tx);
	}

	async createMany(data: CreateBaseOptionDto[], tx?: Transaction): Promise<BaseOptionDto[]> {
		return await this.repo.createMany(data, tx);
	}
}
