/**
 * @fileoverview
 * This service handles CRUD operations for Placement Quizzes.
 */
import type {
	PlacementQuizDto,
	CreatePlacementQuizDto,
	UpdatePlacementQuizDto
} from '../db/schema';

import { PlacementQuizRepository } from '../repositories/placementQuizRepository';
import type { Transaction } from '../types';
import { NotFoundError } from '../errors/AppError';

export class PlacementQuizService {
	constructor(private repo: PlacementQuizRepository = new PlacementQuizRepository()) {}

	/**
	 * Get a PlacementQuiz by its ID. 
	 * @param id 
	 * @param tx 
	 * @returns PlacementQuizDto 
	 * @throws NotFoundError if the PlacementQuiz is not found. 
	 */
	async getById(id: string, tx?: Transaction): Promise<PlacementQuizDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`PlacementQuiz with id ${id} not found`);
		return item;
	}

	/**
	 * Create a new PlacementQuiz.
	 * @param data The data for the new PlacementQuiz.
	 * @param tx Optional transaction object.
	 * @returns The created PlacementQuizDto.
	 */
	async create(data: CreatePlacementQuizDto, tx?: Transaction): Promise<PlacementQuizDto> {
		return await this.repo.create(data, tx);
	}

	/**
	 * Update an existing PlacementQuiz.
	 * @param id The ID of the PlacementQuiz to update.
	 * @param data The data to update.
	 * @param tx Optional transaction object.
	 * @returns The updated PlacementQuizDto.
	 * @throws NotFoundError if the PlacementQuiz is not found.
	 */
	async update(
		id: string,
		data: UpdatePlacementQuizDto,
		tx?: Transaction
	): Promise<PlacementQuizDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`PlacementQuiz with id ${id} not found`);
		return item;
	}

	/**
	 * Delete a PlacementQuiz by its ID.
	 * @param id The ID of the PlacementQuiz to delete.
	 * @param tx Optional transaction object.
	 * @returns The deleted PlacementQuizDto.
	 * @throws NotFoundError if the PlacementQuiz is not found.
	 */
	async delete(id: string, tx?: Transaction): Promise<PlacementQuizDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`PlacementQuiz with id ${id} not found`);
		return item;
	}

	/**
	 * Get a PlacementQuiz by its associated block ID.
	 * @param blockId The block ID of the PlacementQuiz.
	 * @param tx Optional transaction object.
	 * @returns The PlacementQuizDto.
	 * @throws NotFoundError if the PlacementQuiz is not found.
	 */
	async getByBlockId(blockId: string, tx?: Transaction): Promise<PlacementQuizDto> {
		const item = await this.repo.getByBlockId(blockId, tx);
		if (!item) throw new NotFoundError(`PlacementQuiz with blockId ${blockId} not found`);
		return item;
	}
}
