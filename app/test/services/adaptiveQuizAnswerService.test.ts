import { describe, it, expect } from 'bun:test';
import type {
	AdaptiveQuizAnswerDto,
	CreateAdaptiveQuizAnswerDto,
	UpdateAdaptiveQuizAnswerDto
} from '../../src/db/schema';
import type { Transaction } from '../../src/types';
import { AdaptiveQuizAnswerService } from '../../src/services/adaptiveQuizAnswerService';
import { AdaptiveQuizAnswerRepository } from '../../src/repositories/adaptiveQuizAnswerRepository';
import { NotFoundError } from '../../src/errors/AppError';

function makeAdaptiveQuizAnswer(
	overrides: Partial<AdaptiveQuizAnswerDto> = {}
): AdaptiveQuizAnswerDto {
	return {
		id: 'a1',
		adaptiveQuizId: 'aq1',
		baseQuestionId: 'q1',
		answerText: 'foo',
		isCorrect: true,
		time: 10,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

type QuestionHistoryRow = {
	questionText: string;
	correctAnswerText: string;
	isCorrect: boolean;
};

type RepoFixtures = {
	getByIdResult?: AdaptiveQuizAnswerDto | undefined;
	createResult?: AdaptiveQuizAnswerDto;
	updateResult?: AdaptiveQuizAnswerDto | undefined;
	deleteResult?: AdaptiveQuizAnswerDto | undefined;
	getByIdsResult?: AdaptiveQuizAnswerDto[];
	getByBaseQuestionIdResult?: AdaptiveQuizAnswerDto | undefined;
	getByAdaptiveQuizIdResult?: AdaptiveQuizAnswerDto[];
	getQuestionHistoryResult?: QuestionHistoryRow[];
};

class FakeAdaptiveQuizAnswerRepository implements Partial<AdaptiveQuizAnswerRepository> {
	public fixtures: RepoFixtures;
	public receivedTxs: {
		getById?: Transaction | undefined;
		create?: Transaction | undefined;
		update?: Transaction | undefined;
		delete?: Transaction | undefined;
		getByIds?: Transaction | undefined;
		getByBaseQuestionId?: Transaction | undefined;
		getByAdaptiveQuizId?: Transaction | undefined;
		getQuestionHistory?: Transaction | undefined;
	} = {};

	constructor(fixtures: RepoFixtures) {
		this.fixtures = fixtures;
	}

	async getById(
		id: string,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto | undefined> {
		this.receivedTxs.getById = tx;
		return this.fixtures.getByIdResult;
	}

	async create(
		data: CreateAdaptiveQuizAnswerDto,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto> {
		this.receivedTxs.create = tx;
		if (!this.fixtures.createResult) {
			this.fixtures.createResult = makeAdaptiveQuizAnswer({
				id: 'created',
				adaptiveQuizId: data.adaptiveQuizId,
				baseQuestionId: data.baseQuestionId,
				answerText: data.answerText,
				isCorrect: data.isCorrect,
				time: data.time
			});
		}
		return this.fixtures.createResult;
	}

	async update(
		id: string,
		data: UpdateAdaptiveQuizAnswerDto,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto | undefined> {
		this.receivedTxs.update = tx;
		return this.fixtures.updateResult;
	}

	async delete(
		id: string,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto | undefined> {
		this.receivedTxs.delete = tx;
		return this.fixtures.deleteResult;
	}

	async getByIds(
		ids: string[],
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto[]> {
		this.receivedTxs.getByIds = tx;
		return this.fixtures.getByIdsResult ?? [];
	}

	async getByBaseQuestionId(
		baseQuestionId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto | undefined> {
		this.receivedTxs.getByBaseQuestionId = tx;
		return this.fixtures.getByBaseQuestionIdResult;
	}

	async getByAdaptiveQuizId(
		adaptiveQuizId: string,
		tx?: Transaction
	): Promise<AdaptiveQuizAnswerDto[]> {
		this.receivedTxs.getByAdaptiveQuizId = tx;
		return this.fixtures.getByAdaptiveQuizIdResult ?? [];
	}

	async getQuestionHistory(
		adaptiveQuizIds: string[],
		conceptId: string,
		tx?: Transaction
	): Promise<QuestionHistoryRow[]> {
		this.receivedTxs.getQuestionHistory = tx;
		return this.fixtures.getQuestionHistoryResult ?? [];
	}
}

describe('AdaptiveQuizAnswerService', () => {
	// getById

	it('getById: returns answer when found', async () => {
		const ans = makeAdaptiveQuizAnswer({ id: 'a1' });
		const repo = new FakeAdaptiveQuizAnswerRepository({
			getByIdResult: ans
		}) as unknown as AdaptiveQuizAnswerRepository;
		const svc = new AdaptiveQuizAnswerService(repo);

		const res = await svc.getById('a1');
		expect(res).toEqual(ans);
	});

	it('getById: throws NotFoundError when not found', async () => {
		const repo = new FakeAdaptiveQuizAnswerRepository({
			getByIdResult: undefined
		}) as unknown as AdaptiveQuizAnswerRepository;
		const svc = new AdaptiveQuizAnswerService(repo);

		await expect(svc.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// create

	it('create: delegates to repository.create', async () => {
		const created = makeAdaptiveQuizAnswer({ id: 'a2' });
		const repo = new FakeAdaptiveQuizAnswerRepository({
			createResult: created
		}) as unknown as AdaptiveQuizAnswerRepository;
		const svc = new AdaptiveQuizAnswerService(repo);

		const input = {
			adaptiveQuizId: 'aq1',
			baseQuestionId: 'q1',
			answerText: 'bar',
			isCorrect: false,
			time: 20
		} as CreateAdaptiveQuizAnswerDto;

		const res = await svc.create(input);
		expect(res).toEqual(created);
	});

	// update

	it('update: returns updated answer when repo returns value', async () => {
		const updated = makeAdaptiveQuizAnswer({
			id: 'a1',
			answerText: 'updated'
		});
		const repo = new FakeAdaptiveQuizAnswerRepository({
			updateResult: updated
		}) as unknown as AdaptiveQuizAnswerRepository;
		const svc = new AdaptiveQuizAnswerService(repo);

		const patch = {
			answerText: 'updated'
		} as UpdateAdaptiveQuizAnswerDto;

		const res = await svc.update('a1', patch);
		expect(res).toEqual(updated);
	});

	it('update: throws NotFoundError when repo returns undefined', async () => {
		const repo = new FakeAdaptiveQuizAnswerRepository({
			updateResult: undefined
		}) as unknown as AdaptiveQuizAnswerRepository;
		const svc = new AdaptiveQuizAnswerService(repo);

		const patch = {
			answerText: 'updated'
		} as UpdateAdaptiveQuizAnswerDto;

		await expect(svc.update('missing', patch)).rejects.toBeInstanceOf(NotFoundError);
	});

	// delete

	it('delete: returns deleted answer when repo returns value', async () => {
		const deleted = makeAdaptiveQuizAnswer({ id: 'a1' });
		const repo = new FakeAdaptiveQuizAnswerRepository({
			deleteResult: deleted
		}) as unknown as AdaptiveQuizAnswerRepository;
		const svc = new AdaptiveQuizAnswerService(repo);

		const res = await svc.delete('a1');
		expect(res).toEqual(deleted);
	});

	it('delete: throws NotFoundError when repo.delete returns undefined', async () => {
		const repo = new FakeAdaptiveQuizAnswerRepository({
			deleteResult: undefined
		}) as unknown as AdaptiveQuizAnswerRepository;
		const svc = new AdaptiveQuizAnswerService(repo);

		await expect(svc.delete('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// getByIds

	it('getByIds: returns array of answers', async () => {
		const rows = [
			makeAdaptiveQuizAnswer({ id: 'a1' }),
			makeAdaptiveQuizAnswer({ id: 'a2' })
		];

		const repo = new FakeAdaptiveQuizAnswerRepository({
			getByIdsResult: rows
		}) as unknown as AdaptiveQuizAnswerRepository;
		const svc = new AdaptiveQuizAnswerService(repo);

		const res = await svc.getByIds(['a1', 'a2']);
		expect(res).toEqual(rows);
	});

	it('getByIds: returns empty array when none', async () => {
		const repo = new FakeAdaptiveQuizAnswerRepository({
			getByIdsResult: []
		}) as unknown as AdaptiveQuizAnswerRepository;
		const svc = new AdaptiveQuizAnswerService(repo);

		const res = await svc.getByIds(['a1', 'a2']);
		expect(res).toEqual([]);
	});

	// getByBaseQuestionId

	it('getByBaseQuestionId: returns answer for given baseQuestionId', async () => {
		const ans = makeAdaptiveQuizAnswer({ id: 'a1', baseQuestionId: 'qX' });

		const repo = new FakeAdaptiveQuizAnswerRepository({
			getByBaseQuestionIdResult: ans
		}) as unknown as AdaptiveQuizAnswerRepository;
		const svc = new AdaptiveQuizAnswerService(repo);

		const res = await svc.getByBaseQuestionId('qX');
		expect(res).toEqual(ans);
	});

	it('getByBaseQuestionId: returns undefined when none exist', async () => {
		const repo = new FakeAdaptiveQuizAnswerRepository({
			getByBaseQuestionIdResult: undefined
		}) as unknown as AdaptiveQuizAnswerRepository;
		const svc = new AdaptiveQuizAnswerService(repo);

		const res = await svc.getByBaseQuestionId('qMissing');
		expect(res).toBeUndefined();
	});

	// getManyByAdaptiveQuizId

	it('getManyByAdaptiveQuizId: returns answers for adaptiveQuizId', async () => {
		const rows = [
			makeAdaptiveQuizAnswer({ id: 'a1', adaptiveQuizId: 'aqX' }),
			makeAdaptiveQuizAnswer({ id: 'a2', adaptiveQuizId: 'aqX' })
		];

		const repo = new FakeAdaptiveQuizAnswerRepository({
			getByAdaptiveQuizIdResult: rows
		}) as unknown as AdaptiveQuizAnswerRepository;
		const svc = new AdaptiveQuizAnswerService(repo);

		const res = await svc.getManyByAdaptiveQuizId('aqX');
		expect(res).toEqual(rows);
	});

	it('getManyByAdaptiveQuizId: returns empty array when none', async () => {
		const repo = new FakeAdaptiveQuizAnswerRepository({
			getByAdaptiveQuizIdResult: []
		}) as unknown as AdaptiveQuizAnswerRepository;
		const svc = new AdaptiveQuizAnswerService(repo);

		const res = await svc.getManyByAdaptiveQuizId('aqX');
		expect(res).toEqual([]);
	});

	// getQuestionHistory

	it('getQuestionHistory: delegates to repository.getQuestionHistory', async () => {
		const historyRows: QuestionHistoryRow[] = [
			{
				questionText: 'What is 2+2?',
				correctAnswerText: '4',
				isCorrect: true
			},
			{
				questionText: 'What is 3+3?',
				correctAnswerText: '6',
				isCorrect: false
			}
		];

		const repo = new FakeAdaptiveQuizAnswerRepository({
			getQuestionHistoryResult: historyRows
		}) as unknown as AdaptiveQuizAnswerRepository;
		const svc = new AdaptiveQuizAnswerService(repo);

		const res = await svc.getQuestionHistory(['aq1', 'aq2'], 'concept1');
		expect(res).toEqual(historyRows);
	});

	// transaction wiring example

	it('passes transaction through to repository methods (example: getById)', async () => {
		const ans = makeAdaptiveQuizAnswer({ id: 'a1' });
		const fakeRepo = new FakeAdaptiveQuizAnswerRepository({
			getByIdResult: ans
		});
		const repo = fakeRepo as unknown as AdaptiveQuizAnswerRepository;
		const svc = new AdaptiveQuizAnswerService(repo);
		const tx = {} as Transaction;

		await svc.getById('a1', tx);

		expect(fakeRepo.receivedTxs.getById).toBe(tx);
	});
});
