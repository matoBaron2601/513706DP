import type { PlacementQuizDto, CreatePlacementQuizDto, UpdatePlacementQuizDto } from '../db/schema';

import { PlacementQuizRepository } from '../repositories/placementQuizRepository';
import type { Transaction } from '../types';
import { NotFoundError } from '../errors/AppError';

export class PlacementQuizService {
	private repo: PlacementQuizRepository;

	constructor() {
		this.repo = new PlacementQuizRepository();
	}

	async getById(id: string, tx?: Transaction): Promise<PlacementQuizDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`PlacementQuiz with id ${id} not found`);
		return item;
	}

	async create(data: CreatePlacementQuizDto, tx?: Transaction): Promise<PlacementQuizDto> {
		return await this.repo.create(data, tx);
	}

	async update(id: string, data: UpdatePlacementQuizDto, tx?: Transaction): Promise<PlacementQuizDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`PlacementQuiz with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<PlacementQuizDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`PlacementQuiz with id ${id} not found`);
		return item;
	}

	async getByBlockId(blockId: string, tx?: Transaction): Promise<PlacementQuizDto> {
		const item = await this.repo.getByBlockId(blockId, tx);
		if (!item) throw new NotFoundError(`PlacementQuiz with blockId ${blockId} not found`);
		return item;
	}
}
