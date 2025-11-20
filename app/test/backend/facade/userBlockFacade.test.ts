import { describe, it, expect } from 'bun:test';
import { UserBlockFacade } from '../../../src/facades/userBlockFacade';
import { db } from '../../../src/db/client';
import type { CreateUserBlock, UserBlock } from '../../../src/schemas/userBlockSchema';

type PlacementQuiz = any;
type AdaptiveQuiz = any;
type Concept = any;
type ConceptProgress = any;

function makeUserBlock(overrides: Partial<UserBlock> = {}): UserBlock {
	return {
		id: 'ub1',
		userId: 'u1',
		blockId: 'b1',
		completed: false,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	} as UserBlock;
}

function makePlacementQuiz(overrides: Partial<PlacementQuiz> = {}): PlacementQuiz {
	return {
		id: 'pq1',
		blockId: 'b1',
		baseQuizId: 'bq1',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

function makeConcept(overrides: Partial<Concept> = {}): Concept {
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

class FakeUserBlockService {
	fixtures: { existing?: UserBlock | undefined; created?: UserBlock | undefined } = {};
	calls = {
		getByBothIdsOrUndefined: [] as { data: CreateUserBlock; tx: any }[],
		create: [] as { data: CreateUserBlock; tx: any }[]
	};

	constructor(fixtures: { existing?: UserBlock; created?: UserBlock } = {}) {
		this.fixtures = fixtures;
	}

	async getByBothIdsOrUndefined(data: CreateUserBlock, tx?: any): Promise<UserBlock | undefined> {
		this.calls.getByBothIdsOrUndefined.push({ data, tx });
		return this.fixtures.existing;
	}

	async create(data: CreateUserBlock, tx?: any): Promise<UserBlock> {
		this.calls.create.push({ data, tx });
		if (!this.fixtures.created) {
			this.fixtures.created = makeUserBlock({
				id: 'created-ub',
				userId: data.userId,
				blockId: data.blockId
			});
		}
		return this.fixtures.created as UserBlock;
	}

	async update(id: string, patch: any, tx?: any): Promise<UserBlock> {
		return { ...makeUserBlock({ id }), ...patch };
	}
}

class FakePlacementQuizService {
	fixtures: { byBlockId?: PlacementQuiz } = {};
	calls = {
		getByBlockId: [] as { blockId: string; tx: any }[]
	};

	constructor(fixtures: { byBlockId?: PlacementQuiz } = {}) {
		this.fixtures = fixtures;
	}

	async getByBlockId(blockId: string, tx?: any): Promise<PlacementQuiz> {
		this.calls.getByBlockId.push({ blockId, tx });
		return this.fixtures.byBlockId ?? makePlacementQuiz({ blockId });
	}
}

class FakeAdaptiveQuizService {
	fixtures: { created?: AdaptiveQuiz } = {};
	calls = {
		create: [] as { data: any; tx: any }[]
	};

	constructor(fixtures: { created?: AdaptiveQuiz } = {}) {
		this.fixtures = fixtures;
	}

	async create(data: any, tx?: any): Promise<AdaptiveQuiz> {
		this.calls.create.push({ data, tx });
		if (!this.fixtures.created) {
			this.fixtures.created = {
				id: 'aq1',
				...data,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: null,
				deletedAt: null
			};
		}
		return this.fixtures.created;
	}
}

class FakeConceptService {
	fixtures: { byBlockId?: Concept[] } = {};
	calls = {
		getManyByBlockId: [] as { blockId: string; tx: any }[]
	};

	constructor(fixtures: { byBlockId?: Concept[] } = {}) {
		this.fixtures = fixtures;
	}

	async getManyByBlockId(blockId: string, tx?: any): Promise<Concept[]> {
		this.calls.getManyByBlockId.push({ blockId, tx });
		return this.fixtures.byBlockId ?? [];
	}
}

class FakeConceptProgressService {
	fixtures: { createdMany?: ConceptProgress[] } = {};
	calls = {
		createMany: [] as { data: any[]; tx: any }[]
	};

	constructor(fixtures: { createdMany?: ConceptProgress[] } = {}) {
		this.fixtures = fixtures;
	}

	async createMany(data: any[], tx?: any): Promise<ConceptProgress[]> {
		this.calls.createMany.push({ data, tx });
		if (!this.fixtures.createdMany) {
			this.fixtures.createdMany = data.map((d, i) => ({
				id: `cp${i + 1}`,
				...d
			}));
		}
		return this.fixtures.createdMany;
	}
}

function makeFacade(deps?: {
	userBlockService?: FakeUserBlockService;
	adaptiveQuizService?: FakeAdaptiveQuizService;
	placementQuizService?: FakePlacementQuizService;
	conceptProgressService?: FakeConceptProgressService;
	conceptService?: FakeConceptService;
}) {
	const facade = new UserBlockFacade();
	const anyFacade = facade as any;

	const userBlockService = deps?.userBlockService ?? new FakeUserBlockService();
	const adaptiveQuizService = deps?.adaptiveQuizService ?? new FakeAdaptiveQuizService();
	const placementQuizService = deps?.placementQuizService ?? new FakePlacementQuizService();
	const conceptProgressService = deps?.conceptProgressService ?? new FakeConceptProgressService();
	const conceptService = deps?.conceptService ?? new FakeConceptService();

	anyFacade.userBlockService = userBlockService;
	anyFacade.adaptiveQuizService = adaptiveQuizService;
	anyFacade.placementQuizService = placementQuizService;
	anyFacade.conceptProgressService = conceptProgressService;
	anyFacade.conceptService = conceptService;

	return {
		facade,
		userBlockService,
		adaptiveQuizService,
		placementQuizService,
		conceptProgressService,
		conceptService
	};
}

describe('UserBlockFacade handleUserBlockLogic', () => {
	it('returns existing userBlock if already present', async () => {
		const existing = makeUserBlock({ id: 'existing-ub' });
		const userBlockService = new FakeUserBlockService({ existing });

		const { facade } = makeFacade({ userBlockService });

		const originalTransaction = (db as any).transaction;
		(db as any).transaction = async (fn: any) => {
			return await fn({} as any);
		};

		const createData: CreateUserBlock = {
			userId: 'u1',
			blockId: 'b1'
		} as CreateUserBlock;

		try {
			const res = await facade.handleUserBlockLogic(createData);

			expect(res).toEqual(existing);
			expect(userBlockService.calls.getByBothIdsOrUndefined.length).toBe(1);
			expect(userBlockService.calls.create.length).toBe(0);
		} finally {
			(db as any).transaction = originalTransaction;
		}
	});

	it('creates userBlock, adaptiveQuiz and conceptProgress when not existing', async () => {
		const createdUb = makeUserBlock({ id: 'created-ub', userId: 'u1', blockId: 'b1' });
		const userBlockService = new FakeUserBlockService({ existing: undefined, created: createdUb });

		const placementQuiz = makePlacementQuiz({
			id: 'pq1',
			blockId: 'b1',
			baseQuizId: 'bq1'
		});
		const placementQuizService = new FakePlacementQuizService({
			byBlockId: placementQuiz
		});

		const adaptiveQuizService = new FakeAdaptiveQuizService();

		const concepts = [
			makeConcept({ id: 'c1', blockId: 'b1' }),
			makeConcept({ id: 'c2', blockId: 'b1' })
		];
		const conceptService = new FakeConceptService({
			byBlockId: concepts
		});

		const conceptProgressService = new FakeConceptProgressService();

		const { facade } = makeFacade({
			userBlockService,
			placementQuizService,
			adaptiveQuizService,
			conceptService,
			conceptProgressService
		});

		const originalTransaction = (db as any).transaction;
		(db as any).transaction = async (fn: any) => {
			return await fn({} as any);
		};

		const createData: CreateUserBlock = {
			userId: 'u1',
			blockId: 'b1'
		} as CreateUserBlock;

		try {
			const res = await facade.handleUserBlockLogic(createData);

			expect(res).toEqual(createdUb);

			expect(userBlockService.calls.getByBothIdsOrUndefined.length).toBe(1);
			expect(userBlockService.calls.create.length).toBe(1);
			expect(userBlockService.calls.create[0].data).toEqual(createData);

			expect(placementQuizService.calls.getByBlockId.length).toBe(1);
			expect(placementQuizService.calls.getByBlockId[0].blockId).toBe('b1');

			expect(adaptiveQuizService.calls.create.length).toBe(1);
			const aqCreate = adaptiveQuizService.calls.create[0].data;
			expect(aqCreate.userBlockId).toBe('created-ub');
			expect(aqCreate.baseQuizId).toBe('bq1');
			expect(aqCreate.placementQuizId).toBe('pq1');
			expect(aqCreate.readyForAnswering).toBe(true);

			expect(conceptService.calls.getManyByBlockId.length).toBe(1);
			expect(conceptService.calls.getManyByBlockId[0].blockId).toBe('b1');

			expect(conceptProgressService.calls.createMany.length).toBe(1);
			const cpCreateData = conceptProgressService.calls.createMany[0].data;
			expect(cpCreateData.length).toBe(2);
			expect(cpCreateData[0]).toEqual({
				userBlockId: 'created-ub',
				conceptId: 'c1'
			});
			expect(cpCreateData[1]).toEqual({
				userBlockId: 'created-ub',
				conceptId: 'c2'
			});
		} finally {
			(db as any).transaction = originalTransaction;
		}
	});
});
