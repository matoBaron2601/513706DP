/**
 * @fileoverview
 * Repository for managing Concept entities in the database.
 */
import { eq, inArray } from 'drizzle-orm';
import {
	concept,
	type CreateConceptDto,
	type UpdateConceptDto,
	type ConceptDto
} from '../db/schema';
import type { Transaction } from '../types';
import _getDbClient from './utils/getDbClient';

type GetDbClient = (tx?: Transaction) => any;

export class ConceptRepository {
	constructor(private readonly getDbClient: GetDbClient = _getDbClient) {}

	/**
	 * Get a concept by its ID. 
	 * @param conceptId 
	 * @param tx 
	 * @returns The concept with the specified ID, or undefined if not found. 
	 */
	async getById(conceptId: string, tx?: Transaction): Promise<ConceptDto | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(concept)
			.where(eq(concept.id, conceptId));
		return result[0];
	}

	/**
	 * Get multiple concepts by their IDs.
	 * @param conceptIds 
	 * @param tx 
	 * @returns An array of concepts with the specified IDs.
	 */
	async getByIds(conceptIds: string[], tx?: Transaction): Promise<ConceptDto[]> {
		return await this.getDbClient(tx).select().from(concept).where(inArray(concept.id, conceptIds));
	}

	/**
	 * Create a new concept.
	 * @param newConcept 
	 * @param tx 
	 * @returns The created concept.
	 */
	async create(newConcept: CreateConceptDto, tx?: Transaction): Promise<ConceptDto> {
		const result = await this.getDbClient(tx).insert(concept).values(newConcept).returning();
		return result[0];
	}

	/**
	 * Update an existing concept.
	 * @param conceptId 
	 * @param updateConcept 
	 * @param tx 
	 * @returns The updated concept, or undefined if not found.
	 */
	async update(
		conceptId: string,
		updateConcept: UpdateConceptDto,
		tx?: Transaction
	): Promise<ConceptDto | undefined> {
		const result = await this.getDbClient(tx)
			.update(concept)
			.set(updateConcept)
			.where(eq(concept.id, conceptId))
			.returning();
		return result[0];
	}

	/**
	 * Delete a concept by its ID.
	 * @param conceptId 
	 * @param tx 
	 * @returns The deleted concept, or undefined if not found.
	 */
	async delete(conceptId: string, tx?: Transaction): Promise<ConceptDto | undefined> {
		const result = await this.getDbClient(tx)
			.delete(concept)
			.where(eq(concept.id, conceptId))
			.returning();
		return result[0];
	}

	/**
	 * Create multiple concepts.
	 * @param newConcepts 
	 * @param tx 
	 * @returns An array of created concepts.
	 */
	async createMany(newConcepts: CreateConceptDto[], tx?: Transaction): Promise<ConceptDto[]> {
		return await this.getDbClient(tx).insert(concept).values(newConcepts).returning();
	}

	/**
	 * Get multiple concepts by their associated block ID.
	 * @param blockId 
	 * @param tx 
	 * @returns An array of concepts associated with the specified block ID.
	 */
	async getManyByBlockId(blockId: string, tx?: Transaction): Promise<ConceptDto[]> {
		return await this.getDbClient(tx).select().from(concept).where(eq(concept.blockId, blockId));
	}

	/**
	 * Get multiple concepts by an array of block IDs.
	 * @param blockIds 
	 * @param tx 
	 * @returns An array of concepts associated with the specified block IDs.
	 */
	async getManyByBlockIds(blockIds: string[], tx?: Transaction): Promise<ConceptDto[]> {
		return await this.getDbClient(tx)
			.select()
			.from(concept)
			.where(inArray(concept.blockId, blockIds));
	}
}
