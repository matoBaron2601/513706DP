import { db } from '../db/client';
import { eq } from 'drizzle-orm';
import { option, type CreateOptionDto, type OptionDto } from '../db/schema';
import type { Transaction } from '../types';
import getDbClient from './utils/getDbClient';

export class OptionRepository {
	async getOptionById(optionId: string): Promise<OptionDto | undefined> {
		const result = await db.select().from(option).where(eq(option.id, optionId));
		return result[0];
	}

	async createOption(newOption: CreateOptionDto, tx?: Transaction): Promise<OptionDto> {
		const result = await getDbClient(tx).insert(option).values(newOption).returning();
		return result[0];
	}

	async deleteOptionById(
		optionId: string,
		tx?: Transaction
	): Promise<OptionDto | undefined> {
		const result = await getDbClient(tx)
			.update(option)
			.set({ deletedAt: new Date() })
			.where(eq(option.id, optionId))
			.returning();
		return result[0];
	}

	async updateOption(newOption: OptionDto): Promise<OptionDto | undefined> {
		const result = await db
			.update(option)
			.set(newOption)
			.where(eq(option.id, newOption.id))
			.returning();
		return result[0];
	}

	async getOptionsByQuestionId(questionId: string, tx?: Transaction): Promise<OptionDto[]> {
		return await getDbClient(tx).select().from(option).where(eq(option.questionId, questionId));
	}
}
