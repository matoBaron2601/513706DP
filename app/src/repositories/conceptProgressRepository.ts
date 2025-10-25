import { eq, inArray } from 'drizzle-orm';
import { block, type CreateBlockDto, type UpdateBlockDto, type BlockDto, type ConceptProgressDto, conceptProgress, type CreateConceptProgressDto, type UpdateConceptProgressDto } from '../db/schema';
import type { Transaction } from '../types';
import getDbClient from './utils/getDbClient';

export class ConceptProgressRepository {
    async getById(conceptProgressId: string, tx?: Transaction): Promise<ConceptProgressDto | undefined> {
        const result = await getDbClient(tx).select().from(conceptProgress).where(eq(conceptProgress.id, conceptProgressId));
        return result[0];
    }

    async create(newConceptProgress: CreateConceptProgressDto, tx?: Transaction): Promise<ConceptProgressDto> {
        const result = await getDbClient(tx).insert(conceptProgress).values(newConceptProgress).returning();
        return result[0];
    }

    async update(
        blockId: string,
        updateBlock: UpdateConceptProgressDto,
        tx?: Transaction
    ): Promise<ConceptProgressDto | undefined> {
        const result = await getDbClient(tx)
            .update(conceptProgress)
            .set(updateBlock)
            .where(eq(conceptProgress.id, blockId))
            .returning();
        return result[0];
    }

    async delete(blockId: string, tx?: Transaction): Promise<ConceptProgressDto | undefined> {
        const result = await getDbClient(tx).delete(conceptProgress).where(eq(conceptProgress.id, blockId)).returning();
        return result[0];
    }

    async createMany(newConceptProgresses: CreateConceptProgressDto[], tx?: Transaction): Promise<ConceptProgressDto[]> {
        const result = await getDbClient(tx).insert(conceptProgress).values(newConceptProgresses).returning();
        return result;
    }

}
