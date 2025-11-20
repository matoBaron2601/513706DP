import type { Transaction } from '../types';
import { NotFoundError } from '../errors/AppError';
import fs from 'fs/promises';
import path from 'path';
import { BlockRepository } from '../repositories/blockRepository';
import type { BlockDto, CreateBlockDto, UpdateBlockDto } from '../db/schema';
export class BlockService {
	constructor(private repo: BlockRepository = new BlockRepository()) {}

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
		try {
			const uploadsDir = path.resolve(process.cwd(), 'uploads');
			const resolvedPath = path.resolve(uploadsDir, filePath);

			if (resolvedPath === uploadsDir || !resolvedPath.startsWith(uploadsDir + path.sep)) {
				return null;
			}

			if (path.extname(resolvedPath).toLowerCase() !== '.txt') {
				return null;
			}

			const data = await fs.readFile(resolvedPath, 'utf8');
			return data;
		} catch (error) {
			throw new NotFoundError('Imported document file not found or could not be read');
		}
	}

	async saveFile(file: File): Promise<string> {
		const uploadDir = path.resolve(process.cwd(), 'uploads');
		await fs.mkdir(uploadDir, { recursive: true });

		const formData = new FormData();
		formData.append('file', file);
		const fileName = `${Date.now()}_${file.name}`;
		const filePath = path.join(uploadDir, fileName);

		let dataToWrite: Buffer | string;
		if (typeof file === 'string') {
			dataToWrite = file;
		} else if (typeof (file as any)?.arrayBuffer === 'function') {
			const ab = await (file as any).arrayBuffer();
			dataToWrite = Buffer.from(ab);
		} else if (Buffer.isBuffer(file)) {
			dataToWrite = file;
		} else {
			dataToWrite = JSON.stringify(file);
		}

		await fs.writeFile(filePath, dataToWrite);
		return fileName;
	}

	async deleteByCourseId(courseId: string, tx?: Transaction): Promise<BlockDto[]> {
		return await this.repo.deleteByCourseId(courseId, tx);
	}
}
