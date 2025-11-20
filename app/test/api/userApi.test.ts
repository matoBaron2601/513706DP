// import { describe, it, expect } from 'bun:test';
// import { Elysia } from 'elysia';
// import { createAuthApi } from '../../src/routes/api/[...slugs]/authApi';
// import type { UserService } from '../../src/services/userService';
// import type { Transaction } from '../../src/types';
// import type { UserDto, CreateUserDto, UpdateUserDto } from '../../src/db/schema';
// import { NotFoundError } from '../../src/services/utils/notFoundError';

// function makeUser(overrides: Partial<UserDto> = {}): UserDto {
// 	return {
// 		id: 'u1',
// 		email: 'a@a.com',
// 		name: 'Alice',
// 		profilePicture: 'https://example.com/p.png',
// 		createdAt: new Date('2024-01-01T00:00:00Z'),
// 		updatedAt: null,
// 		deletedAt: null,
// 		...overrides
// 	};
// }

// function makeCreateUserDto(overrides: Partial<CreateUserDto> = {}): CreateUserDto {
// 	return {
// 		email: 'new@user.com',
// 		name: 'New User',
// 		profilePicture: 'https://example.com/new.png',
// 		...overrides
// 	} as CreateUserDto;
// }

// function makeUpdateUserDto(overrides: Partial<UpdateUserDto> = {}): UpdateUserDto {
// 	return {
// 		name: 'Updated Name',
// 		profilePicture: 'https://example.com/updated.png',
// 		...overrides
// 	} as UpdateUserDto;
// }

// type UserServiceLike = Pick<
// 	UserService,
// 	'getById' | 'getByEmail' | 'create' | 'update' | 'delete' | 'getByIds' | 'getOrCreateUser'
// >;

// function makeFakeUserService() {
// 	// fixtures
// 	let getByIdResult: UserDto | undefined;
// 	let getByEmailResult: UserDto | undefined;
// 	let createResult: UserDto | undefined;
// 	let updateResult: UserDto | undefined;
// 	let deleteResult: UserDto | undefined;
// 	let getByIdsResult: UserDto[] = [];
// 	let getOrCreateResult: UserDto | undefined;

// 	// errors
// 	let getByIdError: Error | undefined;
// 	let getByEmailError: Error | undefined;
// 	let createError: Error | undefined;
// 	let updateError: Error | undefined;
// 	let deleteError: Error | undefined;
// 	let getOrCreateError: Error | undefined;

// 	// tracking
// 	const calls = {
// 		getById: [] as { id: string; tx?: Transaction }[],
// 		getByEmail: [] as { email: string; tx?: Transaction }[],
// 		create: [] as { dto: CreateUserDto; tx?: Transaction }[],
// 		update: [] as { id: string; patch: UpdateUserDto; tx?: Transaction }[],
// 		delete: [] as { id: string; tx?: Transaction }[],
// 		getByIds: [] as { ids: string[]; tx?: Transaction }[],
// 		getOrCreateUser: [] as { dto: CreateUserDto }[]
// 	};

// 	const svc: UserServiceLike = {
// 		async getById(id: string, tx?: Transaction) {
// 			calls.getById.push({ id, tx });
// 			if (getByIdError) throw getByIdError;
// 			if (!getByIdResult) throw new NotFoundError('not found');
// 			return getByIdResult;
// 		},
// 		async getByEmail(email: string, tx?: Transaction) {
// 			calls.getByEmail.push({ email, tx });
// 			if (getByEmailError) throw getByEmailError;
// 			if (!getByEmailResult) throw new NotFoundError('not found');
// 			return getByEmailResult;
// 		},
// 		async create(dto: CreateUserDto, tx?: Transaction) {
// 			calls.create.push({ dto, tx });
// 			if (createError) throw createError;
// 			if (!createResult) throw new Error('createResult fixture not set');
// 			return createResult;
// 		},
// 		async update(id: string, patch: UpdateUserDto, tx?: Transaction) {
// 			calls.update.push({ id, patch, tx });
// 			if (updateError) throw updateError;
// 			if (!updateResult) throw new NotFoundError('not found');
// 			return updateResult;
// 		},
// 		async delete(id: string, tx?: Transaction) {
// 			calls.delete.push({ id, tx });
// 			if (deleteError) throw deleteError;
// 			if (!deleteResult) throw new NotFoundError('not found');
// 			return deleteResult;
// 		},
// 		async getByIds(ids: string[], tx?: Transaction) {
// 			calls.getByIds.push({ ids, tx });
// 			return getByIdsResult;
// 		},
// 		async getOrCreateUser(dto: CreateUserDto) {
// 			calls.getOrCreateUser.push({ dto });
// 			if (getOrCreateError) throw getOrCreateError;
// 			if (!getOrCreateResult) throw new Error('getOrCreateResult fixture not set');
// 			return getOrCreateResult;
// 		}
// 	};

// 	return {
// 		svc,
// 		calls,
// 		// fixture setters
// 		setGetByIdResult: (u?: UserDto) => (getByIdResult = u),
// 		setGetByEmailResult: (u?: UserDto) => (getByEmailResult = u),
// 		setCreateResult: (u: UserDto) => (createResult = u),
// 		setUpdateResult: (u?: UserDto) => (updateResult = u),
// 		setDeleteResult: (u?: UserDto) => (deleteResult = u),
// 		setGetByIdsResult: (rows: UserDto[]) => (getByIdsResult = rows),
// 		setGetOrCreateResult: (u: UserDto) => (getOrCreateResult = u),
// 		setGetByIdError: (err?: Error) => (getByIdError = err),
// 		setGetByEmailError: (err?: Error) => (getByEmailError = err),
// 		setCreateError: (err?: Error) => (createError = err),
// 		setUpdateError: (err?: Error) => (updateError = err),
// 		setDeleteError: (err?: Error) => (deleteError = err),
// 		setGetOrCreateError: (err?: Error) => (getOrCreateError = err)
// 	};
// }

// async function json(res: Response) {
// 	const text = await res.text();
// 	if (!text) return undefined;
// 	return JSON.parse(text);
// }

// describe('authApi', () => {
// 	// ---------- GET /auth/:id ----------

// 	it('GET /auth/:id returns user from service', async () => {
// 		const fake = makeFakeUserService();
// 		const user = makeUser({ id: 'u1' });
// 		fake.setGetByIdResult(user);

// 		const app = new Elysia().use(createAuthApi(fake.svc as any));

// 		const res = await app.handle(new Request('http://localhost/auth/u1'));
// 		expect(res.status).toBe(200);

// 		const body = await json(res);
// 		expect(body).toEqual({
// 			...user,
// 			createdAt: user.createdAt.toISOString()
// 		});

// 		expect(fake.calls.getById).toHaveLength(1);
// 		expect(fake.calls.getById[0].id).toBe('u1');
// 	});

// 	it('GET /auth/:id -> 500 when service throws NotFoundError (bez vlastného error handleru)', async () => {
// 		const fake = makeFakeUserService();
// 		const app = new Elysia().use(createAuthApi(fake.svc as any));

// 		const res = await app.handle(new Request('http://localhost/auth/missing'));
// 		expect(res.status).toBe(500);
// 	});

// 	// ---------- GET /auth/email/:email ----------

// 	it('GET /auth/email/:email calls getByEmail with decoded email', async () => {
// 		const fake = makeFakeUserService();
// 		const user = makeUser({ id: 'u2', email: 'b@b.com', name: 'Bob' });
// 		fake.setGetByEmailResult(user);

// 		const app = new Elysia().use(createAuthApi(fake.svc as any));

// 		const res = await app.handle(new Request('http://localhost/auth/email/b%40b.com'));
// 		expect(res.status).toBe(200);

// 		const body = await json(res);
// 		expect(body.email).toBe('b@b.com');

// 		expect(fake.calls.getByEmail).toHaveLength(1);
// 		expect(fake.calls.getByEmail[0].email).toBe('b@b.com');
// 	});

// 	// ---------- POST /auth ----------

// 	it('POST /auth creates user via service', async () => {
// 		const fake = makeFakeUserService();
// 		const dto = makeCreateUserDto({
// 			email: 'c@c.com',
// 			name: 'Carol'
// 		});
// 		const created = makeUser({ id: 'u3', email: dto.email, name: dto.name });
// 		fake.setCreateResult(created);

// 		const app = new Elysia().use(createAuthApi(fake.svc as any));

// 		const res = await app.handle(
// 			new Request('http://localhost/auth', {
// 				method: 'POST',
// 				headers: { 'content-type': 'application/json' },
// 				body: JSON.stringify(dto)
// 			})
// 		);

// 		expect(res.status).toBe(200); // default Elysia
// 		const body = await json(res);
// 		expect(body.id).toBe('u3');
// 		expect(body.email).toBe('c@c.com');

// 		expect(fake.calls.create).toHaveLength(1);
// 		expect(fake.calls.create[0].dto).toEqual(dto);
// 	});

// 	it('POST /auth returns 422 when body does not match createUserSchema', async () => {
// 		const fake = makeFakeUserService();
// 		const app = new Elysia().use(createAuthApi(fake.svc as any));

// 		const res = await app.handle(
// 			new Request('http://localhost/auth', {
// 				method: 'POST',
// 				headers: { 'content-type': 'application/json' },
// 				body: JSON.stringify({})
// 			})
// 		);

// 		expect(res.status).toBe(422);
// 		expect(fake.calls.create).toHaveLength(0);
// 	});

// 	// ---------- PUT /auth/:id ----------

// 	it('PUT /auth/:id updates user via service', async () => {
// 		const fake = makeFakeUserService();
// 		const patch = makeUpdateUserDto({ name: 'Alice 2' });
// 		const updated = makeUser({ id: 'u1', name: 'Alice 2' });
// 		fake.setUpdateResult(updated);

// 		const app = new Elysia().use(createAuthApi(fake.svc as any));

// 		const res = await app.handle(
// 			new Request('http://localhost/auth/u1', {
// 				method: 'PUT',
// 				headers: { 'content-type': 'application/json' },
// 				body: JSON.stringify(patch)
// 			})
// 		);

// 		expect(res.status).toBe(200);
// 		const body = await json(res);
// 		expect(body.name).toBe('Alice 2');

// 		expect(fake.calls.update).toHaveLength(1);
// 		expect(fake.calls.update[0].id).toBe('u1');
// 		expect(fake.calls.update[0].patch).toEqual(patch);
// 	});

// 	it('PUT /auth/:id returns 422 when body does not match updateUserSchema', async () => {
// 		const fake = makeFakeUserService();
// 		const app = new Elysia().use(createAuthApi(fake.svc as any));

// 		const res = await app.handle(
// 			new Request('http://localhost/auth/u1', {
// 				method: 'PUT',
// 				headers: { 'content-type': 'application/json' },
// 				body: JSON.stringify({ name: 123 })
// 			})
// 		);

// 		expect(res.status).toBe(422);
// 		expect(fake.calls.update).toHaveLength(0);
// 	});

// 	// ---------- POST /auth/getOrCreate ----------

// 	it('POST /auth/getOrCreate calls getOrCreateUser and returns result', async () => {
// 		const fake = makeFakeUserService();
// 		const dto = makeCreateUserDto({ email: 'goc@example.com' });
// 		const user = makeUser({ id: 'u-goc', email: 'goc@example.com' });
// 		fake.setGetOrCreateResult(user);

// 		const app = new Elysia().use(createAuthApi(fake.svc as any));

// 		const res = await app.handle(
// 			new Request('http://localhost/auth/getOrCreate', {
// 				method: 'POST',
// 				headers: { 'content-type': 'application/json' },
// 				body: JSON.stringify(dto)
// 			})
// 		);

// 		expect(res.status).toBe(200);
// 		const body = await json(res);
// 		expect(body.id).toBe('u-goc');
// 		expect(body.email).toBe('goc@example.com');

// 		expect(fake.calls.getOrCreateUser).toHaveLength(1);
// 		expect(fake.calls.getOrCreateUser[0].dto).toEqual(dto);
// 	});
// });
