/**
 * @fileoverview
 * Service layer for BaseQuiz entity, providing methods for CRUD operations.
 */
import type { CreateBaseQuizDto, UpdateBaseQuizDto, BaseQuizDto } from '../db/schema';
import { BaseQuizRepository } from '../repositories/baseQuizRepository';
import type { Transaction } from '../types';
import { NotFoundError } from '../errors/AppError';

export class BaseQuizService {
	constructor(private repo: BaseQuizRepository = new BaseQuizRepository()) {}

	/**
	 * Get BaseQuiz by ID
	 * @param id
	 * @param tx
	 * @returns BaseQuizDto
	 * @throws NotFoundError if the BaseQuiz does not exist
	 */
	async getById(id: string, tx?: Transaction): Promise<BaseQuizDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`BaseQuiz with id ${id} not found`);
		return item;
	}

	/**
	 * Create a new BaseQuiz
	 * @param data
	 * @param tx
	 * @returns BaseQuizDto
	 */
	async create(data: CreateBaseQuizDto, tx?: Transaction): Promise<BaseQuizDto> {
		return await this.repo.create(data, tx);
	}

	/**
	 * Update an existing BaseQuiz
	 * @param id
	 * @param data
	 * @param tx
	 * @returns BaseQuizDto
	 * @throws NotFoundError if the BaseQuiz does not exist
	 */
	async update(id: string, data: UpdateBaseQuizDto, tx?: Transaction): Promise<BaseQuizDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`BaseQuiz with id ${id} not found`);
		return item;
	}

	/**
	 * Delete a BaseQuiz by ID
	 * @param id
	 * @param tx
	 * @returns BaseQuizDto
	 * @throws NotFoundError if the BaseQuiz does not exist
	 */
	async delete(id: string, tx?: Transaction): Promise<BaseQuizDto> {
		const item = await this.repo.deleteById(id, tx);
		if (!item) throw new NotFoundError(`BaseQuiz with id ${id} not found`);
		return item;
	}

	/**
	 * Get multiple BaseQuiz entities by their IDs
	 * @param ids
	 * @param tx
	 * @returns Array of BaseQuizDto
	 */
	async getByIds(ids: string[], tx?: Transaction): Promise<BaseQuizDto[]> {
		return await this.repo.getByIds(ids, tx);
	}
}
