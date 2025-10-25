import { eq, inArray } from 'drizzle-orm';
import type { Transaction } from '../types';
import getDbClient from './utils/getDbClient';
import { type ConceptProgressRecordDto, conceptProgressRecord, type CreateConceptProgressRecordDto, type UpdateConceptProgressRecordDto } from '../db/schema';

export class ConceptProgressRecordRepository {
    async getById(conceptProgressId: string, tx?: Transaction): Promise<ConceptProgressRecordDto | undefined> {
        const result = await getDbClient(tx).select().from(conceptProgressRecord).where(eq(conceptProgressRecord.id, conceptProgressId));
        return result[0];
    }

    async create(newConceptProgress: CreateConceptProgressRecordDto, tx?: Transaction): Promise<ConceptProgressRecordDto> {
        const result = await getDbClient(tx).insert(conceptProgressRecord).values(newConceptProgress).returning();
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
        const result = await getDbClient(tx).delete(conceptProgressRecord).where(eq(conceptProgressRecord.id, blockId)).returning();
        return result[0];
    }

    async createMany(newConceptProgressRecords: CreateConceptProgressRecordDto[], tx?: Transaction): Promise<ConceptProgressRecordDto[]> {
        const result = await getDbClient(tx).insert(conceptProgressRecord).values(newConceptProgressRecords).returning();
        return result;
    }

}
