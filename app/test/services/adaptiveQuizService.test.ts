import { describe, it, expect } from 'bun:test';
import type {
	AdaptiveQuizDto,
	CreateAdaptiveQuizDto,
	UpdateAdaptiveQuizDto
} from '../../src/db/schema';
import type { Transaction } from '../../src/types';
import { AdaptiveQuizService } from '../../src/services/adaptiveQuizService';
import { AdaptiveQuizRepository } from '../../src/repositories/adaptiveQuizRepository';
import { NotFoundError } from '../../src/errors/AppError';

function makeAdaptiveQuiz(overrides: Partial<AdaptiveQuizDto> = {}): AdaptiveQuizDto {
	return {
		id: 'aq1',
		baseQuizId: 'baseQuiz1',
		userBlockId: 'ub1',
		placementQuizId: null,
		version: 1,
		isCompleted: false,
		readyForAnswering: true,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

type RepoFixtures = {
	getByIdResult?: AdaptiveQuizDto | undefined;
	createResult?: AdaptiveQuizDto;
	updateResult?: AdaptiveQuizDto | undefined;
	deleteResult?: AdaptiveQuizDto | undefined;
	getByIdsResult?: AdaptiveQuizDto[];
	getByUserBlockIdResult?: AdaptiveQuizDto[];
	getByUserBlockIdLowerVersionResult?: AdaptiveQuizDto | undefined;
	getByBaseQuizIdResult?: AdaptiveQuizDto | undefined;
	getLastAdaptiveQuizByUserBlockIdResult?: AdaptiveQuizDto | undefined;
	getLastVersionsByUserBlockIdResult?: AdaptiveQuizDto[];
	getLastIncompletedByUserBlockIdResult?: AdaptiveQuizDto | undefined;
};

class FakeAdaptiveQuizRepository implements Partial<AdaptiveQuizRepository> {
	public fixtures: RepoFixtures;
	public receivedTxs: {
		getById?: Transaction | undefined;
		create?: Transaction | undefined;
		update?: Transaction | undefined;
		delete?: Transaction | undefined;
		getByIds?: Transaction | undefined;
		getByUserBlockId?: Transaction | undefined;
		getByUserBlockIdLowerVersion?: Transaction | undefined;
		getByBaseQuizId?: Transaction | undefined;
		getLastAdaptiveQuizByUserBlockId?: Transaction | undefined;
		getLastVersionsByUserBlockId?: Transaction | undefined;
		getLastIncompletedByUserBlockId?: Transaction | undefined;
	} = {};

	constructor(fixtures: RepoFixtures) {
		this.fixtures = fixtures;
	}

	async getById(id: string, tx?: Transaction): Promise<AdaptiveQuizDto | undefined> {
		this.receivedTxs.getById = tx;
		return this.fixtures.getByIdResult;
	}

	async create(data: CreateAdaptiveQuizDto, tx?: Transaction): Promise<AdaptiveQuizDto> {
		this.receivedTxs.create = tx;
		if (!this.fixtures.createResult) {
			this.fixtures.createResult = makeAdaptiveQuiz({
				id: 'created',
				baseQuizId: data.baseQuizId,
				userBlockId: data.userBlockId,
				placementQuizId: data.placementQuizId ?? null,
				version: data.version,
				isCompleted: data.isCompleted,
				readyForAnswering: data.readyForAnswering
			});
		}
		return this.fixtures.createResult;
	}

	async update(
		id: string,
		data: UpdateAdaptiveQuizDto,
		tx?: Transaction
	): Promise<AdaptiveQuizDto | undefined> {
		this.receivedTxs.update = tx;
		return this.fixtures.updateResult;
	}

	async delete(id: string, tx?: Transaction): Promise<AdaptiveQuizDto | undefined> {
		this.receivedTxs.delete = tx;
		return this.fixtures.deleteResult;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<AdaptiveQuizDto[]> {
		this.receivedTxs.getByIds = tx;
		return this.fixtures.getByIdsResult ?? [];
	}

	async getByUserBlockId(userBlockId: string, tx?: Transaction): Promise<AdaptiveQuizDto[]> {
		this.receivedTxs.getByUserBlockId = tx;
		return this.fixtures.getByUserBlockIdResult ?? [];
	}

	async getByUserBlockIdLowerVersion(
		userBlockId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizDto> {
		this.receivedTxs.getByUserBlockIdLowerVersion = tx;
		// service expects a value here (throws if undefined)
		if (!this.fixtures.getByUserBlockIdLowerVersionResult) {
			throw new Error('Fixture for getByUserBlockIdLowerVersionResult not set');
		}
		return this.fixtures.getByUserBlockIdLowerVersionResult;
	}

	async getByBaseQuizId(
		baseQuizId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizDto | undefined> {
		this.receivedTxs.getByBaseQuizId = tx;
		return this.fixtures.getByBaseQuizIdResult;
	}

	async getLastAdaptiveQuizByUserBlockId(
		userBlockId: string
	): Promise<AdaptiveQuizDto | undefined> {
		this.receivedTxs.getLastAdaptiveQuizByUserBlockId = undefined; // no tx param in service
		return this.fixtures.getLastAdaptiveQuizByUserBlockIdResult;
	}

	async getLastVersionsByUserBlockId(
		userBlockId: string,
		count: number,
		tx?: Transaction
	): Promise<AdaptiveQuizDto[]> {
		this.receivedTxs.getLastVersionsByUserBlockId = tx;
		return this.fixtures.getLastVersionsByUserBlockIdResult ?? [];
	}

	async getLastIncompletedByUserBlockId(
		userBlockId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizDto | undefined> {
		this.receivedTxs.getLastIncompletedByUserBlockId = tx;
		return this.fixtures.getLastIncompletedByUserBlockIdResult;
	}
}

describe('AdaptiveQuizService', () => {
	// getById

	it('getById: returns adaptive quiz when found', async () => {
		const aq = makeAdaptiveQuiz({ id: 'aq1' });
		const repo = new FakeAdaptiveQuizRepository({
			getByIdResult: aq
		}) as unknown as AdaptiveQuizRepository;
		const svc = new AdaptiveQuizService(repo);

		const res = await svc.getById('aq1');
		expect(res).toEqual(aq);
	});

	it('getById: throws NotFoundError when not found', async () => {
		const repo = new FakeAdaptiveQuizRepository({
			getByIdResult: undefined
		}) as unknown as AdaptiveQuizRepository;
		const svc = new AdaptiveQuizService(repo);

		await expect(svc.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// create

	it('create: delegates to repository.create', async () => {
		const created = makeAdaptiveQuiz({ id: 'aq2' });
		const repo = new FakeAdaptiveQuizRepository({
			createResult: created
		}) as unknown as AdaptiveQuizRepository;
		const svc = new AdaptiveQuizService(repo);

		const input = {
			baseQuizId: 'baseQuiz2',
			userBlockId: 'ub2',
			placementQuizId: null,
			version: 1,
			isCompleted: false,
			readyForAnswering: true
		} as CreateAdaptiveQuizDto;

		const res = await svc.create(input);
		expect(res).toEqual(created);
	});

	// update

	it('update: returns updated adaptive quiz when repo returns value', async () => {
		const updated = makeAdaptiveQuiz({
			id: 'aq1',
			isCompleted: true
		});
		const repo = new FakeAdaptiveQuizRepository({
			updateResult: updated
		}) as unknown as AdaptiveQuizRepository;
		const svc = new AdaptiveQuizService(repo);

		const patch = {
			isCompleted: true
		} as UpdateAdaptiveQuizDto;

		const res = await svc.update('aq1', patch);
		expect(res).toEqual(updated);
	});

	it('update: throws NotFoundError when repo returns undefined', async () => {
		const repo = new FakeAdaptiveQuizRepository({
			updateResult: undefined
		}) as unknown as AdaptiveQuizRepository;
		const svc = new AdaptiveQuizService(repo);

		const patch = {
			isCompleted: true
		} as UpdateAdaptiveQuizDto;

		await expect(svc.update('missing', patch)).rejects.toBeInstanceOf(NotFoundError);
	});

	// delete

	it('delete: returns deleted adaptive quiz when repo returns value', async () => {
		const deleted = makeAdaptiveQuiz({ id: 'aq1' });
		const repo = new FakeAdaptiveQuizRepository({
			deleteResult: deleted
		}) as unknown as AdaptiveQuizRepository;
		const svc = new AdaptiveQuizService(repo);

		const res = await svc.delete('aq1');
		expect(res).toEqual(deleted);
	});

	it('delete: throws NotFoundError when repo.delete returns undefined', async () => {
		const repo = new FakeAdaptiveQuizRepository({
			deleteResult: undefined
		}) as unknown as AdaptiveQuizRepository;
		const svc = new AdaptiveQuizService(repo);

		await expect(svc.delete('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// getByIds

	it('getByIds: returns array of adaptive quizzes', async () => {
		const rows = [makeAdaptiveQuiz({ id: 'aq1' }), makeAdaptiveQuiz({ id: 'aq2' })];

		const repo = new FakeAdaptiveQuizRepository({
			getByIdsResult: rows
		}) as unknown as AdaptiveQuizRepository;
		const svc = new AdaptiveQuizService(repo);

		const res = await svc.getByIds(['aq1', 'aq2']);
		expect(res).toEqual(rows);
	});

	it('getByIds: returns empty array when none', async () => {
		const repo = new FakeAdaptiveQuizRepository({
			getByIdsResult: []
		}) as unknown as AdaptiveQuizRepository;
		const svc = new AdaptiveQuizService(repo);

		const res = await svc.getByIds(['aq1', 'aq2']);
		expect(res).toEqual([]);
	});

	// getByUserBlockId

	it('getByUserBlockId: returns quizzes for userBlockId', async () => {
		const rows = [
			makeAdaptiveQuiz({ id: 'aq1', userBlockId: 'ubX' }),
			makeAdaptiveQuiz({ id: 'aq2', userBlockId: 'ubX' })
		];

		const repo = new FakeAdaptiveQuizRepository({
			getByUserBlockIdResult: rows
		}) as unknown as AdaptiveQuizRepository;
		const svc = new AdaptiveQuizService(repo);

		const res = await svc.getByUserBlockId('ubX');
		expect(res).toEqual(rows);
	});

	// getNextQuiz (getByUserBlockIdLowerVersion)

	it('getNextQuiz: returns quiz from getByUserBlockIdLowerVersion', async () => {
		const quiz = makeAdaptiveQuiz({ id: 'aqLow', userBlockId: 'ub1', version: 1 });
		const repo = new FakeAdaptiveQuizRepository({
			getByUserBlockIdLowerVersionResult: quiz
		}) as unknown as AdaptiveQuizRepository;
		const svc = new AdaptiveQuizService(repo);

		const res = await svc.getNextQuiz('ub1');
		expect(res).toEqual(quiz);
	});

	// getByBaseQuizId

	it('getByBaseQuizId: returns quiz for baseQuizId', async () => {
		const quiz = makeAdaptiveQuiz({ id: 'aq1', baseQuizId: 'baseX' });

		const repo = new FakeAdaptiveQuizRepository({
			getByBaseQuizIdResult: quiz
		}) as unknown as AdaptiveQuizRepository;
		const svc = new AdaptiveQuizService(repo);

		const res = await svc.getByBaseQuizId('baseX');
		expect(res).toEqual(quiz);
	});

	it('getByBaseQuizId: throws NotFoundError when undefined', async () => {
		const repo = new FakeAdaptiveQuizRepository({
			getByBaseQuizIdResult: undefined
		}) as unknown as AdaptiveQuizRepository;
		const svc = new AdaptiveQuizService(repo);

		await expect(svc.getByBaseQuizId('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// getLastAdaptiveQuizByUserBlockId (no tx in service)

	it('getLastAdaptiveQuizByUserBlockId: returns last quiz', async () => {
		const quiz = makeAdaptiveQuiz({ id: 'aqLast', userBlockId: 'ub1', version: 5 });

		const repo = new FakeAdaptiveQuizRepository({
			getLastAdaptiveQuizByUserBlockIdResult: quiz
		}) as unknown as AdaptiveQuizRepository;
		const svc = new AdaptiveQuizService(repo);

		const res = await svc.getLastAdaptiveQuizByUserBlockId('ub1');
		expect(res).toEqual(quiz);
	});

	it('getLastAdaptiveQuizByUserBlockId: throws NotFoundError when undefined', async () => {
		const repo = new FakeAdaptiveQuizRepository({
			getLastAdaptiveQuizByUserBlockIdResult: undefined
		}) as unknown as AdaptiveQuizRepository;
		const svc = new AdaptiveQuizService(repo);

		await expect(svc.getLastAdaptiveQuizByUserBlockId('ubMissing')).rejects.toBeInstanceOf(
			NotFoundError
		);
	});

	// getLastVersionsByUserBlockId

	it('getLastVersionsByUserBlockId: returns last N versions', async () => {
		const rows = [
			makeAdaptiveQuiz({ id: 'aq5', version: 5 }),
			makeAdaptiveQuiz({ id: 'aq4', version: 4 })
		];

		const repo = new FakeAdaptiveQuizRepository({
			getLastVersionsByUserBlockIdResult: rows
		}) as unknown as AdaptiveQuizRepository;
		const svc = new AdaptiveQuizService(repo);

		const res = await svc.getLastVersionsByUserBlockId('ub1', 2);
		expect(res).toEqual(rows);
	});

	// getLastIncompletedByUserBlockId

	it('getLastIncompletedByUserBlockId: returns last incompleted quiz', async () => {
		const quiz = makeAdaptiveQuiz({
			id: 'aqInc',
			userBlockId: 'ub1',
			isCompleted: false
		});

		const repo = new FakeAdaptiveQuizRepository({
			getLastIncompletedByUserBlockIdResult: quiz
		}) as unknown as AdaptiveQuizRepository;
		const svc = new AdaptiveQuizService(repo);

		const res = await svc.getLastIncompletedByUserBlockId('ub1');
		expect(res).toEqual(quiz);
	});

	it('getLastIncompletedByUserBlockId: throws NotFoundError when undefined', async () => {
		const repo = new FakeAdaptiveQuizRepository({
			getLastIncompletedByUserBlockIdResult: undefined
		}) as unknown as AdaptiveQuizRepository;
		const svc = new AdaptiveQuizService(repo);

		await expect(svc.getLastIncompletedByUserBlockId('ubMissing')).rejects.toBeInstanceOf(
			NotFoundError
		);
	});

	// transaction wiring example

	it('passes transaction through to repository methods (example: getById)', async () => {
		const quiz = makeAdaptiveQuiz({ id: 'aq1' });
		const fakeRepo = new FakeAdaptiveQuizRepository({
			getByIdResult: quiz
		});
		const repo = fakeRepo as unknown as AdaptiveQuizRepository;
		const svc = new AdaptiveQuizService(repo);
		const tx = {} as Transaction;

		await svc.getById('aq1', tx);

		expect(fakeRepo.receivedTxs.getById).toBe(tx);
	});
});
