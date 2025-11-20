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

	async getById(conceptId: string, tx?: Transaction): Promise<ConceptDto | undefined> {
		const result = await this.getDbClient(tx).select().from(concept).where(eq(concept.id, conceptId));
		return result[0];
	}

	async getByIds(conceptIds: string[], tx?: Transaction): Promise<ConceptDto[]> {
		return await this.getDbClient(tx).select().from(concept).where(inArray(concept.id, conceptIds));
	}

	async create(newConcept: CreateConceptDto, tx?: Transaction): Promise<ConceptDto> {
		const result = await this.getDbClient(tx).insert(concept).values(newConcept).returning();
		return result[0];
	}

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

	async delete(conceptId: string, tx?: Transaction): Promise<ConceptDto | undefined> {
		const result = await this.getDbClient(tx)
			.delete(concept)
			.where(eq(concept.id, conceptId))
			.returning();
		return result[0];
	}

	async createMany(newConcepts: CreateConceptDto[], tx?: Transaction): Promise<ConceptDto[]> {
		return await this.getDbClient(tx).insert(concept).values(newConcepts).returning();
	}

	async getManyByBlockId(blockId: string, tx?: Transaction): Promise<ConceptDto[]> {
		return await this.getDbClient(tx).select().from(concept).where(eq(concept.blockId, blockId));
	}

	async getManyByBlockIds(blockIds: string[], tx?: Transaction): Promise<ConceptDto[]> {
		return await this.getDbClient(tx).select().from(concept).where(inArray(concept.blockId, blockIds));
	}
}
