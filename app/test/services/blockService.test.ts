import { describe, it, expect } from 'bun:test';
import fs from 'fs/promises';
import path from 'path';

import type { BlockDto, CreateBlockDto, UpdateBlockDto } from '../../src/db/schema';
import type { Transaction } from '../../src/types';
import { BlockService } from '../../src/services/blockService';
import { BlockRepository } from '../../src/repositories/blockRepository';
import { NotFoundError } from '../../src/errors/AppError';

function makeBlock(overrides: Partial<BlockDto> = {}): BlockDto {
	return {
		id: 'b1',
		name: 'Block 1',
		courseId: 'course1',
		documentPath: '/doc',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

type RepoFixtures = {
	getByIdResult?: BlockDto | undefined;
	createResult?: BlockDto;
	updateResult?: BlockDto | undefined;
	deleteResult?: BlockDto | undefined;
	getManyByIdsResult?: BlockDto[];
	getAllResult?: BlockDto[];
	getManyByCourseIdResult?: BlockDto[];
	deleteByCourseIdResult?: BlockDto[];
};

class FakeBlockRepository implements Partial<BlockRepository> {
	public fixtures: RepoFixtures;
	public receivedTxs: {
		getById?: Transaction | undefined;
		create?: Transaction | undefined;
		update?: Transaction | undefined;
		delete?: Transaction | undefined;
		getManyByIds?: Transaction | undefined;
		getAll?: Transaction | undefined;
		getManyByCourseId?: Transaction | undefined;
		deleteByCourseId?: Transaction | undefined;
	} = {};

	constructor(fixtures: RepoFixtures) {
		this.fixtures = fixtures;
	}

	async getById(id: string, tx?: Transaction): Promise<BlockDto | undefined> {
		this.receivedTxs.getById = tx;
		return this.fixtures.getByIdResult;
	}

	async create(data: CreateBlockDto, tx?: Transaction): Promise<BlockDto> {
		this.receivedTxs.create = tx;
		if (!this.fixtures.createResult) {
			this.fixtures.createResult = makeBlock({
				id: 'created',
				name: data.name,
				courseId: data.courseId,
				documentPath: data.documentPath
			});
		}
		return this.fixtures.createResult;
	}

	async update(id: string, data: UpdateBlockDto, tx?: Transaction): Promise<BlockDto | undefined> {
		this.receivedTxs.update = tx;
		return this.fixtures.updateResult;
	}

	async delete(id: string, tx?: Transaction): Promise<BlockDto | undefined> {
		this.receivedTxs.delete = tx;
		return this.fixtures.deleteResult;
	}

	async getManyByIds(ids: string[], tx?: Transaction): Promise<BlockDto[]> {
		this.receivedTxs.getManyByIds = tx;
		return this.fixtures.getManyByIdsResult ?? [];
	}

	async getAll(tx?: Transaction): Promise<BlockDto[]> {
		this.receivedTxs.getAll = tx;
		return this.fixtures.getAllResult ?? [];
	}

	async getManyByCourseId(courseId: string, tx?: Transaction): Promise<BlockDto[]> {
		this.receivedTxs.getManyByCourseId = tx;
		return this.fixtures.getManyByCourseIdResult ?? [];
	}

	async deleteByCourseId(courseId: string, tx?: Transaction): Promise<BlockDto[]> {
		this.receivedTxs.deleteByCourseId = tx;
		return this.fixtures.deleteByCourseIdResult ?? [];
	}
}

describe('BlockService', () => {
	// --- repo-based methods ---

	it('getById: returns block when found', async () => {
		const block = makeBlock({ id: 'b1' });
		const repo = new FakeBlockRepository({ getByIdResult: block }) as unknown as BlockRepository;
		const svc = new BlockService(repo);

		const res = await svc.getById('b1');
		expect(res).toEqual(block);
	});

	it('getById: throws NotFoundError when not found', async () => {
		const repo = new FakeBlockRepository({
			getByIdResult: undefined
		}) as unknown as BlockRepository;
		const svc = new BlockService(repo);

		await expect(svc.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	it('create: delegates to repository.create', async () => {
		const created = makeBlock({ id: 'b2' });
		const repo = new FakeBlockRepository({ createResult: created }) as unknown as BlockRepository;
		const svc = new BlockService(repo);

		const input = {
			name: 'New block',
			courseId: 'course1',
			documentPath: '/doc2'
		} as CreateBlockDto;

		const res = await svc.create(input);
		expect(res).toEqual(created);
	});

	it('update: returns updated block when repo returns value', async () => {
		const updated = makeBlock({ id: 'b1', name: 'Updated' });
		const repo = new FakeBlockRepository({ updateResult: updated }) as unknown as BlockRepository;
		const svc = new BlockService(repo);

		const patch = { name: 'Updated' } as UpdateBlockDto;
		const res = await svc.update('b1', patch);
		expect(res).toEqual(updated);
	});

	it('update: throws NotFoundError when repo returns undefined', async () => {
		const repo = new FakeBlockRepository({ updateResult: undefined }) as unknown as BlockRepository;
		const svc = new BlockService(repo);

		const patch = { name: 'Updated' } as UpdateBlockDto;
		await expect(svc.update('missing', patch)).rejects.toBeInstanceOf(NotFoundError);
	});

	it('delete: returns deleted block when repo returns value', async () => {
		const deleted = makeBlock({ id: 'b1' });
		const repo = new FakeBlockRepository({ deleteResult: deleted }) as unknown as BlockRepository;
		const svc = new BlockService(repo);

		const res = await svc.delete('b1');
		expect(res).toEqual(deleted);
	});

	it('delete: throws NotFoundError when repo returns undefined', async () => {
		const repo = new FakeBlockRepository({ deleteResult: undefined }) as unknown as BlockRepository;
		const svc = new BlockService(repo);

		await expect(svc.delete('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	it('getManyByIds: returns array of blocks', async () => {
		const rows = [makeBlock({ id: 'b1' }), makeBlock({ id: 'b2' })];
		const repo = new FakeBlockRepository({
			getManyByIdsResult: rows
		}) as unknown as BlockRepository;
		const svc = new BlockService(repo);

		const res = await svc.getManyByIds(['b1', 'b2']);
		expect(res).toEqual(rows);
	});

	it('getManyByIds: returns empty array when none', async () => {
		const repo = new FakeBlockRepository({ getManyByIdsResult: [] }) as unknown as BlockRepository;
		const svc = new BlockService(repo);

		const res = await svc.getManyByIds(['b1', 'b2']);
		expect(res).toEqual([]);
	});

	it('getAll: returns all blocks', async () => {
		const rows = [makeBlock({ id: 'b1' }), makeBlock({ id: 'b2' })];
		const repo = new FakeBlockRepository({ getAllResult: rows }) as unknown as BlockRepository;
		const svc = new BlockService(repo);

		const res = await svc.getAll();
		expect(res).toEqual(rows);
	});

	it('getManyByCourseId: returns blocks for course', async () => {
		const rows = [makeBlock({ id: 'b1', courseId: 'courseX' })];
		const repo = new FakeBlockRepository({
			getManyByCourseIdResult: rows
		}) as unknown as BlockRepository;
		const svc = new BlockService(repo);

		const res = await svc.getManyByCourseId('courseX');
		expect(res).toEqual(rows);
	});

	it('deleteByCourseId: delegates to repository.deleteByCourseId', async () => {
		const rows = [makeBlock({ id: 'b1', courseId: 'courseX' })];
		const repo = new FakeBlockRepository({
			deleteByCourseIdResult: rows
		}) as unknown as BlockRepository;
		const svc = new BlockService(repo);

		const res = await svc.deleteByCourseId('courseX');
		expect(res).toEqual(rows);
	});

	// --- getFileTextByPath ---

	it('getFileTextByPath: returns file contents for valid .txt inside uploads', async () => {
		const svc = new BlockService(new FakeBlockRepository({}) as unknown as BlockRepository);

		const uploadsDir = path.resolve(process.cwd(), 'uploads');
		await fs.mkdir(uploadsDir, { recursive: true });

		const filename = 'test_file.txt';
		const fullPath = path.resolve(uploadsDir, filename);
		const content = 'hello world';

		await fs.writeFile(fullPath, content, 'utf8');

		const res = await svc.getFileTextByPath(filename);
		expect(res).toBe(content);
	});

	it('getFileTextByPath: returns null for non-txt extension', async () => {
		const svc = new BlockService(new FakeBlockRepository({}) as unknown as BlockRepository);

		const res = await svc.getFileTextByPath('file.pdf');
		expect(res).toBeNull();
	});

	it('getFileTextByPath: returns null for path traversal attempt', async () => {
		const svc = new BlockService(new FakeBlockRepository({}) as unknown as BlockRepository);

		const res = await svc.getFileTextByPath('../outside.txt');
		expect(res).toBeNull();
	});

	it('getFileTextByPath: throws NotFoundError when file does not exist but path is otherwise valid', async () => {
		const svc = new BlockService(new FakeBlockRepository({}) as unknown as BlockRepository);

		// `nonexistent.txt` -> valid .txt name under uploads, but no file
		await expect(svc.getFileTextByPath('nonexistent.txt')).rejects.toBeInstanceOf(NotFoundError);
	});

	// --- saveFile ---

	it('saveFile: writes file to uploads and returns generated filename', async () => {
		const svc = new BlockService(new FakeBlockRepository({}) as unknown as BlockRepository);

		const fileContent = 'sample content';
		const file = new File([fileContent], 'myfile.txt', { type: 'text/plain' });

		const returnedName = await svc.saveFile(file);

		// Should have structure: <timestamp>_myfile.txt
		expect(returnedName.endsWith('_myfile.txt')).toBe(true);

		const uploadsDir = path.resolve(process.cwd(), 'uploads');
		const savedPath = path.join(uploadsDir, returnedName);
		const savedContent = await fs.readFile(savedPath, 'utf8');

		expect(savedContent).toBe(fileContent);
	});

	// --- transaction wiring ---

	it('passes transaction through to repository methods (example: getById)', async () => {
		const block = makeBlock({ id: 'b1' });
		const fakeRepo = new FakeBlockRepository({ getByIdResult: block });
		const repo = fakeRepo as unknown as BlockRepository;
		const svc = new BlockService(repo);
		const tx = {} as Transaction;

		await svc.getById('b1', tx);

		expect(fakeRepo.receivedTxs.getById).toBe(tx);
	});
});
