import type { CreateConceptDto, UpdateConceptDto, ConceptDto } from '../../db/schema';
import { ConceptRepository } from '../../repositories/complexQuizRepositories/conceptRepository';
import type { Transaction } from '../../types';
import { NotFoundError } from '../utils/notFoundError';

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

	async getByCourseBlockId(courseBlockId: string, tx?: Transaction): Promise<ConceptDto[]> {
		return await this.repo.getByCourseBlockId(courseBlockId, tx);
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

	async getByIds(ids: string[], tx?: Transaction): Promise<ConceptDto[]> {
		return await this.repo.getByIds(ids, tx);
	}

	async createMany(data: CreateConceptDto[], tx?: Transaction): Promise<ConceptDto[]> {
		return await this.repo.createMany(data, tx);
	}

	async getManyByCourseBlockIds(courseBlockIds: string[], tx?: Transaction): Promise<ConceptDto[]> {
		return await this.repo.getManyByCourseBlockIds(courseBlockIds, tx);
	}	
}
