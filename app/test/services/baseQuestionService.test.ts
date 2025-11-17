import { describe, it, expect } from 'bun:test';
import type {
	BaseQuestionDto,
	CreateBaseQuestionDto,
	UpdateBaseQuestionDto
} from '../../src/db/schema';
import type { Transaction } from '../../src/types';
import { BaseQuestionService } from '../../src/services/baseQuestionService';
import { NotFoundError } from '../../src/services/utils/notFoundError';
import { BaseQuestionRepository } from '../../src/repositories/baseQuestionRepository';

function makeBaseQuestion(overrides: Partial<BaseQuestionDto> = {}): BaseQuestionDto {
	return {
		id: 'q1',
		baseQuizId: 'bq1',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		questionText: 'What is 2+2?',
		correctAnswerText: '4',
		conceptId: 'concept-1',
		codeSnippet: '2+2',
		questionType: 'single-choice',
		orderIndex: 1,
		...overrides
	};
}

type RepoLike = Pick<
	BaseQuestionRepository,
	| 'getById'
	| 'create'
	| 'update'
	| 'deleteById'
	| 'getByIds'
	| 'createMany'
	| 'getByBaseQuizId'
	| 'getBaseQuizIdByQuestionId'
>;

function makeFakeRepo() {
	let getByIdResult: BaseQuestionDto | undefined;
	let createResult: BaseQuestionDto | undefined;
	let updateResult: BaseQuestionDto | undefined;
	let deleteResult: BaseQuestionDto | undefined;
	let getByIdsResult: BaseQuestionDto[] = [];
	let createManyResult: BaseQuestionDto[] = [];
	let getByBaseQuizIdResult: BaseQuestionDto[] = [];
	let getBaseQuizIdByQuestionIdResult: string | undefined;

	const calls = {
		getById: [] as any[],
		create: [] as any[],
		update: [] as any[],
		deleteById: [] as any[],
		getByIds: [] as any[],
		createMany: [] as any[],
		getByBaseQuizId: [] as any[],
		getBaseQuizIdByQuestionId: [] as any[]
	};

	const repo: RepoLike = {
		async getById(id: string, tx?: Transaction) {
			calls.getById.push({ id, tx });
			return getByIdResult;
		},
		async create(dto: CreateBaseQuestionDto, tx?: Transaction) {
			calls.create.push({ dto, tx });
			if (!createResult) throw new Error('createResult not set');
			return createResult;
		},
		async update(id: string, dto: UpdateBaseQuestionDto, tx?: Transaction) {
			calls.update.push({ id, dto, tx });
			return updateResult;
		},
		async deleteById(id: string, tx?: Transaction) {
			calls.deleteById.push({ id, tx });
			return deleteResult;
		},
		async getByIds(ids: string[], tx?: Transaction) {
			calls.getByIds.push({ ids, tx });
			return getByIdsResult;
		},
		async createMany(dtos: CreateBaseQuestionDto[], tx?: Transaction) {
			calls.createMany.push({ dtos, tx });
			return createManyResult;
		},
		async getByBaseQuizId(baseQuizId: string, tx?: Transaction) {
			calls.getByBaseQuizId.push({ baseQuizId, tx });
			return getByBaseQuizIdResult;
		},
		async getBaseQuizIdByQuestionId(questionId: string, tx?: Transaction) {
			calls.getBaseQuizIdByQuestionId.push({ questionId, tx });
			if (getBaseQuizIdByQuestionIdResult === undefined) return undefined;
			// služba očakáva string, repo môže vrátiť string | undefined
			return getBaseQuizIdByQuestionIdResult as any;
		}
	};

	return {
		repo,
		calls,
		setGetByIdResult: (v?: BaseQuestionDto) => (getByIdResult = v),
		setCreateResult: (v: BaseQuestionDto) => (createResult = v),
		setUpdateResult: (v?: BaseQuestionDto) => (updateResult = v),
		setDeleteResult: (v?: BaseQuestionDto) => (deleteResult = v),
		setGetByIdsResult: (v: BaseQuestionDto[]) => (getByIdsResult = v),
		setCreateManyResult: (v: BaseQuestionDto[]) => (createManyResult = v),
		setGetByBaseQuizIdResult: (v: BaseQuestionDto[]) => (getByBaseQuizIdResult = v),
		setGetBaseQuizIdByQuestionIdResult: (v?: string) =>
			(getBaseQuizIdByQuestionIdResult = v)
	};
}

describe('BaseQuestionService', () => {
	it('getById: returns question when found', async () => {
		const fake = makeFakeRepo();
		const q = makeBaseQuestion({ id: 'q1' });
		fake.setGetByIdResult(q);

		const service = new BaseQuestionService(fake.repo as any);

		const res = await service.getById('q1');
		expect(res).toEqual(q);
		expect(fake.calls.getById[0].id).toBe('q1');
	});

	it('getById: throws NotFoundError when not found', async () => {
		const fake = makeFakeRepo();
		fake.setGetByIdResult(undefined);

		const service = new BaseQuestionService(fake.repo as any);

		await expect(service.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	it('create: forwards to repo and returns created question', async () => {
		const fake = makeFakeRepo();
		const created = makeBaseQuestion({ id: 'q-new' });
		fake.setCreateResult(created);

		const service = new BaseQuestionService(fake.repo as any);

		const dto = {
			baseQuizId: 'bq1',
			questionText: 'Q',
			correctAnswerText: 'A',
			conceptId: 'c1',
			codeSnippet: 'code',
			questionType: 'type',
			orderIndex: 1
		} as CreateBaseQuestionDto;

		const res = await service.create(dto);
		expect(res).toEqual(created);
		expect(fake.calls.create[0].dto).toEqual(dto);
	});

	it('update: returns updated question', async () => {
		const fake = makeFakeRepo();
		const updated = makeBaseQuestion({ id: 'q1', questionText: 'updated' });
		fake.setUpdateResult(updated);

		const service = new BaseQuestionService(fake.repo as any);

		const patch = { questionText: 'updated' } as UpdateBaseQuestionDto;

		const res = await service.update('q1', patch);
		expect(res).toEqual(updated);
		expect(fake.calls.update[0].id).toBe('q1');
		expect(fake.calls.update[0].dto).toEqual(patch);
	});

	it('update: throws NotFoundError when repo returns undefined', async () => {
		const fake = makeFakeRepo();
		fake.setUpdateResult(undefined);

		const service = new BaseQuestionService(fake.repo as any);

		await expect(service.update('missing', {} as UpdateBaseQuestionDto)).rejects.toBeInstanceOf(
			NotFoundError
		);
	});

	it('delete: returns deleted question', async () => {
		const fake = makeFakeRepo();
		const deleted = makeBaseQuestion({ id: 'q1' });
		fake.setDeleteResult(deleted);

		const service = new BaseQuestionService(fake.repo as any);

		const res = await service.delete('q1');
		expect(res).toEqual(deleted);
		expect(fake.calls.deleteById[0].id).toBe('q1');
	});

	it('delete: throws NotFoundError when repo returns undefined', async () => {
		const fake = makeFakeRepo();
		fake.setDeleteResult(undefined);

		const service = new BaseQuestionService(fake.repo as any);

		await expect(service.delete('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	it('getManyByIds: returns questions', async () => {
		const fake = makeFakeRepo();
		const rows = [makeBaseQuestion({ id: 'q1' }), makeBaseQuestion({ id: 'q2' })];
		fake.setGetByIdsResult(rows);

		const service = new BaseQuestionService(fake.repo as any);

		const res = await service.getManyByIds(['q1', 'q2']);
		expect(res).toEqual(rows);
		expect(fake.calls.getByIds[0].ids).toEqual(['q1', 'q2']);
	});

	it('createMany: forwards to repo and returns created questions', async () => {
		const fake = makeFakeRepo();
		const rows = [makeBaseQuestion({ id: 'q1' }), makeBaseQuestion({ id: 'q2' })];
		fake.setCreateManyResult(rows);

		const service = new BaseQuestionService(fake.repo as any);

		const dtos: CreateBaseQuestionDto[] = [
			{
				baseQuizId: 'bq1',
				questionText: 'Q1',
				correctAnswerText: 'A1',
				conceptId: 'c1',
				codeSnippet: 'code1',
				questionType: 'type',
				orderIndex: 1
			} as CreateBaseQuestionDto,
			{
				baseQuizId: 'bq1',
				questionText: 'Q2',
				correctAnswerText: 'A2',
				conceptId: 'c2',
				codeSnippet: 'code2',
				questionType: 'type',
				orderIndex: 2
			} as CreateBaseQuestionDto
		];

		const res = await service.createMany(dtos);
		expect(res).toEqual(rows);
		expect(fake.calls.createMany[0].dtos).toEqual(dtos);
	});

	it('getByBaseQuizId: returns questions for quiz', async () => {
		const fake = makeFakeRepo();
		const rows = [makeBaseQuestion({ id: 'q1', baseQuizId: 'bqX' })];
		fake.setGetByBaseQuizIdResult(rows);

		const service = new BaseQuestionService(fake.repo as any);

		const res = await service.getByBaseQuizId('bqX');
		expect(res).toEqual(rows);
		expect(fake.calls.getByBaseQuizId[0].baseQuizId).toBe('bqX');
	});

	it('getBaseQuizIdByQuestionId: returns baseQuizId', async () => {
		const fake = makeFakeRepo();
		fake.setGetBaseQuizIdByQuestionIdResult('bq-returned');

		const service = new BaseQuestionService(fake.repo as any);

		const res = await service.getBaseQuizIdByQuestionId('q1');
		expect(res).toBe('bq-returned');
		expect(fake.calls.getBaseQuizIdByQuestionId[0].questionId).toBe('q1');
	});

	it('getBaseQuizIdByQuestionId: throws NotFoundError when repo returns undefined', async () => {
		const fake = makeFakeRepo();
		fake.setGetBaseQuizIdByQuestionIdResult(undefined);

		const service = new BaseQuestionService(fake.repo as any);

		await expect(
			service.getBaseQuizIdByQuestionId('missing')
		).rejects.toBeInstanceOf(NotFoundError);
	});
});
