import { eq, inArray, and, desc } from 'drizzle-orm';
import type { Transaction } from '../types';
import getDbClient from './utils/getDbClient';
import {
	type ConceptProgressRecordDto,
	conceptProgressRecord,
	type CreateConceptProgressRecordDto,
	type UpdateConceptProgressRecordDto
} from '../db/schema';

export class ConceptProgressRecordRepository {
	async getById(
		conceptProgressId: string,
		tx?: Transaction
	): Promise<ConceptProgressRecordDto | undefined> {
		const result = await getDbClient(tx)
			.select()
			.from(conceptProgressRecord)
			.where(eq(conceptProgressRecord.id, conceptProgressId));
		return result[0];
	}

	async create(
		newConceptProgress: CreateConceptProgressRecordDto,
		tx?: Transaction
	): Promise<ConceptProgressRecordDto> {
		const result = await getDbClient(tx)
			.insert(conceptProgressRecord)
			.values(newConceptProgress)
			.returning();
		return result[0];
	}

	async update(
		blockId: string,
		updateBlock: UpdateConceptProgressRecordDto,
		tx?: Transaction
	): Promise<ConceptProgressRecordDto | undefined> {
		const result = await getDbClient(tx)
			.update(conceptProgressRecord)
			.set(updateBlock)
			.where(eq(conceptProgressRecord.id, blockId))
			.returning();
		return result[0];
	}

	async delete(blockId: string, tx?: Transaction): Promise<ConceptProgressRecordDto | undefined> {
		const result = await getDbClient(tx)
			.delete(conceptProgressRecord)
			.where(eq(conceptProgressRecord.id, blockId))
			.returning();
		return result[0];
	}

	async createMany(
		newConceptProgressRecords: CreateConceptProgressRecordDto[],
		tx?: Transaction
	): Promise<ConceptProgressRecordDto[]> {
		const result = await getDbClient(tx)
			.insert(conceptProgressRecord)
			.values(newConceptProgressRecords)
			.returning();
		return result;
	}

	async getManyByProgressIdsByAdaptiveQuizIds(
		conceptProgressIds: string[],
		adaptiveQuizIds: string[],
		tx?: Transaction
	): Promise<ConceptProgressRecordDto[]> {
		const result = await getDbClient(tx)
			.select()
			.from(conceptProgressRecord)
			.where(
				and(
					inArray(conceptProgressRecord.conceptProgressId, conceptProgressIds),
					inArray(conceptProgressRecord.adaptiveQuizId, adaptiveQuizIds)
				)
			);
		return result;
	}

	async getLatestByProgressIdAndAdaptiveQuizId(
		conceptProgressId: string,
		adaptiveQuizId: string,
		tx?: Transaction
	): Promise<ConceptProgressRecordDto | null> {
		const result = await getDbClient(tx)
			.select()
			.from(conceptProgressRecord)
			.where(
				and(
					eq(conceptProgressRecord.conceptProgressId, conceptProgressId),
					eq(conceptProgressRecord.adaptiveQuizId, adaptiveQuizId)
				)
			)
			.orderBy(desc(conceptProgressRecord.createdAt))
			.limit(1);
		return result[0] || null;
	}
}
