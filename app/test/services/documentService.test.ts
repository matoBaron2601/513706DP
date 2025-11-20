import { describe, it, expect } from 'bun:test';
import type { DocumentDto, CreateDocumentDto, UpdateDocumentDto } from '../../src/db/schema';
import type { Transaction } from '../../src/types';
import { DocumentService } from '../../src/services/documentService';
import { DocumentRepository } from '../../src/repositories/documentRepository';
import { NotFoundError } from '../../src/errors/AppError';

function makeDocument(overrides: Partial<DocumentDto> = {}): DocumentDto {
	return {
		id: 'd1',
		blockId: 'b1',
		filePath: 'file1.txt',
		isMain: false,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

type RepoFixtures = {
	getByIdResult?: DocumentDto | undefined;
	createResult?: DocumentDto;
	updateResult?: DocumentDto | undefined;
	deleteResult?: DocumentDto | undefined;
	getByBlockIdResult?: DocumentDto[];
	getByFilePathResult?: DocumentDto | undefined;
};

class FakeDocumentRepository implements Partial<DocumentRepository> {
	public fixtures: RepoFixtures;
	public calls = {
		delete: 0
	};
	public receivedTxs: {
		getById?: Transaction | undefined;
		create?: Transaction | undefined;
		update?: Transaction | undefined;
		delete?: Transaction | undefined;
		getByBlockId?: Transaction | undefined;
		getByFilePath?: Transaction | undefined;
	} = {};

	constructor(fixtures: RepoFixtures) {
		this.fixtures = fixtures;
	}

	async getById(id: string, tx?: Transaction): Promise<DocumentDto | undefined> {
		this.receivedTxs.getById = tx;
		return this.fixtures.getByIdResult;
	}

	async create(newDocument: CreateDocumentDto, tx?: Transaction): Promise<DocumentDto> {
		this.receivedTxs.create = tx;
		if (!this.fixtures.createResult) {
			this.fixtures.createResult = makeDocument({
				id: 'created',
				blockId: newDocument.blockId,
				filePath: newDocument.filePath,
				isMain: newDocument.isMain
			});
		}
		return this.fixtures.createResult;
	}

	async update(
		documentId: string,
		updateDocument: UpdateDocumentDto,
		tx?: Transaction
	): Promise<DocumentDto | undefined> {
		this.receivedTxs.update = tx;
		return this.fixtures.updateResult;
	}

	async delete(documentId: string, tx?: Transaction): Promise<DocumentDto | undefined> {
		this.calls.delete++;
		this.receivedTxs.delete = tx;
		return this.fixtures.deleteResult;
	}

	async getByBlockId(blockId: string, tx?: Transaction): Promise<DocumentDto[]> {
		this.receivedTxs.getByBlockId = tx;
		return this.fixtures.getByBlockIdResult ?? [];
	}

	async getByFilePath(filePath: string, tx?: Transaction): Promise<DocumentDto | undefined> {
		this.receivedTxs.getByFilePath = tx;
		return this.fixtures.getByFilePathResult;
	}
}

describe('DocumentService', () => {
	// getById

	it('getById: returns document when found', async () => {
		const doc = makeDocument({ id: 'd1' });
		const repo = new FakeDocumentRepository({
			getByIdResult: doc
		}) as unknown as DocumentRepository;
		const svc = new DocumentService(repo);

		const res = await svc.getById('d1');
		expect(res).toEqual(doc);
	});

	it('getById: throws NotFoundError when not found', async () => {
		const repo = new FakeDocumentRepository({
			getByIdResult: undefined
		}) as unknown as DocumentRepository;
		const svc = new DocumentService(repo);

		await expect(svc.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// create

	it('create: delegates to repository.create', async () => {
		const created = makeDocument({ id: 'd2' });
		const repo = new FakeDocumentRepository({
			createResult: created
		}) as unknown as DocumentRepository;
		const svc = new DocumentService(repo);

		const input = {
			blockId: 'b1',
			filePath: 'file2.txt',
			isMain: false
		} as CreateDocumentDto;

		const res = await svc.create(input);
		expect(res).toEqual(created);
	});

	// update

	it('update: returns updated document when repo returns value', async () => {
		const updated = makeDocument({ id: 'd1', filePath: 'updated.txt' });

		const repo = new FakeDocumentRepository({
			updateResult: updated
		}) as unknown as DocumentRepository;
		const svc = new DocumentService(repo);

		const patch = { filePath: 'updated.txt' } as UpdateDocumentDto;

		const res = await svc.update('d1', patch);
		expect(res).toEqual(updated);
	});

	it('update: throws NotFoundError when repo returns undefined', async () => {
		const repo = new FakeDocumentRepository({
			updateResult: undefined
		}) as unknown as DocumentRepository;
		const svc = new DocumentService(repo);

		const patch = { filePath: 'updated.txt' } as UpdateDocumentDto;

		await expect(svc.update('missing', patch)).rejects.toBeInstanceOf(NotFoundError);
	});

	// delete

	it('delete: returns deleted document when repo returns value', async () => {
		const deleted = makeDocument({ id: 'd1' });

		const repo = new FakeDocumentRepository({
			deleteResult: deleted
		}) as unknown as DocumentRepository;
		const svc = new DocumentService(repo);

		const res = await svc.delete('d1');
		expect(res).toEqual(deleted);
	});

	it('delete: throws NotFoundError when repo.delete returns undefined', async () => {
		const repo = new FakeDocumentRepository({
			deleteResult: undefined
		}) as unknown as DocumentRepository;
		const svc = new DocumentService(repo);

		await expect(svc.delete('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// getByBlockId

	it('getByBlockId: returns documents for block', async () => {
		const rows = [
			makeDocument({ id: 'd1', blockId: 'bX' }),
			makeDocument({ id: 'd2', blockId: 'bX' })
		];

		const repo = new FakeDocumentRepository({
			getByBlockIdResult: rows
		}) as unknown as DocumentRepository;
		const svc = new DocumentService(repo);

		const res = await svc.getByBlockId('bX');
		expect(res).toEqual(rows);
	});

	it('getByBlockId: returns empty array when none', async () => {
		const repo = new FakeDocumentRepository({
			getByBlockIdResult: []
		}) as unknown as DocumentRepository;
		const svc = new DocumentService(repo);

		const res = await svc.getByBlockId('bX');
		expect(res).toEqual([]);
	});

	// deleteByFilePath

	it('deleteByFilePath: throws NotFoundError when document by filePath not found', async () => {
		const repo = new FakeDocumentRepository({
			getByFilePathResult: undefined
		}) as unknown as DocumentRepository;
		const svc = new DocumentService(repo);

		await expect(svc.deleteByFilePath('missing.txt')).rejects.toBeInstanceOf(NotFoundError);
	});

	it('deleteByFilePath: throws when it is the only document in block', async () => {
		const doc = makeDocument({ id: 'd1', blockId: 'b1', filePath: 'only.txt' });

		const repo = new FakeDocumentRepository({
			getByFilePathResult: doc,
			getByBlockIdResult: [doc]
		}) as unknown as DocumentRepository;
		const svc = new DocumentService(repo);

		await expect(svc.deleteByFilePath('only.txt')).rejects.toThrow(
			'Cannot delete the only document in the block.'
		);
	});


	// transaction wiring example

	it('passes transaction through to repository methods (example: getById)', async () => {
		const doc = makeDocument({ id: 'd1' });

		const fakeRepo = new FakeDocumentRepository({
			getByIdResult: doc
		});
		const repo = fakeRepo as unknown as DocumentRepository;
		const svc = new DocumentService(repo);
		const tx = {} as Transaction;

		await svc.getById('d1', tx);

		expect(fakeRepo.receivedTxs.getById).toBe(tx);
	});
});
