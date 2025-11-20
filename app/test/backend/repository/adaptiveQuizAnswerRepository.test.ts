import { describe, it, expect } from 'bun:test';
import type {
	AdaptiveQuizAnswerDto,
	CreateAdaptiveQuizAnswerDto,
	UpdateAdaptiveQuizAnswerDto
} from '../../../src/db/schema';
import type { Transaction } from '../../../src/types';
import { AdaptiveQuizAnswerRepository } from '../../../src/repositories/adaptiveQuizAnswerRepository';

function makeAdaptiveQuizAnswer(
	overrides: Partial<AdaptiveQuizAnswerDto> = {}
): AdaptiveQuizAnswerDto {
	return {
		id: 'aqa1',
		adaptiveQuizId: 'aq1',
		baseQuestionId: 'q1',
		answerText: '4',
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

type Fixtures = {
	selectResult?: AdaptiveQuizAnswerDto[];
	insertReturn?: AdaptiveQuizAnswerDto[];
	updateReturn?: AdaptiveQuizAnswerDto[];
	deleteReturn?: AdaptiveQuizAnswerDto[];
	questionHistoryResult?: QuestionHistoryRow[];
};

function makeFakeDbClient(fixtures: Fixtures) {
	const api = {
		select(fields?: any) {
			// questionHistory uses select({...})
			if (fields) {
				return {
					from(_table: unknown) {
						return {
							innerJoin(_other: unknown, _on: unknown) {
								return {
									where(_expr: unknown) {
										return {
											limit(_n: number): Promise<QuestionHistoryRow[]> {
												return Promise.resolve(fixtures.questionHistoryResult ?? []);
											}
										};
									}
								};
							}
						};
					}
				};
			}

			// All other calls use select().from(adaptiveQuizAnswer)...
			return {
				from(_table: unknown) {
					const rows = fixtures.selectResult ?? [];
					return {
						where(_expr: unknown) {
							return {
								orderBy(_expr: unknown): Promise<AdaptiveQuizAnswerDto[]> {
									// getByAdaptiveQuizId: .orderBy(...)
									return Promise.resolve(rows);
								},
								limit(_n: number): Promise<AdaptiveQuizAnswerDto[]> {
									// if ever used with limit()
									return Promise.resolve(rows);
								},
								then<TResult1 = AdaptiveQuizAnswerDto[], TResult2 = never>(
									onfulfilled?:
										| ((value: AdaptiveQuizAnswerDto[]) => TResult1 | PromiseLike<TResult1>)
										| null,
									onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
								): Promise<TResult1 | TResult2> {
									// for simple await select().from().where(...)
									return Promise.resolve(rows).then(onfulfilled as any, onrejected as any);
								}
							};
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateAdaptiveQuizAnswerDto | CreateAdaptiveQuizAnswerDto[]) {
					return {
						returning(): Promise<AdaptiveQuizAnswerDto[]> {
							return Promise.resolve(fixtures.insertReturn ?? []);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateAdaptiveQuizAnswerDto) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<AdaptiveQuizAnswerDto[]> {
									return Promise.resolve(fixtures.updateReturn ?? []);
								}
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
						returning(): Promise<AdaptiveQuizAnswerDto[]> {
							return Promise.resolve(fixtures.deleteReturn ?? []);
						}
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
		select(fields?: any) {
			if (fields) {
				return {
					from(_table: unknown) {
						return {
							innerJoin(_other: unknown, _on: unknown) {
								return {
									where(_expr: unknown) {
										return {
											limit(_n: number): Promise<QuestionHistoryRow[]> {
												return Promise.resolve(fixtures.questionHistoryResult ?? []);
											}
										};
									}
								};
							}
						};
					}
				};
			}

			return {
				from(_table: unknown) {
					const rows = fixtures.selectResult ?? [];
					return {
						where(_expr: unknown) {
							return {
								orderBy(_expr: unknown): Promise<AdaptiveQuizAnswerDto[]> {
									return Promise.resolve(rows);
								},
								limit(_n: number): Promise<AdaptiveQuizAnswerDto[]> {
									return Promise.resolve(rows);
								},
								then<TResult1 = AdaptiveQuizAnswerDto[], TResult2 = never>(
									onfulfilled?:
										| ((value: AdaptiveQuizAnswerDto[]) => TResult1 | PromiseLike<TResult1>)
										| null,
									onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
								): Promise<TResult1 | TResult2> {
									return Promise.resolve(rows).then(onfulfilled as any, onrejected as any);
								}
							};
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateAdaptiveQuizAnswerDto | CreateAdaptiveQuizAnswerDto[]) {
					return {
						returning(): Promise<AdaptiveQuizAnswerDto[]> {
							return Promise.resolve(fixtures.insertReturn ?? []);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateAdaptiveQuizAnswerDto) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<AdaptiveQuizAnswerDto[]> {
									return Promise.resolve(fixtures.updateReturn ?? []);
								}
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
						returning(): Promise<AdaptiveQuizAnswerDto[]> {
							return Promise.resolve(fixtures.deleteReturn ?? []);
						}
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

describe('AdaptiveQuizAnswerRepository', () => {
	// getById

	it('getById: returns adaptiveQuizAnswer when it exists', async () => {
		const row = makeAdaptiveQuizAnswer({ id: 'aqa1' });

		const repo = new AdaptiveQuizAnswerRepository(
			makeFakeDbClient({ selectResult: [row] }).getDbClient
		);

		const found = await repo.getById('aqa1');
		expect(found).toEqual(row);
	});

	it('getById: returns undefined when not found', async () => {
		const repo = new AdaptiveQuizAnswerRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const found = await repo.getById('missing');
		expect(found).toBeUndefined();
	});

	it('getById: returns first row when multiple rows are returned', async () => {
		const first = makeAdaptiveQuizAnswer({ id: 'aqa1', isCorrect: true });
		const second = makeAdaptiveQuizAnswer({ id: 'aqa1', isCorrect: false });

		const repo = new AdaptiveQuizAnswerRepository(
			makeFakeDbClient({ selectResult: [first, second] }).getDbClient
		);

		const found = await repo.getById('aqa1');
		expect(found).toEqual(first);
	});

	// getByIds

	it('getByIds: returns array of rows', async () => {
		const rows: AdaptiveQuizAnswerDto[] = [
			makeAdaptiveQuizAnswer({ id: 'aqa1' }),
			makeAdaptiveQuizAnswer({ id: 'aqa2' })
		];

		const repo = new AdaptiveQuizAnswerRepository(
			makeFakeDbClient({ selectResult: rows }).getDbClient
		);

		const res = await repo.getByIds(['aqa1', 'aqa2']);
		expect(res).toEqual(rows);
	});

	it('getByIds: returns empty array when nothing found', async () => {
		const repo = new AdaptiveQuizAnswerRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const res = await repo.getByIds(['aqa1', 'aqa2']);
		expect(res).toEqual([]);
	});

	// create

	it('create: returns inserted row from returning()', async () => {
		const input = {
			adaptiveQuizId: 'aq1',
			baseQuestionId: 'q1',
			answerText: '4',
			isCorrect: true,
			time: 12
		} as CreateAdaptiveQuizAnswerDto;

		const returned = makeAdaptiveQuizAnswer({
			id: 'aqa2',
			adaptiveQuizId: 'aq1',
			baseQuestionId: 'q1'
		});

		const repo = new AdaptiveQuizAnswerRepository(
			makeFakeDbClient({ insertReturn: [returned] }).getDbClient
		);

		const created = await repo.create(input);
		expect(created).toEqual(returned);
	});

	// update

	it('update: returns updated row from returning()', async () => {
		const patch = {
			isCorrect: false,
			answerText: '5'
		} as UpdateAdaptiveQuizAnswerDto;

		const returned = makeAdaptiveQuizAnswer({
			id: 'aqa1',
			isCorrect: false,
			answerText: '5'
		});

		const repo = new AdaptiveQuizAnswerRepository(
			makeFakeDbClient({ updateReturn: [returned] }).getDbClient
		);

		const updated = await repo.update('aqa1', patch);
		expect(updated).toEqual(returned);
	});

	it('update: returns undefined when returning() is empty', async () => {
		const patch = {
			isCorrect: false
		} as UpdateAdaptiveQuizAnswerDto;

		const repo = new AdaptiveQuizAnswerRepository(
			makeFakeDbClient({ updateReturn: [] }).getDbClient
		);

		const updated = await repo.update('aqa1', patch);
		expect(updated).toBeUndefined();
	});

	// delete

	it('delete: returns deleted row from returning()', async () => {
		const deleted = makeAdaptiveQuizAnswer({ id: 'aqa1' });

		const repo = new AdaptiveQuizAnswerRepository(
			makeFakeDbClient({ deleteReturn: [deleted] }).getDbClient
		);

		const res = await repo.delete('aqa1');
		expect(res).toEqual(deleted);
	});

	it('delete: returns undefined when nothing was deleted', async () => {
		const repo = new AdaptiveQuizAnswerRepository(
			makeFakeDbClient({ deleteReturn: [] }).getDbClient
		);

		const res = await repo.delete('aqa1');
		expect(res).toBeUndefined();
	});

	// getByBaseQuestionId

	it('getByBaseQuestionId: returns row for baseQuestionId', async () => {
		const row = makeAdaptiveQuizAnswer({ id: 'aqa1', baseQuestionId: 'qX' });

		const repo = new AdaptiveQuizAnswerRepository(
			makeFakeDbClient({ selectResult: [row] }).getDbClient
		);

		const res = await repo.getByBaseQuestionId('qX');
		expect(res).toEqual(row);
	});

	it('getByBaseQuestionId: returns undefined when none', async () => {
		const repo = new AdaptiveQuizAnswerRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const res = await repo.getByBaseQuestionId('qX');
		expect(res).toBeUndefined();
	});

	// getByAdaptiveQuizId

	it('getByAdaptiveQuizId: returns rows ordered by createdAt desc (we just return fixtures)', async () => {
		const rows = [
			makeAdaptiveQuizAnswer({ id: 'aqa1', adaptiveQuizId: 'aqX' }),
			makeAdaptiveQuizAnswer({ id: 'aqa2', adaptiveQuizId: 'aqX' })
		];

		const repo = new AdaptiveQuizAnswerRepository(
			makeFakeDbClient({ selectResult: rows }).getDbClient
		);

		const res = await repo.getByAdaptiveQuizId('aqX');
		expect(res).toEqual(rows);
	});

	// getQuestionHistory

	it('getQuestionHistory: returns projected rows', async () => {
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

		const repo = new AdaptiveQuizAnswerRepository(
			makeFakeDbClient({ questionHistoryResult: historyRows }).getDbClient
		);

		const res = await repo.getQuestionHistory(['aq1', 'aq2'], 'concept-1');
		expect(res).toEqual(historyRows);
	});

	// transaction wiring

	it('uses provided transaction when calling getDbClient in getById', async () => {
		const row = makeAdaptiveQuizAnswer({ id: 'aqa1' });

		const { getDbClient, getReceivedTx } = makeTrackingDbClient({
			selectResult: [row]
		});

		const repo = new AdaptiveQuizAnswerRepository(getDbClient);
		const tx = {} as Transaction;

		await repo.getById('aqa1', tx);

		expect(getReceivedTx()).toBe(tx);
	});
});
