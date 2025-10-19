import type { CreateCourseBlockDto, UpdateCourseBlockDto, CourseBlockDto } from '../../db/schema';
import { CourseBlockRepository } from '../../repositories/complexQuizRepositories/courseBlockRepository';
import type { Transaction } from '../../types';
import { NotFoundError } from '../utils/notFoundError';
import fs from 'fs/promises';
import path from 'path';
export class CourseBlockService {
	private repo: CourseBlockRepository;

	constructor() {
		this.repo = new CourseBlockRepository();
	}

	async getById(id: string, tx?: Transaction): Promise<CourseBlockDto> {
		const item = await this.repo.getById(id, tx);
		if (!item) throw new NotFoundError(`CourseBlock with id ${id} not found`);
		return item;
	}

	async getByCourseId(courseId: string, tx?: Transaction): Promise<CourseBlockDto[]> {
		return await this.repo.getByCourseId(courseId, tx);
	}

	async create(data: CreateCourseBlockDto, tx?: Transaction): Promise<CourseBlockDto> {
		return await this.repo.create(data, tx);
	}

	async update(id: string, data: UpdateCourseBlockDto, tx?: Transaction): Promise<CourseBlockDto> {
		const item = await this.repo.update(id, data, tx);
		if (!item) throw new NotFoundError(`CourseBlock with id ${id} not found`);
		return item;
	}

	async delete(id: string, tx?: Transaction): Promise<CourseBlockDto> {
		const item = await this.repo.delete(id, tx);
		if (!item) throw new NotFoundError(`CourseBlock with id ${id} not found`);
		return item;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<CourseBlockDto[]> {
		return await this.repo.getByIds(ids, tx);
	}

	async getAll(tx?: Transaction): Promise<CourseBlockDto[]> {
		return await this.repo.getAll(tx);
	}
	async getFileByPath(filePath: string): Promise<string | null> {
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
