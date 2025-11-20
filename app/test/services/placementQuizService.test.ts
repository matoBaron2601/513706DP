import { describe, it, expect } from 'bun:test';
import type {
	PlacementQuizDto,
	CreatePlacementQuizDto,
	UpdatePlacementQuizDto
} from '../../src/db/schema';
import type { Transaction } from '../../src/types';
import { PlacementQuizService } from '../../src/services/placementQuizService';
import { PlacementQuizRepository } from '../../src/repositories/placementQuizRepository';
import { NotFoundError } from '../../src/errors/AppError';

function makePlacementQuiz(overrides: Partial<PlacementQuizDto> = {}): PlacementQuizDto {
	return {
		id: 'pq1',
		blockId: 'b1',
		baseQuizId: 'baseQuiz1',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

type RepoFixtures = {
	getByIdResult?: PlacementQuizDto | undefined;
	createResult?: PlacementQuizDto;
	updateResult?: PlacementQuizDto | undefined;
	deleteResult?: PlacementQuizDto | undefined;
	getByBlockIdResult?: PlacementQuizDto | undefined;
};

class FakePlacementQuizRepository implements Partial<PlacementQuizRepository> {
	public fixtures: RepoFixtures;
	public receivedTxs: {
		getById?: Transaction | undefined;
		create?: Transaction | undefined;
		update?: Transaction | undefined;
		delete?: Transaction | undefined;
		getByBlockId?: Transaction | undefined;
	} = {};

	constructor(fixtures: RepoFixtures) {
		this.fixtures = fixtures;
	}

	async getById(id: string, tx?: Transaction): Promise<PlacementQuizDto | undefined> {
		this.receivedTxs.getById = tx;
		return this.fixtures.getByIdResult;
	}

	async create(
		data: CreatePlacementQuizDto,
		tx?: Transaction
	): Promise<PlacementQuizDto> {
		this.receivedTxs.create = tx;
		if (!this.fixtures.createResult) {
			this.fixtures.createResult = makePlacementQuiz({
				id: 'created',
				blockId: data.blockId,
				baseQuizId: data.baseQuizId
			});
		}
		return this.fixtures.createResult;
	}

	async update(
		id: string,
		data: UpdatePlacementQuizDto,
		tx?: Transaction
	): Promise<PlacementQuizDto | undefined> {
		this.receivedTxs.update = tx;
		return this.fixtures.updateResult;
	}

	async delete(
		id: string,
		tx?: Transaction
	): Promise<PlacementQuizDto | undefined> {
		this.receivedTxs.delete = tx;
		return this.fixtures.deleteResult;
	}

	async getByBlockId(
		blockId: string,
		tx?: Transaction
	): Promise<PlacementQuizDto | undefined> {
		this.receivedTxs.getByBlockId = tx;
		return this.fixtures.getByBlockIdResult;
	}
}

describe('PlacementQuizService', () => {
	// getById

	it('getById: returns placement quiz when found', async () => {
		const pq = makePlacementQuiz({ id: 'pq1' });
		const repo = new FakePlacementQuizRepository({
			getByIdResult: pq
		}) as unknown as PlacementQuizRepository;
		const svc = new PlacementQuizService(repo);

		const res = await svc.getById('pq1');
		expect(res).toEqual(pq);
	});

	it('getById: throws NotFoundError when not found', async () => {
		const repo = new FakePlacementQuizRepository({
			getByIdResult: undefined
		}) as unknown as PlacementQuizRepository;
		const svc = new PlacementQuizService(repo);

		await expect(svc.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// create

	it('create: delegates to repository.create', async () => {
		const created = makePlacementQuiz({ id: 'pq2', blockId: 'b2' });
		const repo = new FakePlacementQuizRepository({
			createResult: created
		}) as unknown as PlacementQuizRepository;
		const svc = new PlacementQuizService(repo);

		const input = {
			blockId: 'b2',
			baseQuizId: 'baseQuiz2'
		} as CreatePlacementQuizDto;

		const res = await svc.create(input);
		expect(res).toEqual(created);
	});

	// update

	it('update: returns updated placement quiz when repo returns value', async () => {
		const updated = makePlacementQuiz({
			id: 'pq1',
			blockId: 'b1',
			baseQuizId: 'baseQuizUpdated'
		});

		const repo = new FakePlacementQuizRepository({
			updateResult: updated
		}) as unknown as PlacementQuizRepository;
		const svc = new PlacementQuizService(repo);

		const patch = {
			baseQuizId: 'baseQuizUpdated'
		} as UpdatePlacementQuizDto;

		const res = await svc.update('pq1', patch);
		expect(res).toEqual(updated);
	});

	it('update: throws NotFoundError when repo returns undefined', async () => {
		const repo = new FakePlacementQuizRepository({
			updateResult: undefined
		}) as unknown as PlacementQuizRepository;
		const svc = new PlacementQuizService(repo);

		const patch = {
			baseQuizId: 'baseQuizUpdated'
		} as UpdatePlacementQuizDto;

		await expect(svc.update('missing', patch)).rejects.toBeInstanceOf(NotFoundError);
	});

	// delete

	it('delete: returns deleted placement quiz when repo returns value', async () => {
		const deleted = makePlacementQuiz({ id: 'pq1' });

		const repo = new FakePlacementQuizRepository({
			deleteResult: deleted
		}) as unknown as PlacementQuizRepository;
		const svc = new PlacementQuizService(repo);

		const res = await svc.delete('pq1');
		expect(res).toEqual(deleted);
	});

	it('delete: throws NotFoundError when repo.delete returns undefined', async () => {
		const repo = new FakePlacementQuizRepository({
			deleteResult: undefined
		}) as unknown as PlacementQuizRepository;
		const svc = new PlacementQuizService(repo);

		await expect(svc.delete('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// getByBlockId

	it('getByBlockId: returns placement quiz for given blockId', async () => {
		const pq = makePlacementQuiz({ id: 'pq1', blockId: 'bX' });

		const repo = new FakePlacementQuizRepository({
			getByBlockIdResult: pq
		}) as unknown as PlacementQuizRepository;
		const svc = new PlacementQuizService(repo);

		const res = await svc.getByBlockId('bX');
		expect(res).toEqual(pq);
	});

	it('getByBlockId: throws NotFoundError when none for blockId', async () => {
		const repo = new FakePlacementQuizRepository({
			getByBlockIdResult: undefined
		}) as unknown as PlacementQuizRepository;
		const svc = new PlacementQuizService(repo);

		await expect(svc.getByBlockId('bMissing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// transaction wiring

	it('passes transaction through to repository methods (example: getById)', async () => {
		const pq = makePlacementQuiz({ id: 'pq1' });
		const fakeRepo = new FakePlacementQuizRepository({
			getByIdResult: pq
		});
		const repo = fakeRepo as unknown as PlacementQuizRepository;
		const svc = new PlacementQuizService(repo);
		const tx = {} as Transaction;

		await svc.getById('pq1', tx);

		expect(fakeRepo.receivedTxs.getById).toBe(tx);
	});
});
