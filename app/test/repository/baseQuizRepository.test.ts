// test/repositories/baseQuizRepository.test.ts
import { describe, it, expect } from 'bun:test';
import type {
	BaseQuizDto,
	CreateBaseQuizDto,
	UpdateBaseQuizDto
} from '../../src/db/schema';
import type { Transaction } from '../../src/types';
import { BaseQuizRepository } from '../../src/repositories/baseQuizRepository';

function makeBaseQuiz(overrides: Partial<BaseQuizDto> = {}): BaseQuizDto {
	return {
		id: 'q1',
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
				from() {
					return {
						where(): Promise<BaseQuizDto[]> {
							return Promise.resolve(fixtures.selectResult ?? []);
						}
					};
				}
			};
		},
		insert() {
			return {
				values() {
					return {
						returning(): Promise<BaseQuizDto[]> {
							return Promise.resolve(fixtures.insertReturn ?? []);
						}
					};
				}
			};
		},
		update() {
			return {
				set() {
					return {
						where() {
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
		delete() {
			return {
				where() {
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
	const api = {
		select() {
			return {
				from() {
					return {
						where(): Promise<BaseQuizDto[]> {
							return Promise.resolve(fixtures.selectResult ?? []);
						}
					};
				}
			};
		},
		insert() {
			return {
				values() {
					return {
						returning(): Promise<BaseQuizDto[]> {
							return Promise.resolve(fixtures.insertReturn ?? []);
						}
					};
				}
			};
		},
		update() {
			return {
				set() {
					return {
						where() {
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
		delete() {
			return {
				where() {
					return {
						returning(): Promise<BaseQuizDto[]> {
							return Promise.resolve(fixtures.deleteReturn ?? []);
						}
					};
				}
			};
		}
	};

	let receivedTx: Transaction | undefined;

	const getDbClient = (tx?: Transaction) => {
		receivedTx = tx;
		return api;
	};

	return { getDbClient, getReceivedTx: () => receivedTx };
}

describe('BaseQuizRepository', () => {
	it('getById: returns quiz', async () => {
		const quiz = makeBaseQuiz({ id: 'q1' });

		const repo = new BaseQuizRepository(
			makeFakeDbClient({ selectResult: [quiz] }).getDbClient
		);

		const res = await repo.getById('q1');
		expect(res).toEqual(quiz);
	});

	it('getById: returns undefined when not found', async () => {
		const repo = new BaseQuizRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const res = await repo.getById('missing');
		expect(res).toBeUndefined();
	});

	it('create: returns created quiz', async () => {
		const created = makeBaseQuiz({ id: 'new' });

		const repo = new BaseQuizRepository(
			makeFakeDbClient({ insertReturn: [created] }).getDbClient
		);

		const res = await repo.create({} as CreateBaseQuizDto);
		expect(res).toEqual(created);
	});

	it('update: returns updated quiz', async () => {
		const updated = makeBaseQuiz({ id: 'q1', updatedAt: new Date() });

		const repo = new BaseQuizRepository(
			makeFakeDbClient({ updateReturn: [updated] }).getDbClient
		);

		const res = await repo.update('q1', {} as UpdateBaseQuizDto);
		expect(res).toEqual(updated);
	});

	it('update: returns undefined when no row updated', async () => {
		const repo = new BaseQuizRepository(
			makeFakeDbClient({ updateReturn: [] }).getDbClient
		);

		const res = await repo.update('q1', {} as UpdateBaseQuizDto);
		expect(res).toBeUndefined();
	});

	it('deleteById: returns deleted quiz', async () => {
		const deleted = makeBaseQuiz({ id: 'q1' });

		const repo = new BaseQuizRepository(
			makeFakeDbClient({ deleteReturn: [deleted] }).getDbClient
		);

		const res = await repo.deleteById('q1');
		expect(res).toEqual(deleted);
	});

	it('deleteById: returns undefined when nothing deleted', async () => {
		const repo = new BaseQuizRepository(
			makeFakeDbClient({ deleteReturn: [] }).getDbClient
		);

		const res = await repo.deleteById('q1');
		expect(res).toBeUndefined();
	});

	it('getByIds: returns rows', async () => {
		const rows = [
			makeBaseQuiz({ id: 'q1' }),
			makeBaseQuiz({ id: 'q2' })
		];

		const repo = new BaseQuizRepository(
			makeFakeDbClient({ selectResult: rows }).getDbClient
		);

		const res = await repo.getByIds(['q1', 'q2']);
		expect(res).toEqual(rows);
	});

	it('transaction: passes tx to getDbClient', async () => {
		const quiz = makeBaseQuiz({ id: 'q1' });

		const { getDbClient, getReceivedTx } = makeTrackingDbClient({
			selectResult: [quiz]
		});

		const repo = new BaseQuizRepository(getDbClient);

		const tx = {} as Transaction;
		await repo.getById('q1', tx);

		expect(getReceivedTx()).toBe(tx);
	});
});
