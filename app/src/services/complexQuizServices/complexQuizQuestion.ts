import type {
	CreateComplexQuizQuestionDto,
	UpdateComplexQuizQuestionDto,
	ComplexQuizQuestionDto
} from '../../db/schema';
import { ComplexQuizQuestionRepository } from '../../repositories/complexQuizRepositories/complexQuizQuestion';
import type { Transaction } from '../../types';
import { NotFoundError } from '../utils/notFoundError';

export class ComplexQuizQuestionService {
	private repo: ComplexQuizQuestionRepository;

	constructor() {
		this.repo = new ComplexQuizQuestionRepository();
	}

	async getById(id: string, tx?: Transaction): Promise<ComplexQuizQuestionDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`ComplexQuizQuestion with id ${id} not found`);
		return item;
	}

	async getByComplexQuizId(complexQuizId: string, tx?: Transaction): Promise<ComplexQuizQuestionDto[]> {
		return await this.repo.getByComplexQuizId(complexQuizId, tx);
	}

	async getByBaseQuestionId(baseQuestionId: string, tx?: Transaction): Promise<ComplexQuizQuestionDto[]> {
		return await this.repo.getByBaseQuestionId(baseQuestionId, tx);
	}

	async getByConceptId(conceptId: string, tx?: Transaction): Promise<ComplexQuizQuestionDto[]> {
		return await this.repo.getByConceptId(conceptId, tx);
	}

	async create(data: CreateComplexQuizQuestionDto, tx?: Transaction): Promise<ComplexQuizQuestionDto> {
		return await this.repo.create(data, tx);
	}

	async update(id: string, data: UpdateComplexQuizQuestionDto, tx?: Transaction): Promise<ComplexQuizQuestionDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`ComplexQuizQuestion with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<ComplexQuizQuestionDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`ComplexQuizQuestion with id ${id} not found`);
		return item;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<ComplexQuizQuestionDto[]> {
		return await this.repo.getByIds(ids, tx);
	}
}
