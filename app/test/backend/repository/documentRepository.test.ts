import { describe, it, expect } from 'bun:test';
import type { DocumentDto, CreateDocumentDto, UpdateDocumentDto } from '../../../src/db/schema';
import type { Transaction } from '../../../src/types';
import { DocumentRepository } from '../../../src/repositories/documentRepository';

function makeDocument(overrides: Partial<DocumentDto> = {}): DocumentDto {
	return {
		id: 'd1',
		blockId: 'b1',
		filePath: '/files/doc1.pdf',
		isMain: false,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

type Fixtures = {
	selectResult?: DocumentDto[];
	insertReturn?: DocumentDto[];
	updateReturn?: DocumentDto[];
};

function makeFakeDbClient(fixtures: Fixtures) {
	const api = {
		select() {
			return {
				from(_table: unknown) {
					const rows = fixtures.selectResult ?? [];
					return {
						where(_expr: unknown) {
							// await select().from().where(...)
							return Promise.resolve(rows);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateDocumentDto | CreateDocumentDto[]) {
					return {
						returning(): Promise<DocumentDto[]> {
							return Promise.resolve(fixtures.insertReturn ?? []);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateDocumentDto | { deletedAt: Date }) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<DocumentDto[]> {
									return Promise.resolve(fixtures.updateReturn ?? []);
								}
							};
						}
					};
				}
			};
		}
	};

	return { getDbClient: () => api };
}

function makeTrackingDbClient(fixtures: Fixtures) {
	let receivedTx: Transaction | undefined;

	const api = {
		select() {
			return {
				from(_table: unknown) {
					const rows = fixtures.selectResult ?? [];
					return {
						where(_expr: unknown) {
							return Promise.resolve(rows);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateDocumentDto | CreateDocumentDto[]) {
					return {
						returning(): Promise<DocumentDto[]> {
							return Promise.resolve(fixtures.insertReturn ?? []);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateDocumentDto | { deletedAt: Date }) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<DocumentDto[]> {
									return Promise.resolve(fixtures.updateReturn ?? []);
								}
							};
						}
					};
				}
			};
		}
	};

	const getDbClient = (tx?: Transaction) => {
		receivedTx = tx;
		return api;
	};

	return { getDbClient, getReceivedTx: () => receivedTx };
}

describe('DocumentRepository', () => {
	// getById

	it('getById: returns document when it exists', async () => {
		const row = makeDocument({ id: 'd1' });

		const repo = new DocumentRepository(makeFakeDbClient({ selectResult: [row] }).getDbClient);

		const found = await repo.getById('d1');
		expect(found).toEqual(row);
	});

	it('getById: returns undefined when document does not exist', async () => {
		const repo = new DocumentRepository(makeFakeDbClient({ selectResult: [] }).getDbClient);

		const found = await repo.getById('missing');
		expect(found).toBeUndefined();
	});

	// getByFilePath

	it('getByFilePath: returns document for given path', async () => {
		const row = makeDocument({ filePath: '/files/x.pdf' });

		const repo = new DocumentRepository(makeFakeDbClient({ selectResult: [row] }).getDbClient);

		const found = await repo.getByFilePath('/files/x.pdf');
		expect(found).toEqual(row);
	});

	it('getByFilePath: returns undefined when not found', async () => {
		const repo = new DocumentRepository(makeFakeDbClient({ selectResult: [] }).getDbClient);

		const found = await repo.getByFilePath('/files/x.pdf');
		expect(found).toBeUndefined();
	});

	// create

	it('create: returns inserted row from returning()', async () => {
		const input = {
			blockId: 'b1',
			filePath: '/files/new.pdf',
			isMain: false
		} as CreateDocumentDto;

		const returned = makeDocument({
			id: 'd2',
			blockId: 'b1',
			filePath: '/files/new.pdf'
		});

		const repo = new DocumentRepository(makeFakeDbClient({ insertReturn: [returned] }).getDbClient);

		const created = await repo.create(input);
		expect(created).toEqual(returned);
	});

	// update

	it('update: returns updated row from returning()', async () => {
		const patch = {
			isMain: true
		} as UpdateDocumentDto;

		const returned = makeDocument({
			id: 'd1',
			isMain: true
		});

		const repo = new DocumentRepository(makeFakeDbClient({ updateReturn: [returned] }).getDbClient);

		const updated = await repo.update('d1', patch);
		expect(updated).toEqual(returned);
	});

	it('update: returns undefined when returning() is empty', async () => {
		const patch = {
			isMain: true
		} as UpdateDocumentDto;

		const repo = new DocumentRepository(makeFakeDbClient({ updateReturn: [] }).getDbClient);

		const updated = await repo.update('d1', patch);
		expect(updated).toBeUndefined();
	});

	// delete (soft delete by id)

	it('delete: returns soft-deleted row from returning()', async () => {
		const deleted = makeDocument({
			id: 'd1',
			deletedAt: new Date('2024-01-02T00:00:00Z')
		});

		const repo = new DocumentRepository(makeFakeDbClient({ updateReturn: [deleted] }).getDbClient);

		const res = await repo.delete('d1');
		expect(res).toEqual(deleted);
	});

	it('delete: returns undefined when nothing was updated', async () => {
		const repo = new DocumentRepository(makeFakeDbClient({ updateReturn: [] }).getDbClient);

		const res = await repo.delete('d1');
		expect(res).toBeUndefined();
	});

	// getManyByBlockId

	it('getManyByBlockId: returns documents for given blockId', async () => {
		const rows: DocumentDto[] = [
			makeDocument({ id: 'd1', blockId: 'bX' }),
			makeDocument({ id: 'd2', blockId: 'bX' })
		];

		const repo = new DocumentRepository(makeFakeDbClient({ selectResult: rows }).getDbClient);

		const res = await repo.getManyByBlockId('bX');
		expect(res).toEqual(rows);
	});

	it('getManyByBlockId: returns empty array when nothing found', async () => {
		const repo = new DocumentRepository(makeFakeDbClient({ selectResult: [] }).getDbClient);

		const res = await repo.getManyByBlockId('bX');
		expect(res).toEqual([]);
	});

	// getByBlockId (alias behaviour)

	it('getByBlockId: returns documents for given blockId', async () => {
		const rows: DocumentDto[] = [
			makeDocument({ id: 'd1', blockId: 'bY' }),
			makeDocument({ id: 'd2', blockId: 'bY' })
		];

		const repo = new DocumentRepository(makeFakeDbClient({ selectResult: rows }).getDbClient);

		const res = await repo.getByBlockId('bY');
		expect(res).toEqual(rows);
	});

	// deleteByName

	it('deleteByName: returns soft-deleted row from returning()', async () => {
		const deleted = makeDocument({
			id: 'd3',
			filePath: '/files/to-delete.pdf',
			deletedAt: new Date('2024-01-03T00:00:00Z')
		});

		const repo = new DocumentRepository(makeFakeDbClient({ updateReturn: [deleted] }).getDbClient);

		const res = await repo.deleteByName('/files/to-delete.pdf');
		expect(res).toEqual(deleted);
	});

	it('deleteByName: returns undefined when nothing updated', async () => {
		const repo = new DocumentRepository(makeFakeDbClient({ updateReturn: [] }).getDbClient);

		const res = await repo.deleteByName('/files/to-delete.pdf');
		expect(res).toBeUndefined();
	});

	// transaction wiring

	it('uses provided transaction when calling getDbClient in getById', async () => {
		const row = makeDocument({ id: 'd1' });

		const { getDbClient, getReceivedTx } = makeTrackingDbClient({
			selectResult: [row]
		});

		const repo = new DocumentRepository(getDbClient);
		const tx = {} as Transaction;

		await repo.getById('d1', tx);

		expect(getReceivedTx()).toBe(tx);
	});
});
