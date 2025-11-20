import { describe, it, expect } from 'bun:test';
import type {
	BaseQuestionDto,
	CreateBaseQuestionDto,
	UpdateBaseQuestionDto
} from '../../src/db/schema';
import type { Transaction } from '../../src/types';
import { BaseQuestionService } from '../../src/services/baseQuestionService';
import { BaseQuestionRepository } from '../../src/repositories/baseQuestionRepository';
import { NotFoundError } from '../../src/errors/AppError';

function makeBaseQuestion(overrides: Partial<BaseQuestionDto> = {}): BaseQuestionDto {
	return {
		id: 'q1',
		baseQuizId: 'quiz1',
		questionText: 'What is 2+2?',
		correctAnswerText: '4',
		conceptId: 'math',
		codeSnippet: '',
		questionType: 'MCQ',
		orderIndex: 1,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

type RepoFixtures = {
	getByIdResult?: BaseQuestionDto | undefined;
	createResult?: BaseQuestionDto;
	updateResult?: BaseQuestionDto | undefined;
	deleteResult?: BaseQuestionDto | undefined;
	getByIdsResult?: BaseQuestionDto[];
	createManyResult?: BaseQuestionDto[];
	getByBaseQuizIdResult?: BaseQuestionDto[];
	getBaseQuizIdByQuestionIdResult?: string | undefined;
};

class FakeBaseQuestionRepository implements Partial<BaseQuestionRepository> {
	public fixtures: RepoFixtures;
	public receivedTxs: {
		getById?: Transaction | undefined;
		create?: Transaction | undefined;
		update?: Transaction | undefined;
		deleteById?: Transaction | undefined;
		getByIds?: Transaction | undefined;
		createMany?: Transaction | undefined;
		getByBaseQuizId?: Transaction | undefined;
		getBaseQuizIdByQuestionId?: Transaction | undefined;
	} = {};

	constructor(fixtures: RepoFixtures) {
		this.fixtures = fixtures;
	}

	async getById(id: string, tx?: Transaction): Promise<BaseQuestionDto | undefined> {
		this.receivedTxs.getById = tx;
		return this.fixtures.getByIdResult;
	}

	async create(data: CreateBaseQuestionDto, tx?: Transaction): Promise<BaseQuestionDto> {
		this.receivedTxs.create = tx;
		if (!this.fixtures.createResult) {
			this.fixtures.createResult = makeBaseQuestion({
				id: 'created',
				baseQuizId: data.baseQuizId,
				questionText: data.questionText,
				correctAnswerText: data.correctAnswerText,
				conceptId: data.conceptId,
				codeSnippet: data.codeSnippet,
				questionType: data.questionType,
				orderIndex: data.orderIndex
			});
		}
		return this.fixtures.createResult;
	}

	async update(
		id: string,
		data: UpdateBaseQuestionDto,
		tx?: Transaction
	): Promise<BaseQuestionDto | undefined> {
		this.receivedTxs.update = tx;
		return this.fixtures.updateResult;
	}

	async deleteById(id: string, tx?: Transaction): Promise<BaseQuestionDto | undefined> {
		this.receivedTxs.deleteById = tx;
		return this.fixtures.deleteResult;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<BaseQuestionDto[]> {
		this.receivedTxs.getByIds = tx;
		return this.fixtures.getByIdsResult ?? [];
	}

	async createMany(data: CreateBaseQuestionDto[], tx?: Transaction): Promise<BaseQuestionDto[]> {
		this.receivedTxs.createMany = tx;
		return this.fixtures.createManyResult ?? [];
	}

	async getByBaseQuizId(
		baseQuizId: string,
		tx?: Transaction
	): Promise<BaseQuestionDto[]> {
		this.receivedTxs.getByBaseQuizId = tx;
		return this.fixtures.getByBaseQuizIdResult ?? [];
	}

	async getBaseQuizIdByQuestionId(
		questionId: string,
		tx?: Transaction
	): Promise<string | undefined> {
		this.receivedTxs.getBaseQuizIdByQuestionId = tx;
		return this.fixtures.getBaseQuizIdByQuestionIdResult;
	}
}

describe('BaseQuestionService', () => {
	// getById

	it('getById: returns question when found', async () => {
		const q = makeBaseQuestion({ id: 'q1' });
		const repo = new FakeBaseQuestionRepository({
			getByIdResult: q
		}) as unknown as BaseQuestionRepository;
		const svc = new BaseQuestionService(repo);

		const res = await svc.getById('q1');
		expect(res).toEqual(q);
	});

	it('getById: throws NotFoundError when question not found', async () => {
		const repo = new FakeBaseQuestionRepository({
			getByIdResult: undefined
		}) as unknown as BaseQuestionRepository;
		const svc = new BaseQuestionService(repo);

		await expect(svc.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// create

	it('create: delegates to repository.create', async () => {
		const created = makeBaseQuestion({ id: 'q2', questionText: 'New question' });
		const repo = new FakeBaseQuestionRepository({
			createResult: created
		}) as unknown as BaseQuestionRepository;
		const svc = new BaseQuestionService(repo);

		const input = {
			baseQuizId: 'quiz1',
			questionText: 'New question',
			correctAnswerText: '42',
			conceptId: 'math',
			codeSnippet: '',
			questionType: 'MCQ',
			orderIndex: 2
		} as CreateBaseQuestionDto;

		const res = await svc.create(input);
		expect(res).toEqual(created);
	});

	// update

	it('update: returns updated question when repo returns value', async () => {
		const updated = makeBaseQuestion({
			id: 'q1',
			questionText: 'Updated question'
		});
		const repo = new FakeBaseQuestionRepository({
			updateResult: updated
		}) as unknown as BaseQuestionRepository;
		const svc = new BaseQuestionService(repo);

		const patch = {
			questionText: 'Updated question'
		} as UpdateBaseQuestionDto;

		const res = await svc.update('q1', patch);
		expect(res).toEqual(updated);
	});

	it('update: throws NotFoundError when repo returns undefined', async () => {
		const repo = new FakeBaseQuestionRepository({
			updateResult: undefined
		}) as unknown as BaseQuestionRepository;
		const svc = new BaseQuestionService(repo);

		const patch = {
			questionText: 'Updated question'
		} as UpdateBaseQuestionDto;

		await expect(svc.update('missing', patch)).rejects.toBeInstanceOf(NotFoundError);
	});

	// delete

	it('delete: returns deleted question when repo returns value', async () => {
		const deleted = makeBaseQuestion({ id: 'q1' });
		const repo = new FakeBaseQuestionRepository({
			deleteResult: deleted
		}) as unknown as BaseQuestionRepository;
		const svc = new BaseQuestionService(repo);

		const res = await svc.delete('q1');
		expect(res).toEqual(deleted);
	});

	it('delete: throws NotFoundError when repo returns undefined', async () => {
		const repo = new FakeBaseQuestionRepository({
			deleteResult: undefined
		}) as unknown as BaseQuestionRepository;
		const svc = new BaseQuestionService(repo);

		await expect(svc.delete('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// getManyByIds

	it('getManyByIds: returns array of questions', async () => {
		const rows = [
			makeBaseQuestion({ id: 'q1' }),
			makeBaseQuestion({ id: 'q2' })
		];

		const repo = new FakeBaseQuestionRepository({
			getByIdsResult: rows
		}) as unknown as BaseQuestionRepository;
		const svc = new BaseQuestionService(repo);

		const res = await svc.getManyByIds(['q1', 'q2']);
		expect(res).toEqual(rows);
	});

	it('getManyByIds: returns empty array when none', async () => {
		const repo = new FakeBaseQuestionRepository({
			getByIdsResult: []
		}) as unknown as BaseQuestionRepository;
		const svc = new BaseQuestionService(repo);

		const res = await svc.getManyByIds(['q1', 'q2']);
		expect(res).toEqual([]);
	});

	// createMany

	it('createMany: delegates to repository.createMany', async () => {
		const created = [
			makeBaseQuestion({ id: 'q1' }),
			makeBaseQuestion({ id: 'q2' })
		];

		const repo = new FakeBaseQuestionRepository({
			createManyResult: created
		}) as unknown as BaseQuestionRepository;
		const svc = new BaseQuestionService(repo);

		const input: CreateBaseQuestionDto[] = [
			{
				baseQuizId: 'quiz1',
				questionText: 'Q1',
				correctAnswerText: 'A1',
				conceptId: 'math',
				codeSnippet: '',
				questionType: 'MCQ',
				orderIndex: 1
			} as CreateBaseQuestionDto,
			{
				baseQuizId: 'quiz1',
				questionText: 'Q2',
				correctAnswerText: 'A2',
				conceptId: 'math',
				codeSnippet: '',
				questionType: 'MCQ',
				orderIndex: 2
			} as CreateBaseQuestionDto
		];

		const res = await svc.createMany(input);
		expect(res).toEqual(created);
	});

	// getByBaseQuizId

	it('getByBaseQuizId: returns questions for given baseQuizId', async () => {
		const rows = [
			makeBaseQuestion({ id: 'q1', baseQuizId: 'quizX' }),
			makeBaseQuestion({ id: 'q2', baseQuizId: 'quizX' })
		];

		const repo = new FakeBaseQuestionRepository({
			getByBaseQuizIdResult: rows
		}) as unknown as BaseQuestionRepository;
		const svc = new BaseQuestionService(repo);

		const res = await svc.getByBaseQuizId('quizX');
		expect(res).toEqual(rows);
	});

	// getBaseQuizIdByQuestionId

	it('getBaseQuizIdByQuestionId: returns baseQuizId when found', async () => {
		const repo = new FakeBaseQuestionRepository({
			getBaseQuizIdByQuestionIdResult: 'quizX'
		}) as unknown as BaseQuestionRepository;
		const svc = new BaseQuestionService(repo);

		const res = await svc.getBaseQuizIdByQuestionId('q1');
		expect(res).toBe('quizX');
	});

	it('getBaseQuizIdByQuestionId: throws NotFoundError when undefined', async () => {
		const repo = new FakeBaseQuestionRepository({
			getBaseQuizIdByQuestionIdResult: undefined
		}) as unknown as BaseQuestionRepository;
		const svc = new BaseQuestionService(repo);

		await expect(
			svc.getBaseQuizIdByQuestionId('missing')
		).rejects.toBeInstanceOf(NotFoundError);
	});

	// transaction wiring

	it('passes transaction through to repository methods (example: getById)', async () => {
		const q = makeBaseQuestion({ id: 'q1' });
		const fakeRepo = new FakeBaseQuestionRepository({
			getByIdResult: q
		});
		const repo = fakeRepo as unknown as BaseQuestionRepository;
		const svc = new BaseQuestionService(repo);
		const tx = {} as Transaction;

		await svc.getById('q1', tx);

		expect(fakeRepo.receivedTxs.getById).toBe(tx);
	});
});
