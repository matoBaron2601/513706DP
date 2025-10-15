import { eq, inArray } from 'drizzle-orm';
import {
	complexQuizUserAnswer,
	type ComplexQuizUserAnswerDto,
	type CreateComplexQuizUserAnswerDto,
	type UpdateComplexQuizUserAnswerDto
} from '../../db/schema';
import type { Transaction } from '../../types';
import getDbClient from '../utils/getDbClient';

export class ComplexQuizUserAnswerRepository {
	async getById(id: string, tx?: Transaction): Promise<ComplexQuizUserAnswerDto | undefined> {
		const result = await getDbClient(tx)
			.select()
			.from(complexQuizUserAnswer)
			.where(eq(complexQuizUserAnswer.id, id));
		return result[0];
	}

	async getByComplexQuizUserId(
		complexQuizUserId: string,
		tx?: Transaction
	): Promise<ComplexQuizUserAnswerDto[]> {
		return await getDbClient(tx)
			.select()
			.from(complexQuizUserAnswer)
			.where(eq(complexQuizUserAnswer.complexQuizUserId, complexQuizUserId));
	}

	async getByComplexQuizQuestionId(
		complexQuizQuestionId: string,
		tx?: Transaction
	): Promise<ComplexQuizUserAnswerDto[]> {
		return await getDbClient(tx)
			.select()
			.from(complexQuizUserAnswer)
			.where(eq(complexQuizUserAnswer.complexQuizQuestionId, complexQuizQuestionId));
	}

	async getByBaseAnswerId(
		baseAnswerId: string,
		tx?: Transaction
	): Promise<ComplexQuizUserAnswerDto[]> {
		return await getDbClient(tx)
			.select()
			.from(complexQuizUserAnswer)
			.where(eq(complexQuizUserAnswer.baseAnswerId, baseAnswerId));
	}

	async create(
		newAnswer: CreateComplexQuizUserAnswerDto,
		tx?: Transaction
	): Promise<ComplexQuizUserAnswerDto> {
		const result = await getDbClient(tx)
			.insert(complexQuizUserAnswer)
			.values(newAnswer)
			.returning();
		return result[0];
	}

	async update(
		id: string,
		updateAnswer: UpdateComplexQuizUserAnswerDto,
		tx?: Transaction
	): Promise<ComplexQuizUserAnswerDto | undefined> {
		const result = await getDbClient(tx)
			.update(complexQuizUserAnswer)
			.set(updateAnswer)
			.where(eq(complexQuizUserAnswer.id, id))
			.returning();
		return result[0];
	}

	async delete(id: string, tx?: Transaction): Promise<ComplexQuizUserAnswerDto | undefined> {
		const result = await getDbClient(tx)
			.delete(complexQuizUserAnswer)
			.where(eq(complexQuizUserAnswer.id, id))
			.returning();
		return result[0];
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<ComplexQuizUserAnswerDto[]> {
		return await getDbClient(tx)
			.select()
			.from(complexQuizUserAnswer)
			.where(inArray(complexQuizUserAnswer.id, ids));
	}
}
