import { describe, it, expect } from 'bun:test';
import type {
	BaseQuestionDto,
	CreateBaseQuestionDto,
	UpdateBaseQuestionDto
} from '../../src/db/schema';
import type { Transaction } from '../../src/types';
import { BaseQuestionRepository } from '../../src/repositories/baseQuestionRepository';

function makeBaseQuestion(overrides: Partial<BaseQuestionDto> = {}): BaseQuestionDto {
	return {
		id: 'q1',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		baseQuizId: 'quiz1',
		questionText: 'What is 2+2?',
		correctAnswerText: '4',
		conceptId: 'math',
		codeSnippet: '',
		questionType: 'MCQ',
		orderIndex: 1,
		...overrides
	};
}

type Fixtures = {
	selectResult?: BaseQuestionDto[];
	insertReturn?: BaseQuestionDto[];
	updateReturn?: BaseQuestionDto[];
	deleteReturn?: BaseQuestionDto[];
	createManyReturn?: BaseQuestionDto[];
};

function makeThenableSelectResult(fixtures: Fixtures): any {
	const rows = fixtures.selectResult ?? [];

	// Thenable object that also has .limit()
	return {
		limit(_n: number): Promise<BaseQuestionDto[]> {
			return Promise.resolve(rows);
		},
		then<TResult1 = BaseQuestionDto[], TResult2 = never>(
			onfulfilled?: ((value: BaseQuestionDto[]) => TResult1 | PromiseLike<TResult1>) | null,
			onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
		): Promise<TResult1 | TResult2> {
			return Promise.resolve(rows).then(onfulfilled as any, onrejected as any);
		}
	};
}

function makeFakeDbClient(fixtures: Fixtures) {
	const api = {
		select() {
			return {
				from(_table: unknown) {
					return {
						where(_expr: unknown): any {
							// Supports both: await ...where(...)
							// and: ...where(...).limit(1)
							return makeThenableSelectResult(fixtures);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateBaseQuestionDto | CreateBaseQuestionDto[]) {
					return {
						returning: () =>
							Promise.resolve(
								fixtures.insertReturn ?? fixtures.createManyReturn ?? []
							)
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateBaseQuestionDto) {
					return {
						where(_expr: unknown) {
							return {
								returning: () => Promise.resolve(fixtures.updateReturn ?? [])
							};
						}
					};
				}
			};
		},
		delete(_table: unknown) {
			return {
				where(_expr: unknown) {
					return {
						returning: () => Promise.resolve(fixtures.deleteReturn ?? [])
					};
				}
			};
		}
	};

	return { getDbClient: () => api };
}

function makeTrackingDbClient(fixtures: Fixtures) {
	let receivedTx: Transaction | undefined;

	const api = {
		select() {
			return {
				from(_table: unknown) {
					return {
						where(_expr: unknown): any {
							return makeThenableSelectResult(fixtures);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateBaseQuestionDto | CreateBaseQuestionDto[]) {
					return {
						returning: () =>
							Promise.resolve(
								fixtures.insertReturn ?? fixtures.createManyReturn ?? []
							)
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateBaseQuestionDto) {
					return {
						where(_expr: unknown) {
							return {
								returning: () => Promise.resolve(fixtures.updateReturn ?? [])
							};
						}
					};
				}
			};
		},
		delete(_table: unknown) {
			return {
				where(_expr: unknown) {
					return {
						returning: () => Promise.resolve(fixtures.deleteReturn ?? [])
					};
				}
			};
		}
	};

	const getDbClient = (tx?: Transaction) => {
		receivedTx = tx;
		return api;
	};

	return { getDbClient, getReceivedTx: () => receivedTx };
}

describe('BaseQuestionRepository', () => {
	// getById

	it('getById: returns question when found', async () => {
		const row = makeBaseQuestion();
		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ selectResult: [row] }).getDbClient
		);

		const found = await repo.getById('q1');
		expect(found).toEqual(row);
	});

	it('getById: returns undefined when not found', async () => {
		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const found = await repo.getById('missing');
		expect(found).toBeUndefined();
	});

	// create

	it('create: returns created row', async () => {
		const input = {
			baseQuizId: 'quiz1',
			questionText: 'New',
			correctAnswerText: 'A',
			conceptId: 'math',
			codeSnippet: '',
			questionType: 'MCQ',
			orderIndex: 2
		} as CreateBaseQuestionDto;

		const returned = makeBaseQuestion({ id: 'q2', questionText: 'New' });

		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ insertReturn: [returned] }).getDbClient
		);

		const created = await repo.create(input);
		expect(created).toEqual(returned);
	});

	// update

	it('update: returns updated row', async () => {
		const returned = makeBaseQuestion({ questionText: 'Updated' });

		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ updateReturn: [returned] }).getDbClient
		);

		const updated = await repo.update('q1', { questionText: 'Updated' });
		expect(updated).toEqual(returned);
	});

	it('update: returns undefined when nothing updated', async () => {
		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ updateReturn: [] }).getDbClient
		);

		const updated = await repo.update('q1', { questionText: 'Updated' });
		expect(updated).toBeUndefined();
	});

	// deleteById

	it('deleteById: returns deleted row', async () => {
		const deleted = makeBaseQuestion();
		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ deleteReturn: [deleted] }).getDbClient
		);

		const res = await repo.deleteById('q1');
		expect(res).toEqual(deleted);
	});

	it('deleteById: returns undefined when nothing deleted', async () => {
		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ deleteReturn: [] }).getDbClient
		);

		const res = await repo.deleteById('q1');
		expect(res).toBeUndefined();
	});

	// getByIds

	it('getByIds: returns matching rows', async () => {
		const rows = [
			makeBaseQuestion({ id: 'q1' }),
			makeBaseQuestion({ id: 'q2' })
		];

		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ selectResult: rows }).getDbClient
		);

		const res = await repo.getByIds(['q1', 'q2']);
		expect(res).toEqual(rows);
	});

	// createMany

	it('createMany: returns inserted rows', async () => {
		const rows = [
			makeBaseQuestion({ id: 'q1' }),
			makeBaseQuestion({ id: 'q2' })
		];

		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ createManyReturn: rows }).getDbClient
		);

		const res = await repo.createMany([]);
		expect(res).toEqual(rows);
	});

	// getByBaseQuizId

	it('getByBaseQuizId: returns related rows', async () => {
		const rows = [
			makeBaseQuestion({ id: 'q1', baseQuizId: 'quizX' }),
			makeBaseQuestion({ id: 'q2', baseQuizId: 'quizX' })
		];

		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ selectResult: rows }).getDbClient
		);

		const res = await repo.getByBaseQuizId('quizX');
		expect(res).toEqual(rows);
	});

	// getBaseQuizIdByQuestionId

	it('getBaseQuizIdByQuestionId: returns baseQuizId', async () => {
		const row = makeBaseQuestion({ baseQuizId: 'quiz42' });

		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ selectResult: [row] }).getDbClient
		);

		const id = await repo.getBaseQuizIdByQuestionId('q1');
		expect(id).toBe('quiz42');
	});

	it('getBaseQuizIdByQuestionId: returns undefined when not found', async () => {
		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const id = await repo.getBaseQuizIdByQuestionId('missing');
		expect(id).toBeUndefined();
	});

	// transaction wiring

	it('passes transaction', async () => {
		const row = makeBaseQuestion();

		const { getDbClient, getReceivedTx } = makeTrackingDbClient({
			selectResult: [row]
		});

		const repo = new BaseQuestionRepository(getDbClient);
		const tx = {} as Transaction;

		await repo.getById('q1', tx);

		expect(getReceivedTx()).toBe(tx);
	});
});
