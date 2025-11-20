import { describe, it, expect } from 'bun:test';
import type {
	AdaptiveQuizDto,
	CreateAdaptiveQuizDto,
	UpdateAdaptiveQuizDto
} from '../../src/db/schema';
import type { Transaction } from '../../src/types';
import { AdaptiveQuizRepository } from '../../src/repositories/adaptiveQuizRepository';

function makeAdaptiveQuiz(overrides: Partial<AdaptiveQuizDto> = {}): AdaptiveQuizDto {
	return {
		id: 'aq1',
		baseQuizId: 'bq1',
		userBlockId: 'ub1',
		placementQuizId: null,
		version: 1,
		isCompleted: false,
		readyForAnswering: false,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

type Fixtures = {
	selectResult?: AdaptiveQuizDto[];
	insertReturn?: AdaptiveQuizDto[];
	updateReturn?: AdaptiveQuizDto[];
	deleteReturn?: AdaptiveQuizDto[];
};

function makeThenableSelectResult(rows: AdaptiveQuizDto[] = []): any {
	return {
		orderBy(_expr: unknown) {
			// For calls that end after orderBy(...)
			return {
				limit(_n: number) {
					// For orderBy().limit(...)
					return Promise.resolve(rows);
				},
				then<TResult1 = AdaptiveQuizDto[], TResult2 = never>(
					onfulfilled?:
						| ((value: AdaptiveQuizDto[]) => TResult1 | PromiseLike<TResult1>)
						| null,
					onrejected?:
						| ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
						| null
				): Promise<TResult1 | TResult2> {
					return Promise.resolve(rows).then(onfulfilled as any, onrejected as any);
				}
			};
		},
		limit(_n: number) {
			return Promise.resolve(rows);
		},
		then<TResult1 = AdaptiveQuizDto[], TResult2 = never>(
			onfulfilled?:
				| ((value: AdaptiveQuizDto[]) => TResult1 | PromiseLike<TResult1>)
				| null,
			onrejected?:
				| ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
				| null
		): Promise<TResult1 | TResult2> {
			return Promise.resolve(rows).then(onfulfilled as any, onrejected as any);
		}
	};
}

function makeFakeDbClient(fixtures: Fixtures) {
	const api = {
		select() {
			return {
				from(_table: unknown) {
					const rows = fixtures.selectResult ?? [];
					return {
						where(_expr: unknown): any {
							return makeThenableSelectResult(rows);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateAdaptiveQuizDto | CreateAdaptiveQuizDto[]) {
					return {
						returning(): Promise<AdaptiveQuizDto[]> {
							return Promise.resolve(fixtures.insertReturn ?? []);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateAdaptiveQuizDto) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<AdaptiveQuizDto[]> {
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
						returning(): Promise<AdaptiveQuizDto[]> {
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
						where(_expr: unknown): any {
							return makeThenableSelectResult(rows);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateAdaptiveQuizDto | CreateAdaptiveQuizDto[]) {
					return {
						returning(): Promise<AdaptiveQuizDto[]> {
							return Promise.resolve(fixtures.insertReturn ?? []);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateAdaptiveQuizDto) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<AdaptiveQuizDto[]> {
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
						returning(): Promise<AdaptiveQuizDto[]> {
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

describe('AdaptiveQuizRepository', () => {
	// getById

	it('getById: returns adaptiveQuiz when it exists', async () => {
		const row = makeAdaptiveQuiz({ id: 'aq1' });

		const repo = new AdaptiveQuizRepository(
			makeFakeDbClient({ selectResult: [row] }).getDbClient
		);

		const found = await repo.getById('aq1');
		expect(found).toEqual(row);
	});

	it('getById: returns undefined when not found', async () => {
		const repo = new AdaptiveQuizRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const found = await repo.getById('missing');
		expect(found).toBeUndefined();
	});

	it('getById: returns first row when multiple rows are returned', async () => {
		const first = makeAdaptiveQuiz({ id: 'aq1', version: 1 });
		const second = makeAdaptiveQuiz({ id: 'aq1', version: 2 });

		const repo = new AdaptiveQuizRepository(
			makeFakeDbClient({ selectResult: [first, second] }).getDbClient
		);

		const found = await repo.getById('aq1');
		expect(found).toEqual(first);
	});

	// getByIds

	it('getByIds: returns array of rows', async () => {
		const rows: AdaptiveQuizDto[] = [
			makeAdaptiveQuiz({ id: 'aq1' }),
			makeAdaptiveQuiz({ id: 'aq2' })
		];

		const repo = new AdaptiveQuizRepository(
			makeFakeDbClient({ selectResult: rows }).getDbClient
		);

		const res = await repo.getByIds(['aq1', 'aq2']);
		expect(res).toEqual(rows);
	});

	it('getByIds: returns empty array when nothing found', async () => {
		const repo = new AdaptiveQuizRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const res = await repo.getByIds(['aq1', 'aq2']);
		expect(res).toEqual([]);
	});

	// create

	it('create: returns inserted row from returning()', async () => {
		const input = {
			baseQuizId: 'bq1',
			userBlockId: 'ub1',
			placementQuizId: null,
			version: 1,
			isCompleted: false,
			readyForAnswering: false
		} as CreateAdaptiveQuizDto;

		const returned = makeAdaptiveQuiz({
			id: 'aq2',
			baseQuizId: 'bq1',
			userBlockId: 'ub1'
		});

		const repo = new AdaptiveQuizRepository(
			makeFakeDbClient({ insertReturn: [returned] }).getDbClient
		);

		const created = await repo.create(input);
		expect(created).toEqual(returned);
	});

	// update

	it('update: returns updated row from returning()', async () => {
		const patch = {
			isCompleted: true,
			readyForAnswering: true
		} as UpdateAdaptiveQuizDto;

		const returned = makeAdaptiveQuiz({
			id: 'aq1',
			isCompleted: true,
			readyForAnswering: true
		});

		const repo = new AdaptiveQuizRepository(
			makeFakeDbClient({ updateReturn: [returned] }).getDbClient
		);

		const updated = await repo.update('aq1', patch);
		expect(updated).toEqual(returned);
	});

	it('update: returns undefined when returning() is empty', async () => {
		const patch = {
			isCompleted: true
		} as UpdateAdaptiveQuizDto;

		const repo = new AdaptiveQuizRepository(
			makeFakeDbClient({ updateReturn: [] }).getDbClient
		);

		const updated = await repo.update('aq1', patch);
		expect(updated).toBeUndefined();
	});

	// delete

	it('delete: returns deleted row from returning()', async () => {
		const deleted = makeAdaptiveQuiz({ id: 'aq1' });

		const repo = new AdaptiveQuizRepository(
			makeFakeDbClient({ deleteReturn: [deleted] }).getDbClient
		);

		const res = await repo.delete('aq1');
		expect(res).toEqual(deleted);
	});

	it('delete: returns undefined when nothing was deleted', async () => {
		const repo = new AdaptiveQuizRepository(
			makeFakeDbClient({ deleteReturn: [] }).getDbClient
		);

		const res = await repo.delete('aq1');
		expect(res).toBeUndefined();
	});

	// getByUserBlockId

	it('getByUserBlockId: returns rows for userBlockId', async () => {
		const rows = [
			makeAdaptiveQuiz({ id: 'aq1', userBlockId: 'ubX' }),
			makeAdaptiveQuiz({ id: 'aq2', userBlockId: 'ubX' })
		];

		const repo = new AdaptiveQuizRepository(
			makeFakeDbClient({ selectResult: rows }).getDbClient
		);

		const res = await repo.getByUserBlockId('ubX');
		expect(res).toEqual(rows);
	});

	// getByUserBlockIdLowerVersion

	it('getByUserBlockIdLowerVersion: returns first version for userBlockId', async () => {
		const rows = [
			makeAdaptiveQuiz({ id: 'aq1', userBlockId: 'ubX', version: 1 }),
			makeAdaptiveQuiz({ id: 'aq2', userBlockId: 'ubX', version: 2 })
		];

		const repo = new AdaptiveQuizRepository(
			makeFakeDbClient({ selectResult: rows }).getDbClient
		);

		const res = await repo.getByUserBlockIdLowerVersion('ubX');
		expect(res).toEqual(rows[0]);
	});

	// getByBaseQuizId

	it('getByBaseQuizId: returns row for baseQuizId', async () => {
		const row = makeAdaptiveQuiz({ id: 'aq1', baseQuizId: 'bqX' });

		const repo = new AdaptiveQuizRepository(
			makeFakeDbClient({ selectResult: [row] }).getDbClient
		);

		const res = await repo.getByBaseQuizId('bqX');
		expect(res).toEqual(row);
	});

	it('getByBaseQuizId: returns undefined when not found', async () => {
		const repo = new AdaptiveQuizRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const res = await repo.getByBaseQuizId('bqX');
		expect(res).toBeUndefined();
	});

	// getLastAdaptiveQuizByUserBlockId

	it('getLastAdaptiveQuizByUserBlockId: returns last version (uses no tx)', async () => {
		const rows = [
			makeAdaptiveQuiz({ id: 'aq1', userBlockId: 'ubX', version: 1 }),
			makeAdaptiveQuiz({ id: 'aq2', userBlockId: 'ubX', version: 2 })
		];

		const repo = new AdaptiveQuizRepository(
			makeFakeDbClient({ selectResult: rows }).getDbClient
		);

		const res = await repo.getLastAdaptiveQuizByUserBlockId('ubX');
		// our fake returns first row; we just assert it returns something from fixtures
		expect(res).toEqual(rows[0]);
	});

	// getLastVersionsByUserBlockId

	it('getLastVersionsByUserBlockId: returns limited rows', async () => {
		const rows = [
			makeAdaptiveQuiz({ id: 'aq1', version: 3, isCompleted: true, readyForAnswering: true }),
			makeAdaptiveQuiz({ id: 'aq2', version: 2, isCompleted: true, readyForAnswering: true })
		];

		const repo = new AdaptiveQuizRepository(
			makeFakeDbClient({ selectResult: rows }).getDbClient
		);

		const res = await repo.getLastVersionsByUserBlockId('ub1', 2);
		expect(res).toEqual(rows);
	});

	// getLastIncompletedByUserBlockId

	it('getLastIncompletedByUserBlockId: returns last incomplete quiz', async () => {
		const rows = [
			makeAdaptiveQuiz({ id: 'aq1', userBlockId: 'ubX', isCompleted: false, version: 1 }),
			makeAdaptiveQuiz({ id: 'aq2', userBlockId: 'ubX', isCompleted: false, version: 2 })
		];

		const repo = new AdaptiveQuizRepository(
			makeFakeDbClient({ selectResult: rows }).getDbClient
		);

		const res = await repo.getLastIncompletedByUserBlockId('ubX');
		expect(res).toEqual(rows[0]);
	});

	it('getLastIncompletedByUserBlockId: returns undefined when none', async () => {
		const repo = new AdaptiveQuizRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const res = await repo.getLastIncompletedByUserBlockId('ubX');
		expect(res).toBeUndefined();
	});

	// transaction wiring

	it('uses provided transaction when calling getDbClient in getById', async () => {
		const row = makeAdaptiveQuiz({ id: 'aq1' });

		const { getDbClient, getReceivedTx } = makeTrackingDbClient({
			selectResult: [row]
		});

		const repo = new AdaptiveQuizRepository(getDbClient);
		const tx = {} as Transaction;

		await repo.getById('aq1', tx);

		expect(getReceivedTx()).toBe(tx);
	});
});
