import type { CreateBaseAnswerDto, UpdateBaseAnswerDto, BaseAnswerDto } from '../../db/schema';
import { BaseAnswerRepository } from '../../repositories/commonRepositories/baseAnswerRepository';
import type { Transaction } from '../../types';
import { NotFoundError } from '../utils/notFoundError';

export class BaseAnswerService {
	private repo: BaseAnswerRepository;

	constructor() {
		this.repo = new BaseAnswerRepository();
	}

	async getById(id: string, tx?: Transaction): Promise<BaseAnswerDto> {
		const item = await this.repo.getBaseAnswerById(id, tx);
		if (!item) throw new NotFoundError(`BaseAnswer with id ${id} not found`);
		return item;
	}

	async create(data: CreateBaseAnswerDto, tx?: Transaction): Promise<BaseAnswerDto> {
		return await this.repo.createBaseAnswer(data, tx);
	}

	async update(id: string, data: UpdateBaseAnswerDto, tx?: Transaction): Promise<BaseAnswerDto> {
		const item = await this.repo.updateBaseAnswer(id, data, tx);
		if (!item) throw new NotFoundError(`BaseAnswer with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<BaseAnswerDto> {
		const item = await this.repo.deleteBaseAnswerById(id, tx);
		if (!item) throw new NotFoundError(`BaseAnswer with id ${id} not found`);
		return item;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<BaseAnswerDto[]> {
		return await this.repo.getBaseAnswersByIds(ids, tx);
	}
}
