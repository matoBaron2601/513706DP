import { eq, inArray } from 'drizzle-orm';
import {
	baseQuiz,
	type BaseQuizDto,
	type CreateBaseQuizDto,
	type UpdateBaseQuizDto
} from '../../db/schema';
import getDbClient from '../utils/getDbClient';
import type { Transaction } from '../../types';

export class BaseQuizRepository {
	async getById(id: string, tx?: Transaction): Promise<BaseQuizDto | undefined> {
		const result = await getDbClient(tx).select().from(baseQuiz).where(eq(baseQuiz.id, id));
		return result[0];
	}

	async create(data: CreateBaseQuizDto, tx?: Transaction): Promise<BaseQuizDto> {
		const result = await getDbClient(tx).insert(baseQuiz).values(data).returning();
		return result[0];
	}

	async update(
		id: string,
		data: UpdateBaseQuizDto,
		tx?: Transaction
	): Promise<BaseQuizDto | undefined> {
		const result = await getDbClient(tx)
			.update(baseQuiz)
			.set(data)
			.where(eq(baseQuiz.id, id))
			.returning();
		return result[0];
	}

	async deleteById(id: string, tx?: Transaction): Promise<BaseQuizDto | undefined> {
		const result = await getDbClient(tx).delete(baseQuiz).where(eq(baseQuiz.id, id)).returning();
		return result[0];
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<BaseQuizDto[]> {
		return await getDbClient(tx).select().from(baseQuiz).where(inArray(baseQuiz.id, ids));
	}
}
