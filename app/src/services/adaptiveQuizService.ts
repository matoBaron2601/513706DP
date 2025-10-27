import type {
	CreateBaseOptionDto,
	UpdateBaseOptionDto,
	BaseOptionDto,
	AdaptiveQuizDto,
	CreateAdaptiveQuizDto,
	UpdateAdaptiveQuizDto
} from '../db/schema';
import { AdaptiveQuizRepository } from '../repositories/adaptiveQuizRepository';
import type { Transaction } from '../types';
import { NotFoundError } from './utils/notFoundError';

export class AdaptiveQuizService {
	private repo: AdaptiveQuizRepository;

	constructor() {
		this.repo = new AdaptiveQuizRepository();
	}

	async getById(id: string, tx?: Transaction): Promise<AdaptiveQuizDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`AdaptiveQuiz with id ${id} not found`);
		return item;
	}

	async create(data: CreateAdaptiveQuizDto, tx?: Transaction): Promise<AdaptiveQuizDto> {
		return await this.repo.create(data, tx);
	}

	async update(
		id: string,
		data: UpdateAdaptiveQuizDto,
		tx?: Transaction
	): Promise<AdaptiveQuizDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`AdaptiveQuiz with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<AdaptiveQuizDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`AdaptiveQuiz with id ${id} not found`);
		return item;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<AdaptiveQuizDto[]> {
		return await this.repo.getByIds(ids, tx);
	}

	async getByUserBlockId(userBlockId: string, tx?: Transaction): Promise<AdaptiveQuizDto[]> {
		return await this.repo.getByUserBlockId(userBlockId, tx);
	}

	async getNextQuiz(userBlockId: string, tx?: Transaction): Promise<AdaptiveQuizDto> {
		const item = await this.repo.getByUserBlockIdLowerVersion(userBlockId, tx);
		if (!item) throw new NotFoundError(`AdaptiveQuiz with id ${userBlockId} not found`);
		return item;
	}

	async getByBaseQuizId(baseQuizId: string, tx?: Transaction): Promise<AdaptiveQuizDto> {
		const item = await this.repo.getByBaseQuizId(baseQuizId, tx);
		if (!item) throw new NotFoundError(`AdaptiveQuiz with id ${baseQuizId} not found`);
		return item;
	}

	async getLastVersionsByUserBlockId(userBlockId: string, count: number, tx?: Transaction): Promise<AdaptiveQuizDto[]> {
		return await this.repo.getLastVersionsByUserBlockId(userBlockId, count, tx);
	}

	
}
