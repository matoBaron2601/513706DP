// tests/services/userService.test.ts
import { describe, it, expect } from 'bun:test';
import type { CreateUserDto, UpdateUserDto, UserDto } from '../../src/db/schema';
import type { Transaction } from '../../src/types';
import { UserService } from '../../src/services/userService';
import { NotFoundError } from '../../src/services/utils/notFoundError';
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

function makeCreateUserDto(overrides: Partial<CreateUserDto> = {}): CreateUserDto {
	return {
		email: 'new@user.com',
		name: 'New User',
		profilePicture: 'https://example.com/new.png',
		...overrides
	} as CreateUserDto;
}

function makeUpdateUserDto(overrides: Partial<UpdateUserDto> = {}): UpdateUserDto {
	return {
		name: 'Updated Name',
		profilePicture: 'https://example.com/updated.png',
		...overrides
	} as UpdateUserDto;
}

type UserRepositoryLike = Pick<
	UserRepository,
	'getById' | 'getByEmail' | 'create' | 'update' | 'delete' | 'getByIds'
>;

function makeFakeRepo() {
	// fixtures
	let getByIdResult: UserDto | undefined;
	let getByEmailResult: UserDto | undefined;
	let createResult: UserDto | undefined;
	let updateResult: UserDto | undefined;
	let deleteResult: UserDto | undefined;
	let getByIdsResult: UserDto[] = [];

	// errors
	let getByEmailError: Error | undefined;

	// tracking
	let getByIdArgs: { id: string; tx?: Transaction }[] = [];
	let getByEmailArgs: { email: string; tx?: Transaction }[] = [];
	let createArgs: { dto: CreateUserDto; tx?: Transaction }[] = [];
	let updateArgs: { id: string; patch: UpdateUserDto; tx?: Transaction }[] = [];
	let deleteArgs: { id: string; tx?: Transaction }[] = [];
	let getByIdsArgs: { ids: string[]; tx?: Transaction }[] = [];

	const repo: UserRepositoryLike = {
		async getById(id: string, tx?: Transaction): Promise<UserDto | undefined> {
			getByIdArgs.push({ id, tx });
			return getByIdResult;
		},
		async getByEmail(email: string, tx?: Transaction): Promise<UserDto | undefined> {
			getByEmailArgs.push({ email, tx });
			if (getByEmailError) throw getByEmailError;
			return getByEmailResult;
		},
		async create(dto: CreateUserDto, tx?: Transaction): Promise<UserDto> {
			createArgs.push({ dto, tx });
			if (!createResult) {
				throw new Error('createResult fixture not set');
			}
			return createResult;
		},
		async update(id: string, patch: UpdateUserDto, tx?: Transaction): Promise<UserDto | undefined> {
			updateArgs.push({ id, patch, tx });
			return updateResult;
		},
		async delete(id: string, tx?: Transaction): Promise<UserDto | undefined> {
			deleteArgs.push({ id, tx });
			return deleteResult;
		},
		async getByIds(ids: string[], tx?: Transaction): Promise<UserDto[]> {
			getByIdsArgs.push({ ids, tx });
			return getByIdsResult;
		}
	};

	return {
		repo,
		// fixture setters
		setGetByIdResult: (u?: UserDto) => (getByIdResult = u),
		setGetByEmailResult: (u?: UserDto) => (getByEmailResult = u),
		setCreateResult: (u: UserDto) => (createResult = u),
		setUpdateResult: (u?: UserDto) => (updateResult = u),
		setDeleteResult: (u?: UserDto) => (deleteResult = u),
		setGetByIdsResult: (rows: UserDto[]) => (getByIdsResult = rows),
		setGetByEmailError: (err?: Error) => (getByEmailError = err),
		// tracking getters
		getByIdArgs: () => getByIdArgs,
		getByEmailArgs: () => getByEmailArgs,
		createArgs: () => createArgs,
		updateArgs: () => updateArgs,
		deleteArgs: () => deleteArgs,
		getByIdsArgs: () => getByIdsArgs
	};
}

describe('UserService', () => {
	// ---------- getById ----------

	it('getById: returns user when it exists', async () => {
		const u = makeUser({ id: 'u1' });
		const fake = makeFakeRepo();
		fake.setGetByIdResult(u);

		const service = new UserService(fake.repo as unknown as UserRepository);

		const res = await service.getById('u1');
		expect(res).toEqual(u);

		const calls = fake.getByIdArgs();
		expect(calls).toHaveLength(1);
		expect(calls[0].id).toBe('u1');
		expect(calls[0].tx).toBeUndefined();
	});

	it('getById: throws NotFoundError when user does not exist', async () => {
		const fake = makeFakeRepo();
		fake.setGetByIdResult(undefined);

		const service = new UserService(fake.repo as unknown as UserRepository);

		await expect(service.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	it('getById: passes transaction to repository', async () => {
		const u = makeUser({ id: 'u1' });
		const fake = makeFakeRepo();
		fake.setGetByIdResult(u);

		const service = new UserService(fake.repo as unknown as UserRepository);
		const tx = {} as Transaction;

		await service.getById('u1', tx);

		const calls = fake.getByIdArgs();
		expect(calls).toHaveLength(1);
		expect(calls[0].tx).toBe(tx);
	});

	// ---------- getByEmail ----------

	it('getByEmail: returns user when it exists', async () => {
		const u = makeUser({ id: 'u2', email: 'b@b.com', name: 'Bob' });
		const fake = makeFakeRepo();
		fake.setGetByEmailResult(u);

		const service = new UserService(fake.repo as unknown as UserRepository);

		const res = await service.getByEmail('b@b.com');
		expect(res).toEqual(u);

		const calls = fake.getByEmailArgs();
		expect(calls).toHaveLength(1);
		expect(calls[0].email).toBe('b@b.com');
		expect(calls[0].tx).toBeUndefined();
	});

	it('getByEmail: throws NotFoundError when user does not exist', async () => {
		const fake = makeFakeRepo();
		fake.setGetByEmailResult(undefined);

		const service = new UserService(fake.repo as unknown as UserRepository);

		await expect(service.getByEmail('missing@example.com')).rejects.toBeInstanceOf(NotFoundError);
	});

	it('getByEmail: passes transaction to repository', async () => {
		const u = makeUser({ id: 'u2', email: 'b@b.com' });
		const fake = makeFakeRepo();
		fake.setGetByEmailResult(u);

		const service = new UserService(fake.repo as unknown as UserRepository);
		const tx = {} as Transaction;

		await service.getByEmail('b@b.com', tx);

		const calls = fake.getByEmailArgs();
		expect(calls).toHaveLength(1);
		expect(calls[0].tx).toBe(tx);
	});

	// ---------- create ----------

	it('create: forwards to repository and returns created user', async () => {
		const dto = makeCreateUserDto({
			email: 'c@c.com',
			name: 'Carol'
		});

		const created = makeUser({
			id: 'u3',
			email: 'c@c.com',
			name: 'Carol'
		});

		const fake = makeFakeRepo();
		fake.setCreateResult(created);

		const service = new UserService(fake.repo as unknown as UserRepository);

		const res = await service.create(dto);
		expect(res).toEqual(created);

		const calls = fake.createArgs();
		expect(calls).toHaveLength(1);
		expect(calls[0].dto).toEqual(dto);
		expect(calls[0].tx).toBeUndefined();
	});

	it('create: passes transaction to repository', async () => {
		const dto = makeCreateUserDto({
			email: 'tx@tx.com',
			name: 'Tx User'
		});

		const created = makeUser({
			id: 'u-tx',
			email: 'tx@tx.com',
			name: 'Tx User'
		});

		const fake = makeFakeRepo();
		fake.setCreateResult(created);

		const service = new UserService(fake.repo as unknown as UserRepository);
		const tx = {} as Transaction;

		const res = await service.create(dto, tx);
		expect(res).toEqual(created);

		const calls = fake.createArgs();
		expect(calls).toHaveLength(1);
		expect(calls[0].tx).toBe(tx);
	});

	// ---------- update ----------

	it('update: returns updated user when repository returns a row', async () => {
		const patch = makeUpdateUserDto({ name: 'Alice 2' });
		const updated = makeUser({ id: 'u1', name: 'Alice 2' });

		const fake = makeFakeRepo();
		fake.setUpdateResult(updated);

		const service = new UserService(fake.repo as unknown as UserRepository);

		const res = await service.update('u1', patch);
		expect(res).toEqual(updated);

		const calls = fake.updateArgs();
		expect(calls).toHaveLength(1);
		expect(calls[0].id).toBe('u1');
		expect(calls[0].patch).toEqual(patch);
		expect(calls[0].tx).toBeUndefined();
	});

	it('update: throws NotFoundError when repository returns undefined', async () => {
		const patch = makeUpdateUserDto({ name: 'Missing' });

		const fake = makeFakeRepo();
		fake.setUpdateResult(undefined);

		const service = new UserService(fake.repo as unknown as UserRepository);

		await expect(service.update('missing', patch)).rejects.toBeInstanceOf(NotFoundError);
	});

	it('update: passes transaction to repository', async () => {
		const patch = makeUpdateUserDto({ name: 'Alice TX' });
		const updated = makeUser({ id: 'u1', name: 'Alice TX' });

		const fake = makeFakeRepo();
		fake.setUpdateResult(updated);

		const service = new UserService(fake.repo as unknown as UserRepository);
		const tx = {} as Transaction;

		const res = await service.update('u1', patch, tx);
		expect(res).toEqual(updated);

		const calls = fake.updateArgs();
		expect(calls).toHaveLength(1);
		expect(calls[0].tx).toBe(tx);
	});

	// ---------- delete ----------

	it('delete: returns deleted user when repository returns a row', async () => {
		const deleted = makeUser({ id: 'u1' });

		const fake = makeFakeRepo();
		fake.setDeleteResult(deleted);

		const service = new UserService(fake.repo as unknown as UserRepository);

		const res = await service.delete('u1');
		expect(res).toEqual(deleted);

		const calls = fake.deleteArgs();
		expect(calls).toHaveLength(1);
		expect(calls[0].id).toBe('u1');
		expect(calls[0].tx).toBeUndefined();
	});

	it('delete: throws NotFoundError when repository returns undefined', async () => {
		const fake = makeFakeRepo();
		fake.setDeleteResult(undefined);

		const service = new UserService(fake.repo as unknown as UserRepository);

		await expect(service.delete('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	it('delete: passes transaction to repository', async () => {
		const deleted = makeUser({ id: 'u1' });

		const fake = makeFakeRepo();
		fake.setDeleteResult(deleted);

		const service = new UserService(fake.repo as unknown as UserRepository);
		const tx = {} as Transaction;

		const res = await service.delete('u1', tx);
		expect(res).toEqual(deleted);

		const calls = fake.deleteArgs();
		expect(calls).toHaveLength(1);
		expect(calls[0].tx).toBe(tx);
	});

	// ---------- getByIds ----------

	it('getByIds: returns users from repository', async () => {
		const rows = [
			makeUser({ id: 'u1' }),
			makeUser({ id: 'u2', email: 'b@b.com', name: 'Bob' })
		];

		const fake = makeFakeRepo();
		fake.setGetByIdsResult(rows);

		const service = new UserService(fake.repo as unknown as UserRepository);

		const res = await service.getByIds(['u1', 'u2']);
		expect(res).toEqual(rows);

		const calls = fake.getByIdsArgs();
		expect(calls).toHaveLength(1);
		expect(calls[0].ids).toEqual(['u1', 'u2']);
		expect(calls[0].tx).toBeUndefined();
	});

	it('getByIds: passes transaction to repository', async () => {
		const rows = [makeUser({ id: 'u1' })];

		const fake = makeFakeRepo();
		fake.setGetByIdsResult(rows);

		const service = new UserService(fake.repo as unknown as UserRepository);
		const tx = {} as Transaction;

		const res = await service.getByIds(['u1'], tx);
		expect(res).toEqual(rows);

		const calls = fake.getByIdsArgs();
		expect(calls).toHaveLength(1);
		expect(calls[0].tx).toBe(tx);
	});

	// ---------- getOrCreateUser ----------

	it('getOrCreateUser: returns existing user when found by email', async () => {
		const existing = makeUser({ id: 'u-exists', email: 'exists@example.com' });
		const dto = makeCreateUserDto({ email: 'exists@example.com' });

		const fake = makeFakeRepo();
		fake.setGetByEmailResult(existing);

		const service = new UserService(fake.repo as unknown as UserRepository);

		const res = await service.getOrCreateUser(dto);
		expect(res).toEqual(existing);

		const getCalls = fake.getByEmailArgs();
		expect(getCalls).toHaveLength(1);
		expect(getCalls[0].email).toBe('exists@example.com');

		const createCalls = fake.createArgs();
		expect(createCalls).toHaveLength(0);
	});

	it('getOrCreateUser: creates user when repository returns undefined', async () => {
		const dto = makeCreateUserDto({ email: 'new@example.com' });
		const created = makeUser({ id: 'u-new', email: 'new@example.com' });

		const fake = makeFakeRepo();
		fake.setGetByEmailResult(undefined);
		fake.setCreateResult(created);

		const service = new UserService(fake.repo as unknown as UserRepository);

		const res = await service.getOrCreateUser(dto);
		expect(res).toEqual(created);

		const getCalls = fake.getByEmailArgs();
		expect(getCalls).toHaveLength(1);
		expect(getCalls[0].email).toBe('new@example.com');

		const createCalls = fake.createArgs();
		expect(createCalls).toHaveLength(1);
		expect(createCalls[0].dto).toEqual(dto);
	});

	it('getOrCreateUser: creates user when getByEmail throws NotFoundError', async () => {
		const dto = makeCreateUserDto({ email: 'notfound@example.com' });
		const created = makeUser({ id: 'u-notfound', email: 'notfound@example.com' });

		const fake = makeFakeRepo();
		fake.setGetByEmailError(new NotFoundError('not found'));
		fake.setCreateResult(created);

		const service = new UserService(fake.repo as unknown as UserRepository);

		const res = await service.getOrCreateUser(dto);
		expect(res).toEqual(created);

		const getCalls = fake.getByEmailArgs();
		expect(getCalls).toHaveLength(1);

		const createCalls = fake.createArgs();
		expect(createCalls).toHaveLength(1);
	});

	it('getOrCreateUser: still creates user when getByEmail throws non-NotFoundError', async () => {
		const dto = makeCreateUserDto({ email: 'error@example.com' });
		const created = makeUser({ id: 'u-error', email: 'error@example.com' });

		const fake = makeFakeRepo();
		fake.setGetByEmailError(new Error('db is down'));
		fake.setCreateResult(created);

		const service = new UserService(fake.repo as unknown as UserRepository);

		const res = await service.getOrCreateUser(dto);
		expect(res).toEqual(created);

		const createCalls = fake.createArgs();
		expect(createCalls).toHaveLength(1);
	});
});
