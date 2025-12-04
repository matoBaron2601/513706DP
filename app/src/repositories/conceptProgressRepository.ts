/**
 * @fileoverview
 * Repository for managing ConceptProgress entities in the database.
 */
import { eq, inArray, and } from 'drizzle-orm';
import {
	type ConceptProgressDto,
	conceptProgress,
	type CreateConceptProgressDto,
	type UpdateConceptProgressDto
} from '../db/schema';
import type { Transaction } from '../types';
import _getDbClient, { type GetDbClient } from './utils/getDbClient';

export class ConceptProgressRepository {
	constructor(private readonly getDbClient: GetDbClient = _getDbClient) {}

	/**
	 * Retrieves a ConceptProgress by its ID.
	 * @param conceptProgressId - The ID of the ConceptProgress.
	 * @param tx - Optional transaction object.
	 * @returns The ConceptProgress DTO if found, otherwise undefined.
	 */
	async getById(
		conceptProgressId: string,
		tx?: Transaction
	): Promise<ConceptProgressDto | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(conceptProgress)
			.where(eq(conceptProgress.id, conceptProgressId));
		return result[0];
	}

	/**
	 * Creates a new ConceptProgress.
	 * @param newConceptProgress - The data for the new ConceptProgress.
	 * @param tx - Optional transaction object.
	 * @returns The created ConceptProgress DTO.
	 */
	async create(
		newConceptProgress: CreateConceptProgressDto,
		tx?: Transaction
	): Promise<ConceptProgressDto> {
		const result = await this.getDbClient(tx)
			.insert(conceptProgress)
			.values(newConceptProgress)
			.returning();
		return result[0];
	}

	/**
	 * Updates an existing ConceptProgress.
	 * @param blockId - The ID of the ConceptProgress to update.
	 * @param updateBlock - The data to update.
	 * @param tx - Optional transaction object.
	 * @returns The updated ConceptProgress DTO if found, otherwise undefined.
	 */
	async update(
		blockId: string,
		updateBlock: UpdateConceptProgressDto,
		tx?: Transaction
	): Promise<ConceptProgressDto | undefined> {
		const result = await this.getDbClient(tx)
			.update(conceptProgress)
			.set(updateBlock)
			.where(eq(conceptProgress.id, blockId))
			.returning();
		return result[0];
	}

	/**
	 * Deletes a ConceptProgress by its ID.
	 * @param blockId - The ID of the ConceptProgress to delete.
	 * @param tx - Optional transaction object.
	 * @returns The deleted ConceptProgress DTO if found, otherwise undefined.
	 */
	async delete(blockId: string, tx?: Transaction): Promise<ConceptProgressDto | undefined> {
		const result = await this.getDbClient(tx)
			.delete(conceptProgress)
			.where(eq(conceptProgress.id, blockId))
			.returning();
		return result[0];
	}

	/**
	 * Creates multiple ConceptProgress entries.
	 * @param newConceptProgresses - An array of new ConceptProgress data.
	 * @param tx - Optional transaction object.
	 * @returns An array of created ConceptProgress DTOs.
	 */
	async createMany(
		newConceptProgresses: CreateConceptProgressDto[],
		tx?: Transaction
	): Promise<ConceptProgressDto[]> {
		const result = await this.getDbClient(tx)
			.insert(conceptProgress)
			.values(newConceptProgresses)
			.returning();
		return result;
	}

	/**
	 * Updates multiple ConceptProgress entries.
	 * @param ids - An array of ConceptProgress IDs to update.
	 * @param updateData - The data to update.
	 * @param tx - Optional transaction object.
	 * @returns An array of updated ConceptProgress DTOs.
	 */
	async updateMany(
		ids: string[],
		updateData: UpdateConceptProgressDto,
		tx?: Transaction
	): Promise<ConceptProgressDto[]> {
		const result = await this.getDbClient(tx)
			.update(conceptProgress)
			.set(updateData)
			.where(inArray(conceptProgress.id, ids))
			.returning();
		return result;
	}

	/**
	 * Retrieves multiple ConceptProgress entries by UserBlock ID.
	 * @param userBlockId - The ID of the UserBlock.
	 * @param tx - Optional transaction object.
	 * @returns An array of ConceptProgress DTOs.
	 */
	async getManyByUserBlockId(userBlockId: string, tx?: Transaction): Promise<ConceptProgressDto[]> {
		const result = await this.getDbClient(tx)
			.select()
			.from(conceptProgress)
			.where(eq(conceptProgress.userBlockId, userBlockId));
		return result;
	}

	/**
	 * Retrieves a ConceptProgress by UserBlock ID and Concept ID.
	 * @param userBlockId - The ID of the UserBlock.
	 * @param conceptId - The ID of the Concept.
	 * @param tx - Optional transaction object.
	 * @returns The ConceptProgress DTO if found, otherwise undefined.
	 */
	async getByUserBlockIdAndConceptId(
		userBlockId: string,
		conceptId: string,
		tx?: Transaction
	): Promise<ConceptProgressDto | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(conceptProgress)
			.where(
				and(eq(conceptProgress.userBlockId, userBlockId), eq(conceptProgress.conceptId, conceptId))
			);
		return result[0];
	}

	/**
	 * Retrieves incomplete ConceptProgress entries by UserBlock ID.
	 * @param userBlockId - The ID of the UserBlock.
	 * @param tx - Optional transaction object.
	 * @returns An array of incomplete ConceptProgress DTOs.
	 */
	async getManyIncompleteByUserBlockId(
		userBlockId: string,
		tx?: Transaction
	): Promise<ConceptProgressDto[]> {
		const result = await this.getDbClient(tx)
			.select()
			.from(conceptProgress)
			.where(
				and(eq(conceptProgress.userBlockId, userBlockId), eq(conceptProgress.mastered, false))
			);
		return result;
	}
}
