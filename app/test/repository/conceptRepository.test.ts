import { describe, it, expect } from 'bun:test';
import type {
	ConceptDto,
	CreateConceptDto,
	UpdateConceptDto
} from '../../src/db/schema';
import type { Transaction } from '../../src/types';
import { ConceptRepository } from '../../src/repositories/conceptRepository';

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

type Fixtures = {
	selectResult?: ConceptDto[];
	insertReturn?: ConceptDto[];
	updateReturn?: ConceptDto[];
	deleteReturn?: ConceptDto[];
	createManyReturn?: ConceptDto[];
};

function makeFakeDbClient(fixtures: Fixtures) {
	const api = {
		select() {
			return {
				from(_table: unknown) {
					return {
						where(_expr: unknown): Promise<ConceptDto[]> {
							return Promise.resolve(fixtures.selectResult ?? []);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateConceptDto | CreateConceptDto[]) {
					return {
						returning(): Promise<ConceptDto[]> {
							const result = fixtures.insertReturn ?? fixtures.createManyReturn ?? [];
							return Promise.resolve(result);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateConceptDto) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<ConceptDto[]> {
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
						returning(): Promise<ConceptDto[]> {
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
						where(_expr: unknown): Promise<ConceptDto[]> {
							return Promise.resolve(fixtures.selectResult ?? []);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: CreateConceptDto | CreateConceptDto[]) {
					return {
						returning(): Promise<ConceptDto[]> {
							const result = fixtures.insertReturn ?? fixtures.createManyReturn ?? [];
							return Promise.resolve(result);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: UpdateConceptDto) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<ConceptDto[]> {
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
						returning(): Promise<ConceptDto[]> {
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

describe('ConceptRepository', () => {
	// getById

	it('getById: returns concept when it exists', async () => {
		const row = makeConcept({ id: 'c1' });

		const repo = new ConceptRepository(
			makeFakeDbClient({ selectResult: [row] }).getDbClient
		);

		const found = await repo.getById('c1');
		expect(found).toEqual(row);
	});

	it('getById: returns undefined when concept does not exist', async () => {
		const repo = new ConceptRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const found = await repo.getById('missing');
		expect(found).toBeUndefined();
	});

	// getByIds

	it('getByIds: returns array of concepts', async () => {
		const rows: ConceptDto[] = [
			makeConcept({ id: 'c1' }),
			makeConcept({ id: 'c2', name: 'Concept 2' })
		];

		const repo = new ConceptRepository(
			makeFakeDbClient({ selectResult: rows }).getDbClient
		);

		const res = await repo.getByIds(['c1', 'c2']);
		expect(res).toEqual(rows);
	});

	it('getByIds: returns empty array when nothing found', async () => {
		const repo = new ConceptRepository(
			makeFakeDbClient({ selectResult: [] }).getDbClient
		);

		const res = await repo.getByIds(['c1', 'c2']);
		expect(res).toEqual([]);
	});

	// create

	it('create: returns inserted concept from returning()', async () => {
		const input = {
			name: 'New Concept',
			blockId: 'b1',
			difficultyIndex: 3
		} as CreateConceptDto;

		const returned = makeConcept({
			id: 'c2',
			name: 'New Concept',
			blockId: 'b1',
			difficultyIndex: 3
		});

		const repo = new ConceptRepository(
			makeFakeDbClient({ insertReturn: [returned] }).getDbClient
		);

		const created = await repo.create(input);
		expect(created).toEqual(returned);
	});

	// update

	it('update: returns updated concept from returning()', async () => {
		const patch = {
			name: 'Updated Concept',
			difficultyIndex: 5
		} as UpdateConceptDto;

		const returned = makeConcept({
			id: 'c1',
			name: 'Updated Concept',
			difficultyIndex: 5
		});

		const repo = new ConceptRepository(
			makeFakeDbClient({ updateReturn: [returned] }).getDbClient
		);

		const updated = await repo.update('c1', patch);
		expect(updated).toEqual(returned);
	});

	it('update: returns undefined when returning() is empty', async () => {
		const patch = {
			name: 'Updated Concept'
		} as UpdateConceptDto;

		const repo = new ConceptRepository(
			makeFakeDbClient({ updateReturn: [] }).getDbClient
		);

		const updated = await repo.update('c1', patch);
		expect(updated).toBeUndefined();
	});

	// delete

	it('delete: returns deleted concept from returning()', async () => {
		const deleted = makeConcept({ id: 'c1' });

		const repo = new ConceptRepository(
			makeFakeDbClient({ deleteReturn: [deleted] }).getDbClient
		);

		const res = await repo.delete('c1');
		expect(res).toEqual(deleted);
	});

	it('delete: returns undefined when nothing was deleted', async () => {
		const repo = new ConceptRepository(
			makeFakeDbClient({ deleteReturn: [] }).getDbClient
		);

		const res = await repo.delete('c1');
		expect(res).toBeUndefined();
	});

	// createMany

	it('createMany: returns inserted concepts', async () => {
		const input: CreateConceptDto[] = [
			{
				name: 'C1',
				blockId: 'b1',
				difficultyIndex: 1
			} as CreateConceptDto,
			{
				name: 'C2',
				blockId: 'b1',
				difficultyIndex: 2
			} as CreateConceptDto
		];

		const returned: ConceptDto[] = [
			makeConcept({ id: 'c1', name: 'C1', difficultyIndex: 1 }),
			makeConcept({ id: 'c2', name: 'C2', difficultyIndex: 2 })
		];

		const repo = new ConceptRepository(
			makeFakeDbClient({ createManyReturn: returned }).getDbClient
		);

		const res = await repo.createMany(input);
		expect(res).toEqual(returned);
	});

	// getManyByBlockId

	it('getManyByBlockId: returns concepts for given blockId', async () => {
		const rows: ConceptDto[] = [
			makeConcept({ id: 'c1', blockId: 'bX' }),
			makeConcept({ id: 'c2', blockId: 'bX' })
		];

		const repo = new ConceptRepository(
			makeFakeDbClient({ selectResult: rows }).getDbClient
		);

		const res = await repo.getManyByBlockId('bX');
		expect(res).toEqual(rows);
	});

	// getManyByBlockIds

	it('getManyByBlockIds: returns concepts for given blockIds', async () => {
		const rows: ConceptDto[] = [
			makeConcept({ id: 'c1', blockId: 'b1' }),
			makeConcept({ id: 'c2', blockId: 'b2' }),
			makeConcept({ id: 'c3', blockId: 'b1' })
		];

		const repo = new ConceptRepository(
			makeFakeDbClient({ selectResult: rows }).getDbClient
		);

		const res = await repo.getManyByBlockIds(['b1', 'b2']);
		expect(res).toEqual(rows);
	});

	// transaction wiring

	it('uses provided transaction when calling getDbClient in getById', async () => {
		const row = makeConcept({ id: 'c1' });

		const { getDbClient, getReceivedTx } = makeTrackingDbClient({
			selectResult: [row]
		});

		const repo = new ConceptRepository(getDbClient);
		const tx = {} as Transaction;

		await repo.getById('c1', tx);

		expect(getReceivedTx()).toBe(tx);
	});
});
