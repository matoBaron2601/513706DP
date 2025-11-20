import { describe, it, expect } from 'bun:test';
import type {
	UserBlockDto,
	CreateUserBlockDto,
	UpdateUserBlockDto,
	UserDto
} from '../../src/db/schema';
import type { Transaction } from '../../src/types';
import { UserBlockService } from '../../src/services/userBlockService';
import { UserBlockRepository } from '../../src/repositories/userBlockRepository';
import { UserRepository } from '../../src/repositories/userRepository';
import { NotFoundError, UnauthorizedError } from '../../src/errors/AppError';

function makeUserBlock(overrides: Partial<UserBlockDto> = {}): UserBlockDto {
	return {
		id: 'ub1',
		userId: 'user1',
		blockId: 'block1',
		completed: false,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

function makeUser(overrides: Partial<UserDto> = {}): UserDto {
	return {
		id: 'user1',
		name: 'User',
		email: 'user@example.com',
		profilePicture: 'pic',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

type UserBlockRepoFixtures = {
	getByIdResult?: UserBlockDto | undefined;
	createResult?: UserBlockDto;
	updateResult?: UserBlockDto | undefined;
	deleteResult?: UserBlockDto | undefined;
	getByBothIdsResult?: UserBlockDto | undefined;
};

type UserRepoFixtures = {
	getByEmailResult?: UserDto | undefined;
};

class FakeUserBlockRepository implements Partial<UserBlockRepository> {
	public fixtures: UserBlockRepoFixtures;
	public receivedTxs: {
		getById?: Transaction | undefined;
		create?: Transaction | undefined;
		update?: Transaction | undefined;
		delete?: Transaction | undefined;
		getByBothIds?: Transaction | undefined;
	} = {};

	constructor(fixtures: UserBlockRepoFixtures) {
		this.fixtures = fixtures;
	}

	async getById(id: string, tx?: Transaction): Promise<UserBlockDto | undefined> {
		this.receivedTxs.getById = tx;
		return this.fixtures.getByIdResult;
	}

	async create(data: CreateUserBlockDto, tx?: Transaction): Promise<UserBlockDto> {
		this.receivedTxs.create = tx;
		if (!this.fixtures.createResult) {
			this.fixtures.createResult = makeUserBlock({
				id: 'created',
				userId: data.userId,
				blockId: data.blockId,
				completed: data.completed ?? false
			});
		}
		return this.fixtures.createResult;
	}

	async update(
		id: string,
		data: UpdateUserBlockDto,
		tx?: Transaction
	): Promise<UserBlockDto | undefined> {
		this.receivedTxs.update = tx;
		return this.fixtures.updateResult;
	}

	async delete(id: string, tx?: Transaction): Promise<UserBlockDto | undefined> {
		this.receivedTxs.delete = tx;
		return this.fixtures.deleteResult;
	}

	async getByBothIds(
		data: { userId: string; blockId: string },
		tx?: Transaction
	): Promise<UserBlockDto | undefined> {
		this.receivedTxs.getByBothIds = tx;
		return this.fixtures.getByBothIdsResult;
	}
}

class FakeUserRepository implements Partial<UserRepository> {
	public fixtures: UserRepoFixtures;
	public receivedTxs: {
		getByEmail?: Transaction | undefined;
	} = {};

	constructor(fixtures: UserRepoFixtures) {
		this.fixtures = fixtures;
	}

	async getByEmail(email: string, tx?: Transaction): Promise<UserDto | undefined> {
		this.receivedTxs.getByEmail = tx;
		return this.fixtures.getByEmailResult;
	}
}

describe('UserBlockService', () => {
	// getById

	it('getById: returns userBlock when found', async () => {
		const ub = makeUserBlock({ id: 'ub1' });

		const ubRepo = new FakeUserBlockRepository({ getByIdResult: ub }) as unknown as UserBlockRepository;
		const userRepo = new FakeUserRepository({}) as unknown as UserRepository;

		const svc = new UserBlockService(ubRepo, userRepo);

		const res = await svc.getById('ub1');
		expect(res).toEqual(ub);
	});

	it('getById: throws NotFoundError when not found', async () => {
		const ubRepo = new FakeUserBlockRepository({ getByIdResult: undefined }) as unknown as UserBlockRepository;
		const userRepo = new FakeUserRepository({}) as unknown as UserRepository;

		const svc = new UserBlockService(ubRepo, userRepo);

		await expect(svc.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// create

	it('create: delegates to repository.create', async () => {
		const created = makeUserBlock({ id: 'ub2' });

		const ubRepo = new FakeUserBlockRepository({ createResult: created }) as unknown as UserBlockRepository;
		const userRepo = new FakeUserRepository({}) as unknown as UserRepository;

		const svc = new UserBlockService(ubRepo, userRepo);

		const input = {
			userId: 'user1',
			blockId: 'block1',
			completed: false
		} as CreateUserBlockDto;

		const res = await svc.create(input);
		expect(res).toEqual(created);
	});

	// update

	it('update: returns updated userBlock when repo returns value', async () => {
		const updated = makeUserBlock({ id: 'ub1', completed: true });

		const ubRepo = new FakeUserBlockRepository({ updateResult: updated }) as unknown as UserBlockRepository;
		const userRepo = new FakeUserRepository({}) as unknown as UserRepository;

		const svc = new UserBlockService(ubRepo, userRepo);

		const patch = { completed: true } as UpdateUserBlockDto;

		const res = await svc.update('ub1', patch);
		expect(res).toEqual(updated);
	});

	it('update: throws NotFoundError when repo returns undefined', async () => {
		const ubRepo = new FakeUserBlockRepository({ updateResult: undefined }) as unknown as UserBlockRepository;
		const userRepo = new FakeUserRepository({}) as unknown as UserRepository;

		const svc = new UserBlockService(ubRepo, userRepo);

		const patch = { completed: true } as UpdateUserBlockDto;

		await expect(svc.update('missing', patch)).rejects.toBeInstanceOf(NotFoundError);
	});

	// getByBothIdsOrUndefined

	it('getByBothIdsOrUndefined: returns userBlock when found', async () => {
		const ub = makeUserBlock({ id: 'ubX', userId: 'user1', blockId: 'block1' });

		const ubRepo = new FakeUserBlockRepository({ getByBothIdsResult: ub }) as unknown as UserBlockRepository;
		const userRepo = new FakeUserRepository({}) as unknown as UserRepository;

		const svc = new UserBlockService(ubRepo, userRepo);

		const res = await svc.getByBothIdsOrUndefined({ userId: 'user1', blockId: 'block1' });
		expect(res).toEqual(ub);
	});

	it('getByBothIdsOrUndefined: returns undefined when not found', async () => {
		const ubRepo = new FakeUserBlockRepository({ getByBothIdsResult: undefined }) as unknown as UserBlockRepository;
		const userRepo = new FakeUserRepository({}) as unknown as UserRepository;

		const svc = new UserBlockService(ubRepo, userRepo);

		const res = await svc.getByBothIdsOrUndefined({ userId: 'user1', blockId: 'block1' });
		expect(res).toBeUndefined();
	});

	// checkUserIsOwnerOfUserBlock

	it('checkUserIsOwnerOfUserBlock: succeeds when user owns userBlock', async () => {
		const ub = makeUserBlock({ id: 'ub1', userId: 'user1' });
		const user = makeUser({ id: 'user1', email: 'user@example.com' });

		const ubRepo = new FakeUserBlockRepository({ getByIdResult: ub }) as unknown as UserBlockRepository;
		const userRepo = new FakeUserRepository({ getByEmailResult: user }) as unknown as UserRepository;

		const svc = new UserBlockService(ubRepo, userRepo);

		await svc.checkUserIsOwnerOfUserBlock('ub1', 'user@example.com');
		// no throw == success
	});

	it('checkUserIsOwnerOfUserBlock: throws NotFoundError when user not found', async () => {
		const ub = makeUserBlock({ id: 'ub1', userId: 'user1' });

		const ubRepo = new FakeUserBlockRepository({ getByIdResult: ub }) as unknown as UserBlockRepository;
		const userRepo = new FakeUserRepository({ getByEmailResult: undefined }) as unknown as UserRepository;

		const svc = new UserBlockService(ubRepo, userRepo);

		await expect(
			svc.checkUserIsOwnerOfUserBlock('ub1', 'nope@example.com')
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it('checkUserIsOwnerOfUserBlock: throws NotFoundError when userBlock not found', async () => {
		const user = makeUser({ id: 'user1', email: 'user@example.com' });

		const ubRepo = new FakeUserBlockRepository({ getByIdResult: undefined }) as unknown as UserBlockRepository;
		const userRepo = new FakeUserRepository({ getByEmailResult: user }) as unknown as UserRepository;

		const svc = new UserBlockService(ubRepo, userRepo);

		await expect(
			svc.checkUserIsOwnerOfUserBlock('missing', 'user@example.com')
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it('checkUserIsOwnerOfUserBlock: throws UnauthorizedError when user is not owner', async () => {
		const ub = makeUserBlock({ id: 'ub1', userId: 'otherUser' });
		const user = makeUser({ id: 'user1', email: 'user@example.com' });

		const ubRepo = new FakeUserBlockRepository({ getByIdResult: ub }) as unknown as UserBlockRepository;
		const userRepo = new FakeUserRepository({ getByEmailResult: user }) as unknown as UserRepository;

		const svc = new UserBlockService(ubRepo, userRepo);

		await expect(
			svc.checkUserIsOwnerOfUserBlock('ub1', 'user@example.com')
		).rejects.toBeInstanceOf(UnauthorizedError);
	});

	// delete

	it('delete: deletes userBlock when user is owner', async () => {
		const ub = makeUserBlock({ id: 'ub1', userId: 'user1' });
		const user = makeUser({ id: 'user1', email: 'user@example.com' });

		const ubRepo = new FakeUserBlockRepository({
			getByIdResult: ub,
			deleteResult: ub
		}) as unknown as UserBlockRepository;
		const userRepo = new FakeUserRepository({
			getByEmailResult: user
		}) as unknown as UserRepository;

		const svc = new UserBlockService(ubRepo, userRepo);

		const res = await svc.delete('ub1', 'user@example.com');
		expect(res).toEqual(ub);
	});

	it('delete: throws NotFoundError when repo.delete returns undefined', async () => {
		const ub = makeUserBlock({ id: 'ub1', userId: 'user1' });
		const user = makeUser({ id: 'user1', email: 'user@example.com' });

		const ubRepo = new FakeUserBlockRepository({
			getByIdResult: ub,
			deleteResult: undefined
		}) as unknown as UserBlockRepository;
		const userRepo = new FakeUserRepository({
			getByEmailResult: user
		}) as unknown as UserRepository;

		const svc = new UserBlockService(ubRepo, userRepo);

		await expect(
			svc.delete('ub1', 'user@example.com')
		).rejects.toBeInstanceOf(NotFoundError);
	});

	// transaction wiring

	it('passes transaction through to repositories (example: delete)', async () => {
		const ub = makeUserBlock({ id: 'ub1', userId: 'user1' });
		const user = makeUser({ id: 'user1', email: 'user@example.com' });

		const fakeUbRepo = new FakeUserBlockRepository({
			getByIdResult: ub,
			deleteResult: ub
		});
		const fakeUserRepo = new FakeUserRepository({
			getByEmailResult: user
		});

		const ubRepo = fakeUbRepo as unknown as UserBlockRepository;
		const userRepo = fakeUserRepo as unknown as UserRepository;

		const svc = new UserBlockService(ubRepo, userRepo);
		const tx = {} as Transaction;

		await svc.delete('ub1', 'user@example.com', tx);

		expect(fakeUbRepo.receivedTxs.getById).toBe(tx);
		expect(fakeUbRepo.receivedTxs.delete).toBe(tx);
		expect(fakeUserRepo.receivedTxs.getByEmail).toBe(tx);
	});
});
