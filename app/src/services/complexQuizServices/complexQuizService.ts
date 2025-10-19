import type { CreateComplexQuizDto, UpdateComplexQuizDto, ComplexQuizDto } from '../../db/schema';
import { ComplexQuizRepository } from '../../repositories/complexQuizRepositories/comlexQuizRepository';
import type { Transaction } from '../../types';
import { NotFoundError } from '../utils/notFoundError';

export class ComplexQuizService {
	private repo: ComplexQuizRepository;

	constructor() {
		this.repo = new ComplexQuizRepository();
	}

	async getById(id: string, tx?: Transaction): Promise<ComplexQuizDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`ComplexQuiz with id ${id} not found`);
		return item;
	}

	async getByBaseQuizId(baseQuizId: string, tx?: Transaction): Promise<ComplexQuizDto[]> {
		return await this.repo.getByBaseQuizId(baseQuizId, tx);
	}

	async getByCourseBlockId(courseBlockId: string, tx?: Transaction): Promise<ComplexQuizDto[]> {
		return await this.repo.getByCourseBlockId(courseBlockId, tx);
	}

	async create(data: CreateComplexQuizDto, tx?: Transaction): Promise<ComplexQuizDto> {
		return await this.repo.create(data, tx);
	}

	async update(id: string, data: UpdateComplexQuizDto, tx?: Transaction): Promise<ComplexQuizDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`ComplexQuiz with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<ComplexQuizDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`ComplexQuiz with id ${id} not found`);
		return item;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<ComplexQuizDto[]> {
		return await this.repo.getByIds(ids, tx);
	}

	async getQuizWithSmallerVersion(
		courseBlockId: string,
		tx?: Transaction
	): Promise<ComplexQuizDto> {
		const item = await this.repo.getQuizWithSmallerVersion(courseBlockId, tx);
		if (!item) throw new NotFoundError(`ComplexQuiz for courseBlockId ${courseBlockId} not found`);
		return item;
	}
}
