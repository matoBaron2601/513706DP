import { eq, inArray } from 'drizzle-orm';
import { oneTimeQuizConcept, type CreateOneTimeQuizConceptDto, type UpdateOneTimeQuizConceptDto, type OneTimeQuizConceptDto } from '../db/schema';
import type { Transaction } from '../types';
import getDbClient from './utils/getDbClient';

export class OneTimeQuizConceptRepository {
	async getById(oneTimeQuizConceptId: string, tx?: Transaction): Promise<OneTimeQuizConceptDto | undefined> {
		const result = await getDbClient(tx).select().from(oneTimeQuizConcept).where(eq(oneTimeQuizConcept.id, oneTimeQuizConceptId));
		return result[0];
	}

	async getByIds(oneTimeQuizConceptIds: string[], tx?: Transaction): Promise<OneTimeQuizConceptDto[]> {
		return await getDbClient(tx).select().from(oneTimeQuizConcept).where(inArray(oneTimeQuizConcept.id, oneTimeQuizConceptIds));
	}

	async create(newOneTimeQuizConcept: CreateOneTimeQuizConceptDto, tx?: Transaction): Promise<OneTimeQuizConceptDto> {
		const result = await getDbClient(tx).insert(oneTimeQuizConcept).values(newOneTimeQuizConcept).returning();
		return result[0];
	}

	async update(oneTimeQuizConceptId: string, updateOneTimeQuizConcept: UpdateOneTimeQuizConceptDto, tx?: Transaction): Promise<OneTimeQuizConceptDto | undefined> {
		const result = await getDbClient(tx)
			.update(oneTimeQuizConcept)
			.set(updateOneTimeQuizConcept)
			.where(eq(oneTimeQuizConcept.id, oneTimeQuizConceptId))
			.returning();
		return result[0];
	}

	async delete(oneTimeQuizConceptId: string, tx?: Transaction): Promise<OneTimeQuizConceptDto | undefined> {
		const result = await getDbClient(tx).delete(oneTimeQuizConcept).where(eq(oneTimeQuizConcept.id, oneTimeQuizConceptId)).returning();
		return result[0];
	}
}