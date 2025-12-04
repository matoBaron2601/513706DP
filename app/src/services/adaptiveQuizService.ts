/**
 * @fileoverview
 * Service for managing AdaptiveQuiz entities.
 */
import type { AdaptiveQuizDto, CreateAdaptiveQuizDto, UpdateAdaptiveQuizDto } from '../db/schema';
import { AdaptiveQuizRepository } from '../repositories/adaptiveQuizRepository';
import type { Transaction } from '../types';
import { NotFoundError } from '../errors/AppError';

export class AdaptiveQuizService {
	constructor(private repo: AdaptiveQuizRepository = new AdaptiveQuizRepository()) {}

	/**
	 * Get adaptive quiz by ID
	 * @param id
	 * @param tx
	 * @returns AdaptiveQuizDto
	 * @throws NotFoundError if the adaptive quiz does not exist
	 */
	async getById(id: string, tx?: Transaction): Promise<AdaptiveQuizDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`AdaptiveQuiz with id ${id} not found`);
		return item;
	}

	/**
	 * Create a new adaptive quiz
	 * @param data
	 * @param tx
	 * @returns AdaptiveQuizDto
	 */
	async create(data: CreateAdaptiveQuizDto, tx?: Transaction): Promise<AdaptiveQuizDto> {
		return await this.repo.create(data, tx);
	}

	/**
	 * Update an existing adaptive quiz
	 * @param id
	 * @param data
	 * @param tx
	 * @returns AdaptiveQuizDto
	 * @throws NotFoundError if the adaptive quiz does not exist
	 */
	async update(
		id: string,
		data: UpdateAdaptiveQuizDto,
		tx?: Transaction
	): Promise<AdaptiveQuizDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`AdaptiveQuiz with id ${id} not found`);
		return item;
	}

	/**
	 * Delete an adaptive quiz
	 * @param id
	 * @param tx
	 * @returns AdaptiveQuizDto
	 * @throws NotFoundError if the adaptive quiz does not exist
	 */
	async delete(id: string, tx?: Transaction): Promise<AdaptiveQuizDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`AdaptiveQuiz with id ${id} not found`);
		return item;
	}

	/**
	 * Get adaptive quizzes by their IDs
	 * @param ids
	 * @param tx
	 * @returns AdaptiveQuizDto[]
	 */
	async getByIds(ids: string[], tx?: Transaction): Promise<AdaptiveQuizDto[]> {
		return await this.repo.getByIds(ids, tx);
	}

	/**
	 * Get adaptive quizzes by user block ID
	 * @param userBlockId
	 * @param tx
	 * @returns AdaptiveQuizDto[]
	 */
	async getByUserBlockId(userBlockId: string, tx?: Transaction): Promise<AdaptiveQuizDto[]> {
		return await this.repo.getByUserBlockId(userBlockId, tx);
	}

	/**
	 * Get next adaptive quiz for a user block ID
	 * @param userBlockId
	 * @param tx
	 * @returns AdaptiveQuizDto
	 * @throws NotFoundError if the adaptive quiz does not exist
	 */
	async getNextQuiz(userBlockId: string, tx?: Transaction): Promise<AdaptiveQuizDto> {
		const item = await this.repo.getByUserBlockIdLowerVersion(userBlockId, tx);
		if (!item) throw new NotFoundError(`AdaptiveQuiz with id ${userBlockId} not found`);
		return item;
	}

	/**
	 * Get adaptive quiz by base quiz ID
	 * @param baseQuizId
	 * @param tx
	 * @returns AdaptiveQuizDto
	 * @throws NotFoundError if the adaptive quiz does not exist
	 */
	async getByBaseQuizId(baseQuizId: string, tx?: Transaction): Promise<AdaptiveQuizDto> {
		const item = await this.repo.getByBaseQuizId(baseQuizId, tx);
		if (!item) throw new NotFoundError(`AdaptiveQuiz with id ${baseQuizId} not found`);
		return item;
	}

	/**
	 * Get last adaptive quiz by user block ID
	 * @param userBlockId
	 * @returns AdaptiveQuizDto
	 * @throws NotFoundError if the adaptive quiz does not exist
	 */
	async getLastAdaptiveQuizByUserBlockId(userBlockId: string): Promise<AdaptiveQuizDto> {
		const item = await this.repo.getLastAdaptiveQuizByUserBlockId(userBlockId);
		if (!item) throw new NotFoundError(`AdaptiveQuiz with id ${userBlockId} not found`);
		return item;
	}

	/**
	 * Get last N versions of adaptive quizzes by user block ID
	 * @param userBlockId
	 * @param count
	 * @param tx
	 * @returns AdaptiveQuizDto[]
	 */
	async getLastVersionsByUserBlockId(
		userBlockId: string,
		count: number,
		tx?: Transaction
	): Promise<AdaptiveQuizDto[]> {
		return await this.repo.getLastVersionsByUserBlockId(userBlockId, count, tx);
	}

	/**
	 * Get last incompleted adaptive quiz by user block ID
	 * @param userBlockId
	 * @param tx
	 * @returns AdaptiveQuizDto
	 * @throws NotFoundError if the adaptive quiz does not exist
	 */
	async getLastIncompletedByUserBlockId(
		userBlockId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizDto> {
		const item = await this.repo.getLastIncompletedByUserBlockId(userBlockId, tx);
		if (!item) throw new NotFoundError(`AdaptiveQuiz with userBlockId ${userBlockId} not found`);
		return item;
	}
}
