/**
 * @fileoverview
 * Service for managing BaseOption entities.
 */
import type { CreateBaseOptionDto, UpdateBaseOptionDto, BaseOptionDto } from '../db/schema';
import { BaseOptionRepository } from '../repositories/baseOptionRepository';
import type { Transaction } from '../types';
import { NotFoundError } from '../errors/AppError';

export class BaseOptionService {
	constructor(private repo: BaseOptionRepository = new BaseOptionRepository()) {}

	/**
	 * Get BaseOption by ID
	 * @param id
	 * @param tx
	 * @returns BaseOptionDto
	 * @throws NotFoundError if the BaseOption does not exist
	 */
	async getById(id: string, tx?: Transaction): Promise<BaseOptionDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`BaseOption with id ${id} not found`);
		return item;
	}

	/**
	 * Create a new BaseOption
	 * @param data
	 * @param tx
	 * @returns BaseOptionDto
	 */
	async create(data: CreateBaseOptionDto, tx?: Transaction): Promise<BaseOptionDto> {
		return await this.repo.create(data, tx);
	}

	/**
	 * Update an existing BaseOption
	 * @param id
	 * @param data
	 * @param tx
	 * @returns BaseOptionDto
	 * @throws NotFoundError if the BaseOption does not exist
	 */
	async update(id: string, data: UpdateBaseOptionDto, tx?: Transaction): Promise<BaseOptionDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`BaseOption with id ${id} not found`);
		return item;
	}

	/**
	 * Delete a BaseOption by ID
	 * @param id
	 * @param tx
	 * @returns BaseOptionDto
	 * @throws NotFoundError if the BaseOption does not exist
	 */
	async delete(id: string, tx?: Transaction): Promise<BaseOptionDto> {
		const item = await this.repo.deleteById(id, tx);
		if (!item) throw new NotFoundError(`BaseOption with id ${id} not found`);
		return item;
	}

	/**
	 * Get BaseOptions by IDs
	 * @param ids
	 * @param tx
	 * @returns BaseOptionDto[]
	 */
	async getByIds(ids: string[], tx?: Transaction): Promise<BaseOptionDto[]> {
		return await this.repo.getByIds(ids, tx);
	}

	/**
	 * Create multiple BaseOptions
	 * @param data
	 * @param tx
	 * @returns BaseOptionDto[]
	 */
	async createMany(data: CreateBaseOptionDto[], tx?: Transaction): Promise<BaseOptionDto[]> {
		return await this.repo.createMany(data, tx);
	}

	/**
	 * Get BaseOptions by BaseQuestion ID
	 * @param baseQuestionId
	 * @param tx
	 * @returns BaseOptionDto[]
	 */
	async getByBaseQuestionId(baseQuestionId: string, tx?: Transaction): Promise<BaseOptionDto[]> {
		return await this.repo.getByBaseQuestionId(baseQuestionId, tx);
	}

	/**
	 * Get BaseOptions by multiple BaseQuestion IDs
	 * @param baseQuestionIds
	 * @param tx
	 * @returns BaseOptionDto[]
	 */
	async getManyByBaseQuestionIds(
		baseQuestionIds: string[],
		tx?: Transaction
	): Promise<BaseOptionDto[]> {
		return await this.repo.getManyByBaseQuestionIds(baseQuestionIds, tx);
	}
}
