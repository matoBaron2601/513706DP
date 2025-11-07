import type { CreateConceptDto, UpdateConceptDto, ConceptDto } from '../db/schema';
import type { Transaction } from '../types';
import { NotFoundError } from './utils/notFoundError';
import { ConceptRepository } from '../repositories/conceptRepository';

export class ConceptService {
	private repo: ConceptRepository;

	constructor() {
		this.repo = new ConceptRepository();
	}

	async getById(id: string, tx?: Transaction): Promise<ConceptDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`Concept with id ${id} not found`);
		return item;
	}

	async create(data: CreateConceptDto, tx?: Transaction): Promise<ConceptDto> {
		return await this.repo.create(data, tx);
	}

	async update(id: string, data: UpdateConceptDto, tx?: Transaction): Promise<ConceptDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`Concept with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<ConceptDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`Concept with id ${id} not found`);
		return item;
	}

	async getManyByIds(ids: string[], tx?: Transaction): Promise<ConceptDto[]> {
		return await this.repo.getByIds(ids, tx);
	}

	async createMany(data: CreateConceptDto[], tx?: Transaction): Promise<ConceptDto[]> {
		return await this.repo.createMany(data, tx);
	}

	async getManyByBlockId(blockId: string, tx?: Transaction): Promise<ConceptDto[]> {
		return await this.repo.getManyByBlockId(blockId, tx);
	}

	async getManyByBlockIds(blockIds: string[], tx?: Transaction): Promise<ConceptDto[]> {
		return await this.repo.getManyByBlockIds(blockIds, tx);
	}

}
