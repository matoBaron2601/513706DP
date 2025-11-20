import { describe, it, expect } from 'bun:test';
import type { BaseQuizDto, CreateBaseQuizDto, UpdateBaseQuizDto } from '../../../src/db/schema';
import type { Transaction } from '../../../src/types';
import { BaseQuizService } from '../../../src/services/baseQuizService';
import { BaseQuizRepository } from '../../../src/repositories/baseQuizRepository';
import { NotFoundError } from '../../../src/errors/AppError';

function makeBaseQuiz(overrides: Partial<BaseQuizDto> = {}): BaseQuizDto {
	return {
		id: 'quiz1',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

type RepoFixtures = {
	getByIdResult?: BaseQuizDto | undefined;
	createResult?: BaseQuizDto;
	updateResult?: BaseQuizDto | undefined;
	deleteResult?: BaseQuizDto | undefined;
	getByIdsResult?: BaseQuizDto[];
};

class FakeBaseQuizRepository implements Partial<BaseQuizRepository> {
	public fixtures: RepoFixtures;
	public receivedTxs: {
		getById?: Transaction | undefined;
		create?: Transaction | undefined;
		update?: Transaction | undefined;
		deleteById?: Transaction | undefined;
		getByIds?: Transaction | undefined;
	} = {};

	constructor(fixtures: RepoFixtures) {
		this.fixtures = fixtures;
	}

	async getById(id: string, tx?: Transaction): Promise<BaseQuizDto | undefined> {
		this.receivedTxs.getById = tx;
		return this.fixtures.getByIdResult;
	}

	async create(data: CreateBaseQuizDto, tx?: Transaction): Promise<BaseQuizDto> {
		this.receivedTxs.create = tx;
		if (!this.fixtures.createResult) {
			this.fixtures.createResult = makeBaseQuiz({
				id: 'created'
			});
		}
		return this.fixtures.createResult;
	}

	async update(
		id: string,
		patch: UpdateBaseQuizDto,
		tx?: Transaction
	): Promise<BaseQuizDto | undefined> {
		this.receivedTxs.update = tx;
		return this.fixtures.updateResult;
	}

	async deleteById(id: string, tx?: Transaction): Promise<BaseQuizDto | undefined> {
		this.receivedTxs.deleteById = tx;
		return this.fixtures.deleteResult;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<BaseQuizDto[]> {
		this.receivedTxs.getByIds = tx;
		return this.fixtures.getByIdsResult ?? [];
	}
}

describe('BaseQuizService', () => {
	// getById

	it('getById: returns quiz when found', async () => {
		const quiz = makeBaseQuiz({ id: 'quiz1' });
		const repo = new FakeBaseQuizRepository({
			getByIdResult: quiz
		}) as unknown as BaseQuizRepository;
		const svc = new BaseQuizService(repo);

		const res = await svc.getById('quiz1');
		expect(res).toEqual(quiz);
	});

	it('getById: throws NotFoundError when not found', async () => {
		const repo = new FakeBaseQuizRepository({
			getByIdResult: undefined
		}) as unknown as BaseQuizRepository;
		const svc = new BaseQuizService(repo);

		await expect(svc.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// create

	it('create: delegates to repository.create', async () => {
		const created = makeBaseQuiz({ id: 'quiz2' });
		const repo = new FakeBaseQuizRepository({
			createResult: created
		}) as unknown as BaseQuizRepository;
		const svc = new BaseQuizService(repo);

		const input = {
			id: 'quiz2'
		} as CreateBaseQuizDto;

		const res = await svc.create(input);
		expect(res).toEqual(created);
	});

	// update

	it('update: returns updated quiz when repo returns value', async () => {
		const updated = makeBaseQuiz({
			id: 'quiz1',
			updatedAt: new Date()
		});
		const repo = new FakeBaseQuizRepository({
			updateResult: updated
		}) as unknown as BaseQuizRepository;
		const svc = new BaseQuizService(repo);

		const patch = {} as UpdateBaseQuizDto;
		const res = await svc.update('quiz1', patch);
		expect(res).toEqual(updated);
	});

	it('update: throws NotFoundError when repo returns undefined', async () => {
		const repo = new FakeBaseQuizRepository({
			updateResult: undefined
		}) as unknown as BaseQuizRepository;
		const svc = new BaseQuizService(repo);

		const patch = {} as UpdateBaseQuizDto;
		await expect(svc.update('missing', patch)).rejects.toBeInstanceOf(NotFoundError);
	});

	// delete

	it('delete: returns deleted quiz when repo returns value', async () => {
		const deleted = makeBaseQuiz({ id: 'quiz1' });
		const repo = new FakeBaseQuizRepository({
			deleteResult: deleted
		}) as unknown as BaseQuizRepository;
		const svc = new BaseQuizService(repo);

		const res = await svc.delete('quiz1');
		expect(res).toEqual(deleted);
	});

	it('delete: throws NotFoundError when repo returns undefined', async () => {
		const repo = new FakeBaseQuizRepository({
			deleteResult: undefined
		}) as unknown as BaseQuizRepository;
		const svc = new BaseQuizService(repo);

		await expect(svc.delete('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// getByIds

	it('getByIds: returns array of quizzes', async () => {
		const rows = [makeBaseQuiz({ id: 'quiz1' }), makeBaseQuiz({ id: 'quiz2' })];

		const repo = new FakeBaseQuizRepository({
			getByIdsResult: rows
		}) as unknown as BaseQuizRepository;
		const svc = new BaseQuizService(repo);

		const res = await svc.getByIds(['quiz1', 'quiz2']);
		expect(res).toEqual(rows);
	});

	it('getByIds: returns empty array when none', async () => {
		const repo = new FakeBaseQuizRepository({
			getByIdsResult: []
		}) as unknown as BaseQuizRepository;
		const svc = new BaseQuizService(repo);

		const res = await svc.getByIds(['quiz1', 'quiz2']);
		expect(res).toEqual([]);
	});

	// transaction wiring

	it('passes transaction through to repository methods (example: getById)', async () => {
		const quiz = makeBaseQuiz({ id: 'quiz1' });
		const fakeRepo = new FakeBaseQuizRepository({
			getByIdResult: quiz
		});
		const repo = fakeRepo as unknown as BaseQuizRepository;
		const svc = new BaseQuizService(repo);
		const tx = {} as Transaction;

		await svc.getById('quiz1', tx);

		expect(fakeRepo.receivedTxs.getById).toBe(tx);
	});
});
