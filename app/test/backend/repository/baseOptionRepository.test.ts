import { describe, it, expect } from 'bun:test';
import type {
	BaseOptionDto,
	CreateBaseOptionDto,
	UpdateBaseOptionDto
} from '../../../src/db/schema';
import type { Transaction } from '../../../src/types';
import { BaseOptionRepository } from '../../../src/repositories/baseOptionRepository';

function makeBaseOption(overrides: Partial<BaseOptionDto> = {}): BaseOptionDto {
	return {
		id: 'o1',
		baseQuestionId: 'q1',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		optionText: 'Option 1',
		isCorrect: false,
		...overrides
	};
}

type Fixtures = {
	selectResult?: BaseOptionDto[];
	insertReturn?: BaseOptionDto[];
	updateReturn?: BaseOptionDto[];
	deleteReturn?: BaseOptionDto[];
	createManyReturn?: BaseOptionDto[];
};

function makeFakeDbClient(fixtures: Fixtures) {
	const api = {
		select() {
			return {
				from(_table: unknown) {
					return {
						where(_expr: unknown): Promise<BaseOptionDto[]> {
							return Promise.resolve(fixtures.selectResult ?? []);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateBaseOptionDto | CreateBaseOptionDto[]) {
					return {
						returning(): Promise<BaseOptionDto[]> {
							const result = fixtures.insertReturn ?? fixtures.createManyReturn ?? [];
							return Promise.resolve(result);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateBaseOptionDto) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<BaseOptionDto[]> {
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
						returning(): Promise<BaseOptionDto[]> {
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
				from(_table: unknown) {
					return {
						where(_expr: unknown): Promise<BaseOptionDto[]> {
							return Promise.resolve(fixtures.selectResult ?? []);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateBaseOptionDto | CreateBaseOptionDto[]) {
					return {
						returning(): Promise<BaseOptionDto[]> {
							const result = fixtures.insertReturn ?? fixtures.createManyReturn ?? [];
							return Promise.resolve(result);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateBaseOptionDto) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<BaseOptionDto[]> {
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
						returning(): Promise<BaseOptionDto[]> {
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

describe('BaseOptionRepository', () => {
	// getById

	it('getById: returns option when it exists', async () => {
		const row = makeBaseOption({ id: 'o1' });
		const repo = new BaseOptionRepository(makeFakeDbClient({ selectResult: [row] }).getDbClient);

		const found = await repo.getById('o1');
		expect(found).toEqual(row);
	});

	it('getById: returns undefined when option does not exist', async () => {
		const repo = new BaseOptionRepository(makeFakeDbClient({ selectResult: [] }).getDbClient);

		const found = await repo.getById('missing');
		expect(found).toBeUndefined();
	});

	it('getById: returns first row when multiple rows are returned', async () => {
		const first = makeBaseOption({ id: 'o1', optionText: 'first' });
		const second = makeBaseOption({ id: 'o1', optionText: 'second' });

		const repo = new BaseOptionRepository(
			makeFakeDbClient({ selectResult: [first, second] }).getDbClient
		);

		const found = await repo.getById('o1');
		expect(found).toEqual(first);
	});

	// create

	it('create: returns inserted row from returning()', async () => {
		const input = {
			baseQuestionId: 'q1',
			optionText: 'Option X',
			isCorrect: true
		} as CreateBaseOptionDto;

		const returned = makeBaseOption({
			id: 'o2',
			baseQuestionId: 'q1',
			optionText: 'Option X',
			isCorrect: true
		});

		const repo = new BaseOptionRepository(
			makeFakeDbClient({ insertReturn: [returned] }).getDbClient
		);

		const created = await repo.create(input);
		expect(created).toEqual(returned);
	});

	// update

	it('update: returns updated row from returning()', async () => {
		const patch = {
			optionText: 'Updated option',
			isCorrect: true
		} as UpdateBaseOptionDto;

		const returned = makeBaseOption({
			id: 'o1',
			optionText: 'Updated option',
			isCorrect: true
		});

		const repo = new BaseOptionRepository(
			makeFakeDbClient({ updateReturn: [returned] }).getDbClient
		);

		const updated = await repo.update('o1', patch);
		expect(updated).toEqual(returned);
	});

	it('update: returns undefined when returning() is empty', async () => {
		const patch = {
			optionText: 'Updated option'
		} as UpdateBaseOptionDto;

		const repo = new BaseOptionRepository(makeFakeDbClient({ updateReturn: [] }).getDbClient);

		const updated = await repo.update('o1', patch);
		expect(updated).toBeUndefined();
	});

	// deleteById

	it('deleteById: returns deleted row from returning()', async () => {
		const deleted = makeBaseOption({ id: 'o1' });

		const repo = new BaseOptionRepository(
			makeFakeDbClient({ deleteReturn: [deleted] }).getDbClient
		);

		const res = await repo.deleteById('o1');
		expect(res).toEqual(deleted);
	});

	it('deleteById: returns undefined when nothing was deleted', async () => {
		const repo = new BaseOptionRepository(makeFakeDbClient({ deleteReturn: [] }).getDbClient);

		const res = await repo.deleteById('o1');
		expect(res).toBeUndefined();
	});

	// getByIds

	it('getByIds: returns array of rows', async () => {
		const rows: BaseOptionDto[] = [
			makeBaseOption({ id: 'o1' }),
			makeBaseOption({ id: 'o2', optionText: 'second' })
		];

		const repo = new BaseOptionRepository(makeFakeDbClient({ selectResult: rows }).getDbClient);

		const res = await repo.getByIds(['o1', 'o2']);
		expect(res).toEqual(rows);
	});

	it('getByIds: returns empty array when nothing found', async () => {
		const repo = new BaseOptionRepository(makeFakeDbClient({ selectResult: [] }).getDbClient);

		const res = await repo.getByIds(['o1', 'o2']);
		expect(res).toEqual([]);
	});

	// createMany

	it('createMany: returns inserted rows', async () => {
		const input: CreateBaseOptionDto[] = [
			{
				baseQuestionId: 'q1',
				optionText: 'O1',
				isCorrect: false
			} as CreateBaseOptionDto,
			{
				baseQuestionId: 'q1',
				optionText: 'O2',
				isCorrect: true
			} as CreateBaseOptionDto
		];

		const returned: BaseOptionDto[] = [
			makeBaseOption({ id: 'o1', optionText: 'O1', isCorrect: false }),
			makeBaseOption({ id: 'o2', optionText: 'O2', isCorrect: true })
		];

		const repo = new BaseOptionRepository(
			makeFakeDbClient({ createManyReturn: returned }).getDbClient
		);

		const res = await repo.createMany(input);
		expect(res).toEqual(returned);
	});

	// getByBaseQuestionId

	it('getByBaseQuestionId: returns options for given baseQuestionId', async () => {
		const rows: BaseOptionDto[] = [
			makeBaseOption({ id: 'o1', baseQuestionId: 'qX' }),
			makeBaseOption({ id: 'o2', baseQuestionId: 'qX' })
		];

		const repo = new BaseOptionRepository(makeFakeDbClient({ selectResult: rows }).getDbClient);

		const res = await repo.getByBaseQuestionId('qX');
		expect(res).toEqual(rows);
	});

	// getManyByBaseQuestionIds

	it('getManyByBaseQuestionIds: returns options for given baseQuestionIds', async () => {
		const rows: BaseOptionDto[] = [
			makeBaseOption({ id: 'o1', baseQuestionId: 'q1' }),
			makeBaseOption({ id: 'o2', baseQuestionId: 'q2' }),
			makeBaseOption({ id: 'o3', baseQuestionId: 'q1' })
		];

		const repo = new BaseOptionRepository(makeFakeDbClient({ selectResult: rows }).getDbClient);

		const res = await repo.getManyByBaseQuestionIds(['q1', 'q2']);
		expect(res).toEqual(rows);
	});

	// transaction wiring

	it('uses provided transaction when calling getDbClient in getById', async () => {
		const row = makeBaseOption({ id: 'o1' });

		const { getDbClient, getReceivedTx } = makeTrackingDbClient({
			selectResult: [row]
		});

		const repo = new BaseOptionRepository(getDbClient);
		const tx = {} as Transaction;

		await repo.getById('o1', tx);

		expect(getReceivedTx()).toBe(tx);
	});
});
