import { describe, it, expect } from 'bun:test';
import type { BaseQuizDto, CreateBaseQuizDto, UpdateBaseQuizDto } from '../../../src/db/schema';
import type { Transaction } from '../../../src/types';
import { BaseQuizRepository } from '../../../src/repositories/baseQuizRepository';

function makeBaseQuiz(overrides: Partial<BaseQuizDto> = {}): BaseQuizDto {
	return {
		id: 'quiz1',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

type Fixtures = {
	selectResult?: BaseQuizDto[];
	insertReturn?: BaseQuizDto[];
	updateReturn?: BaseQuizDto[];
	deleteReturn?: BaseQuizDto[];
};

function makeFakeDbClient(fixtures: Fixtures) {
	const api = {
		select() {
			return {
				from(_table: unknown) {
					return {
						where(_expr: unknown): Promise<BaseQuizDto[]> {
							return Promise.resolve(fixtures.selectResult ?? []);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateBaseQuizDto | CreateBaseQuizDto[]) {
					return {
						returning(): Promise<BaseQuizDto[]> {
							const result = fixtures.insertReturn ?? [];
							return Promise.resolve(result);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateBaseQuizDto) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<BaseQuizDto[]> {
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
						returning(): Promise<BaseQuizDto[]> {
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
						where(_expr: unknown): Promise<BaseQuizDto[]> {
							return Promise.resolve(fixtures.selectResult ?? []);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateBaseQuizDto | CreateBaseQuizDto[]) {
					return {
						returning(): Promise<BaseQuizDto[]> {
							const result = fixtures.insertReturn ?? [];
							return Promise.resolve(result);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateBaseQuizDto) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<BaseQuizDto[]> {
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
						returning(): Promise<BaseQuizDto[]> {
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

describe('BaseQuizRepository', () => {
	// getById

	it('getById: returns quiz when it exists', async () => {
		const row = makeBaseQuiz({ id: 'quiz1' });
		const repo = new BaseQuizRepository(makeFakeDbClient({ selectResult: [row] }).getDbClient);

		const found = await repo.getById('quiz1');
		expect(found).toEqual(row);
	});

	it('getById: returns undefined when quiz does not exist', async () => {
		const repo = new BaseQuizRepository(makeFakeDbClient({ selectResult: [] }).getDbClient);

		const found = await repo.getById('missing');
		expect(found).toBeUndefined();
	});

	it('getById: returns first row when multiple rows are returned', async () => {
		const first = makeBaseQuiz({ id: 'quiz1' });
		const second = makeBaseQuiz({ id: 'quiz1' });

		const repo = new BaseQuizRepository(
			makeFakeDbClient({ selectResult: [first, second] }).getDbClient
		);

		const found = await repo.getById('quiz1');
		expect(found).toEqual(first);
	});

	// create

	it('create: returns inserted row from returning()', async () => {
		const input = {
			// whatever fields CreateBaseQuizDto requires beyond BaseQuizDto metadata
		} as CreateBaseQuizDto;

		const returned = makeBaseQuiz({ id: 'quiz2' });

		const repo = new BaseQuizRepository(makeFakeDbClient({ insertReturn: [returned] }).getDbClient);

		const created = await repo.create(input);
		expect(created).toEqual(returned);
	});

	// update

	it('update: returns updated row from returning()', async () => {
		const patch = {
			// some updatable fields, if any
		} as UpdateBaseQuizDto;

		const returned = makeBaseQuiz({ id: 'quiz1' });

		const repo = new BaseQuizRepository(makeFakeDbClient({ updateReturn: [returned] }).getDbClient);

		const updated = await repo.update('quiz1', patch);
		expect(updated).toEqual(returned);
	});

	it('update: returns undefined when returning() is empty', async () => {
		const patch = {
			// some updatable fields, if any
		} as UpdateBaseQuizDto;

		const repo = new BaseQuizRepository(makeFakeDbClient({ updateReturn: [] }).getDbClient);

		const updated = await repo.update('quiz1', patch);
		expect(updated).toBeUndefined();
	});

	// deleteById

	it('deleteById: returns deleted row from returning()', async () => {
		const deleted = makeBaseQuiz({ id: 'quiz1' });

		const repo = new BaseQuizRepository(makeFakeDbClient({ deleteReturn: [deleted] }).getDbClient);

		const res = await repo.deleteById('quiz1');
		expect(res).toEqual(deleted);
	});

	it('deleteById: returns undefined when nothing was deleted', async () => {
		const repo = new BaseQuizRepository(makeFakeDbClient({ deleteReturn: [] }).getDbClient);

		const res = await repo.deleteById('quiz1');
		expect(res).toBeUndefined();
	});

	// getByIds

	it('getByIds: returns array of rows', async () => {
		const rows: BaseQuizDto[] = [makeBaseQuiz({ id: 'quiz1' }), makeBaseQuiz({ id: 'quiz2' })];

		const repo = new BaseQuizRepository(makeFakeDbClient({ selectResult: rows }).getDbClient);

		const res = await repo.getByIds(['quiz1', 'quiz2']);
		expect(res).toEqual(rows);
	});

	it('getByIds: returns empty array when nothing found', async () => {
		const repo = new BaseQuizRepository(makeFakeDbClient({ selectResult: [] }).getDbClient);

		const res = await repo.getByIds(['quiz1', 'quiz2']);
		expect(res).toEqual([]);
	});

	// transaction wiring

	it('uses provided transaction when calling getDbClient in getById', async () => {
		const row = makeBaseQuiz({ id: 'quiz1' });

		const { getDbClient, getReceivedTx } = makeTrackingDbClient({
			selectResult: [row]
		});

		const repo = new BaseQuizRepository(getDbClient);
		const tx = {} as Transaction;

		await repo.getById('quiz1', tx);

		expect(getReceivedTx()).toBe(tx);
	});
});
