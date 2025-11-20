import { describe, it, expect } from 'bun:test';
import type {
	ConceptProgressDto,
	CreateConceptProgressDto,
	UpdateConceptProgressDto
} from '../../src/db/schema';
import type { Transaction } from '../../src/types';
import { ConceptProgressService } from '../../src/services/conceptProgressService';
import { ConceptProgressRepository } from '../../src/repositories/conceptProgressRepository';
import { NotFoundError } from '../../src/errors/AppError';

function makeConceptProgress(
	overrides: Partial<ConceptProgressDto> = {}
): ConceptProgressDto {
	return {
		id: 'cp1',
		userBlockId: 'ub1',
		conceptId: 'c1',
		correctA1: 0,
		askedA1: 0,
		correctA2: 0,
		askedA2: 0,
		correctB1: 0,
		askedB1: 0,
		correctB2: 0,
		askedB2: 0,
		alfa: 0,
		beta: 0,
		variance: 0,
		score: 0,
		streak: 0,
		mastered: false,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

type RepoFixtures = {
	getByIdResult?: ConceptProgressDto | undefined;
	createResult?: ConceptProgressDto;
	updateResult?: ConceptProgressDto | undefined;
	deleteResult?: ConceptProgressDto | undefined;
	createManyResult?: ConceptProgressDto[];
	updateManyResult?: ConceptProgressDto[];
	getManyByUserBlockIdResult?: ConceptProgressDto[];
	getByUserBlockIdAndConceptIdResult?: ConceptProgressDto | undefined;
	getManyIncompleteByUserBlockIdResult?: ConceptProgressDto[];
};

class FakeConceptProgressRepository implements Partial<ConceptProgressRepository> {
	public fixtures: RepoFixtures;
	public receivedTxs: {
		getById?: Transaction | undefined;
		create?: Transaction | undefined;
		update?: Transaction | undefined;
		updateMany?: Transaction | undefined;
		delete?: Transaction | undefined;
		createMany?: Transaction | undefined;
		getManyByUserBlockId?: Transaction | undefined;
		getByUserBlockIdAndConceptId?: Transaction | undefined;
		getManyIncompleteByUserBlockId?: Transaction | undefined;
	} = {};

	constructor(fixtures: RepoFixtures) {
		this.fixtures = fixtures;
	}

	async getById(id: string, tx?: Transaction): Promise<ConceptProgressDto | undefined> {
		this.receivedTxs.getById = tx;
		return this.fixtures.getByIdResult;
	}

	async create(
		data: CreateConceptProgressDto,
		tx?: Transaction
	): Promise<ConceptProgressDto> {
		this.receivedTxs.create = tx;
		if (!this.fixtures.createResult) {
			this.fixtures.createResult = makeConceptProgress({
				id: 'created',
				userBlockId: data.userBlockId,
				conceptId: data.conceptId
			});
		}
		return this.fixtures.createResult;
	}

	async update(
		id: string,
		data: UpdateConceptProgressDto,
		tx?: Transaction
	): Promise<ConceptProgressDto | undefined> {
		this.receivedTxs.update = tx;
		return this.fixtures.updateResult;
	}

	async updateMany(
		ids: string[],
		data: UpdateConceptProgressDto,
		tx?: Transaction
	): Promise<ConceptProgressDto[]> {
		this.receivedTxs.updateMany = tx;
		return this.fixtures.updateManyResult ?? [];
	}

	async delete(id: string, tx?: Transaction): Promise<ConceptProgressDto | undefined> {
		this.receivedTxs.delete = tx;
		return this.fixtures.deleteResult;
	}

	async createMany(
		data: CreateConceptProgressDto[],
		tx?: Transaction
	): Promise<ConceptProgressDto[]> {
		this.receivedTxs.createMany = tx;
		return this.fixtures.createManyResult ?? [];
	}

	async getManyByUserBlockId(
		userBlockId: string,
		tx?: Transaction
	): Promise<ConceptProgressDto[]> {
		this.receivedTxs.getManyByUserBlockId = tx;
		return this.fixtures.getManyByUserBlockIdResult ?? [];
	}

	async getByUserBlockIdAndConceptId(
		userBlockId: string,
		conceptId: string,
		tx?: Transaction
	): Promise<ConceptProgressDto | undefined> {
		this.receivedTxs.getByUserBlockIdAndConceptId = tx;
		return this.fixtures.getByUserBlockIdAndConceptIdResult;
	}

	async getManyIncompleteByUserBlockId(
		userBlockId: string,
		tx?: Transaction
	): Promise<ConceptProgressDto[]> {
		this.receivedTxs.getManyIncompleteByUserBlockId = tx;
		return this.fixtures.getManyIncompleteByUserBlockIdResult ?? [];
	}
}

describe('ConceptProgressService', () => {
	// getById

	it('getById: returns conceptProgress when found', async () => {
		const cp = makeConceptProgress({ id: 'cp1' });
		const repo = new FakeConceptProgressRepository({
			getByIdResult: cp
		}) as unknown as ConceptProgressRepository;
		const svc = new ConceptProgressService(repo);

		const res = await svc.getById('cp1');
		expect(res).toEqual(cp);
	});

	it('getById: throws NotFoundError when not found', async () => {
		const repo = new FakeConceptProgressRepository({
			getByIdResult: undefined
		}) as unknown as ConceptProgressRepository;
		const svc = new ConceptProgressService(repo);

		await expect(svc.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// create

	it('create: delegates to repository.create', async () => {
		const created = makeConceptProgress({ id: 'cp2' });
		const repo = new FakeConceptProgressRepository({
			createResult: created
		}) as unknown as ConceptProgressRepository;
		const svc = new ConceptProgressService(repo);

		const input = {
			userBlockId: 'ub1',
			conceptId: 'c1'
		} as CreateConceptProgressDto;

		const res = await svc.create(input);
		expect(res).toEqual(created);
	});

	// update

	it('update: returns updated conceptProgress when repo returns value', async () => {
		const updated = makeConceptProgress({
			id: 'cp1',
			mastered: true
		});
		const repo = new FakeConceptProgressRepository({
			updateResult: updated
		}) as unknown as ConceptProgressRepository;
		const svc = new ConceptProgressService(repo);

		const patch = {
			mastered: true
		} as UpdateConceptProgressDto;

		const res = await svc.update('cp1', patch);
		expect(res).toEqual(updated);
	});

	it('update: throws NotFoundError when repo returns undefined', async () => {
		const repo = new FakeConceptProgressRepository({
			updateResult: undefined
		}) as unknown as ConceptProgressRepository;
		const svc = new ConceptProgressService(repo);

		const patch = {
			mastered: true
		} as UpdateConceptProgressDto;

		await expect(svc.update('missing', patch)).rejects.toBeInstanceOf(NotFoundError);
	});

	// updateMany

	it('updateMany: delegates to repository.updateMany', async () => {
		const rows = [
			makeConceptProgress({ id: 'cp1', mastered: true }),
			makeConceptProgress({ id: 'cp2', mastered: true })
		];

		const repo = new FakeConceptProgressRepository({
			updateManyResult: rows
		}) as unknown as ConceptProgressRepository;
		const svc = new ConceptProgressService(repo);

		const patch = {
			mastered: true
		} as UpdateConceptProgressDto;

		const res = await svc.updateMany(['cp1', 'cp2'], patch);
		expect(res).toEqual(rows);
	});

	// delete

	it('delete: returns deleted conceptProgress when repo returns value', async () => {
		const deleted = makeConceptProgress({ id: 'cp1' });
		const repo = new FakeConceptProgressRepository({
			deleteResult: deleted
		}) as unknown as ConceptProgressRepository;
		const svc = new ConceptProgressService(repo);

		const res = await svc.delete('cp1');
		expect(res).toEqual(deleted);
	});

	it('delete: throws NotFoundError when repo returns undefined', async () => {
		const repo = new FakeConceptProgressRepository({
			deleteResult: undefined
		}) as unknown as ConceptProgressRepository;
		const svc = new ConceptProgressService(repo);

		await expect(svc.delete('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// createMany

	it('createMany: delegates to repository.createMany', async () => {
		const created = [
			makeConceptProgress({ id: 'cp1' }),
			makeConceptProgress({ id: 'cp2' })
		];

		const repo = new FakeConceptProgressRepository({
			createManyResult: created
		}) as unknown as ConceptProgressRepository;
		const svc = new ConceptProgressService(repo);

		const input: CreateConceptProgressDto[] = [
			{ userBlockId: 'ub1', conceptId: 'c1' } as CreateConceptProgressDto,
			{ userBlockId: 'ub1', conceptId: 'c2' } as CreateConceptProgressDto
		];

		const res = await svc.createMany(input);
		expect(res).toEqual(created);
	});

	// getManyByUserBlockId

	it('getManyByUserBlockId: returns list for userBlockId', async () => {
		const rows = [
			makeConceptProgress({ id: 'cp1', userBlockId: 'ubX' }),
			makeConceptProgress({ id: 'cp2', userBlockId: 'ubX' })
		];

		const repo = new FakeConceptProgressRepository({
			getManyByUserBlockIdResult: rows
		}) as unknown as ConceptProgressRepository;
		const svc = new ConceptProgressService(repo);

		const res = await svc.getManyByUserBlockId('ubX');
		expect(res).toEqual(rows);
	});

	it('getManyByUserBlockId: returns empty array when none', async () => {
		const repo = new FakeConceptProgressRepository({
			getManyByUserBlockIdResult: []
		}) as unknown as ConceptProgressRepository;
		const svc = new ConceptProgressService(repo);

		const res = await svc.getManyByUserBlockId('ubX');
		expect(res).toEqual([]);
	});

	// getOrCreateConceptProgress

	it('getOrCreateConceptProgress: returns existing when found', async () => {
		const existing = makeConceptProgress({
			id: 'cpExisting',
			userBlockId: 'ub1',
			conceptId: 'c1'
		});

		const repo = new FakeConceptProgressRepository({
			getByUserBlockIdAndConceptIdResult: existing,
			createResult: makeConceptProgress({ id: 'cpNew' })
		}) as unknown as ConceptProgressRepository;
		const svc = new ConceptProgressService(repo);

		const input = {
			userBlockId: 'ub1',
			conceptId: 'c1'
		} as CreateConceptProgressDto;

		const res = await svc.getOrCreateConceptProgress(input);
		expect(res).toEqual(existing);
	});

	it('getOrCreateConceptProgress: creates when none exist', async () => {
		const created = makeConceptProgress({
			id: 'cpNew',
			userBlockId: 'ub1',
			conceptId: 'c1'
		});

		const repo = new FakeConceptProgressRepository({
			getByUserBlockIdAndConceptIdResult: undefined,
			createResult: created
		}) as unknown as ConceptProgressRepository;
		const svc = new ConceptProgressService(repo);

		const input = {
			userBlockId: 'ub1',
			conceptId: 'c1'
		} as CreateConceptProgressDto;

		const res = await svc.getOrCreateConceptProgress(input);
		expect(res).toEqual(created);
	});

	// getManyIncompleteByUserBlockId

	it('getManyIncompleteByUserBlockId: returns incomplete progresses', async () => {
		const rows = [
			makeConceptProgress({ id: 'cp1', userBlockId: 'ubX', mastered: false }),
			makeConceptProgress({ id: 'cp2', userBlockId: 'ubX', mastered: false })
		];

		const repo = new FakeConceptProgressRepository({
			getManyIncompleteByUserBlockIdResult: rows
		}) as unknown as ConceptProgressRepository;
		const svc = new ConceptProgressService(repo);

		const res = await svc.getManyIncompleteByUserBlockId('ubX');
		expect(res).toEqual(rows);
	});

	it('getManyIncompleteByUserBlockId: returns empty array when none', async () => {
		const repo = new FakeConceptProgressRepository({
			getManyIncompleteByUserBlockIdResult: []
		}) as unknown as ConceptProgressRepository;
		const svc = new ConceptProgressService(repo);

		const res = await svc.getManyIncompleteByUserBlockId('ubX');
		expect(res).toEqual([]);
	});

	// transaction wiring

	it('passes transaction through to repository methods (example: getById)', async () => {
		const cp = makeConceptProgress({ id: 'cp1' });
		const fakeRepo = new FakeConceptProgressRepository({
			getByIdResult: cp
		});
		const repo = fakeRepo as unknown as ConceptProgressRepository;
		const svc = new ConceptProgressService(repo);
		const tx = {} as Transaction;

		await svc.getById('cp1', tx);

		expect(fakeRepo.receivedTxs.getById).toBe(tx);
	});
});
