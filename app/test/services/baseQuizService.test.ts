// import { describe, it, expect } from 'bun:test';
// import type {
// 	BaseQuizDto,
// 	CreateBaseQuizDto,
// 	UpdateBaseQuizDto
// } from '../../src/db/schema';
// import type { Transaction } from '../../src/types';
// import { BaseQuizService } from '../../src/services/baseQuizService';
// import { NotFoundError } from '../../src/services/utils/notFoundError';
// import { BaseQuizRepository } from '../../src/repositories/baseQuizRepository';

// function makeBaseQuiz(overrides: Partial<BaseQuizDto> = {}): BaseQuizDto {
// 	return {
// 		id: 'q1',
// 		createdAt: new Date('2024-01-01T00:00:00Z'),
// 		updatedAt: null,
// 		deletedAt: null,
// 		...overrides
// 	};
// }

// type RepoLike = Pick<
// 	BaseQuizRepository,
// 	'getById' | 'create' | 'update' | 'deleteById' | 'getByIds'
// >;

// function makeFakeRepo() {
// 	let getByIdResult: BaseQuizDto | undefined;
// 	let createResult: BaseQuizDto | undefined;
// 	let updateResult: BaseQuizDto | undefined;
// 	let deleteResult: BaseQuizDto | undefined;
// 	let getByIdsResult: BaseQuizDto[] = [];

// 	const calls = {
// 		getById: [] as any[],
// 		create: [] as any[],
// 		update: [] as any[],
// 		deleteById: [] as any[],
// 		getByIds: [] as any[]
// 	};

// 	const repo: RepoLike = {
// 		async getById(id: string, tx?: Transaction) {
// 			calls.getById.push({ id, tx });
// 			return getByIdResult;
// 		},
// 		async create(dto: CreateBaseQuizDto, tx?: Transaction) {
// 			calls.create.push({ dto, tx });
// 			if (!createResult) throw new Error('createResult missing');
// 			return createResult;
// 		},
// 		async update(id: string, dto: UpdateBaseQuizDto, tx?: Transaction) {
// 			calls.update.push({ id, dto, tx });
// 			return updateResult;
// 		},
// 		async deleteById(id: string, tx?: Transaction) {
// 			calls.deleteById.push({ id, tx });
// 			return deleteResult;
// 		},
// 		async getByIds(ids: string[], tx?: Transaction) {
// 			calls.getByIds.push({ ids, tx });
// 			return getByIdsResult;
// 		}
// 	};

// 	return {
// 		repo,
// 		calls,
// 		setGetByIdResult: (v?: BaseQuizDto) => (getByIdResult = v),
// 		setCreateResult: (v: BaseQuizDto) => (createResult = v),
// 		setUpdateResult: (v?: BaseQuizDto) => (updateResult = v),
// 		setDeleteResult: (v?: BaseQuizDto) => (deleteResult = v),
// 		setGetByIdsResult: (v: BaseQuizDto[]) => (getByIdsResult = v)
// 	};
// }

// describe('BaseQuizService', () => {
// 	it('getById: returns quiz', async () => {
// 		const fake = makeFakeRepo();
// 		const quiz = makeBaseQuiz({ id: 'q1' });
// 		fake.setGetByIdResult(quiz);

// 		const service = new BaseQuizService(fake.repo as any);

// 		const res = await service.getById('q1');
// 		expect(res).toEqual(quiz);

// 		expect(fake.calls.getById[0].id).toBe('q1');
// 	});

// 	it('getById: throws NotFoundError', async () => {
// 		const fake = makeFakeRepo();
// 		fake.setGetByIdResult(undefined);

// 		const service = new BaseQuizService(fake.repo as any);

// 		await expect(service.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
// 	});

// 	it('create: forwards to repo', async () => {
// 		const fake = makeFakeRepo();
// 		const created = makeBaseQuiz({ id: 'new' });
// 		fake.setCreateResult(created);

// 		const service = new BaseQuizService(fake.repo as any);

// 		const res = await service.create({} as CreateBaseQuizDto);
// 		expect(res).toEqual(created);

// 		expect(fake.calls.create[0].dto).toEqual({});
// 	});

// 	it('update: returns updated quiz', async () => {
// 		const fake = makeFakeRepo();
// 		const updated = makeBaseQuiz({ id: 'q1', updatedAt: new Date() });
// 		fake.setUpdateResult(updated);

// 		const service = new BaseQuizService(fake.repo as any);

// 		const res = await service.update('q1', {} as UpdateBaseQuizDto);
// 		expect(res).toEqual(updated);
// 	});

// 	it('update: throws NotFoundError', async () => {
// 		const fake = makeFakeRepo();
// 		fake.setUpdateResult(undefined);

// 		const service = new BaseQuizService(fake.repo as any);

// 		await expect(service.update('q1', {})).rejects.toBeInstanceOf(NotFoundError);
// 	});

// 	it('delete: returns deleted quiz', async () => {
// 		const fake = makeFakeRepo();
// 		const deleted = makeBaseQuiz({ id: 'q1' });

// 		fake.setDeleteResult(deleted);

// 		const service = new BaseQuizService(fake.repo as any);

// 		const res = await service.delete('q1');
// 		expect(res).toEqual(deleted);
// 	});

// 	it('delete: throws NotFoundError', async () => {
// 		const fake = makeFakeRepo();
// 		fake.setDeleteResult(undefined);

// 		const service = new BaseQuizService(fake.repo as any);

// 		await expect(service.delete('missing')).rejects.toBeInstanceOf(NotFoundError);
// 	});

// 	it('getByIds returns rows', async () => {
// 		const fake = makeFakeRepo();
// 		const rows = [makeBaseQuiz({ id: 'q1' })];
// 		fake.setGetByIdsResult(rows);

// 		const service = new BaseQuizService(fake.repo as any);

// 		const res = await service.getByIds(['q1']);
// 		expect(res).toEqual(rows);
// 	});
// });
