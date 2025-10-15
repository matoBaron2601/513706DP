import { eq, inArray } from 'drizzle-orm';
import {
	complexQuizUser,
	type ComplexQuizUserDto,
	type CreateComplexQuizUserDto,
	type UpdateComplexQuizUserDto
} from '../../db/schema';
import type { Transaction } from '../../types';
import getDbClient from '../utils/getDbClient';

export class ComplexQuizUserRepository {
	async getById(id: string, tx?: Transaction): Promise<ComplexQuizUserDto | undefined> {
		const result = await getDbClient(tx)
			.select()
			.from(complexQuizUser)
			.where(eq(complexQuizUser.id, id));
		return result[0];
	}

	async getByComplexQuizId(complexQuizId: string, tx?: Transaction): Promise<ComplexQuizUserDto[]> {
		return await getDbClient(tx)
			.select()
			.from(complexQuizUser)
			.where(eq(complexQuizUser.complexQuizId, complexQuizId));
	}

	async getByUserId(userId: string, tx?: Transaction): Promise<ComplexQuizUserDto[]> {
		return await getDbClient(tx)
			.select()
			.from(complexQuizUser)
			.where(eq(complexQuizUser.userId, userId));
	}

	async create(newEntry: CreateComplexQuizUserDto, tx?: Transaction): Promise<ComplexQuizUserDto> {
		const result = await getDbClient(tx).insert(complexQuizUser).values(newEntry).returning();
		return result[0];
	}

	async update(
		id: string,
		updateEntry: UpdateComplexQuizUserDto,
		tx?: Transaction
	): Promise<ComplexQuizUserDto | undefined> {
		const result = await getDbClient(tx)
			.update(complexQuizUser)
			.set(updateEntry)
			.where(eq(complexQuizUser.id, id))
			.returning();
		return result[0];
	}

	async delete(id: string, tx?: Transaction): Promise<ComplexQuizUserDto | undefined> {
		const result = await getDbClient(tx)
			.delete(complexQuizUser)
			.where(eq(complexQuizUser.id, id))
			.returning();
		return result[0];
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<ComplexQuizUserDto[]> {
		return await getDbClient(tx)
			.select()
			.from(complexQuizUser)
			.where(inArray(complexQuizUser.id, ids));
	}
}
