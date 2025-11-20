import { eq, inArray, and } from 'drizzle-orm';
import {
	block,
	type CreateBlockDto,
	type UpdateBlockDto,
	type BlockDto,
	type ConceptProgressDto,
	conceptProgress,
	type CreateConceptProgressDto,
	type UpdateConceptProgressDto
} from '../db/schema';
import type { Transaction } from '../types';
import _getDbClient, { type GetDbClient } from './utils/getDbClient';

export class ConceptProgressRepository {
	constructor(private readonly getDbClient: GetDbClient = _getDbClient) {}

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

	async delete(blockId: string, tx?: Transaction): Promise<ConceptProgressDto | undefined> {
		const result = await this.getDbClient(tx)
			.delete(conceptProgress)
			.where(eq(conceptProgress.id, blockId))
			.returning();
		return result[0];
	}

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

	async getManyByUserBlockId(userBlockId: string, tx?: Transaction): Promise<ConceptProgressDto[]> {
		const result = await this.getDbClient(tx)
			.select()
			.from(conceptProgress)
			.where(eq(conceptProgress.userBlockId, userBlockId));
		return result;
	}

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
