import type { CreateBaseQuestionDto, UpdateBaseQuestionDto, BaseQuestionDto } from '../db/schema';
import { BaseQuestionRepository } from '../repositories/baseQuestionRepository';
import type { Transaction } from '../types';
import { NotFoundError } from './utils/notFoundError';

export class BaseQuestionService {
	private repo: BaseQuestionRepository;

	constructor() {
		this.repo = new BaseQuestionRepository();
	}

	async getById(id: string, tx?: Transaction): Promise<BaseQuestionDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`BaseQuestion with id ${id} not found`);
		return item;
	}

	async create(data: CreateBaseQuestionDto, tx?: Transaction): Promise<BaseQuestionDto> {
		return await this.repo.create(data, tx);
	}

	async update(
		id: string,
		data: UpdateBaseQuestionDto,
		tx?: Transaction
	): Promise<BaseQuestionDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`BaseQuestion with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<BaseQuestionDto> {
		const item = await this.repo.deleteById(id, tx);
		if (!item) throw new NotFoundError(`BaseQuestion with id ${id} not found`);
		return item;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<BaseQuestionDto[]> {
		return await this.repo.getByIds(ids, tx);
	}

	async createMany(data: CreateBaseQuestionDto[], tx?: Transaction): Promise<BaseQuestionDto[]> {
		return await this.repo.createMany(data, tx);
	}

	async getByBaseQuizId(baseQuizId: string, tx?: Transaction): Promise<BaseQuestionDto[]> {
		return await this.repo.getByBaseQuizId(baseQuizId, tx);
	}

	async getBaseQuizIdByQuestionId(questionId: string, tx?: Transaction): Promise<string> {
		const item = await this.repo.getBaseQuizIdByQuestionId(questionId, tx);
		if (!item) throw new NotFoundError(`BaseQuestion with id ${questionId} not found`);
		return item;
	}
}
