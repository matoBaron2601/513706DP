import { describe, it, expect } from 'bun:test';
import type { UserBlockDto, CreateUserBlockDto, UpdateUserBlockDto } from '../../../src/db/schema';
import type { Transaction } from '../../../src/types';
import { UserBlockRepository } from '../../../src/repositories/userBlockRepository';

function makeUserBlock(overrides: Partial<UserBlockDto> = {}): UserBlockDto {
	return {
		id: 'ub1',
		userId: 'u1',
		blockId: 'b1',
		completed: false,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

type Fixtures = {
	selectResult?: UserBlockDto[];
	insertReturn?: UserBlockDto[];
	updateReturn?: UserBlockDto[];
	deleteReturn?: UserBlockDto[];
};

function makeFakeDbClient(fixtures: Fixtures) {
	const api = {
		select() {
			return {
				from(_table: unknown) {
					return {
						where(_expr: unknown): Promise<UserBlockDto[]> {
							return Promise.resolve(fixtures.selectResult ?? []);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateUserBlockDto | CreateUserBlockDto[]) {
					return {
						returning(): Promise<UserBlockDto[]> {
							return Promise.resolve(fixtures.insertReturn ?? []);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateUserBlockDto) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<UserBlockDto[]> {
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
						returning(): Promise<UserBlockDto[]> {
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
						where(_expr: unknown): Promise<UserBlockDto[]> {
							return Promise.resolve(fixtures.selectResult ?? []);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateUserBlockDto | CreateUserBlockDto[]) {
					return {
						returning(): Promise<UserBlockDto[]> {
							return Promise.resolve(fixtures.insertReturn ?? []);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateUserBlockDto) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<UserBlockDto[]> {
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
						returning(): Promise<UserBlockDto[]> {
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

describe('UserBlockRepository', () => {
	// getById

	it('getById: returns userBlock when it exists', async () => {
		const row = makeUserBlock({ id: 'ub1' });

		const repo = new UserBlockRepository(makeFakeDbClient({ selectResult: [row] }).getDbClient);

		const found = await repo.getById('ub1');
		expect(found).toEqual(row);
	});

	it('getById: returns undefined when userBlock does not exist', async () => {
		const repo = new UserBlockRepository(makeFakeDbClient({ selectResult: [] }).getDbClient);

		const found = await repo.getById('missing');
		expect(found).toBeUndefined();
	});

	it('getById: returns first row when multiple rows are returned', async () => {
		const first = makeUserBlock({ id: 'ub1', completed: false });
		const second = makeUserBlock({ id: 'ub1', completed: true });

		const repo = new UserBlockRepository(
			makeFakeDbClient({ selectResult: [first, second] }).getDbClient
		);

		const found = await repo.getById('ub1');
		expect(found).toEqual(first);
	});

	// getByIds

	it('getByIds: returns array of rows', async () => {
		const rows: UserBlockDto[] = [
			makeUserBlock({ id: 'ub1' }),
			makeUserBlock({ id: 'ub2', blockId: 'b2' })
		];

		const repo = new UserBlockRepository(makeFakeDbClient({ selectResult: rows }).getDbClient);

		const res = await repo.getByIds(['ub1', 'ub2']);
		expect(res).toEqual(rows);
	});

	it('getByIds: returns empty array when nothing found', async () => {
		const repo = new UserBlockRepository(makeFakeDbClient({ selectResult: [] }).getDbClient);

		const res = await repo.getByIds(['ub1', 'ub2']);
		expect(res).toEqual([]);
	});

	// create

	it('create: returns inserted row from returning()', async () => {
		const input = {
			userId: 'u1',
			blockId: 'b1',
			completed: false
		} as CreateUserBlockDto;

		const returned = makeUserBlock({
			id: 'ub2',
			userId: 'u1',
			blockId: 'b1',
			completed: false
		});

		const repo = new UserBlockRepository(
			makeFakeDbClient({ insertReturn: [returned] }).getDbClient
		);

		const created = await repo.create(input);
		expect(created).toEqual(returned);
	});

	// update

	it('update: returns updated row from returning()', async () => {
		const patch = {
			completed: true
		} as UpdateUserBlockDto;

		const returned = makeUserBlock({
			id: 'ub1',
			completed: true
		});

		const repo = new UserBlockRepository(
			makeFakeDbClient({ updateReturn: [returned] }).getDbClient
		);

		const updated = await repo.update('ub1', patch);
		expect(updated).toEqual(returned);
	});

	it('update: returns undefined when returning() is empty', async () => {
		const patch = {
			completed: true
		} as UpdateUserBlockDto;

		const repo = new UserBlockRepository(makeFakeDbClient({ updateReturn: [] }).getDbClient);

		const updated = await repo.update('ub1', patch);
		expect(updated).toBeUndefined();
	});

	// delete

	it('delete: returns deleted row from returning()', async () => {
		const deleted = makeUserBlock({ id: 'ub1' });

		const repo = new UserBlockRepository(makeFakeDbClient({ deleteReturn: [deleted] }).getDbClient);

		const res = await repo.delete('ub1');
		expect(res).toEqual(deleted);
	});

	it('delete: returns undefined when nothing was deleted', async () => {
		const repo = new UserBlockRepository(makeFakeDbClient({ deleteReturn: [] }).getDbClient);

		const res = await repo.delete('ub1');
		expect(res).toBeUndefined();
	});

	// getByBothIds

	it('getByBothIds: returns matching row for userId + blockId', async () => {
		const row = makeUserBlock({
			id: 'ub1',
			userId: 'uX',
			blockId: 'bY'
		});

		const repo = new UserBlockRepository(makeFakeDbClient({ selectResult: [row] }).getDbClient);

		const found = await repo.getByUserIdAndBlockId('uX', 'bY');

		expect(found).toEqual(row);
	});

	it('getByBothIds: returns undefined when no matching row', async () => {
		const repo = new UserBlockRepository(makeFakeDbClient({ selectResult: [] }).getDbClient);

		const found = await repo.getByUserIdAndBlockId('uX', 'bY');

		expect(found).toBeUndefined();
	});

	// transaction wiring

	it('uses provided transaction when calling getDbClient in getById', async () => {
		const row = makeUserBlock({ id: 'ub1' });

		const { getDbClient, getReceivedTx } = makeTrackingDbClient({
			selectResult: [row]
		});

		const repo = new UserBlockRepository(getDbClient);
		const tx = {} as Transaction;

		await repo.getById('ub1', tx);

		expect(getReceivedTx()).toBe(tx);
	});
});
