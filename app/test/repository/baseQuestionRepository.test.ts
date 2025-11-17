// test/repositories/baseQuestionRepository.test.ts
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
		baseQuizId: 'bq1',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		questionText: 'What is 2+2?',
		correctAnswerText: '4',
		conceptId: 'concept-1',
		codeSnippet: '2+2',
		questionType: 'single-choice',
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

function makeFakeDbClient(fixtures: Fixtures) {
	const api = {
		select() {
			return {
				from(_table: unknown) {
					return {
						where(_expr: unknown): Promise<BaseQuestionDto[]> {
							return Promise.resolve(fixtures.selectResult ?? []);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateBaseQuestionDto | CreateBaseQuestionDto[]) {
					return {
						returning(): Promise<BaseQuestionDto[]> {
							const result = fixtures.insertReturn ?? fixtures.createManyReturn ?? [];
							return Promise.resolve(result);
						}
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
								returning(): Promise<BaseQuestionDto[]> {
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
						returning(): Promise<BaseQuestionDto[]> {
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
	const api = {
		select() {
			return {
				from(_table: unknown) {
					return {
						where(_expr: unknown): Promise<BaseQuestionDto[]> {
							return Promise.resolve(fixtures.selectResult ?? []);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateBaseQuestionDto | CreateBaseQuestionDto[]) {
					return {
						returning(): Promise<BaseQuestionDto[]> {
							const result = fixtures.insertReturn ?? fixtures.createManyReturn ?? [];
							return Promise.resolve(result);
						}
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
								returning(): Promise<BaseQuestionDto[]> {
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
						returning(): Promise<BaseQuestionDto[]> {
							return Promise.resolve(fixtures.deleteReturn ?? []);
						}
					};
				}
			};
		}
	};

	let receivedTx: Transaction | undefined;

	const getDbClient = (tx?: Transaction) => {
		receivedTx = tx;
		return api;
	};

	return { getDbClient, getReceivedTx: () => receivedTx };
}

describe('BaseQuestionRepository', () => {
	// getById

	it('getById: returns question when it exists', async () => {
		const row = makeBaseQuestion({ id: 'q1' });
		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ selectResult: [row] }).getDbClient
		);

		const found = await repo.getById('q1');
		expect(found).toEqual(row);
	});

	it('getById: returns undefined when question does not exist', async () => {
		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const found = await repo.getById('missing');
		expect(found).toBeUndefined();
	});

	it('getById: returns first row when multiple rows are returned', async () => {
		const first = makeBaseQuestion({ id: 'q1', questionText: 'first' });
		const second = makeBaseQuestion({ id: 'q1', questionText: 'second' });

		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ selectResult: [first, second] }).getDbClient
		);

		const found = await repo.getById('q1');
		expect(found).toEqual(first);
	});

	// create

	it('create: returns inserted row from returning()', async () => {
		const input = {
			baseQuizId: 'bq1',
			questionText: 'Q?',
			correctAnswerText: 'A',
			conceptId: 'c1',
			codeSnippet: 'code',
			questionType: 'type',
			orderIndex: 1
		} as CreateBaseQuestionDto;

		const returned = makeBaseQuestion({
			id: 'q2',
			baseQuizId: 'bq1',
			questionText: 'Q?'
		});

		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ insertReturn: [returned] }).getDbClient
		);

		const created = await repo.create(input);
		expect(created).toEqual(returned);
	});

	// update

	it('update: returns updated row from returning()', async () => {
		const patch = {
			questionText: 'updated'
		} as UpdateBaseQuestionDto;

		const returned = makeBaseQuestion({
			id: 'q1',
			questionText: 'updated'
		});

		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ updateReturn: [returned] }).getDbClient
		);

		const updated = await repo.update('q1', patch);
		expect(updated).toEqual(returned);
	});

	it('update: returns undefined when returning() is empty', async () => {
		const patch = {
			questionText: 'updated'
		} as UpdateBaseQuestionDto;

		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ updateReturn: [] }).getDbClient
		);

		const updated = await repo.update('q1', patch);
		expect(updated).toBeUndefined();
	});

	// deleteById

	it('deleteById: returns deleted row from returning()', async () => {
		const deleted = makeBaseQuestion({ id: 'q1' });

		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ deleteReturn: [deleted] }).getDbClient
		);

		const res = await repo.deleteById('q1');
		expect(res).toEqual(deleted);
	});

	it('deleteById: returns undefined when nothing was deleted', async () => {
		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ deleteReturn: [] }).getDbClient
		);

		const res = await repo.deleteById('q1');
		expect(res).toBeUndefined();
	});

	// getByIds

	it('getByIds: returns array of rows', async () => {
		const rows: BaseQuestionDto[] = [
			makeBaseQuestion({ id: 'q1' }),
			makeBaseQuestion({ id: 'q2', questionText: 'second' })
		];

		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ selectResult: rows }).getDbClient
		);

		const res = await repo.getByIds(['q1', 'q2']);
		expect(res).toEqual(rows);
	});

	it('getByIds: returns empty array when nothing found', async () => {
		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const res = await repo.getByIds(['q1', 'q2']);
		expect(res).toEqual([]);
	});

	// createMany

	it('createMany: returns inserted rows', async () => {
		const input: CreateBaseQuestionDto[] = [
			{
				baseQuizId: 'bq1',
				questionText: 'Q1',
				correctAnswerText: 'A1',
				conceptId: 'c1',
				codeSnippet: 'code1',
				questionType: 'type',
				orderIndex: 1
			} as CreateBaseQuestionDto,
			{
				baseQuizId: 'bq1',
				questionText: 'Q2',
				correctAnswerText: 'A2',
				conceptId: 'c2',
				codeSnippet: 'code2',
				questionType: 'type',
				orderIndex: 2
			} as CreateBaseQuestionDto
		];

		const returned: BaseQuestionDto[] = [
			makeBaseQuestion({ id: 'q1', questionText: 'Q1' }),
			makeBaseQuestion({ id: 'q2', questionText: 'Q2' })
		];

		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ createManyReturn: returned }).getDbClient
		);

		const res = await repo.createMany(input);
		expect(res).toEqual(returned);
	});

	// getByBaseQuizId

	it('getByBaseQuizId: returns questions for given baseQuizId', async () => {
		const rows: BaseQuestionDto[] = [
			makeBaseQuestion({ id: 'q1', baseQuizId: 'bq1' }),
			makeBaseQuestion({ id: 'q2', baseQuizId: 'bq1' })
		];

		const repo = new BaseQuestionRepository(
			makeFakeDbClient({ selectResult: rows }).getDbClient
		);

		const res = await repo.getByBaseQuizId('bq1');
		expect(res).toEqual(rows);
	});

	// getBaseQuizIdByQuestionId – špeciálny fake kvôli .limit(1)

	it('getBaseQuizIdByQuestionId: returns baseQuizId when found', async () => {
		const rows: BaseQuestionDto[] = [makeBaseQuestion({ id: 'q1', baseQuizId: 'bq-special' })];

		const getDbClient = () => ({
			select() {
				return {
					from(_table: unknown) {
						return {
							where(_expr: unknown) {
								return {
									limit(_n: number): Promise<BaseQuestionDto[]> {
										return Promise.resolve(rows);
									}
								};
							}
						};
					}
				};
			},
			// ostatné metódy tu netreba
		});

		const repo = new BaseQuestionRepository(getDbClient as any);

		const res = await repo.getBaseQuizIdByQuestionId('q1');
		expect(res).toBe('bq-special');
	});

	it('getBaseQuizIdByQuestionId: returns undefined when not found', async () => {
		const rows: BaseQuestionDto[] = [];

		const getDbClient = () => ({
			select() {
				return {
					from(_table: unknown) {
						return {
							where(_expr: unknown) {
								return {
									limit(_n: number): Promise<BaseQuestionDto[]> {
										return Promise.resolve(rows);
									}
								};
							}
						};
					}
				};
			}
		});

		const repo = new BaseQuestionRepository(getDbClient as any);

		const res = await repo.getBaseQuizIdByQuestionId('missing');
		expect(res).toBeUndefined();
	});

	// transaction wiring

	it('uses provided transaction when calling getDbClient in getById', async () => {
		const row = makeBaseQuestion({ id: 'q1' });

		const { getDbClient, getReceivedTx } = makeTrackingDbClient({
			selectResult: [row]
		});

		const repo = new BaseQuestionRepository(getDbClient);
		const tx = {} as Transaction;

		await repo.getById('q1', tx);

		expect(getReceivedTx()).toBe(tx);
	});
});
