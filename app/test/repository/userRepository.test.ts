import { describe, it, expect } from 'bun:test';
import type { CreateUserDto, UpdateUserDto, UserDto } from '../../src/db/schema';
import type { Transaction } from '../../src/types';
import { UserRepository } from '../../src/repositories/userRepository';

function makeUser(overrides: Partial<UserDto> = {}): UserDto {
	return {
		id: 'u1',
		email: 'a@a.com',
		name: 'Alice',
		profilePicture: 'https://example.com/p.png',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

type Fixtures = {
	selectResult?: UserDto[];
	insertReturn?: UserDto[];
	updateReturn?: UserDto[];
	deleteReturn?: UserDto[];
};

function makeFakeDbClient(fixtures: Fixtures) {
	const api = {
		select() {
			return {
				from(_table: unknown) {
					return {
						where(_expr: unknown): Promise<UserDto[]> {
							const result = fixtures.selectResult ?? [];
							return Promise.resolve(result);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateUserDto) {
					return {
						returning(): Promise<UserDto[]> {
							const result = fixtures.insertReturn ?? [];
							return Promise.resolve(result);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateUserDto) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<UserDto[]> {
									const result = fixtures.updateReturn ?? [];
									return Promise.resolve(result);
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
						returning(): Promise<UserDto[]> {
							const result = fixtures.deleteReturn ?? [];
							return Promise.resolve(result);
						}
					};
				}
			};
		}
	};

	const getDbClient = () => api;
	return { getDbClient };
}

function makeTrackingDbClient(fixtures: Fixtures) {
	const api = {
		select() {
			return {
				from(_table: unknown) {
					return {
						where(_expr: unknown): Promise<UserDto[]> {
							const result = fixtures.selectResult ?? [];
							return Promise.resolve(result);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateUserDto) {
					return {
						returning(): Promise<UserDto[]> {
							const result = fixtures.insertReturn ?? [];
							return Promise.resolve(result);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateUserDto) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<UserDto[]> {
									const result = fixtures.updateReturn ?? [];
									return Promise.resolve(result);
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
						returning(): Promise<UserDto[]> {
							const result = fixtures.deleteReturn ?? [];
							return Promise.resolve(result);
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

	const getReceivedTx = () => receivedTx;

	return { getDbClient, getReceivedTx };
}

describe('UserRepository', () => {
	// ---------- getById ----------

	it('getById: returns user when it exists', async () => {
		const row = makeUser({ id: 'u1' });
		const repo = new UserRepository(makeFakeDbClient({ selectResult: [row] }).getDbClient);

		const found = await repo.getById('u1');
		expect(found).toEqual(row);
	});

	it('getById: returns undefined when user does not exist', async () => {
		const repo = new UserRepository(makeFakeDbClient({ selectResult: [] }).getDbClient);

		const found = await repo.getById('missing');
		expect(found).toBeUndefined();
	});

	it('getById: returns the first row when multiple rows are returned', async () => {
		const first = makeUser({ id: 'u1', email: 'first@example.com' });
		const second = makeUser({ id: 'u1', email: 'second@example.com' });
		const repo = new UserRepository(
			makeFakeDbClient({ selectResult: [first, second] }).getDbClient
		);

		const found = await repo.getById('u1');
		expect(found).toEqual(first);
	});

	// ---------- getByEmail ----------

	it('getByEmail: returns user by email', async () => {
		const row = makeUser({ id: 'u2', email: 'b@b.com', name: 'Bob' });
		const repo = new UserRepository(makeFakeDbClient({ selectResult: [row] }).getDbClient);

		const found = await repo.getByEmail('b@b.com');
		expect(found).toEqual(row);
	});

	it('getByEmail: returns undefined when no user found', async () => {
		const repo = new UserRepository(makeFakeDbClient({ selectResult: [] }).getDbClient);

		const found = await repo.getByEmail('notfound@example.com');
		expect(found).toBeUndefined();
	});

	// ---------- create ----------

	it('create: returns inserted row from returning()', async () => {
		const input = {
			email: 'c@c.com',
			name: 'Carol',
			profilePicture: 'https://example.com/c.png'
			// add any other required fields of CreateUserDto if needed
		} as CreateUserDto;

		const returned = makeUser({
			id: 'u3',
			email: 'c@c.com',
			name: 'Carol',
			profilePicture: 'https://example.com/c.png'
		});

		const repo = new UserRepository(makeFakeDbClient({ insertReturn: [returned] }).getDbClient);

		const created = await repo.create(input);
		expect(created).toEqual(returned);
	});

	// ---------- update ----------

	it('update: returns updated row from returning()', async () => {
		const patch = {
			name: 'Alice 2',
			profilePicture: 'https://example.com/p2.png'
		} as UpdateUserDto;

		const returned = makeUser({
			name: 'Alice 2',
			profilePicture: 'https://example.com/p2.png'
		});

		const repo = new UserRepository(makeFakeDbClient({ updateReturn: [returned] }).getDbClient);

		const updated = await repo.update('u1', patch);
		expect(updated).toEqual(returned);
	});

	it('update: returns undefined when returning() is empty', async () => {
		const patch = {
			name: 'Alice 2'
		} as UpdateUserDto;

		const repo = new UserRepository(makeFakeDbClient({ updateReturn: [] }).getDbClient);

		const updated = await repo.update('u1', patch);
		expect(updated).toBeUndefined();
	});

	// ---------- delete ----------

	it('delete: returns deleted row from returning()', async () => {
		const deleted = makeUser({ id: 'u1' });

		const repo = new UserRepository(makeFakeDbClient({ deleteReturn: [deleted] }).getDbClient);

		const res = await repo.delete('u1');
		expect(res).toEqual(deleted);
	});

	it('delete: returns undefined when nothing was deleted', async () => {
		const repo = new UserRepository(makeFakeDbClient({ deleteReturn: [] }).getDbClient);

		const res = await repo.delete('u1');
		expect(res).toBeUndefined();
	});

	// ---------- getByIds ----------

	it('getByIds: returns array of rows', async () => {
		const rows: UserDto[] = [
			makeUser({ id: 'u1' }),
			makeUser({ id: 'u2', email: 'b@b.com', name: 'Bob' })
		];

		const repo = new UserRepository(makeFakeDbClient({ selectResult: rows }).getDbClient);

		const res = await repo.getByIds(['u1', 'u2']);
		expect(res).toEqual(rows);
	});

	it('getByIds: returns empty array when nothing found', async () => {
		const repo = new UserRepository(makeFakeDbClient({ selectResult: [] }).getDbClient);

		const res = await repo.getByIds(['u1', 'u2']);
		expect(res).toEqual([]);
	});

	// ---------- transactions / getDbClient argument wiring ----------

	it('uses the provided transaction when calling getDbClient in getById', async () => {
		const row = makeUser({ id: 'u1' });
		const { getDbClient, getReceivedTx } = makeTrackingDbClient({
			selectResult: [row]
		});

		const repo = new UserRepository(getDbClient);
		const tx = {} as Transaction;

		await repo.getById('u1', tx);

		expect(getReceivedTx()).toBe(tx);
	});

	it('uses the provided transaction when calling getDbClient in create', async () => {
		const input = {
			email: 'tx@tx.com',
			name: 'Tx User',
			profilePicture: 'https://example.com/tx.png'
		} as CreateUserDto;

		const returned = makeUser({
			id: 'u-tx',
			email: 'tx@tx.com',
			name: 'Tx User',
			profilePicture: 'https://example.com/tx.png'
		});

		const { getDbClient, getReceivedTx } = makeTrackingDbClient({
			insertReturn: [returned]
		});

		const repo = new UserRepository(getDbClient);
		const tx = {} as Transaction;

		const created = await repo.create(input, tx);

		expect(created).toEqual(returned);
		expect(getReceivedTx()).toBe(tx);
	});
});
