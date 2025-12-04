/**
 * @fileoverview
 * ConceptProgressService manages the business logic related to concept progress tracking,
 * interfacing with the ConceptProgressRepository for data operations.
 */

import type { Transaction } from '../types';
import { NotFoundError } from '../errors/AppError';
import type {
	ConceptProgressDto,
	CreateConceptProgressDto,
	UpdateConceptProgressDto
} from '../db/schema';
import { ConceptProgressRepository } from '../repositories/conceptProgressRepository';
export class ConceptProgressService {
	constructor(private repo: ConceptProgressRepository = new ConceptProgressRepository()) {}

	/**
	 * Retrieves a concept progress record by its ID.
	 * @param id
	 * @param tx
	 * @returns ConceptProgressDto
	 * @throws NotFoundError if the concept progress record is not found.
	 */
	async getById(id: string, tx?: Transaction): Promise<ConceptProgressDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`Concept with id ${id} not found`);
		return item;
	}

	/**
	 * Creates a new concept progress record.
	 * @param data
	 * @param tx
	 * @returns ConceptProgressDto
	 */
	async create(data: CreateConceptProgressDto, tx?: Transaction): Promise<ConceptProgressDto> {
		return await this.repo.create(data, tx);
	}

	/**
	 * Updates an existing concept progress record by its ID.
	 * @param id
	 * @param data
	 * @param tx
	 * @returns ConceptProgressDto
	 * @throws NotFoundError if the concept progress record is not found.
	 */
	async update(
		id: string,
		data: UpdateConceptProgressDto,
		tx?: Transaction
	): Promise<ConceptProgressDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`Concept with id ${id} not found`);
		return item;
	}

	/**
	 * Updates multiple concept progress records by their IDs.
	 * @param ids
	 * @param data
	 * @param tx
	 * @returns ConceptProgressDto[]
	 */
	async updateMany(
		ids: string[],
		data: UpdateConceptProgressDto,
		tx?: Transaction
	): Promise<ConceptProgressDto[]> {
		return await this.repo.updateMany(ids, data, tx);
	}

	/**
	 * Deletes a concept progress record by its ID.
	 * @param id
	 * @param tx
	 * @returns ConceptProgressDto
	 * @throws NotFoundError if the concept progress record is not found.
	 */
	async delete(id: string, tx?: Transaction): Promise<ConceptProgressDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`ConceptProgress with id ${id} not found`);
		return item;
	}

	/**
	 * Creates multiple concept progress records.
	 * @param data
	 * @param tx
	 * @returns ConceptProgressDto[]
	 */
	async createMany(
		data: CreateConceptProgressDto[],
		tx?: Transaction
	): Promise<ConceptProgressDto[]> {
		return await this.repo.createMany(data, tx);
	}

	/**
	 * Retrieves multiple concept progress records by user block ID.
	 * @param userBlockId
	 * @param tx
	 * @returns ConceptProgressDto[]
	 */
	async getManyByUserBlockId(userBlockId: string, tx?: Transaction): Promise<ConceptProgressDto[]> {
		return await this.repo.getManyByUserBlockId(userBlockId, tx);
	}

	/**
	 * Retrieves an existing concept progress record by user block ID and concept ID, or creates a new one if it doesn't exist.
	 * @param data
	 * @param tx
	 * @returns ConceptProgressDto
	 */
	async getOrCreateConceptProgress(
		data: CreateConceptProgressDto,
		tx?: Transaction
	): Promise<ConceptProgressDto> {
		const existing = await this.repo.getByUserBlockIdAndConceptId(
			data.userBlockId,
			data.conceptId,
			tx
		);
		if (existing) {
			return existing;
		}
		return await this.repo.create(data, tx);
	}

	/**
	 * Retrieves multiple incomplete concept progress records by user block ID.
	 * @param userBlockId
	 * @param tx
	 * @returns ConceptProgressDto[]
	 */
	async getManyIncompleteByUserBlockId(
		userBlockId: string,
		tx?: Transaction
	): Promise<ConceptProgressDto[]> {
		return await this.repo.getManyIncompleteByUserBlockId(userBlockId, tx);
	}
}
