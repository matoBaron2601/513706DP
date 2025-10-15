import type {
	CreateComplexQuizUserAnswerDto,
	UpdateComplexQuizUserAnswerDto,
	ComplexQuizUserAnswerDto
} from '../../db/schema';
import { ComplexQuizUserAnswerRepository } from '../../repositories/complexQuizRepositories/comlexQuizUserAnswerRepository';
import type { Transaction } from '../../types';
import { NotFoundError } from '../utils/notFoundError';

export class ComplexQuizUserAnswerService {
	private repo: ComplexQuizUserAnswerRepository;

	constructor() {
		this.repo = new ComplexQuizUserAnswerRepository();
	}

	async getById(id: string, tx?: Transaction): Promise<ComplexQuizUserAnswerDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`ComplexQuizUserAnswer with id ${id} not found`);
		return item;
	}

	async getByComplexQuizUserId(complexQuizUserId: string, tx?: Transaction): Promise<ComplexQuizUserAnswerDto[]> {
		return await this.repo.getByComplexQuizUserId(complexQuizUserId, tx);
	}

	async getByComplexQuizQuestionId(complexQuizQuestionId: string, tx?: Transaction): Promise<ComplexQuizUserAnswerDto[]> {
		return await this.repo.getByComplexQuizQuestionId(complexQuizQuestionId, tx);
	}

	async getByBaseAnswerId(baseAnswerId: string, tx?: Transaction): Promise<ComplexQuizUserAnswerDto[]> {
		return await this.repo.getByBaseAnswerId(baseAnswerId, tx);
	}

	async create(data: CreateComplexQuizUserAnswerDto, tx?: Transaction): Promise<ComplexQuizUserAnswerDto> {
		return await this.repo.create(data, tx);
	}

	async update(id: string, data: UpdateComplexQuizUserAnswerDto, tx?: Transaction): Promise<ComplexQuizUserAnswerDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`ComplexQuizUserAnswer with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<ComplexQuizUserAnswerDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`ComplexQuizUserAnswer with id ${id} not found`);
		return item;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<ComplexQuizUserAnswerDto[]> {
		return await this.repo.getByIds(ids, tx);
	}
}
