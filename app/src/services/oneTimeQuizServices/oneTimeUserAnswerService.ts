import type { CreateOneTimeUserAnswerDto, UpdateOneTimeUserAnswerDto, OneTimeUserAnswerDto } from '../../db/schema';
import { OneTimeUserAnswerRepository } from '../../repositories/oneTimeQuizRepositories/oneTimeUserAnswerRepository';
import type { Transaction } from '../../types';
import { NotFoundError } from '../utils/notFoundError';

export class OneTimeUserAnswerService {
	private repo: OneTimeUserAnswerRepository;

	constructor() {
		this.repo = new OneTimeUserAnswerRepository();
	}

	async getById(id: string, tx?: Transaction): Promise<OneTimeUserAnswerDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`OneTimeUserAnswer with id ${id} not found`);
		return item;
	}

	async getByOneTimeUserQuizId(oneTimeUserQuizId: string, tx?: Transaction): Promise<OneTimeUserAnswerDto[]> {
		return await this.repo.getByOneTimeUserQuizId(oneTimeUserQuizId, tx);
	}

	async getByBaseQuestionId(baseQuestionId: string, tx?: Transaction): Promise<OneTimeUserAnswerDto[]> {
		return await this.repo.getByBaseQuestionId(baseQuestionId, tx);
	}

	async getByBaseAnswerId(baseAnswerId: string, tx?: Transaction): Promise<OneTimeUserAnswerDto[]> {
		return await this.repo.getByBaseAnswerId(baseAnswerId, tx);
	}

	async create(data: CreateOneTimeUserAnswerDto, tx?: Transaction): Promise<OneTimeUserAnswerDto> {
		return await this.repo.create(data, tx);
	}

	async update(id: string, data: UpdateOneTimeUserAnswerDto, tx?: Transaction): Promise<OneTimeUserAnswerDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`OneTimeUserAnswer with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<OneTimeUserAnswerDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`OneTimeUserAnswer with id ${id} not found`);
		return item;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<OneTimeUserAnswerDto[]> {
		return await this.repo.getByIds(ids, tx);
	}
}
