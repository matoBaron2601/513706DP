import type { Transaction } from '../types';
import { NotFoundError } from './utils/notFoundError';
import fs from 'fs/promises';
import path from 'path';
import { BlockRepository } from '../repositories/blockRepository';
import type {
	BlockDto,
	ConceptDto,
	ConceptProgressDto,
	CreateBlockDto,
	CreateConceptProgressDto,
	UpdateBlockDto,
	UpdateConceptProgressDto
} from '../db/schema';
import { ConceptRepository } from '../repositories/conceptRepository';
import { ConceptProgressRepository } from '../repositories/conceptProgressRepository';
export class ConceptProgressService {
	private repo: ConceptProgressRepository;

	constructor() {
		this.repo = new ConceptProgressRepository();
	}

	async getById(id: string, tx?: Transaction): Promise<ConceptProgressDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`Concept with id ${id} not found`);
		return item;
	}

	async create(data: CreateConceptProgressDto, tx?: Transaction): Promise<ConceptProgressDto> {
		return await this.repo.create(data, tx);
	}

	async update(
		id: string,
		data: UpdateConceptProgressDto,
		tx?: Transaction
	): Promise<ConceptProgressDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`Concept with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<ConceptProgressDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`ConceptProgress with id ${id} not found`);
		return item;
	}

	async createMany(
		data: CreateConceptProgressDto[],
		tx?: Transaction
	): Promise<ConceptProgressDto[]> {
		return await this.repo.createMany(data, tx);
	}

	async getManyByUserBlockId(userBlockId: string, tx?: Transaction): Promise<ConceptProgressDto[]> {
		return await this.repo.getManyByUserBlockId(userBlockId, tx);
	}
}
