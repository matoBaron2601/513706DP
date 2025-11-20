import { describe, it, expect } from 'bun:test';
import type { BlockDto, CreateBlockDto, UpdateBlockDto } from '../../../src/db/schema';
import type { Transaction } from '../../../src/types';
import { BlockRepository } from '../../../src/repositories/blockRepository';

function makeBlock(overrides: Partial<BlockDto> = {}): BlockDto {
	return {
		id: 'b1',
		name: 'Block 1',
		courseId: 'c1',
		documentPath: '/docs/b1',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

type Fixtures = {
	selectResult?: BlockDto[];
	insertReturn?: BlockDto[];
	updateReturn?: BlockDto[];
	deleteReturn?: BlockDto[];
	deleteByCourseReturn?: BlockDto[];
};

function makeFakeDbClient(fixtures: Fixtures) {
	const api = {
		select() {
			return {
				from(_table: unknown) {
					const rows = fixtures.selectResult ?? [];
					return {
						// for queries with where(...)
						where(_expr: unknown): Promise<BlockDto[]> {
							return Promise.resolve(rows);
						},
						// for getAll: await select().from(block)
						then<TResult1 = BlockDto[], TResult2 = never>(
							onfulfilled?: ((value: BlockDto[]) => TResult1 | PromiseLike<TResult1>) | null,
							onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
						): Promise<TResult1 | TResult2> {
							return Promise.resolve(rows).then(onfulfilled as any, onrejected as any);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateBlockDto | CreateBlockDto[]) {
					return {
						returning(): Promise<BlockDto[]> {
							return Promise.resolve(fixtures.insertReturn ?? []);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateBlockDto | { deletedAt: Date }) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<BlockDto[]> {
									// use deleteByCourseReturn if set, else updateReturn
									return Promise.resolve(
										fixtures.deleteByCourseReturn ?? fixtures.updateReturn ?? []
									);
								}
							};
						}
					};
				}
			};
		},
		delete(_table: unknown) {
			return {
				where(_expr: unknown) {
					return {
						returning(): Promise<BlockDto[]> {
							return Promise.resolve(fixtures.deleteReturn ?? []);
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
						where(_expr: unknown): Promise<BlockDto[]> {
							return Promise.resolve(rows);
						},
						then<TResult1 = BlockDto[], TResult2 = never>(
							onfulfilled?: ((value: BlockDto[]) => TResult1 | PromiseLike<TResult1>) | null,
							onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
						): Promise<TResult1 | TResult2> {
							return Promise.resolve(rows).then(onfulfilled as any, onrejected as any);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateBlockDto | CreateBlockDto[]) {
					return {
						returning(): Promise<BlockDto[]> {
							return Promise.resolve(fixtures.insertReturn ?? []);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateBlockDto | { deletedAt: Date }) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<BlockDto[]> {
									return Promise.resolve(
										fixtures.deleteByCourseReturn ?? fixtures.updateReturn ?? []
									);
								}
							};
						}
					};
				}
			};
		},
		delete(_table: unknown) {
			return {
				where(_expr: unknown) {
					return {
						returning(): Promise<BlockDto[]> {
							return Promise.resolve(fixtures.deleteReturn ?? []);
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

describe('BlockRepository', () => {
	// getById

	it('getById: returns block when it exists', async () => {
		const row = makeBlock({ id: 'b1' });

		const repo = new BlockRepository(makeFakeDbClient({ selectResult: [row] }).getDbClient);

		const found = await repo.getById('b1');
		expect(found).toEqual(row);
	});

	it('getById: returns undefined when block does not exist', async () => {
		const repo = new BlockRepository(makeFakeDbClient({ selectResult: [] }).getDbClient);

		const found = await repo.getById('missing');
		expect(found).toBeUndefined();
	});

	it('getById: returns first row when multiple rows are returned', async () => {
		const first = makeBlock({ id: 'b1', name: 'First' });
		const second = makeBlock({ id: 'b1', name: 'Second' });

		const repo = new BlockRepository(
			makeFakeDbClient({ selectResult: [first, second] }).getDbClient
		);

		const found = await repo.getById('b1');
		expect(found).toEqual(first);
	});

	// create

	it('create: returns inserted row from returning()', async () => {
		const input = {
			name: 'New Block',
			courseId: 'c1',
			documentPath: '/docs/new'
		} as CreateBlockDto;

		const returned = makeBlock({ id: 'b2', name: 'New Block' });

		const repo = new BlockRepository(makeFakeDbClient({ insertReturn: [returned] }).getDbClient);

		const created = await repo.create(input);
		expect(created).toEqual(returned);
	});

	// update

	it('update: returns updated row from returning()', async () => {
		const patch = {
			name: 'Updated Block',
			documentPath: '/docs/updated'
		} as UpdateBlockDto;

		const returned = makeBlock({
			id: 'b1',
			name: 'Updated Block',
			documentPath: '/docs/updated'
		});

		const repo = new BlockRepository(makeFakeDbClient({ updateReturn: [returned] }).getDbClient);

		const updated = await repo.update('b1', patch);
		expect(updated).toEqual(returned);
	});

	it('update: returns undefined when returning() is empty', async () => {
		const patch = {
			name: 'Updated Block'
		} as UpdateBlockDto;

		const repo = new BlockRepository(makeFakeDbClient({ updateReturn: [] }).getDbClient);

		const updated = await repo.update('b1', patch);
		expect(updated).toBeUndefined();
	});

	// delete

	it('delete: returns deleted row from returning()', async () => {
		const deleted = makeBlock({ id: 'b1' });

		const repo = new BlockRepository(makeFakeDbClient({ deleteReturn: [deleted] }).getDbClient);

		const res = await repo.delete('b1');
		expect(res).toEqual(deleted);
	});

	it('delete: returns undefined when nothing was deleted', async () => {
		const repo = new BlockRepository(makeFakeDbClient({ deleteReturn: [] }).getDbClient);

		const res = await repo.delete('b1');
		expect(res).toBeUndefined();
	});

	// getManyByIds

	it('getManyByIds: returns array of rows', async () => {
		const rows: BlockDto[] = [makeBlock({ id: 'b1' }), makeBlock({ id: 'b2', name: 'Second' })];

		const repo = new BlockRepository(makeFakeDbClient({ selectResult: rows }).getDbClient);

		const res = await repo.getManyByIds(['b1', 'b2']);
		expect(res).toEqual(rows);
	});

	it('getManyByIds: returns empty array when nothing found', async () => {
		const repo = new BlockRepository(makeFakeDbClient({ selectResult: [] }).getDbClient);

		const res = await repo.getManyByIds(['b1', 'b2']);
		expect(res).toEqual([]);
	});

	// getAll

	it('getAll: returns all blocks', async () => {
		const rows: BlockDto[] = [makeBlock({ id: 'b1' }), makeBlock({ id: 'b2' })];

		const repo = new BlockRepository(makeFakeDbClient({ selectResult: rows }).getDbClient);

		const res = await repo.getAll();
		expect(res).toEqual(rows);
	});

	// getManyByCourseId

	it('getManyByCourseId: returns blocks for given courseId', async () => {
		const rows: BlockDto[] = [
			makeBlock({ id: 'b1', courseId: 'cX' }),
			makeBlock({ id: 'b2', courseId: 'cX' })
		];

		const repo = new BlockRepository(makeFakeDbClient({ selectResult: rows }).getDbClient);

		const res = await repo.getManyByCourseId('cX');
		expect(res).toEqual(rows);
	});

	// deleteByCourseId (soft delete)

	it('deleteByCourseId: returns updated (soft-deleted) rows', async () => {
		const rows: BlockDto[] = [
			makeBlock({ id: 'b1', courseId: 'cX', deletedAt: new Date('2024-01-02T00:00:00Z') }),
			makeBlock({ id: 'b2', courseId: 'cX', deletedAt: new Date('2024-01-02T00:00:00Z') })
		];

		const repo = new BlockRepository(makeFakeDbClient({ deleteByCourseReturn: rows }).getDbClient);

		const res = await repo.deleteByCourseId('cX');
		expect(res).toEqual(rows);
	});

	// transaction wiring

	it('uses provided transaction when calling getDbClient in getById', async () => {
		const row = makeBlock({ id: 'b1' });

		const { getDbClient, getReceivedTx } = makeTrackingDbClient({
			selectResult: [row]
		});

		const repo = new BlockRepository(getDbClient);
		const tx = {} as Transaction;

		await repo.getById('b1', tx);

		expect(getReceivedTx()).toBe(tx);
	});
});
