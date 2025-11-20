import { eq, inArray } from 'drizzle-orm';
import {
	placementQuiz,
	type CreatePlacementQuizDto,
	type UpdatePlacementQuizDto,
	type PlacementQuizDto
} from '../db/schema';
import type { Transaction } from '../types';
import _getDbClient, { type GetDbClient } from './utils/getDbClient';

export class PlacementQuizRepository {
	constructor(private readonly getDbClient: GetDbClient = _getDbClient) {}

	async getById(placementQuizId: string, tx?: Transaction): Promise<PlacementQuizDto | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(placementQuiz)
			.where(eq(placementQuiz.id, placementQuizId));
		return result[0];
	}

	async getByIds(placementQuizIds: string[], tx?: Transaction): Promise<PlacementQuizDto[]> {
		return await this.getDbClient(tx)
			.select()
			.from(placementQuiz)
			.where(inArray(placementQuiz.id, placementQuizIds));
	}

	async create(
		newPlacementQuiz: CreatePlacementQuizDto,
		tx?: Transaction
	): Promise<PlacementQuizDto> {
		const result = await this.getDbClient(tx).insert(placementQuiz).values(newPlacementQuiz).returning();
		return result[0];
	}

	async update(
		placementQuizId: string,
		updatePlacementQuiz: UpdatePlacementQuizDto,
		tx?: Transaction
	): Promise<PlacementQuizDto | undefined> {
		const result = await this.getDbClient(tx)
			.update(placementQuiz)
			.set(updatePlacementQuiz)
			.where(eq(placementQuiz.id, placementQuizId))
			.returning();
		return result[0];
	}

	async delete(placementQuizId: string, tx?: Transaction): Promise<PlacementQuizDto | undefined> {
		const result = await this.getDbClient(tx)
			.delete(placementQuiz)
			.where(eq(placementQuiz.id, placementQuizId))
			.returning();
		return result[0];
	}

	async getByBlockId(blockId: string, tx?: Transaction): Promise<PlacementQuizDto | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(placementQuiz)
			.where(eq(placementQuiz.blockId, blockId));
		return result[0];
	}
}
