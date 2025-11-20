import { describe, it, expect } from 'bun:test';
import type {
	ConceptProgressDto,
	CreateConceptProgressDto,
	UpdateConceptProgressDto
} from '../../src/db/schema';
import type { Transaction } from '../../src/types';
import { ConceptProgressRepository } from '../../src/repositories/conceptProgressRepository';

function makeConceptProgress(
	overrides: Partial<ConceptProgressDto> = {}
): ConceptProgressDto {
	return {
		id: 'cp1',
		userBlockId: 'ub1',
		conceptId: 'c1',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
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
		...overrides
	};
}

type Fixtures = {
	selectResult?: ConceptProgressDto[];
	insertReturn?: ConceptProgressDto[];
	updateReturn?: ConceptProgressDto[];
	deleteReturn?: ConceptProgressDto[];
	createManyReturn?: ConceptProgressDto[];
};

function makeFakeDbClient(fixtures: Fixtures) {
	const api = {
		select() {
			return {
				from(_table: unknown) {
					return {
						where(_expr: unknown): Promise<ConceptProgressDto[]> {
							return Promise.resolve(fixtures.selectResult ?? []);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateConceptProgressDto | CreateConceptProgressDto[]) {
					return {
						returning(): Promise<ConceptProgressDto[]> {
							const result = fixtures.insertReturn ?? fixtures.createManyReturn ?? [];
							return Promise.resolve(result);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateConceptProgressDto) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<ConceptProgressDto[]> {
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
						returning(): Promise<ConceptProgressDto[]> {
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
		select() {
			return {
				from(_table: unknown) {
					return {
						where(_expr: unknown): Promise<ConceptProgressDto[]> {
							return Promise.resolve(fixtures.selectResult ?? []);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateConceptProgressDto | CreateConceptProgressDto[]) {
					return {
						returning(): Promise<ConceptProgressDto[]> {
							const result = fixtures.insertReturn ?? fixtures.createManyReturn ?? [];
							return Promise.resolve(result);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateConceptProgressDto) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<ConceptProgressDto[]> {
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
						returning(): Promise<ConceptProgressDto[]> {
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

describe('ConceptProgressRepository', () => {
	// getById

	it('getById: returns conceptProgress when it exists', async () => {
		const row = makeConceptProgress({ id: 'cp1' });

		const repo = new ConceptProgressRepository(
			makeFakeDbClient({ selectResult: [row] }).getDbClient
		);

		const found = await repo.getById('cp1');
		expect(found).toEqual(row);
	});

	it('getById: returns undefined when not found', async () => {
		const repo = new ConceptProgressRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const found = await repo.getById('missing');
		expect(found).toBeUndefined();
	});

	// create

	it('create: returns inserted row from returning()', async () => {
		const input = {
			userBlockId: 'ub1',
			conceptId: 'c1'
		} as CreateConceptProgressDto;

		const returned = makeConceptProgress({
			id: 'cp2',
			userBlockId: 'ub1',
			conceptId: 'c1'
		});

		const repo = new ConceptProgressRepository(
			makeFakeDbClient({ insertReturn: [returned] }).getDbClient
		);

		const created = await repo.create(input);
		expect(created).toEqual(returned);
	});

	// update

	it('update: returns updated row from returning()', async () => {
		const patch = {
			mastered: true,
			score: 10
		} as UpdateConceptProgressDto;

		const returned = makeConceptProgress({
			id: 'cp1',
			mastered: true,
			score: 10
		});

		const repo = new ConceptProgressRepository(
			makeFakeDbClient({ updateReturn: [returned] }).getDbClient
		);

		const updated = await repo.update('cp1', patch);
		expect(updated).toEqual(returned);
	});

	it('update: returns undefined when nothing updated', async () => {
		const patch = {
			mastered: true
		} as UpdateConceptProgressDto;

		const repo = new ConceptProgressRepository(
			makeFakeDbClient({ updateReturn: [] }).getDbClient
		);

		const updated = await repo.update('cp1', patch);
		expect(updated).toBeUndefined();
	});

	// delete

	it('delete: returns deleted row from returning()', async () => {
		const deleted = makeConceptProgress({ id: 'cp1' });

		const repo = new ConceptProgressRepository(
			makeFakeDbClient({ deleteReturn: [deleted] }).getDbClient
		);

		const res = await repo.delete('cp1');
		expect(res).toEqual(deleted);
	});

	it('delete: returns undefined when nothing deleted', async () => {
		const repo = new ConceptProgressRepository(
			makeFakeDbClient({ deleteReturn: [] }).getDbClient
		);

		const res = await repo.delete('cp1');
		expect(res).toBeUndefined();
	});

	// createMany

	it('createMany: returns inserted rows', async () => {
		const input: CreateConceptProgressDto[] = [
			{ userBlockId: 'ub1', conceptId: 'c1' } as CreateConceptProgressDto,
			{ userBlockId: 'ub1', conceptId: 'c2' } as CreateConceptProgressDto
		];

		const returned = [
			makeConceptProgress({ id: 'cp1', conceptId: 'c1' }),
			makeConceptProgress({ id: 'cp2', conceptId: 'c2' })
		];

		const repo = new ConceptProgressRepository(
			makeFakeDbClient({ createManyReturn: returned }).getDbClient
		);

		const res = await repo.createMany(input);
		expect(res).toEqual(returned);
	});

	// updateMany

	it('updateMany: returns updated rows', async () => {
		const patch = {
			mastered: true
		} as UpdateConceptProgressDto;

		const returned = [
			makeConceptProgress({ id: 'cp1', mastered: true }),
			makeConceptProgress({ id: 'cp2', mastered: true })
		];

		const repo = new ConceptProgressRepository(
			makeFakeDbClient({ updateReturn: returned }).getDbClient
		);

		const res = await repo.updateMany(['cp1', 'cp2'], patch);
		expect(res).toEqual(returned);
	});

	// getManyByUserBlockId

	it('getManyByUserBlockId: returns rows for given userBlockId', async () => {
		const rows = [
			makeConceptProgress({ id: 'cp1', userBlockId: 'ubX' }),
			makeConceptProgress({ id: 'cp2', userBlockId: 'ubX' })
		];

		const repo = new ConceptProgressRepository(
			makeFakeDbClient({ selectResult: rows }).getDbClient
		);

		const res = await repo.getManyByUserBlockId('ubX');
		expect(res).toEqual(rows);
	});

	// getByUserBlockIdAndConceptId

	it('getByUserBlockIdAndConceptId: returns matching row', async () => {
		const row = makeConceptProgress({
			id: 'cp1',
			userBlockId: 'ubX',
			conceptId: 'c42'
		});

		const repo = new ConceptProgressRepository(
			makeFakeDbClient({ selectResult: [row] }).getDbClient
		);

		const res = await repo.getByUserBlockIdAndConceptId('ubX', 'c42');
		expect(res).toEqual(row);
	});

	it('getByUserBlockIdAndConceptId: returns undefined when not found', async () => {
		const repo = new ConceptProgressRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const res = await repo.getByUserBlockIdAndConceptId('ubX', 'c42');
		expect(res).toBeUndefined();
	});

	// getManyIncompleteByUserBlockId

	it('getManyIncompleteByUserBlockId: returns rows with mastered = false for given userBlockId', async () => {
		const rows = [
			makeConceptProgress({ id: 'cp1', userBlockId: 'ubX', mastered: false }),
			makeConceptProgress({ id: 'cp2', userBlockId: 'ubX', mastered: false })
		];

		const repo = new ConceptProgressRepository(
			makeFakeDbClient({ selectResult: rows }).getDbClient
		);

		const res = await repo.getManyIncompleteByUserBlockId('ubX');
		expect(res).toEqual(rows);
	});

	// transaction wiring

	it('uses provided transaction when calling getDbClient in getById', async () => {
		const row = makeConceptProgress({ id: 'cp1' });

		const { getDbClient, getReceivedTx } = makeTrackingDbClient({
			selectResult: [row]
		});

		const repo = new ConceptProgressRepository(getDbClient);
		const tx = {} as Transaction;

		await repo.getById('cp1', tx);

		expect(getReceivedTx()).toBe(tx);
	});
});
