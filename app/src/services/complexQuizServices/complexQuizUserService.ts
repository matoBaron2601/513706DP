import type {
	CreateComplexQuizUserDto,
	UpdateComplexQuizUserDto,
	ComplexQuizUserDto
} from '../../db/schema';
import { ComplexQuizUserRepository } from '../../repositories/complexQuizRepositories/complexQuizUserRepository';
import type { Transaction } from '../../types';
import { NotFoundError } from '../utils/notFoundError';

export class ComplexQuizUserService {
	private repo: ComplexQuizUserRepository;

	constructor() {
		this.repo = new ComplexQuizUserRepository();
	}

	async getById(id: string, tx?: Transaction): Promise<ComplexQuizUserDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`ComplexQuizUser with id ${id} not found`);
		return item;
	}

	async getByComplexQuizId(complexQuizId: string, tx?: Transaction): Promise<ComplexQuizUserDto[]> {
		return await this.repo.getByComplexQuizId(complexQuizId, tx);
	}

	async getByUserId(userId: string, tx?: Transaction): Promise<ComplexQuizUserDto[]> {
		return await this.repo.getByUserId(userId, tx);
	}

	async create(data: CreateComplexQuizUserDto, tx?: Transaction): Promise<ComplexQuizUserDto> {
		return await this.repo.create(data, tx);
	}

	async update(id: string, data: UpdateComplexQuizUserDto, tx?: Transaction): Promise<ComplexQuizUserDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`ComplexQuizUser with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<ComplexQuizUserDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`ComplexQuizUser with id ${id} not found`);
		return item;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<ComplexQuizUserDto[]> {
		return await this.repo.getByIds(ids, tx);
	}
}
