import { eq, inArray } from 'drizzle-orm';
import {
	concept,
	type ConceptDto,
	type CreateConceptDto,
	type UpdateConceptDto
} from '../../db/schema';
import type { Transaction } from '../../types';
import getDbClient from '../utils/getDbClient';

export class ConceptRepository {
	async getById(id: string, tx?: Transaction): Promise<ConceptDto | undefined> {
		const result = await getDbClient(tx).select().from(concept).where(eq(concept.id, id));
		return result[0];
	}

	async getByCourseBlockId(courseBlockId: string, tx?: Transaction): Promise<ConceptDto[]> {
		return await getDbClient(tx)
			.select()
			.from(concept)
			.where(eq(concept.courseBlockId, courseBlockId));
	}

	async create(newConcept: CreateConceptDto, tx?: Transaction): Promise<ConceptDto> {
		const result = await getDbClient(tx).insert(concept).values(newConcept).returning();
		return result[0];
	}

	async update(
		id: string,
		updateConcept: UpdateConceptDto,
		tx?: Transaction
	): Promise<ConceptDto | undefined> {
		const result = await getDbClient(tx)
			.update(concept)
			.set(updateConcept)
			.where(eq(concept.id, id))
			.returning();
		return result[0];
	}

	async delete(id: string, tx?: Transaction): Promise<ConceptDto | undefined> {
		const result = await getDbClient(tx).delete(concept).where(eq(concept.id, id)).returning();
		return result[0];
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<ConceptDto[]> {
		return await getDbClient(tx).select().from(concept).where(inArray(concept.id, ids));
	}

	async createMany(data: CreateConceptDto[], tx?: Transaction): Promise<ConceptDto[]> {
		const result = await getDbClient(tx).insert(concept).values(data).returning();
		return result;
	}

	async getManyByCourseBlockIds(courseBlockIds: string[], tx?: Transaction): Promise<ConceptDto[]> {
		return await getDbClient(tx)
			.select()
			.from(concept)
			.where(inArray(concept.courseBlockId, courseBlockIds));
	}
}
