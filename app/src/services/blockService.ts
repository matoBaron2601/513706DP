/**
 * @fileoverview
 * Service layer for managing blocks within courses.
 * Handles business logic and interactions with the BlockRepository.
 */

import type { Transaction } from '../types';
import { NotFoundError } from '../errors/AppError';
import fs from 'fs/promises';
import path from 'path';
import { BlockRepository } from '../repositories/blockRepository';
import type { BlockDto, CreateBlockDto, UpdateBlockDto } from '../db/schema';
export class BlockService {
	constructor(private repo: BlockRepository = new BlockRepository()) {}

	/**
	 * Get a block by its ID.
	 * @param id
	 * @param tx
	 * @returns The block DTO.
	 * @throws NotFoundError if the block does not exist.
	 */
	async getById(id: string, tx?: Transaction): Promise<BlockDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`Block with id ${id} not found`);
		return item;
	}

	/**
	 * Create a new block.
	 * @param data
	 * @param tx
	 * @returns The created block DTO.
	 */
	async create(data: CreateBlockDto, tx?: Transaction): Promise<BlockDto> {
		return await this.repo.create(data, tx);
	}

	/**
	 * Update an existing block.
	 * @param id
	 * @param data
	 * @param tx
	 * @returns The updated block DTO.
	 * @throws NotFoundError if the block does not exist.
	 */
	async update(id: string, data: UpdateBlockDto, tx?: Transaction): Promise<BlockDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`Block with id ${id} not found`);
		return item;
	}

	/**
	 * Delete a block by its ID.
	 * @param id
	 * @param tx
	 * @returns The deleted block DTO.
	 * @throws NotFoundError if the block does not exist.
	 */
	async delete(id: string, tx?: Transaction): Promise<BlockDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`Block with id ${id} not found`);
		return item;
	}

	/**
	 * Get multiple blocks by their IDs.
	 * @param ids
	 * @param tx
	 * @returns Array of BlockDto
	 */
	async getManyByIds(ids: string[], tx?: Transaction): Promise<BlockDto[]> {
		return await this.repo.getManyByIds(ids, tx);
	}

	/**
	 * Get all blocks.
	 * @param tx
	 * @returns Array of BlockDto
	 */
	async getAll(tx?: Transaction): Promise<BlockDto[]> {
		return await this.repo.getAll(tx);
	}

	/**
	 * Get blocks by course ID.
	 * @param courseId
	 * @param tx
	 * @returns Array of BlockDto
	 */
	async getManyByCourseId(courseId: string, tx?: Transaction): Promise<BlockDto[]> {
		return await this.repo.getManyByCourseId(courseId, tx);
	}

	/**
	 * Get the text content of a file by its path.
	 * @param filePath
	 * @returns The text content of the file or null if not found or invalid.
	 * @throws NotFoundError if the file cannot be read.
	 */
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

	/**
	 * Save a file to the uploads directory.
	 * @param file
	 * @returns The saved file name.
	 */
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

	/**
	 * Delete blocks by course ID.
	 * @param courseId
	 * @param tx
	 * @returns Array of deleted BlockDto
	 */
	async deleteByCourseId(courseId: string, tx?: Transaction): Promise<BlockDto[]> {
		return await this.repo.deleteByCourseId(courseId, tx);
	}
}
