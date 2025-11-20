// import { describe, it, expect } from 'bun:test';
// import type {
// 	BaseOptionDto,
// 	CreateBaseOptionDto,
// 	UpdateBaseOptionDto
// } from '../../src/db/schema';
// import type { Transaction } from '../../src/types';
// import { BaseOptionService } from '../../src/services/baseOptionService';
// import { BaseOptionRepository } from '../../src/repositories/baseOptionRepository';
// import { NotFoundError } from 'elysia';

// function makeBaseOption(overrides: Partial<BaseOptionDto> = {}): BaseOptionDto {
// 	return {
// 		id: 'o1',
// 		baseQuestionId: 'q1',
// 		createdAt: new Date('2024-01-01T00:00:00Z'),
// 		updatedAt: null,
// 		deletedAt: null,
// 		optionText: 'Option 1',
// 		isCorrect: false,
// 		...overrides
// 	};
// }

// type RepoLike = Pick<
// 	BaseOptionRepository,
// 	| 'getById'
// 	| 'create'
// 	| 'update'
// 	| 'deleteById'
// 	| 'getByIds'
// 	| 'createMany'
// 	| 'getByBaseQuestionId'
// 	| 'getManyByBaseQuestionIds'
// >;

// function makeFakeRepo() {
// 	let getByIdResult: BaseOptionDto | undefined;
// 	let createResult: BaseOptionDto | undefined;
// 	let updateResult: BaseOptionDto | undefined;
// 	let deleteResult: BaseOptionDto | undefined;
// 	let getByIdsResult: BaseOptionDto[] = [];
// 	let createManyResult: BaseOptionDto[] = [];
// 	let getByBaseQuestionIdResult: BaseOptionDto[] = [];
// 	let getManyByBaseQuestionIdsResult: BaseOptionDto[] = [];

// 	const calls = {
// 		getById: [] as any[],
// 		create: [] as any[],
// 		update: [] as any[],
// 		deleteById: [] as any[],
// 		getByIds: [] as any[],
// 		createMany: [] as any[],
// 		getByBaseQuestionId: [] as any[],
// 		getManyByBaseQuestionIds: [] as any[]
// 	};

// 	const repo: RepoLike = {
// 		async getById(id: string, tx?: Transaction) {
// 			calls.getById.push({ id, tx });
// 			return getByIdResult;
// 		},
// 		async create(dto: CreateBaseOptionDto, tx?: Transaction) {
// 			calls.create.push({ dto, tx });
// 			if (!createResult) throw new Error('createResult not set');
// 			return createResult;
// 		},
// 		async update(id: string, dto: UpdateBaseOptionDto, tx?: Transaction) {
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
// 		},
// 		async createMany(dtos: CreateBaseOptionDto[], tx?: Transaction) {
// 			calls.createMany.push({ dtos, tx });
// 			return createManyResult;
// 		},
// 		async getByBaseQuestionId(baseQuestionId: string, tx?: Transaction) {
// 			calls.getByBaseQuestionId.push({ baseQuestionId, tx });
// 			return getByBaseQuestionIdResult;
// 		},
// 		async getManyByBaseQuestionIds(baseQuestionIds: string[], tx?: Transaction) {
// 			calls.getManyByBaseQuestionIds.push({ baseQuestionIds, tx });
// 			return getManyByBaseQuestionIdsResult;
// 		}
// 	};

// 	return {
// 		repo,
// 		calls,
// 		setGetByIdResult: (v?: BaseOptionDto) => (getByIdResult = v),
// 		setCreateResult: (v: BaseOptionDto) => (createResult = v),
// 		setUpdateResult: (v?: BaseOptionDto) => (updateResult = v),
// 		setDeleteResult: (v?: BaseOptionDto) => (deleteResult = v),
// 		setGetByIdsResult: (v: BaseOptionDto[]) => (getByIdsResult = v),
// 		setCreateManyResult: (v: BaseOptionDto[]) => (createManyResult = v),
// 		setGetByBaseQuestionIdResult: (v: BaseOptionDto[]) => (getByBaseQuestionIdResult = v),
// 		setGetManyByBaseQuestionIdsResult: (v: BaseOptionDto[]) =>
// 			(getManyByBaseQuestionIdsResult = v)
// 	};
// }

// describe('BaseOptionService', () => {
// 	// getById

// 	it('getById: returns option when found', async () => {
// 		const fake = makeFakeRepo();
// 		const option = makeBaseOption({ id: 'o1' });
// 		fake.setGetByIdResult(option);

// 		const service = new BaseOptionService(fake.repo as any);

// 		const res = await service.getById('o1');
// 		expect(res).toEqual(option);
// 		expect(fake.calls.getById[0].id).toBe('o1');
// 	});

// 	it('getById: throws NotFoundError when not found', async () => {
// 		const fake = makeFakeRepo();
// 		fake.setGetByIdResult(undefined);

// 		const service = new BaseOptionService(fake.repo as any);

// 		await expect(service.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
// 	});

// 	// create

// 	it('create: forwards to repo and returns created option', async () => {
// 		const fake = makeFakeRepo();
// 		const created = makeBaseOption({ id: 'o-new', isCorrect: true });
// 		fake.setCreateResult(created);

// 		const service = new BaseOptionService(fake.repo as any);

// 		const dto = {
// 			baseQuestionId: 'q1',
// 			optionText: 'New option',
// 			isCorrect: true
// 		} as CreateBaseOptionDto;

// 		const res = await service.create(dto);
// 		expect(res).toEqual(created);
// 		expect(fake.calls.create[0].dto).toEqual(dto);
// 	});

// 	// update

// 	it('update: returns updated option', async () => {
// 		const fake = makeFakeRepo();
// 		const updated = makeBaseOption({ id: 'o1', optionText: 'Updated', isCorrect: true });
// 		fake.setUpdateResult(updated);

// 		const service = new BaseOptionService(fake.repo as any);

// 		const patch = { optionText: 'Updated', isCorrect: true } as UpdateBaseOptionDto;

// 		const res = await service.update('o1', patch);
// 		expect(res).toEqual(updated);
// 		expect(fake.calls.update[0].id).toBe('o1');
// 		expect(fake.calls.update[0].dto).toEqual(patch);
// 	});

// 	it('update: throws NotFoundError when repo returns undefined', async () => {
// 		const fake = makeFakeRepo();
// 		fake.setUpdateResult(undefined);

// 		const service = new BaseOptionService(fake.repo as any);

// 		await expect(service.update('missing', {} as UpdateBaseOptionDto)).rejects.toBeInstanceOf(
// 			NotFoundError
// 		);
// 	});

// 	// delete

// 	it('delete: returns deleted option', async () => {
// 		const fake = makeFakeRepo();
// 		const deleted = makeBaseOption({ id: 'o1' });
// 		fake.setDeleteResult(deleted);

// 		const service = new BaseOptionService(fake.repo as any);

// 		const res = await service.delete('o1');
// 		expect(res).toEqual(deleted);
// 		expect(fake.calls.deleteById[0].id).toBe('o1');
// 	});

// 	it('delete: throws NotFoundError when repo returns undefined', async () => {
// 		const fake = makeFakeRepo();
// 		fake.setDeleteResult(undefined);

// 		const service = new BaseOptionService(fake.repo as any);

// 		await expect(service.delete('missing')).rejects.toBeInstanceOf(NotFoundError);
// 	});

// 	// getByIds

// 	it('getByIds: returns options', async () => {
// 		const fake = makeFakeRepo();
// 		const rows = [
// 			makeBaseOption({ id: 'o1' }),
// 			makeBaseOption({ id: 'o2', optionText: 'second' })
// 		];
// 		fake.setGetByIdsResult(rows);

// 		const service = new BaseOptionService(fake.repo as any);

// 		const res = await service.getByIds(['o1', 'o2']);
// 		expect(res).toEqual(rows);
// 		expect(fake.calls.getByIds[0].ids).toEqual(['o1', 'o2']);
// 	});

// 	// createMany

// 	it('createMany: forwards to repo and returns created options', async () => {
// 		const fake = makeFakeRepo();
// 		const rows = [
// 			makeBaseOption({ id: 'o1' }),
// 			makeBaseOption({ id: 'o2', isCorrect: true })
// 		];
// 		fake.setCreateManyResult(rows);

// 		const service = new BaseOptionService(fake.repo as any);

// 		const dtos: CreateBaseOptionDto[] = [
// 			{
// 				baseQuestionId: 'q1',
// 				optionText: 'O1',
// 				isCorrect: false
// 			} as CreateBaseOptionDto,
// 			{
// 				baseQuestionId: 'q1',
// 				optionText: 'O2',
// 				isCorrect: true
// 			} as CreateBaseOptionDto
// 		];

// 		const res = await service.createMany(dtos);
// 		expect(res).toEqual(rows);
// 		expect(fake.calls.createMany[0].dtos).toEqual(dtos);
// 	});

// 	// getByBaseQuestionId

// 	it('getByBaseQuestionId: returns options for question', async () => {
// 		const fake = makeFakeRepo();
// 		const rows = [
// 			makeBaseOption({ id: 'o1', baseQuestionId: 'qX' }),
// 			makeBaseOption({ id: 'o2', baseQuestionId: 'qX' })
// 		];
// 		fake.setGetByBaseQuestionIdResult(rows);

// 		const service = new BaseOptionService(fake.repo as any);

// 		const res = await service.getByBaseQuestionId('qX');
// 		expect(res).toEqual(rows);
// 		expect(fake.calls.getByBaseQuestionId[0].baseQuestionId).toBe('qX');
// 	});

// 	// getManyByBaseQuestionIds

// 	it('getManyByBaseQuestionIds: returns options for multiple questions', async () => {
// 		const fake = makeFakeRepo();
// 		const rows = [
// 			makeBaseOption({ id: 'o1', baseQuestionId: 'q1' }),
// 			makeBaseOption({ id: 'o2', baseQuestionId: 'q2' }),
// 			makeBaseOption({ id: 'o3', baseQuestionId: 'q1' })
// 		];
// 		fake.setGetManyByBaseQuestionIdsResult(rows);

// 		const service = new BaseOptionService(fake.repo as any);

// 		const res = await service.getManyByBaseQuestionIds(['q1', 'q2']);
// 		expect(res).toEqual(rows);
// 		expect(fake.calls.getManyByBaseQuestionIds[0].baseQuestionIds).toEqual(['q1', 'q2']);
// 	});
// });
