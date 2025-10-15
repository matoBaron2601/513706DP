import { eq, inArray } from 'drizzle-orm';
import {
	oneTimeQuizUser,
	type oneTimeUserQuizDto,
	type CreateOneTimeUserQuizDto,
	type UpdateOneTimeUserQuizDto
} from '../../db/schema';
import type { Transaction } from '../../types';
import getDbClient from '../utils/getDbClient';

export class OneTimeQuizUserRepository {
	async getById(id: string, tx?: Transaction): Promise<oneTimeUserQuizDto | undefined> {
		const result = await getDbClient(tx)
			.select()
			.from(oneTimeQuizUser)
			.where(eq(oneTimeQuizUser.id, id));
		return result[0];
	}

	async getByOneTimeQuizId(oneTimeQuizId: string, tx?: Transaction): Promise<oneTimeUserQuizDto[]> {
		return await getDbClient(tx)
			.select()
			.from(oneTimeQuizUser)
			.where(eq(oneTimeQuizUser.oneTimeQuizId, oneTimeQuizId));
	}

	async getByUserId(userId: string, tx?: Transaction): Promise<oneTimeUserQuizDto[]> {
		return await getDbClient(tx)
			.select()
			.from(oneTimeQuizUser)
			.where(eq(oneTimeQuizUser.userId, userId));
	}

	async create(newEntry: CreateOneTimeUserQuizDto, tx?: Transaction): Promise<oneTimeUserQuizDto> {
		const result = await getDbClient(tx).insert(oneTimeQuizUser).values(newEntry).returning();
		return result[0];
	}

	async update(
		id: string,
		updateEntry: UpdateOneTimeUserQuizDto,
		tx?: Transaction
	): Promise<oneTimeUserQuizDto | undefined> {
		const result = await getDbClient(tx)
			.update(oneTimeQuizUser)
			.set(updateEntry)
			.where(eq(oneTimeQuizUser.id, id))
			.returning();
		return result[0];
	}

	async delete(id: string, tx?: Transaction): Promise<oneTimeUserQuizDto | undefined> {
		const result = await getDbClient(tx)
			.delete(oneTimeQuizUser)
			.where(eq(oneTimeQuizUser.id, id))
			.returning();
		return result[0];
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<oneTimeUserQuizDto[]> {
		return await getDbClient(tx)
			.select()
			.from(oneTimeQuizUser)
			.where(inArray(oneTimeQuizUser.id, ids));
	}
}
