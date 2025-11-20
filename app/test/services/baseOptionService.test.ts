import { describe, it, expect } from 'bun:test';
import type {
	BaseOptionDto,
	CreateBaseOptionDto,
	UpdateBaseOptionDto
} from '../../src/db/schema';
import type { Transaction } from '../../src/types';
import { BaseOptionService } from '../../src/services/baseOptionService';
import { BaseOptionRepository } from '../../src/repositories/baseOptionRepository';
import { NotFoundError } from '../../src/errors/AppError';

function makeBaseOption(overrides: Partial<BaseOptionDto> = {}): BaseOptionDto {
	return {
		id: 'o1',
		baseQuestionId: 'q1',
		optionText: 'Option 1',
		isCorrect: false,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

type RepoFixtures = {
	getByIdResult?: BaseOptionDto | undefined;
	createResult?: BaseOptionDto;
	updateResult?: BaseOptionDto | undefined;
	deleteResult?: BaseOptionDto | undefined;
	getByIdsResult?: BaseOptionDto[];
	createManyResult?: BaseOptionDto[];
	getByBaseQuestionIdResult?: BaseOptionDto[];
	getManyByBaseQuestionIdsResult?: BaseOptionDto[];
};

class FakeBaseOptionRepository implements Partial<BaseOptionRepository> {
	public fixtures: RepoFixtures;
	public receivedTxs: {
		getById?: Transaction | undefined;
		create?: Transaction | undefined;
		update?: Transaction | undefined;
		deleteById?: Transaction | undefined;
		getByIds?: Transaction | undefined;
		createMany?: Transaction | undefined;
		getByBaseQuestionId?: Transaction | undefined;
		getManyByBaseQuestionIds?: Transaction | undefined;
	} = {};

	constructor(fixtures: RepoFixtures) {
		this.fixtures = fixtures;
	}

	async getById(id: string, tx?: Transaction): Promise<BaseOptionDto | undefined> {
		this.receivedTxs.getById = tx;
		return this.fixtures.getByIdResult;
	}

	async create(data: CreateBaseOptionDto, tx?: Transaction): Promise<BaseOptionDto> {
		this.receivedTxs.create = tx;
		if (!this.fixtures.createResult) {
			this.fixtures.createResult = makeBaseOption({
				id: 'created',
				baseQuestionId: data.baseQuestionId,
				optionText: data.optionText ?? null,
				isCorrect: data.isCorrect
			});
		}
		return this.fixtures.createResult;
	}

	async update(
		id: string,
		data: UpdateBaseOptionDto,
		tx?: Transaction
	): Promise<BaseOptionDto | undefined> {
		this.receivedTxs.update = tx;
		return this.fixtures.updateResult;
	}

	async deleteById(id: string, tx?: Transaction): Promise<BaseOptionDto | undefined> {
		this.receivedTxs.deleteById = tx;
		return this.fixtures.deleteResult;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<BaseOptionDto[]> {
		this.receivedTxs.getByIds = tx;
		return this.fixtures.getByIdsResult ?? [];
	}

	async createMany(data: CreateBaseOptionDto[], tx?: Transaction): Promise<BaseOptionDto[]> {
		this.receivedTxs.createMany = tx;
		return this.fixtures.createManyResult ?? [];
	}

	async getByBaseQuestionId(
		baseQuestionId: string,
		tx?: Transaction
	): Promise<BaseOptionDto[]> {
		this.receivedTxs.getByBaseQuestionId = tx;
		return this.fixtures.getByBaseQuestionIdResult ?? [];
	}

	async getManyByBaseQuestionIds(
		baseQuestionIds: string[],
		tx?: Transaction
	): Promise<BaseOptionDto[]> {
		this.receivedTxs.getManyByBaseQuestionIds = tx;
		return this.fixtures.getManyByBaseQuestionIdsResult ?? [];
	}
}

describe('BaseOptionService', () => {
	// getById

	it('getById: returns option when found', async () => {
		const option = makeBaseOption({ id: 'o1' });
		const repo = new FakeBaseOptionRepository({
			getByIdResult: option
		}) as unknown as BaseOptionRepository;
		const svc = new BaseOptionService(repo);

		const res = await svc.getById('o1');
		expect(res).toEqual(option);
	});

	it('getById: throws NotFoundError when option not found', async () => {
		const repo = new FakeBaseOptionRepository({
			getByIdResult: undefined
		}) as unknown as BaseOptionRepository;
		const svc = new BaseOptionService(repo);

		await expect(svc.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// create

	it('create: delegates to repository.create', async () => {
		const created = makeBaseOption({ id: 'o2', optionText: 'New option' });
		const repo = new FakeBaseOptionRepository({
			createResult: created
		}) as unknown as BaseOptionRepository;
		const svc = new BaseOptionService(repo);

		const input = {
			baseQuestionId: 'q1',
			optionText: 'New option',
			isCorrect: true
		} as CreateBaseOptionDto;

		const res = await svc.create(input);
		expect(res).toEqual(created);
	});

	// update

	it('update: returns updated option when repo returns value', async () => {
		const updated = makeBaseOption({
			id: 'o1',
			optionText: 'Updated',
			isCorrect: true
		});
		const repo = new FakeBaseOptionRepository({
			updateResult: updated
		}) as unknown as BaseOptionRepository;
		const svc = new BaseOptionService(repo);

		const patch = {
			optionText: 'Updated',
			isCorrect: true
		} as UpdateBaseOptionDto;

		const res = await svc.update('o1', patch);
		expect(res).toEqual(updated);
	});

	it('update: throws NotFoundError when repo returns undefined', async () => {
		const repo = new FakeBaseOptionRepository({
			updateResult: undefined
		}) as unknown as BaseOptionRepository;
		const svc = new BaseOptionService(repo);

		const patch = {
			optionText: 'Updated'
		} as UpdateBaseOptionDto;

		await expect(svc.update('missing', patch)).rejects.toBeInstanceOf(NotFoundError);
	});

	// delete

	it('delete: returns deleted option when repo returns value', async () => {
		const deleted = makeBaseOption({ id: 'o1' });
		const repo = new FakeBaseOptionRepository({
			deleteResult: deleted
		}) as unknown as BaseOptionRepository;
		const svc = new BaseOptionService(repo);

		const res = await svc.delete('o1');
		expect(res).toEqual(deleted);
	});

	it('delete: throws NotFoundError when repo returns undefined', async () => {
		const repo = new FakeBaseOptionRepository({
			deleteResult: undefined
		}) as unknown as BaseOptionRepository;
		const svc = new BaseOptionService(repo);

		await expect(svc.delete('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// getByIds

	it('getByIds: returns array of options', async () => {
		const rows = [
			makeBaseOption({ id: 'o1' }),
			makeBaseOption({ id: 'o2' })
		];

		const repo = new FakeBaseOptionRepository({
			getByIdsResult: rows
		}) as unknown as BaseOptionRepository;
		const svc = new BaseOptionService(repo);

		const res = await svc.getByIds(['o1', 'o2']);
		expect(res).toEqual(rows);
	});

	it('getByIds: returns empty array when none', async () => {
		const repo = new FakeBaseOptionRepository({
			getByIdsResult: []
		}) as unknown as BaseOptionRepository;
		const svc = new BaseOptionService(repo);

		const res = await svc.getByIds(['o1', 'o2']);
		expect(res).toEqual([]);
	});

	// createMany

	it('createMany: delegates to repository.createMany', async () => {
		const created = [
			makeBaseOption({ id: 'o1' }),
			makeBaseOption({ id: 'o2' })
		];

		const repo = new FakeBaseOptionRepository({
			createManyResult: created
		}) as unknown as BaseOptionRepository;
		const svc = new BaseOptionService(repo);

		const input: CreateBaseOptionDto[] = [
			{ baseQuestionId: 'q1', optionText: 'A', isCorrect: false } as CreateBaseOptionDto,
			{ baseQuestionId: 'q1', optionText: 'B', isCorrect: true } as CreateBaseOptionDto
		];

		const res = await svc.createMany(input);
		expect(res).toEqual(created);
	});

	// getByBaseQuestionId

	it('getByBaseQuestionId: returns options for question', async () => {
		const rows = [
			makeBaseOption({ id: 'o1', baseQuestionId: 'qX' }),
			makeBaseOption({ id: 'o2', baseQuestionId: 'qX' })
		];

		const repo = new FakeBaseOptionRepository({
			getByBaseQuestionIdResult: rows
		}) as unknown as BaseOptionRepository;
		const svc = new BaseOptionService(repo);

		const res = await svc.getByBaseQuestionId('qX');
		expect(res).toEqual(rows);
	});

	// getManyByBaseQuestionIds

	it('getManyByBaseQuestionIds: returns options for multiple baseQuestionIds', async () => {
		const rows = [
			makeBaseOption({ id: 'o1', baseQuestionId: 'q1' }),
			makeBaseOption({ id: 'o2', baseQuestionId: 'q2' }),
			makeBaseOption({ id: 'o3', baseQuestionId: 'q1' })
		];

		const repo = new FakeBaseOptionRepository({
			getManyByBaseQuestionIdsResult: rows
		}) as unknown as BaseOptionRepository;
		const svc = new BaseOptionService(repo);

		const res = await svc.getManyByBaseQuestionIds(['q1', 'q2']);
		expect(res).toEqual(rows);
	});

	// transaction wiring

	it('passes transaction through to repository methods (example: getById)', async () => {
		const option = makeBaseOption({ id: 'o1' });
		const fakeRepo = new FakeBaseOptionRepository({
			getByIdResult: option
		});
		const repo = fakeRepo as unknown as BaseOptionRepository;
		const svc = new BaseOptionService(repo);
		const tx = {} as Transaction;

		await svc.getById('o1', tx);

		expect(fakeRepo.receivedTxs.getById).toBe(tx);
	});
});
