import { describe, it, expect } from 'bun:test';
import type { ConceptDto, CreateConceptDto, UpdateConceptDto } from '../../../src/db/schema';
import type { Transaction } from '../../../src/types';
import { ConceptService } from '../../../src/services/conceptService';
import { ConceptRepository } from '../../../src/repositories/conceptRepository';
import { NotFoundError } from '../../../src/errors/AppError';

function makeConcept(overrides: Partial<ConceptDto> = {}): ConceptDto {
	return {
		id: 'c1',
		name: 'Concept 1',
		blockId: 'b1',
		difficultyIndex: 1,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

type RepoFixtures = {
	getByIdResult?: ConceptDto | undefined;
	createResult?: ConceptDto;
	updateResult?: ConceptDto | undefined;
	deleteResult?: ConceptDto | undefined;
	getByIdsResult?: ConceptDto[];
	createManyResult?: ConceptDto[];
	getManyByBlockIdResult?: ConceptDto[];
	getManyByBlockIdsResult?: ConceptDto[];
};

class FakeConceptRepository implements Partial<ConceptRepository> {
	public fixtures: RepoFixtures;
	public receivedTxs: {
		getById?: Transaction | undefined;
		create?: Transaction | undefined;
		update?: Transaction | undefined;
		delete?: Transaction | undefined;
		getByIds?: Transaction | undefined;
		createMany?: Transaction | undefined;
		getManyByBlockId?: Transaction | undefined;
		getManyByBlockIds?: Transaction | undefined;
	} = {};

	constructor(fixtures: RepoFixtures) {
		this.fixtures = fixtures;
	}

	async getById(id: string, tx?: Transaction): Promise<ConceptDto | undefined> {
		this.receivedTxs.getById = tx;
		return this.fixtures.getByIdResult;
	}

	async create(data: CreateConceptDto, tx?: Transaction): Promise<ConceptDto> {
		this.receivedTxs.create = tx;
		if (!this.fixtures.createResult) {
			this.fixtures.createResult = makeConcept({
				id: 'created',
				name: data.name,
				blockId: data.blockId,
				difficultyIndex: data.difficultyIndex
			});
		}
		return this.fixtures.createResult;
	}

	async update(
		id: string,
		data: UpdateConceptDto,
		tx?: Transaction
	): Promise<ConceptDto | undefined> {
		this.receivedTxs.update = tx;
		return this.fixtures.updateResult;
	}

	async delete(id: string, tx?: Transaction): Promise<ConceptDto | undefined> {
		this.receivedTxs.delete = tx;
		return this.fixtures.deleteResult;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<ConceptDto[]> {
		this.receivedTxs.getByIds = tx;
		return this.fixtures.getByIdsResult ?? [];
	}

	async createMany(data: CreateConceptDto[], tx?: Transaction): Promise<ConceptDto[]> {
		this.receivedTxs.createMany = tx;
		return this.fixtures.createManyResult ?? [];
	}

	async getManyByBlockId(blockId: string, tx?: Transaction): Promise<ConceptDto[]> {
		this.receivedTxs.getManyByBlockId = tx;
		return this.fixtures.getManyByBlockIdResult ?? [];
	}

	async getManyByBlockIds(blockIds: string[], tx?: Transaction): Promise<ConceptDto[]> {
		this.receivedTxs.getManyByBlockIds = tx;
		return this.fixtures.getManyByBlockIdsResult ?? [];
	}
}

describe('ConceptService', () => {
	// getById

	it('getById: returns concept when found', async () => {
		const concept = makeConcept({ id: 'c1' });
		const repo = new FakeConceptRepository({
			getByIdResult: concept
		}) as unknown as ConceptRepository;
		const svc = new ConceptService(repo);

		const res = await svc.getById('c1');
		expect(res).toEqual(concept);
	});

	it('getById: throws NotFoundError when not found', async () => {
		const repo = new FakeConceptRepository({
			getByIdResult: undefined
		}) as unknown as ConceptRepository;
		const svc = new ConceptService(repo);

		await expect(svc.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// create

	it('create: delegates to repository.create', async () => {
		const created = makeConcept({ id: 'c2', name: 'New Concept' });
		const repo = new FakeConceptRepository({
			createResult: created
		}) as unknown as ConceptRepository;
		const svc = new ConceptService(repo);

		const input = {
			name: 'New Concept',
			blockId: 'b1',
			difficultyIndex: 2
		} as CreateConceptDto;

		const res = await svc.create(input);
		expect(res).toEqual(created);
	});

	// update

	it('update: returns updated concept when repo returns value', async () => {
		const updated = makeConcept({
			id: 'c1',
			name: 'Updated Concept'
		});
		const repo = new FakeConceptRepository({
			updateResult: updated
		}) as unknown as ConceptRepository;
		const svc = new ConceptService(repo);

		const patch = {
			name: 'Updated Concept'
		} as UpdateConceptDto;

		const res = await svc.update('c1', patch);
		expect(res).toEqual(updated);
	});

	it('update: throws NotFoundError when repo returns undefined', async () => {
		const repo = new FakeConceptRepository({
			updateResult: undefined
		}) as unknown as ConceptRepository;
		const svc = new ConceptService(repo);

		const patch = {
			name: 'Updated Concept'
		} as UpdateConceptDto;

		await expect(svc.update('missing', patch)).rejects.toBeInstanceOf(NotFoundError);
	});

	// delete

	it('delete: returns deleted concept when repo returns value', async () => {
		const deleted = makeConcept({ id: 'c1' });
		const repo = new FakeConceptRepository({
			deleteResult: deleted
		}) as unknown as ConceptRepository;
		const svc = new ConceptService(repo);

		const res = await svc.delete('c1');
		expect(res).toEqual(deleted);
	});

	it('delete: throws NotFoundError when repo returns undefined', async () => {
		const repo = new FakeConceptRepository({
			deleteResult: undefined
		}) as unknown as ConceptRepository;
		const svc = new ConceptService(repo);

		await expect(svc.delete('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// getManyByIds

	it('getManyByIds: returns array of concepts', async () => {
		const rows = [makeConcept({ id: 'c1' }), makeConcept({ id: 'c2' })];

		const repo = new FakeConceptRepository({
			getByIdsResult: rows
		}) as unknown as ConceptRepository;
		const svc = new ConceptService(repo);

		const res = await svc.getManyByIds(['c1', 'c2']);
		expect(res).toEqual(rows);
	});

	it('getManyByIds: returns empty array when none', async () => {
		const repo = new FakeConceptRepository({
			getByIdsResult: []
		}) as unknown as ConceptRepository;
		const svc = new ConceptService(repo);

		const res = await svc.getManyByIds(['c1', 'c2']);
		expect(res).toEqual([]);
	});

	// createMany

	it('createMany: delegates to repository.createMany', async () => {
		const created = [makeConcept({ id: 'c1' }), makeConcept({ id: 'c2' })];

		const repo = new FakeConceptRepository({
			createManyResult: created
		}) as unknown as ConceptRepository;
		const svc = new ConceptService(repo);

		const input: CreateConceptDto[] = [
			{ name: 'C1', blockId: 'b1', difficultyIndex: 1 } as CreateConceptDto,
			{ name: 'C2', blockId: 'b1', difficultyIndex: 2 } as CreateConceptDto
		];

		const res = await svc.createMany(input);
		expect(res).toEqual(created);
	});

	// getManyByBlockId

	it('getManyByBlockId: returns concepts for given blockId', async () => {
		const rows = [
			makeConcept({ id: 'c1', blockId: 'bX' }),
			makeConcept({ id: 'c2', blockId: 'bX' })
		];

		const repo = new FakeConceptRepository({
			getManyByBlockIdResult: rows
		}) as unknown as ConceptRepository;
		const svc = new ConceptService(repo);

		const res = await svc.getManyByBlockId('bX');
		expect(res).toEqual(rows);
	});

	// getManyByBlockIds

	it('getManyByBlockIds: returns concepts for multiple blockIds', async () => {
		const rows = [
			makeConcept({ id: 'c1', blockId: 'b1' }),
			makeConcept({ id: 'c2', blockId: 'b2' }),
			makeConcept({ id: 'c3', blockId: 'b1' })
		];

		const repo = new FakeConceptRepository({
			getManyByBlockIdsResult: rows
		}) as unknown as ConceptRepository;
		const svc = new ConceptService(repo);

		const res = await svc.getManyByBlockIds(['b1', 'b2']);
		expect(res).toEqual(rows);
	});

	// transaction wiring

	it('passes transaction through to repository methods (example: getById)', async () => {
		const concept = makeConcept({ id: 'c1' });
		const fakeRepo = new FakeConceptRepository({
			getByIdResult: concept
		});
		const repo = fakeRepo as unknown as ConceptRepository;
		const svc = new ConceptService(repo);
		const tx = {} as Transaction;

		await svc.getById('c1', tx);

		expect(fakeRepo.receivedTxs.getById).toBe(tx);
	});
});
