import type { Transaction } from '../types';
import { NotFoundError } from './utils/notFoundError';
import fs from 'fs/promises';
import path from 'path';
import { BlockRepository } from '../repositories/blockRepository';
import type { BlockDto, CreateBlockDto, UpdateBlockDto } from '../db/schema';
export class BlockService {
	private repo: BlockRepository;

	constructor() {
		this.repo = new BlockRepository();
	}

	async getById(id: string, tx?: Transaction): Promise<BlockDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`Block with id ${id} not found`);
		return item;
	}

	async create(data: CreateBlockDto, tx?: Transaction): Promise<BlockDto> {
		return await this.repo.create(data, tx);
	}

	async update(id: string, data: UpdateBlockDto, tx?: Transaction): Promise<BlockDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`Block with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<BlockDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`Block with id ${id} not found`);
		return item;
	}

	async getManyByIds(ids: string[], tx?: Transaction): Promise<BlockDto[]> {
		return await this.repo.getManyByIds(ids, tx);
	}

	async getAll(tx?: Transaction): Promise<BlockDto[]> {
		return await this.repo.getAll(tx);
	}

	async getManyByCourseId(courseId: string, tx?: Transaction): Promise<BlockDto[]> {
		return await this.repo.getManyByCourseId(courseId, tx);
	}

	async getFileTextByPath(filePath: string): Promise<string | null> {
		const uploadsDir = path.resolve(process.cwd(), 'uploads');
		const resolvedPath = path.resolve(uploadsDir, filePath);

		if (resolvedPath === uploadsDir || !resolvedPath.startsWith(uploadsDir + path.sep)) {
			return null;
		}

		if (path.extname(resolvedPath).toLowerCase() !== '.txt') {
			return null;
		}

		try {
			const data = await fs.readFile(resolvedPath, 'utf8');
			return data;
		} catch (err: any) {
			if (err.code === 'ENOENT') return null;
			throw err;
		}
	}
}
