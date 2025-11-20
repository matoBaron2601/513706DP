import { describe, it, expect } from 'bun:test';
import type {
	UserDto,
	CreateUserDto,
	UpdateUserDto
} from '../../src/db/schema';
import type { Transaction } from '../../src/types';
import { UserRepository } from '../../src/repositories/userRepository';

function makeUser(overrides: Partial<UserDto> = {}): UserDto {
	return {
		id: 'u1',
		name: 'Test User',
		email: 'test@example.com',
		profilePicture: 'https://example.com/avatar.png',
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
							return Promise.resolve(fixtures.selectResult ?? []);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateUserDto | CreateUserDto[]) {
					return {
						returning(): Promise<UserDto[]> {
							return Promise.resolve(fixtures.insertReturn ?? []);
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
						returning(): Promise<UserDto[]> {
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
						where(_expr: unknown): Promise<UserDto[]> {
							return Promise.resolve(fixtures.selectResult ?? []);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateUserDto | CreateUserDto[]) {
					return {
						returning(): Promise<UserDto[]> {
							return Promise.resolve(fixtures.insertReturn ?? []);
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
						returning(): Promise<UserDto[]> {
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

describe('UserRepository', () => {
	// getById

	it('getById: returns user when it exists', async () => {
		const row = makeUser({ id: 'u1' });

		const repo = new UserRepository(
			makeFakeDbClient({ selectResult: [row] }).getDbClient
		);

		const found = await repo.getById('u1');
		expect(found).toEqual(row);
	});

	it('getById: returns undefined when user does not exist', async () => {
		const repo = new UserRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const found = await repo.getById('missing');
		expect(found).toBeUndefined();
	});

	it('getById: returns first row when multiple rows are returned', async () => {
		const first = makeUser({ id: 'u1', email: 'first@example.com' });
		const second = makeUser({ id: 'u1', email: 'second@example.com' });

		const repo = new UserRepository(
			makeFakeDbClient({ selectResult: [first, second] }).getDbClient
		);

		const found = await repo.getById('u1');
		expect(found).toEqual(first);
	});

	// getByEmail

	it('getByEmail: returns user when email exists', async () => {
		const row = makeUser({ email: 'user@example.com' });

		const repo = new UserRepository(
			makeFakeDbClient({ selectResult: [row] }).getDbClient
		);

		const found = await repo.getByEmail('user@example.com');
		expect(found).toEqual(row);
	});

	it('getByEmail: returns undefined when email does not exist', async () => {
		const repo = new UserRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const found = await repo.getByEmail('missing@example.com');
		expect(found).toBeUndefined();
	});

	// create

	it('create: returns inserted row from returning()', async () => {
		const input = {
			name: 'New User',
			email: 'new@example.com',
			profilePicture: 'https://example.com/new.png'
		} as CreateUserDto;

		const returned = makeUser({
			id: 'u2',
			name: 'New User',
			email: 'new@example.com'
		});

		const repo = new UserRepository(
			makeFakeDbClient({ insertReturn: [returned] }).getDbClient
		);

		const created = await repo.create(input);
		expect(created).toEqual(returned);
	});

	// delete

	it('delete: returns deleted row from returning()', async () => {
		const deleted = makeUser({ id: 'u1' });

		const repo = new UserRepository(
			makeFakeDbClient({ deleteReturn: [deleted] }).getDbClient
		);

		const res = await repo.delete('u1');
		expect(res).toEqual(deleted);
	});

	it('delete: returns undefined when nothing was deleted', async () => {
		const repo = new UserRepository(
			makeFakeDbClient({ deleteReturn: [] }).getDbClient
		);

		const res = await repo.delete('u1');
		expect(res).toBeUndefined();
	});

	// update

	it('update: returns updated row from returning()', async () => {
		const patch = {
			name: 'Updated Name'
		} as UpdateUserDto;

		const returned = makeUser({ id: 'u1', name: 'Updated Name' });

		const repo = new UserRepository(
			makeFakeDbClient({ updateReturn: [returned] }).getDbClient
		);

		const updated = await repo.update('u1', patch);
		expect(updated).toEqual(returned);
	});

	it('update: returns undefined when returning() is empty', async () => {
		const patch = {
			name: 'Updated Name'
		} as UpdateUserDto;

		const repo = new UserRepository(
			makeFakeDbClient({ updateReturn: [] }).getDbClient
		);

		const updated = await repo.update('u1', patch);
		expect(updated).toBeUndefined();
	});

	// getByIds

	it('getByIds: returns array of rows', async () => {
		const rows: UserDto[] = [
			makeUser({ id: 'u1' }),
			makeUser({ id: 'u2', email: 'second@example.com' })
		];

		const repo = new UserRepository(
			makeFakeDbClient({ selectResult: rows }).getDbClient
		);

		const res = await repo.getByIds(['u1', 'u2']);
		expect(res).toEqual(rows);
	});

	it('getByIds: returns empty array when nothing found', async () => {
		const repo = new UserRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const res = await repo.getByIds(['u1', 'u2']);
		expect(res).toEqual([]);
	});

	// transaction wiring

	it('uses provided transaction when calling getDbClient in getById', async () => {
		const row = makeUser({ id: 'u1' });

		const { getDbClient, getReceivedTx } = makeTrackingDbClient({
			selectResult: [row]
		});

		const repo = new UserRepository(getDbClient);
		const tx = {} as Transaction;

		await repo.getById('u1', tx);

		expect(getReceivedTx()).toBe(tx);
	});
});
