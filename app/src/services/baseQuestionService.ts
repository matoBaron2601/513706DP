/**
 * @fileoverview
 * Service for managing BaseQuestions
 */
import type { CreateBaseQuestionDto, UpdateBaseQuestionDto, BaseQuestionDto } from '../db/schema';
import { BaseQuestionRepository } from '../repositories/baseQuestionRepository';
import type { Transaction } from '../types';
import { NotFoundError } from '../errors/AppError';

export class BaseQuestionService {
	constructor(private repo: BaseQuestionRepository = new BaseQuestionRepository()) {}

	/**
	 * Get BaseQuestion by ID
	 * @param id
	 * @param tx
	 * @returns BaseQuestionDto
	 * @throws NotFoundError if the BaseQuestion does not exist
	 */
	async getById(id: string, tx?: Transaction): Promise<BaseQuestionDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`BaseQuestion with id ${id} not found`);
		return item;
	}

	/**
	 * Create a new BaseQuestion
	 * @param data
	 * @param tx
	 * @returns BaseQuestionDto
	 */
	async create(data: CreateBaseQuestionDto, tx?: Transaction): Promise<BaseQuestionDto> {
		return await this.repo.create(data, tx);
	}

	/**
	 * Update an existing BaseQuestion
	 * @param id
	 * @param data
	 * @param tx
	 * @returns BaseQuestionDto
	 * @throws NotFoundError if the BaseQuestion does not exist
	 */
	async update(
		id: string,
		data: UpdateBaseQuestionDto,
		tx?: Transaction
	): Promise<BaseQuestionDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`BaseQuestion with id ${id} not found`);
		return item;
	}

	/**
	 * Delete a BaseQuestion by ID
	 * @param id
	 * @param tx
	 * @returns BaseQuestionDto
	 * @throws NotFoundError if the BaseQuestion does not exist
	 */
	async delete(id: string, tx?: Transaction): Promise<BaseQuestionDto> {
		const item = await this.repo.deleteById(id, tx);
		if (!item) throw new NotFoundError(`BaseQuestion with id ${id} not found`);
		return item;
	}

	/**
	 * Get BaseQuestions by IDs
	 * @param ids
	 * @param tx
	 * @returns BaseQuestionDto[]
	 */
	async getManyByIds(ids: string[], tx?: Transaction): Promise<BaseQuestionDto[]> {
		return await this.repo.getByIds(ids, tx);
	}

	/**
	 * Create multiple BaseQuestions
	 * @param data
	 * @param tx
	 * @returns BaseQuestionDto[]
	 */
	async createMany(data: CreateBaseQuestionDto[], tx?: Transaction): Promise<BaseQuestionDto[]> {
		return await this.repo.createMany(data, tx);
	}

	/**
	 * Get BaseQuestions by BaseQuiz ID
	 * @param baseQuizId
	 * @param tx
	 * @returns BaseQuestionDto[]
	 */
	async getByBaseQuizId(baseQuizId: string, tx?: Transaction): Promise<BaseQuestionDto[]> {
		return await this.repo.getByBaseQuizId(baseQuizId, tx);
	}

	/**
	 * Get BaseQuiz ID by BaseQuestion ID
	 * @param questionId
	 * @param tx
	 * @returns string
	 * @throws NotFoundError if the BaseQuestion does not exist
	 */
	async getBaseQuizIdByQuestionId(questionId: string, tx?: Transaction): Promise<string> {
		const item = await this.repo.getBaseQuizIdByQuestionId(questionId, tx);
		if (!item) throw new NotFoundError(`BaseQuestion with id ${questionId} not found`);
		return item;
	}
}
