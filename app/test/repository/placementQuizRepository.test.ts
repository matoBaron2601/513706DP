import { describe, it, expect } from 'bun:test';
import type {
	PlacementQuizDto,
	CreatePlacementQuizDto,
	UpdatePlacementQuizDto
} from '../../src/db/schema';
import type { Transaction } from '../../src/types';
import { PlacementQuizRepository } from '../../src/repositories/placementQuizRepository';

function makePlacementQuiz(overrides: Partial<PlacementQuizDto> = {}): PlacementQuizDto {
	return {
		id: 'pq1',
		blockId: 'b1',
		baseQuizId: 'q1',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

type Fixtures = {
	selectResult?: PlacementQuizDto[];
	insertReturn?: PlacementQuizDto[];
	updateReturn?: PlacementQuizDto[];
	deleteReturn?: PlacementQuizDto[];
};

function makeFakeDbClient(fixtures: Fixtures) {
	const api = {
		select() {
			return {
				from(_table: unknown) {
					return {
						where(_expr: unknown): Promise<PlacementQuizDto[]> {
							return Promise.resolve(fixtures.selectResult ?? []);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreatePlacementQuizDto | CreatePlacementQuizDto[]) {
					return {
						returning(): Promise<PlacementQuizDto[]> {
							return Promise.resolve(fixtures.insertReturn ?? []);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdatePlacementQuizDto) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<PlacementQuizDto[]> {
									return Promise.resolve(fixtures.updateReturn ?? []);
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
						returning(): Promise<PlacementQuizDto[]> {
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
					return {
						where(_expr: unknown): Promise<PlacementQuizDto[]> {
							return Promise.resolve(fixtures.selectResult ?? []);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreatePlacementQuizDto | CreatePlacementQuizDto[]) {
					return {
						returning(): Promise<PlacementQuizDto[]> {
							return Promise.resolve(fixtures.insertReturn ?? []);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdatePlacementQuizDto) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<PlacementQuizDto[]> {
									return Promise.resolve(fixtures.updateReturn ?? []);
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
						returning(): Promise<PlacementQuizDto[]> {
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

describe('PlacementQuizRepository', () => {
	// getById

	it('getById: returns placementQuiz when it exists', async () => {
		const row = makePlacementQuiz({ id: 'pq1' });

		const repo = new PlacementQuizRepository(
			makeFakeDbClient({ selectResult: [row] }).getDbClient
		);

		const found = await repo.getById('pq1');
		expect(found).toEqual(row);
	});

	it('getById: returns undefined when placementQuiz does not exist', async () => {
		const repo = new PlacementQuizRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const found = await repo.getById('missing');
		expect(found).toBeUndefined();
	});

	it('getById: returns first row when multiple rows are returned', async () => {
		const first = makePlacementQuiz({ id: 'pq1', blockId: 'b1' });
		const second = makePlacementQuiz({ id: 'pq1', blockId: 'b2' });

		const repo = new PlacementQuizRepository(
			makeFakeDbClient({ selectResult: [first, second] }).getDbClient
		);

		const found = await repo.getById('pq1');
		expect(found).toEqual(first);
	});

	// getByIds

	it('getByIds: returns array of rows', async () => {
		const rows: PlacementQuizDto[] = [
			makePlacementQuiz({ id: 'pq1' }),
			makePlacementQuiz({ id: 'pq2', blockId: 'b2' })
		];

		const repo = new PlacementQuizRepository(
			makeFakeDbClient({ selectResult: rows }).getDbClient
		);

		const res = await repo.getByIds(['pq1', 'pq2']);
		expect(res).toEqual(rows);
	});

	it('getByIds: returns empty array when nothing found', async () => {
		const repo = new PlacementQuizRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const res = await repo.getByIds(['pq1', 'pq2']);
		expect(res).toEqual([]);
	});

	// create

	it('create: returns inserted row from returning()', async () => {
		const input = {
			blockId: 'b1',
			baseQuizId: 'q1'
		} as CreatePlacementQuizDto;

		const returned = makePlacementQuiz({
			id: 'pq2',
			blockId: 'b1',
			baseQuizId: 'q1'
		});

		const repo = new PlacementQuizRepository(
			makeFakeDbClient({ insertReturn: [returned] }).getDbClient
		);

		const created = await repo.create(input);
		expect(created).toEqual(returned);
	});

	// update

	it('update: returns updated row from returning()', async () => {
		const patch = {
			baseQuizId: 'q2'
		} as UpdatePlacementQuizDto;

		const returned = makePlacementQuiz({
			id: 'pq1',
			baseQuizId: 'q2'
		});

		const repo = new PlacementQuizRepository(
			makeFakeDbClient({ updateReturn: [returned] }).getDbClient
		);

		const updated = await repo.update('pq1', patch);
		expect(updated).toEqual(returned);
	});

	it('update: returns undefined when returning() is empty', async () => {
		const patch = {
			baseQuizId: 'q2'
		} as UpdatePlacementQuizDto;

		const repo = new PlacementQuizRepository(
			makeFakeDbClient({ updateReturn: [] }).getDbClient
		);

		const updated = await repo.update('pq1', patch);
		expect(updated).toBeUndefined();
	});

	// delete

	it('delete: returns deleted row from returning()', async () => {
		const deleted = makePlacementQuiz({ id: 'pq1' });

		const repo = new PlacementQuizRepository(
			makeFakeDbClient({ deleteReturn: [deleted] }).getDbClient
		);

		const res = await repo.delete('pq1');
		expect(res).toEqual(deleted);
	});

	it('delete: returns undefined when nothing was deleted', async () => {
		const repo = new PlacementQuizRepository(
			makeFakeDbClient({ deleteReturn: [] }).getDbClient
		);

		const res = await repo.delete('pq1');
		expect(res).toBeUndefined();
	});

	// getByBlockId

	it('getByBlockId: returns placementQuiz for given blockId', async () => {
		const row = makePlacementQuiz({ id: 'pq1', blockId: 'bX' });

		const repo = new PlacementQuizRepository(
			makeFakeDbClient({ selectResult: [row] }).getDbClient
		);

		const found = await repo.getByBlockId('bX');
		expect(found).toEqual(row);
	});

	it('getByBlockId: returns undefined when none exist for blockId', async () => {
		const repo = new PlacementQuizRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const found = await repo.getByBlockId('bX');
		expect(found).toBeUndefined();
	});

	// transaction wiring

	it('uses provided transaction when calling getDbClient in getById', async () => {
		const row = makePlacementQuiz({ id: 'pq1' });

		const { getDbClient, getReceivedTx } = makeTrackingDbClient({
			selectResult: [row]
		});

		const repo = new PlacementQuizRepository(getDbClient);
		const tx = {} as Transaction;

		await repo.getById('pq1', tx);

		expect(getReceivedTx()).toBe(tx);
	});
});
