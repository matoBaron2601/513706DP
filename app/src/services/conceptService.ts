/**
 * @fileoverview
 * Service layer for managing Concept entities.
 * This layer handles business logic and interacts with the ConceptRepository for data operations.
 */
import type { CreateConceptDto, UpdateConceptDto, ConceptDto } from '../db/schema';
import type { Transaction } from '../types';
import { NotFoundError } from '../errors/AppError';
import { ConceptRepository } from '../repositories/conceptRepository';

export class ConceptService {
	constructor(private repo: ConceptRepository = new ConceptRepository()) {}

	/**
	 * Retrieve a Concept by its ID.
	 * @param id
	 * @param tx
	 * @returns The ConceptDto if found.
	 * @throws NotFoundError if the Concept does not exist.
	 */
	async getById(id: string, tx?: Transaction): Promise<ConceptDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`Concept with id ${id} not found`);
		return item;
	}

	/**
	 * Create a new Concept.
	 * @param data
	 * @param tx
	 * @returns The newly created ConceptDto.
	 */
	async create(data: CreateConceptDto, tx?: Transaction): Promise<ConceptDto> {
		return await this.repo.create(data, tx);
	}

	/**
	 * Update an existing Concept by its ID.
	 * @param id
	 * @param data
	 * @param tx
	 * @returns The updated ConceptDto.
	 * @throws NotFoundError if the Concept does not exist.
	 */
	async update(id: string, data: UpdateConceptDto, tx?: Transaction): Promise<ConceptDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`Concept with id ${id} not found`);
		return item;
	}

	/**
	 * Delete a Concept by its ID.
	 * @param id
	 * @param tx
	 * @returns The deleted ConceptDto.
	 * @throws NotFoundError if the Concept does not exist.
	 */
	async delete(id: string, tx?: Transaction): Promise<ConceptDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`Concept with id ${id} not found`);
		return item;
	}

	/**
	 * Retrieve multiple Concepts by their IDs.
	 * @param ids
	 * @param tx
	 * @returns An array of ConceptDto.
	 */
	async getManyByIds(ids: string[], tx?: Transaction): Promise<ConceptDto[]> {
		return await this.repo.getByIds(ids, tx);
	}

	/**
	 * Create multiple Concepts.
	 * @param data
	 * @param tx
	 * @returns An array of newly created ConceptDto.
	 */
	async createMany(data: CreateConceptDto[], tx?: Transaction): Promise<ConceptDto[]> {
		return await this.repo.createMany(data, tx);
	}

	/**
	 * Retrieve multiple Concepts associated with a specific Block ID.
	 * @param blockId
	 * @param tx
	 * @returns An array of ConceptDto.
	 */
	async getManyByBlockId(blockId: string, tx?: Transaction): Promise<ConceptDto[]> {
		return await this.repo.getManyByBlockId(blockId, tx);
	}

	/**
	 * Retrieve multiple Concepts associated with specific Block IDs.
	 * @param blockIds
	 * @param tx
	 * @returns An array of ConceptDto.
	 */
	async getManyByBlockIds(blockIds: string[], tx?: Transaction): Promise<ConceptDto[]> {
		return await this.repo.getManyByBlockIds(blockIds, tx);
	}
}
