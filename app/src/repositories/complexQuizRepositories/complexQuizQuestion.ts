import { eq, inArray } from 'drizzle-orm';
import {
	complexQuizQuestion,
	type ComplexQuizQuestionDto,
	type CreateComplexQuizQuestionDto,
	type UpdateComplexQuizQuestionDto
} from '../../db/schema';
import type { Transaction } from '../../types';
import getDbClient from '../utils/getDbClient';

export class ComplexQuizQuestionRepository {
	async getById(id: string, tx?: Transaction): Promise<ComplexQuizQuestionDto | undefined> {
		const result = await getDbClient(tx)
			.select()
			.from(complexQuizQuestion)
			.where(eq(complexQuizQuestion.id, id));
		return result[0];
	}

	async getByComplexQuizId(
		complexQuizId: string,
		tx?: Transaction
	): Promise<ComplexQuizQuestionDto[]> {
		return await getDbClient(tx)
			.select()
			.from(complexQuizQuestion)
			.where(eq(complexQuizQuestion.complexQuizId, complexQuizId));
	}

	async getByBaseQuestionId(
		baseQuestionId: string,
		tx?: Transaction
	): Promise<ComplexQuizQuestionDto[]> {
		return await getDbClient(tx)
			.select()
			.from(complexQuizQuestion)
			.where(eq(complexQuizQuestion.baseQuestionId, baseQuestionId));
	}

	async getByConceptId(conceptId: string, tx?: Transaction): Promise<ComplexQuizQuestionDto[]> {
		return await getDbClient(tx)
			.select()
			.from(complexQuizQuestion)
			.where(eq(complexQuizQuestion.conceptId, conceptId));
	}

	async create(
		newQuestion: CreateComplexQuizQuestionDto,
		tx?: Transaction
	): Promise<ComplexQuizQuestionDto> {
		const result = await getDbClient(tx)
			.insert(complexQuizQuestion)
			.values(newQuestion)
			.returning();
		return result[0];
	}

	async update(
		id: string,
		updateQuestion: UpdateComplexQuizQuestionDto,
		tx?: Transaction
	): Promise<ComplexQuizQuestionDto | undefined> {
		const result = await getDbClient(tx)
			.update(complexQuizQuestion)
			.set(updateQuestion)
			.where(eq(complexQuizQuestion.id, id))
			.returning();
		return result[0];
	}

	async delete(id: string, tx?: Transaction): Promise<ComplexQuizQuestionDto | undefined> {
		const result = await getDbClient(tx)
			.delete(complexQuizQuestion)
			.where(eq(complexQuizQuestion.id, id))
			.returning();
		return result[0];
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<ComplexQuizQuestionDto[]> {
		return await getDbClient(tx)
			.select()
			.from(complexQuizQuestion)
			.where(inArray(complexQuizQuestion.id, ids));
	}
}
