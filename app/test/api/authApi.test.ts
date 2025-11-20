import { describe, it, expect } from 'bun:test';
import { Elysia } from 'elysia';
import type { UserDto, CreateUserDto, UpdateUserDto } from '../../src/db/schema';
import { createAuthApi } from '../../src/routes/api/[...slugs]/authApi';

function makeUser(overrides: Partial<UserDto> = {}): UserDto {
	return {
		id: 'u1',
		name: 'Test User',
		email: 'user@example.com',
		profilePicture: 'pic.png',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

type ServiceFixtures = {
	getByIdResult?: UserDto;
	getByEmailResult?: UserDto;
	createResult?: UserDto;
	updateResult?: UserDto;
	getOrCreateResult?: UserDto;
};

class FakeUserService {
	public fixtures: ServiceFixtures;
	public calls = {
		getById: [] as string[],
		getByEmail: [] as string[],
		create: [] as CreateUserDto[],
		update: [] as { id: string; patch: UpdateUserDto }[],
		getOrCreateUser: [] as CreateUserDto[]
	};

	constructor(fixtures: ServiceFixtures) {
		this.fixtures = fixtures;
	}

	async getById(id: string): Promise<UserDto> {
		this.calls.getById.push(id);
		if (!this.fixtures.getByIdResult) {
			throw new Error('getByIdResult fixture not set');
		}
		return this.fixtures.getByIdResult;
	}

	async getByEmail(email: string): Promise<UserDto> {
		this.calls.getByEmail.push(email);
		if (!this.fixtures.getByEmailResult) {
			throw new Error('getByEmailResult fixture not set');
		}
		return this.fixtures.getByEmailResult;
	}

	async create(user: CreateUserDto): Promise<UserDto> {
		this.calls.create.push(user);
		if (!this.fixtures.createResult) {
			this.fixtures.createResult = makeUser({
				id: 'created',
				name: user.name,
				email: user.email,
				profilePicture: user.profilePicture
			});
		}
		return this.fixtures.createResult;
	}

	async update(id: string, patch: UpdateUserDto): Promise<UserDto> {
		this.calls.update.push({ id, patch });
		if (!this.fixtures.updateResult) {
			throw new Error('updateResult fixture not set');
		}
		return this.fixtures.updateResult;
	}

	async getOrCreateUser(data: CreateUserDto): Promise<UserDto> {
		this.calls.getOrCreateUser.push(data);
		if (!this.fixtures.getOrCreateResult) {
			this.fixtures.getOrCreateResult = makeUser({
				id: 'get-or-create',
				name: data.name,
				email: data.email,
				profilePicture: data.profilePicture
			});
		}
		return this.fixtures.getOrCreateResult;
	}
}

describe('authApi (createAuthApi)', () => {
	const makeApp = (fixtures: ServiceFixtures) => {
		const fakeService = new FakeUserService(fixtures);
		// prefix 'auth' je už v createAuthApi
		const app = createAuthApi(fakeService as any);
		return { app, fakeService };
	};

	// GET /auth/:id
	it('GET /auth/:id returns user from service.getById', async () => {
		const user = makeUser({ id: 'u123' });
		const { app, fakeService } = makeApp({ getByIdResult: user });

		const res = await app.handle(
			new Request('http://localhost/auth/u123', { method: 'GET' })
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toEqual(JSON.parse(JSON.stringify(user))); // Date -> string v JSON

		expect(fakeService.calls.getById).toEqual(['u123']);
	});

	// GET /auth/email/:email
	it('GET /auth/email/:email returns user from service.getByEmail', async () => {
		const user = makeUser({ email: 'user@example.com' });
		const { app, fakeService } = makeApp({ getByEmailResult: user });

		const res = await app.handle(
			new Request('http://localhost/auth/email/user@example.com', {
				method: 'GET'
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.email).toBe('user@example.com');

		expect(fakeService.calls.getByEmail).toEqual(['user@example.com']);
	});

	// POST /auth/ (create)
	it('POST /auth/ calls service.create with body and returns created user', async () => {
		const input: CreateUserDto = {
			name: 'New User',
			email: 'new@example.com',
			profilePicture: 'new.png'
		} as CreateUserDto;

		const created = makeUser({
			id: 'created-id',
			name: input.name,
			email: input.email,
			profilePicture: input.profilePicture
		});

		const { app, fakeService } = makeApp({ createResult: created });

		const res = await app.handle(
			new Request('http://localhost/auth/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input)
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.id).toBe('created-id');
		expect(body.email).toBe('new@example.com');

		expect(fakeService.calls.create.length).toBe(1);
		expect(fakeService.calls.create[0]).toEqual(input);
	});

	// PUT /auth/:id (update)
	it('PUT /auth/:id calls service.update with id and body', async () => {
		const patch: UpdateUserDto = {
			name: 'Updated Name',
			profilePicture: 'updated.png'
		} as UpdateUserDto;

		const updated = makeUser({
			id: 'u1',
			name: patch.name!,
			profilePicture: patch.profilePicture!
		});

		const { app, fakeService } = makeApp({ updateResult: updated });

		const res = await app.handle(
			new Request('http://localhost/auth/u1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(patch)
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.name).toBe('Updated Name');

		expect(fakeService.calls.update.length).toBe(1);
		expect(fakeService.calls.update[0].id).toBe('u1');
		expect(fakeService.calls.update[0].patch).toEqual(patch);
	});

	// POST /auth/getOrCreate
	it('POST /auth/getOrCreate calls service.getOrCreateUser and returns user', async () => {
		const input: CreateUserDto = {
			name: 'Maybe Existing',
			email: 'maybe@example.com',
			profilePicture: 'maybe.png'
		} as CreateUserDto;

		const returned = makeUser({
			id: 'existing-or-created',
			name: input.name,
			email: input.email
		});

		const { app, fakeService } = makeApp({ getOrCreateResult: returned });

		const res = await app.handle(
			new Request('http://localhost/auth/getOrCreate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input)
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.id).toBe('existing-or-created');
		expect(body.email).toBe('maybe@example.com');

		expect(fakeService.calls.getOrCreateUser.length).toBe(1);
		expect(fakeService.calls.getOrCreateUser[0]).toEqual(input);
	});
});
