import { describe, it, expect } from 'bun:test';
import type { CreateUserDto, UpdateUserDto, UserDto } from '../../../src/db/schema';
import type { Transaction } from '../../../src/types';
import { UserService } from '../../../src/services/userService';
import { NotFoundError } from '../../../src/errors/AppError';
import { UserRepository } from '../../../src/repositories/userRepository';

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

type RepoFixtures = {
	getByIdResult?: UserDto | undefined;
	getByEmailResult?: UserDto | undefined;
	createResult?: UserDto;
	updateResult?: UserDto | undefined;
	deleteResult?: UserDto | undefined;
	getByIdsResult?: UserDto[];
	getByEmailError?: unknown;
};

class FakeUserRepository implements Partial<UserRepository> {
	public fixtures: RepoFixtures;
	public receivedTxs: {
		getById?: Transaction | undefined;
		getByEmail?: Transaction | undefined;
		create?: Transaction | undefined;
		update?: Transaction | undefined;
		delete?: Transaction | undefined;
		getByIds?: Transaction | undefined;
	} = {};

	constructor(fixtures: RepoFixtures) {
		this.fixtures = fixtures;
	}

	async getById(id: string, tx?: Transaction): Promise<UserDto | undefined> {
		this.receivedTxs.getById = tx;
		return this.fixtures.getByIdResult;
	}

	async getByEmail(email: string, tx?: Transaction): Promise<UserDto | undefined> {
		this.receivedTxs.getByEmail = tx;
		if (this.fixtures.getByEmailError) {
			throw this.fixtures.getByEmailError;
		}
		return this.fixtures.getByEmailResult;
	}

	async create(newUser: CreateUserDto, tx?: Transaction): Promise<UserDto> {
		this.receivedTxs.create = tx;
		if (!this.fixtures.createResult) {
			this.fixtures.createResult = makeUser({
				id: 'created',
				email: newUser.email,
				name: newUser.name ?? 'Created User'
			});
		}
		return this.fixtures.createResult;
	}

	async update(id: string, patch: UpdateUserDto, tx?: Transaction): Promise<UserDto | undefined> {
		this.receivedTxs.update = tx;
		return this.fixtures.updateResult;
	}

	async delete(id: string, tx?: Transaction): Promise<UserDto | undefined> {
		this.receivedTxs.delete = tx;
		return this.fixtures.deleteResult;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<UserDto[]> {
		this.receivedTxs.getByIds = tx;
		return this.fixtures.getByIdsResult ?? [];
	}
}

describe('UserService', () => {
	// getById

	it('getById: returns user when found', async () => {
		const user = makeUser({ id: 'u1' });
		const repo = new FakeUserRepository({ getByIdResult: user }) as unknown as UserRepository;
		const svc = new UserService(repo);

		const res = await svc.getById('u1');
		expect(res).toEqual(user);
	});

	it('getById: throws NotFoundError when user not found', async () => {
		const repo = new FakeUserRepository({ getByIdResult: undefined }) as unknown as UserRepository;
		const svc = new UserService(repo);

		await expect(svc.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// getByEmail

	it('getByEmail: returns user when found', async () => {
		const user = makeUser({ email: 'x@example.com' });
		const repo = new FakeUserRepository({ getByEmailResult: user }) as unknown as UserRepository;
		const svc = new UserService(repo);

		const res = await svc.getByEmail('x@example.com');
		expect(res).toEqual(user);
	});

	it('getByEmail: throws NotFoundError when user not found', async () => {
		const repo = new FakeUserRepository({
			getByEmailResult: undefined
		}) as unknown as UserRepository;
		const svc = new UserService(repo);

		await expect(svc.getByEmail('nope@example.com')).rejects.toBeInstanceOf(NotFoundError);
	});

	// create

	it('create: delegates to repository.create', async () => {
		const created = makeUser({ id: 'u2' });
		const repo = new FakeUserRepository({ createResult: created }) as unknown as UserRepository;
		const svc = new UserService(repo);

		const input = {
			email: 'new@example.com',
			name: 'New User',
			profilePicture: 'pic'
		} as CreateUserDto;

		const res = await svc.create(input);
		expect(res).toEqual(created);
	});

	// update

	it('update: returns updated user when repo returns value', async () => {
		const updated = makeUser({ id: 'u1', name: 'Updated' });
		const repo = new FakeUserRepository({ updateResult: updated }) as unknown as UserRepository;
		const svc = new UserService(repo);

		const patch = { name: 'Updated' } as UpdateUserDto;
		const res = await svc.update('u1', patch);
		expect(res).toEqual(updated);
	});

	it('update: throws NotFoundError when repo returns undefined', async () => {
		const repo = new FakeUserRepository({ updateResult: undefined }) as unknown as UserRepository;
		const svc = new UserService(repo);

		const patch = { name: 'Updated' } as UpdateUserDto;
		await expect(svc.update('missing', patch)).rejects.toBeInstanceOf(NotFoundError);
	});

	// delete

	it('delete: returns deleted user when repo returns value', async () => {
		const deleted = makeUser({ id: 'u1' });
		const repo = new FakeUserRepository({ deleteResult: deleted }) as unknown as UserRepository;
		const svc = new UserService(repo);

		const res = await svc.delete('u1');
		expect(res).toEqual(deleted);
	});

	it('delete: throws NotFoundError when repo returns undefined', async () => {
		const repo = new FakeUserRepository({ deleteResult: undefined }) as unknown as UserRepository;
		const svc = new UserService(repo);

		await expect(svc.delete('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// getByIds

	it('getByIds: returns array of users', async () => {
		const users = [makeUser({ id: 'u1' }), makeUser({ id: 'u2' })];
		const repo = new FakeUserRepository({ getByIdsResult: users }) as unknown as UserRepository;
		const svc = new UserService(repo);

		const res = await svc.getByIds(['u1', 'u2']);
		expect(res).toEqual(users);
	});

	it('getByIds: returns empty array when none', async () => {
		const repo = new FakeUserRepository({ getByIdsResult: [] }) as unknown as UserRepository;
		const svc = new UserService(repo);

		const res = await svc.getByIds(['u1', 'u2']);
		expect(res).toEqual([]);
	});

	// getOrCreateUser

	it('getOrCreateUser: returns existing user when found by email', async () => {
		const existing = makeUser({ id: 'u1', email: 'exists@example.com' });
		const fixtures: RepoFixtures = {
			getByEmailResult: existing,
			createResult: makeUser({ id: 'created' })
		};
		const fakeRepo = new FakeUserRepository(fixtures);
		const repo = fakeRepo as unknown as UserRepository;
		const svc = new UserService(repo);

		const input = {
			email: 'exists@example.com',
			name: 'Whatever',
			profilePicture: 'pic'
		} as CreateUserDto;

		const res = await svc.getOrCreateUser(input);
		expect(res).toEqual(existing);
		// ensure create was not needed
		expect(fakeRepo.fixtures.createResult).toEqual(fixtures.createResult);
	});

	it('getOrCreateUser: creates user when getByEmail returns undefined', async () => {
		const created = makeUser({ id: 'created', email: 'new@example.com' });
		const fakeRepo = new FakeUserRepository({
			getByEmailResult: undefined,
			createResult: created
		});
		const repo = fakeRepo as unknown as UserRepository;
		const svc = new UserService(repo);

		const input = {
			email: 'new@example.com',
			name: 'New',
			profilePicture: 'pic'
		} as CreateUserDto;

		const res = await svc.getOrCreateUser(input);
		expect(res).toEqual(created);
	});

	it('getOrCreateUser: creates user when getByEmail throws NotFoundError', async () => {
		const created = makeUser({ id: 'createdNF', email: 'nf@example.com' });
		const fakeRepo = new FakeUserRepository({
			getByEmailError: new NotFoundError('not found'),
			createResult: created
		});
		const repo = fakeRepo as unknown as UserRepository;
		const svc = new UserService(repo);

		const input = {
			email: 'nf@example.com',
			name: 'NF User',
			profilePicture: 'pic'
		} as CreateUserDto;

		const res = await svc.getOrCreateUser(input);
		expect(res).toEqual(created);
	});

	it('getOrCreateUser: also creates user when getByEmail throws other error', async () => {
		const created = makeUser({ id: 'createdErr', email: 'err@example.com' });
		const fakeRepo = new FakeUserRepository({
			getByEmailError: new Error('db down'),
			createResult: created
		});
		const repo = fakeRepo as unknown as UserRepository;
		const svc = new UserService(repo);

		const input = {
			email: 'err@example.com',
			name: 'Err User',
			profilePicture: 'pic'
		} as CreateUserDto;

		const res = await svc.getOrCreateUser(input);
		expect(res).toEqual(created);
	});

	// transaction wiring example

	it('passes transaction through to repository methods', async () => {
		const user = makeUser({ id: 'u1' });
		const fakeRepo = new FakeUserRepository({ getByIdResult: user });
		const repo = fakeRepo as unknown as UserRepository;
		const svc = new UserService(repo);
		const tx = {} as Transaction;

		await svc.getById('u1', tx);

		expect(fakeRepo.receivedTxs.getById).toBe(tx);
	});
});
