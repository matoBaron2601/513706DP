import { describe, it, expect } from 'bun:test';
import type { CourseDto } from '../../../src/db/schema';
import type { Transaction } from '../../../src/types';
import { CourseRepository } from '../../../src/repositories/courseRepository';
import type { GetCoursesResponse } from '../../../src/schemas/courseSchema';

function makeCourse(overrides: Partial<CourseDto> = {}): CourseDto {
	return {
		id: 'c1',
		name: 'Course 1',
		creatorId: 'u1',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		published: false,
		...overrides
	};
}

// GetCoursesResponse is usually CourseDto + blocksCount
function makeCourseWithBlocksCount(
	overrides: Partial<GetCoursesResponse> = {}
): GetCoursesResponse {
	return {
		id: 'c1',
		name: 'Course 1',
		creatorId: 'u1',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		published: true,
		blocksCount: 3,
		...overrides
	} as GetCoursesResponse;
}

type Fixtures = {
	selectResult?: CourseDto[];
	insertReturn?: CourseDto[];
	updateReturn?: CourseDto[];
	deleteReturn?: CourseDto[];
	getAllResult?: GetCoursesResponse[];
};

function makeFakeDbClient(fixtures: Fixtures) {
	const api = {
		// Drizzle: select() or select({...})
		select(_fields?: any) {
			return {
				from(_table: unknown) {
					// getAll path: select({...})
					if (_fields) {
						return {
							leftJoin(_block: unknown, _on: unknown) {
								return {
									where(_whereExpr: unknown) {
										return {
											groupBy(_groupExpr: unknown) {
												const base = {
													having(_havingExpr: unknown) {
														return {
															orderBy(_orderExpr: unknown): Promise<GetCoursesResponse[]> {
																return Promise.resolve(fixtures.getAllResult ?? []);
															}
														};
													},
													orderBy(_orderExpr: unknown): Promise<GetCoursesResponse[]> {
														return Promise.resolve(fixtures.getAllResult ?? []);
													}
												};
												return base;
											}
										};
									}
								};
							}
						};
					}

					// simple select().from(course).where(...)
					return {
						where(_expr: unknown): Promise<CourseDto[]> {
							return Promise.resolve(fixtures.selectResult ?? []);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: any) {
					return {
						returning(): Promise<CourseDto[]> {
							return Promise.resolve(fixtures.insertReturn ?? []);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: any) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<CourseDto[]> {
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
						returning(): Promise<CourseDto[]> {
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
		select(_fields?: any) {
			return {
				from(_table: unknown) {
					if (_fields) {
						return {
							leftJoin(_block: unknown, _on: unknown) {
								return {
									where(_whereExpr: unknown) {
										return {
											groupBy(_groupExpr: unknown) {
												const base = {
													having(_havingExpr: unknown) {
														return {
															orderBy(_orderExpr: unknown): Promise<GetCoursesResponse[]> {
																return Promise.resolve(fixtures.getAllResult ?? []);
															}
														};
													},
													orderBy(_orderExpr: unknown): Promise<GetCoursesResponse[]> {
														return Promise.resolve(fixtures.getAllResult ?? []);
													}
												};
												return base;
											}
										};
									}
								};
							}
						};
					}

					return {
						where(_expr: unknown): Promise<CourseDto[]> {
							return Promise.resolve(fixtures.selectResult ?? []);
						}
					};
				}
			};
		},
		insert(_table: unknown) {
			return {
				values(_v: any) {
					return {
						returning(): Promise<CourseDto[]> {
							return Promise.resolve(fixtures.insertReturn ?? []);
						}
					};
				}
			};
		},
		update(_table: unknown) {
			return {
				set(_v: any) {
					return {
						where(_expr: unknown) {
							return {
								returning(): Promise<CourseDto[]> {
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
						returning(): Promise<CourseDto[]> {
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

describe('CourseRepository', () => {
	// getById

	it('getById: returns course when it exists', async () => {
		const row = makeCourse({ id: 'c1' });

		const repo = new CourseRepository(makeFakeDbClient({ selectResult: [row] }).getDbClient);

		const found = await repo.getById('c1');
		expect(found).toEqual(row);
	});

	it('getById: returns undefined when course does not exist', async () => {
		const repo = new CourseRepository(makeFakeDbClient({ selectResult: [] }).getDbClient);

		const found = await repo.getById('missing');
		expect(found).toBeUndefined();
	});

	it('getById: returns first row when multiple rows are returned', async () => {
		const first = makeCourse({ id: 'c1', name: 'First' });
		const second = makeCourse({ id: 'c1', name: 'Second' });

		const repo = new CourseRepository(
			makeFakeDbClient({ selectResult: [first, second] }).getDbClient
		);

		const found = await repo.getById('c1');
		expect(found).toEqual(first);
	});

	// create

	it('create: returns inserted row from returning()', async () => {
		const input = {
			name: 'New Course',
			creatorId: 'u1',
			published: false
		};

		const returned = makeCourse({ id: 'c2', name: 'New Course' });

		const repo = new CourseRepository(makeFakeDbClient({ insertReturn: [returned] }).getDbClient);

		const created = await repo.create(input);
		expect(created).toEqual(returned);
	});

	// update

	it('update: returns updated row from returning()', async () => {
		const patch = {
			name: 'Updated Course',
			published: true
		};

		const returned = makeCourse({ id: 'c1', name: 'Updated Course', published: true });

		const repo = new CourseRepository(makeFakeDbClient({ updateReturn: [returned] }).getDbClient);

		const updated = await repo.update('c1', patch);
		expect(updated).toEqual(returned);
	});

	it('update: returns undefined when returning() is empty', async () => {
		const patch = {
			name: 'Updated Course'
		};

		const repo = new CourseRepository(makeFakeDbClient({ updateReturn: [] }).getDbClient);

		const updated = await repo.update('c1', patch);
		expect(updated).toBeUndefined();
	});

	// delete

	it('delete: returns deleted row from returning()', async () => {
		const deleted = makeCourse({ id: 'c1' });

		const repo = new CourseRepository(makeFakeDbClient({ deleteReturn: [deleted] }).getDbClient);

		const res = await repo.delete('c1');
		expect(res).toEqual(deleted);
	});

	it('delete: returns undefined when nothing was deleted', async () => {
		const repo = new CourseRepository(makeFakeDbClient({ deleteReturn: [] }).getDbClient);

		const res = await repo.delete('c1');
		expect(res).toBeUndefined();
	});

	// getByIds

	it('getByIds: returns array of courses', async () => {
		const rows = [makeCourse({ id: 'c1' }), makeCourse({ id: 'c2', name: 'Second' })];

		const repo = new CourseRepository(makeFakeDbClient({ selectResult: rows }).getDbClient);

		const res = await repo.getByIds(['c1', 'c2']);
		expect(res).toEqual(rows);
	});

	it('getByIds: returns empty array when nothing found', async () => {
		const repo = new CourseRepository(makeFakeDbClient({ selectResult: [] }).getDbClient);

		const res = await repo.getByIds(['c1', 'c2']);
		expect(res).toEqual([]);
	});

	// getManyByCreatorId

	it('getManyByCreatorId: returns courses for given creatorId', async () => {
		const rows = [
			makeCourse({ id: 'c1', creatorId: 'uX' }),
			makeCourse({ id: 'c2', creatorId: 'uX' })
		];

		const repo = new CourseRepository(makeFakeDbClient({ selectResult: rows }).getDbClient);

		const res = await repo.getManyByCreatorId('uX');
		expect(res).toEqual(rows);
	});

	// getAll

	it('getAll: returns rows from aggregated query', async () => {
		const rows: GetCoursesResponse[] = [
			makeCourseWithBlocksCount({ id: 'c1', name: 'A', blocksCount: 2 }),
			makeCourseWithBlocksCount({ id: 'c2', name: 'B', blocksCount: 5 })
		];

		const repo = new CourseRepository(makeFakeDbClient({ getAllResult: rows }).getDbClient);

		const res = await repo.getAll();
		expect(res).toEqual(rows);
	});

	it('getAll: works with filters and sort options', async () => {
		const rows: GetCoursesResponse[] = [
			makeCourseWithBlocksCount({ id: 'c1', name: 'Filtered', blocksCount: 3 })
		];

		const repo = new CourseRepository(makeFakeDbClient({ getAllResult: rows }).getDbClient);

		const res = await repo.getAll({
			name: 'Fil',
			creatorId: 'u1',
			minBlocks: 1,
			maxBlocks: 10,
			sortBy: 'name',
			sortDir: 'asc'
		});

		expect(res).toEqual(rows);
	});

	// transaction wiring

	it('uses provided transaction when calling getDbClient in getById', async () => {
		const row = makeCourse({ id: 'c1' });

		const { getDbClient, getReceivedTx } = makeTrackingDbClient({
			selectResult: [row]
		});

		const repo = new CourseRepository(getDbClient);
		const tx = {} as Transaction;

		await repo.getById('c1', tx);

		expect(getReceivedTx()).toBe(tx);
	});
});
