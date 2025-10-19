import { eq, inArray } from 'drizzle-orm';
import {
	baseQuestion,
	type BaseQuestionDto,
	type CreateBaseQuestionDto,
	type UpdateBaseQuestionDto
} from '../../db/schema';
import type { Transaction } from '../../types';
import getDbClient from '../utils/getDbClient';

export class BaseQuestionRepository {
	async getById(id: string, tx?: Transaction): Promise<BaseQuestionDto | undefined> {
		const result = await getDbClient(tx).select().from(baseQuestion).where(eq(baseQuestion.id, id));
		return result[0];
	}

	async create(data: CreateBaseQuestionDto, tx?: Transaction): Promise<BaseQuestionDto> {
		const result = await getDbClient(tx).insert(baseQuestion).values(data).returning();
		return result[0];
	}

	async update(
		id: string,
		data: UpdateBaseQuestionDto,
		tx?: Transaction
	): Promise<BaseQuestionDto | undefined> {
		const result = await getDbClient(tx)
			.update(baseQuestion)
			.set(data)
			.where(eq(baseQuestion.id, id))
			.returning();
		return result[0];
	}

	async deleteById(id: string, tx?: Transaction): Promise<BaseQuestionDto | undefined> {
		const result = await getDbClient(tx)
			.delete(baseQuestion)
			.where(eq(baseQuestion.id, id))
			.returning();
		return result[0];
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<BaseQuestionDto[]> {
		return await getDbClient(tx).select().from(baseQuestion).where(inArray(baseQuestion.id, ids));
	}

	async createMany(data: CreateBaseQuestionDto[], tx?: Transaction): Promise<BaseQuestionDto[]> {
		return await getDbClient(tx).insert(baseQuestion).values(data).returning();
	}

	async getByBaseQuizId(baseQuizId: string, tx?: Transaction): Promise<BaseQuestionDto[]> {
		return await getDbClient(tx)
			.select()
			.from(baseQuestion)
			.where(eq(baseQuestion.baseQuizId, baseQuizId));
	}
}
