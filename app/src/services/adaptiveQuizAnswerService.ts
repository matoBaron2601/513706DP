/**
 * @fileoverview
 * Service for managing adaptive quiz answers.
 */
import type {
	AdaptiveQuizAnswerDto,
	CreateAdaptiveQuizAnswerDto,
	UpdateAdaptiveQuizAnswerDto
} from '../db/schema';
import { AdaptiveQuizAnswerRepository } from '../repositories/adaptiveQuizAnswerRepository';
import type { Transaction } from '../types';
import { NotFoundError } from '../errors/AppError';

export class AdaptiveQuizAnswerService {
	constructor(private repo: AdaptiveQuizAnswerRepository = new AdaptiveQuizAnswerRepository()) {}

	/**
	 * Get adaptive quiz answer by ID
	 * @param id
	 * @param tx
	 * @returns AdaptiveQuizAnswerDto
	 * @throws NotFoundError if the adaptive quiz answer does not exist
	 */
	async getById(id: string, tx?: Transaction): Promise<AdaptiveQuizAnswerDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`AdaptiveQuizAnswer with id ${id} not found`);
		return item;
	}

	/**
	 * Create a new adaptive quiz answer
	 * @param data
	 * @param tx
	 * @returns AdaptiveQuizAnswerDto
	 */
	async create(
		data: CreateAdaptiveQuizAnswerDto,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto> {
		return await this.repo.create(data, tx);
	}

	/**
	 * Update an existing adaptive quiz answer
	 * @param id
	 * @param data
	 * @param tx
	 * @returns AdaptiveQuizAnswerDto
	 * @throws NotFoundError if the adaptive quiz answer does not exist
	 */
	async update(
		id: string,
		data: UpdateAdaptiveQuizAnswerDto,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`AdaptiveQuizAnswer with id ${id} not found`);
		return item;
	}

	/**
	 * Delete an adaptive quiz answer
	 * @param id
	 * @param tx
	 * @returns AdaptiveQuizAnswerDto
	 * @throws NotFoundError if the adaptive quiz answer does not exist
	 */
	async delete(id: string, tx?: Transaction): Promise<AdaptiveQuizAnswerDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`AdaptiveQuizAnswer with id ${id} not found`);
		return item;
	}

	/**
	 * Get adaptive quiz answers by their IDs
	 * @param ids
	 * @param tx
	 * @returns AdaptiveQuizAnswerDto[]
	 * @throws NotFoundError if any adaptive quiz answer does not exist
	 */
	async getByIds(ids: string[], tx?: Transaction): Promise<AdaptiveQuizAnswerDto[]> {
		return await this.repo.getByIds(ids, tx);
	}

	/**
	 * Get adaptive quiz answer by base question ID
	 * @param baseQuestionId
	 * @param tx
	 * @returns AdaptiveQuizAnswerDto | undefined
	 */
	async getByBaseQuestionId(
		baseQuestionId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto | undefined> {
		return await this.repo.getByBaseQuestionId(baseQuestionId, tx);
	}

	/**	 * Get adaptive quiz answers by adaptive quiz ID
	 * @param adaptiveQuizId
	 * @param tx
	 * @returns AdaptiveQuizAnswerDto[]
	 */
	async getManyByAdaptiveQuizId(
		adaptiveQuizId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto[]> {
		return await this.repo.getByAdaptiveQuizId(adaptiveQuizId, tx);
	}

	/**
	 * Get question history for given adaptive quiz IDs and concept ID
	 * @param adaptiveQuizIds
	 * @param conceptId
	 * @returns AdaptiveQuizAnswerDto[]
	 */
	async getQuestionHistory(adaptiveQuizIds: string[], conceptId: string) {
		return await this.repo.getQuestionHistory(adaptiveQuizIds, conceptId);
	}
}
