import type {
	CreateBaseOptionDto,
	UpdateBaseOptionDto,
	BaseOptionDto,
	AdaptiveQuizDto,
	CreateAdaptiveQuizDto,
	UpdateAdaptiveQuizDto,
	AdaptiveQuizAnswerDto,
	CreateAdaptiveQuizAnswerDto,
	UpdateAdaptiveQuizAnswerDto
} from '../db/schema';
import { AdaptiveQuizAnswerRepository } from '../repositories/adaptiveQuizAnswerRepository';
import type { Transaction } from '../types';
import { NotFoundError } from './utils/notFoundError';

export class AdaptiveQuizAnswerService {
	private repo: AdaptiveQuizAnswerRepository;

	constructor() {
		this.repo = new AdaptiveQuizAnswerRepository();
	}

	async getById(id: string, tx?: Transaction): Promise<AdaptiveQuizAnswerDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`AdaptiveQuizAnswer with id ${id} not found`);
		return item;
	}

	async create(
		data: CreateAdaptiveQuizAnswerDto,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto> {
		return await this.repo.create(data, tx);
	}

	async update(
		id: string,
		data: UpdateAdaptiveQuizAnswerDto,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`AdaptiveQuizAnswer with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<AdaptiveQuizAnswerDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`AdaptiveQuizAnswer with id ${id} not found`);
		return item;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<AdaptiveQuizAnswerDto[]> {
		return await this.repo.getByIds(ids, tx);
	}

	async getByBaseQuestionId(
		baseQuestionId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto | undefined> {
		return await this.repo.getByBaseQuestionId(baseQuestionId, tx);
	}

	async getManyByAdaptiveQuizId(
		adaptiveQuizId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto[]> {
		return await this.repo.getByAdaptiveQuizId(adaptiveQuizId, tx);
	}
}
