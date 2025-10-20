import { eq, inArray } from 'drizzle-orm';
import {
	completedConcept,
	type CreateCompletedConceptDto,
	type UpdateCompletedConceptDto,
	type CompletedConceptDto
} from '../db/schema';
import type { Transaction } from '../types';
import getDbClient from './utils/getDbClient';

export class CompletedConceptRepository {
	async getById(
		completedConceptId: string,
		tx?: Transaction
	): Promise<CompletedConceptDto | undefined> {
		const result = await getDbClient(tx)
			.select()
			.from(completedConcept)
			.where(eq(completedConcept.id, completedConceptId));
		return result[0];
	}

	async getByIds(completedConceptIds: string[], tx?: Transaction): Promise<CompletedConceptDto[]> {
		return await getDbClient(tx)
			.select()
			.from(completedConcept)
			.where(inArray(completedConcept.id, completedConceptIds));
	}

	async create(
		newCompletedConcept: CreateCompletedConceptDto,
		tx?: Transaction
	): Promise<CompletedConceptDto> {
		const result = await getDbClient(tx)
			.insert(completedConcept)
			.values(newCompletedConcept)
			.returning();
		return result[0];
	}

	async update(
		completedConceptId: string,
		updateCompletedConcept: UpdateCompletedConceptDto,
		tx?: Transaction
	): Promise<CompletedConceptDto | undefined> {
		const result = await getDbClient(tx)
			.update(completedConcept)
			.set(updateCompletedConcept)
			.where(eq(completedConcept.id, completedConceptId))
			.returning();
		return result[0];
	}

	async delete(
		completedConceptId: string,
		tx?: Transaction
	): Promise<CompletedConceptDto | undefined> {
		const result = await getDbClient(tx)
			.delete(completedConcept)
			.where(eq(completedConcept.id, completedConceptId))
			.returning();
		return result[0];
	}
}
