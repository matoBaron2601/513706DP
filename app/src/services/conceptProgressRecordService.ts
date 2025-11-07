import type { Transaction } from '../types';
import { NotFoundError } from './utils/notFoundError';
import fs from 'fs/promises';
import path from 'path';
import { BlockRepository } from '../repositories/blockRepository';
import { ConceptRepository } from '../repositories/conceptRepository';
import { ConceptProgressRepository } from '../repositories/conceptProgressRepository';
import { ConceptProgressRecordRepository } from '../repositories/conceptProgressRecordRepository';
import type {
	ConceptProgressRecordDto,
	CreateConceptProgressRecordDto,
	UpdateConceptProgressRecordDto
} from '../db/schema';
export class ConceptProgressRecordService {
	private repo: ConceptProgressRecordRepository;

	constructor() {
		this.repo = new ConceptProgressRecordRepository();
	}

	async getById(id: string, tx?: Transaction): Promise<ConceptProgressRecordDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`ConceptProgressRecord with id ${id} not found`);
		return item;
	}

	async create(
		data: CreateConceptProgressRecordDto,
		tx?: Transaction
	): Promise<ConceptProgressRecordDto> {
		console.log('Creating ConceptProgressRecord with data:', data);
		return await this.repo.create(data, tx);
	}

	async update(
		id: string,
		data: UpdateConceptProgressRecordDto,
		tx?: Transaction
	): Promise<ConceptProgressRecordDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`ConceptProgressRecord with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<ConceptProgressRecordDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`ConceptProgressRecord with id ${id} not found`);
		return item;
	}

	async createMany(
		data: CreateConceptProgressRecordDto[],
		tx?: Transaction
	): Promise<ConceptProgressRecordDto[]> {
		return await this.repo.createMany(data, tx);
	}

	async getManyByProgressIdsByAdaptiveQuizIds(
		conceptProgressIds: string[],
		adaptiveQuizIds: string[],
		tx?: Transaction
	): Promise<ConceptProgressRecordDto[]> {
		return await this.repo.getManyByProgressIdsByAdaptiveQuizIds(
			conceptProgressIds,
			adaptiveQuizIds,
			tx
		);
	}


	async getLatestByProgressIdAndAdaptiveQuizId(
		conceptProgressId: string,
		adaptiveQuizId: string,
		tx?: Transaction
	): Promise<ConceptProgressRecordDto | null> {
		return await this.repo.getLatestByProgressIdAndAdaptiveQuizId(
			conceptProgressId,
			adaptiveQuizId,
			tx
		);
	}
}
