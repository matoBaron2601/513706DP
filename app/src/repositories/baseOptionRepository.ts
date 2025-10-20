import { eq, inArray } from 'drizzle-orm';
import {
	baseOption,
	type BaseOptionDto,
	type CreateBaseOptionDto,
	type UpdateBaseOptionDto
} from '../db/schema';
import type { Transaction } from '../types';
import getDbClient from './utils/getDbClient';

export class BaseOptionRepository {
	async getById(id: string, tx?: Transaction): Promise<BaseOptionDto | undefined> {
		const result = await getDbClient(tx).select().from(baseOption).where(eq(baseOption.id, id));
		return result[0];
	}

	async create(data: CreateBaseOptionDto, tx?: Transaction): Promise<BaseOptionDto> {
		const result = await getDbClient(tx).insert(baseOption).values(data).returning();
		return result[0];
	}

	async update(
		id: string,
		data: UpdateBaseOptionDto,
		tx?: Transaction
	): Promise<BaseOptionDto | undefined> {
		const result = await getDbClient(tx)
			.update(baseOption)
			.set(data)
			.where(eq(baseOption.id, id))
			.returning();
		return result[0];
	}

	async deleteById(id: string, tx?: Transaction): Promise<BaseOptionDto | undefined> {
		const result = await getDbClient(tx)
			.delete(baseOption)
			.where(eq(baseOption.id, id))
			.returning();
		return result[0];
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<BaseOptionDto[]> {
		return await getDbClient(tx).select().from(baseOption).where(inArray(baseOption.id, ids));
	}

	async createMany(data: CreateBaseOptionDto[], tx?: Transaction): Promise<BaseOptionDto[]> {
		return await getDbClient(tx).insert(baseOption).values(data).returning();
	}

	async getByBaseQuestionId(baseQuestionId: string, tx?: Transaction): Promise<BaseOptionDto[]> {
		return await getDbClient(tx)
			.select()
			.from(baseOption)
			.where(eq(baseOption.baseQuestionId, baseQuestionId));
	}
}
