import { describe, it, expect } from 'bun:test';
import { ConceptFacade } from '../../../src/facades/conceptFacade';

type Concept = any;
type ConceptProgress = any;
type AdaptiveQuiz = any;
type AdaptiveQuizAnswer = any;
type BaseQuestion = any;

// ---------- Helpers ----------

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

function makeConceptProgress(overrides: Partial<ConceptProgress> = {}): ConceptProgress {
	return {
		id: 'cp1',
		conceptId: 'c1',
		userBlockId: 'ub1',
		correctA1: 0,
		askedA1: 0,
		correctA2: 0,
		askedA2: 0,
		correctB1: 0,
		askedB1: 0,
		correctB2: 0,
		askedB2: 0,
		alfa: 1,
		beta: 1,
		score: 0.5,
		variance: 0.1,
		streak: 0,
		mastered: false,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

function makeAdaptiveQuizAnswer(overrides: Partial<AdaptiveQuizAnswer> = {}): AdaptiveQuizAnswer {
	return {
		id: 'a1',
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

function makeBaseQuestion(overrides: Partial<BaseQuestion> = {}): BaseQuestion {
	return {
		id: 'q1',
		conceptId: 'c1',
		questionText: 'What is 2+2?',
		correctAnswerText: '4',
		codeSnippet: '',
		questionType: 'A1',
		orderIndex: 1,
		baseQuizId: 'bq1',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

// ---------- Fake services ----------

class FakeConceptService {
	public fixtures: { byBlock?: Concept[] } = {};
	public calls = { getManyByBlockId: [] as string[] };

	constructor(fixtures: { byBlock?: Concept[] } = {}) {
		this.fixtures = fixtures;
	}

	async getManyByBlockId(blockId: string): Promise<Concept[]> {
		this.calls.getManyByBlockId.push(blockId);
		return this.fixtures.byBlock ?? [];
	}
}

class FakeConceptProgressService {
	public fixtures: {
		byUserBlock?: ConceptProgress[];
		incompleteByUserBlock?: ConceptProgress[];
	} = {};
	public calls = {
		getManyByUserBlockId: [] as string[],
		getManyIncompleteByUserBlockId: [] as string[],
		update: [] as { id: string; patch: any }[],
		updateMany: [] as { ids: string[]; patch: any }[]
	};

	constructor(
		fixtures: {
			byUserBlock?: ConceptProgress[];
			incompleteByUserBlock?: ConceptProgress[];
		} = {}
	) {
		this.fixtures = fixtures;
	}

	async getManyByUserBlockId(userBlockId: string): Promise<ConceptProgress[]> {
		this.calls.getManyByUserBlockId.push(userBlockId);
		return this.fixtures.byUserBlock ?? [];
	}

	async getManyIncompleteByUserBlockId(userBlockId: string): Promise<ConceptProgress[]> {
		this.calls.getManyIncompleteByUserBlockId.push(userBlockId);
		return this.fixtures.incompleteByUserBlock ?? [];
	}

	async update(id: string, patch: any): Promise<ConceptProgress> {
		this.calls.update.push({ id, patch });
		const base = (this.fixtures.byUserBlock ?? this.fixtures.incompleteByUserBlock ?? [])[0];
		return { ...(base ?? makeConceptProgress({ id })), ...patch };
	}

	async updateMany(ids: string[], patch: any): Promise<ConceptProgress[]> {
		this.calls.updateMany.push({ ids, patch });
		return ids.map((id) => ({ ...makeConceptProgress({ id }), ...patch }));
	}
}

class FakeAdaptiveQuizService {
	public fixtures: { lastVersions?: AdaptiveQuiz[] } = {};
	public calls = {
		getLastVersionsByUserBlockId: [] as { userBlockId: string; count: number }[]
	};

	constructor(fixtures: { lastVersions?: AdaptiveQuiz[] } = {}) {
		this.fixtures = fixtures;
	}

	async getLastVersionsByUserBlockId(userBlockId: string, count: number): Promise<AdaptiveQuiz[]> {
		this.calls.getLastVersionsByUserBlockId.push({ userBlockId, count });
		return this.fixtures.lastVersions ?? [];
	}
}

class FakeUserBlockService {
	public fixtures: { byId?: any } = {};
	public calls = {
		getById: [] as string[],
		update: [] as { id: string; patch: any }[]
	};

	constructor(fixtures: { byId?: any } = {}) {
		this.fixtures = fixtures;
	}

	async getById(id: string): Promise<any> {
		this.calls.getById.push(id);
		return this.fixtures.byId ?? { id, blockId: 'b1' };
	}

	async update(id: string, patch: any): Promise<any> {
		this.calls.update.push({ id, patch });
		return { id, ...patch };
	}
}

class FakeAdaptiveQuizAnswerService {
	public fixtures: { byAdaptiveQuizId?: AdaptiveQuizAnswer[] } = {};
	public calls = {
		getManyByAdaptiveQuizId: [] as string[]
	};

	constructor(fixtures: { byAdaptiveQuizId?: AdaptiveQuizAnswer[] } = {}) {
		this.fixtures = fixtures;
	}

	async getManyByAdaptiveQuizId(adaptiveQuizId: string): Promise<AdaptiveQuizAnswer[]> {
		this.calls.getManyByAdaptiveQuizId.push(adaptiveQuizId);
		return this.fixtures.byAdaptiveQuizId ?? [];
	}
}

class FakeBaseQuestionService {
	public fixtures: { byIds?: BaseQuestion[] } = {};
	public calls = {
		getManyByIds: [] as string[][]
	};

	constructor(fixtures: { byIds?: BaseQuestion[] } = {}) {
		this.fixtures = fixtures;
	}

	async getManyByIds(ids: string[]): Promise<BaseQuestion[]> {
		this.calls.getManyByIds.push(ids);
		return this.fixtures.byIds ?? [];
	}
}

function makeFacade(deps?: {
	conceptService?: FakeConceptService;
	conceptProgressService?: FakeConceptProgressService;
	adaptiveQuizService?: FakeAdaptiveQuizService;
	userBlockService?: FakeUserBlockService;
	adaptiveQuizAnswerService?: FakeAdaptiveQuizAnswerService;
	baseQuestionService?: FakeBaseQuestionService;
}) {
	const facade = new ConceptFacade();
	const anyFacade = facade as any;

	const conceptService = deps?.conceptService ?? new FakeConceptService();
	const conceptProgressService = deps?.conceptProgressService ?? new FakeConceptProgressService();
	const adaptiveQuizService = deps?.adaptiveQuizService ?? new FakeAdaptiveQuizService();
	const userBlockService = deps?.userBlockService ?? new FakeUserBlockService();
	const adaptiveQuizAnswerService =
		deps?.adaptiveQuizAnswerService ?? new FakeAdaptiveQuizAnswerService();
	const baseQuestionService = deps?.baseQuestionService ?? new FakeBaseQuestionService();

	anyFacade.conceptService = conceptService;
	anyFacade.conceptProgressService = conceptProgressService;
	anyFacade.adaptiveQuizService = adaptiveQuizService;
	anyFacade.userBlockService = userBlockService;
	anyFacade.adaptiveQuizAnswerService = adaptiveQuizAnswerService;
	anyFacade.baseQuestionService = baseQuestionService;

	return {
		facade,
		conceptService,
		conceptProgressService,
		adaptiveQuizService,
		userBlockService,
		adaptiveQuizAnswerService,
		baseQuestionService
	};
}

// ---------- Tests ----------

describe('ConceptFacade - getConceptProgressByUserBlockId', () => {
	it('returns list of {concept, conceptProgress}', async () => {
		const concept1 = makeConcept({ id: 'c1' });
		const concept2 = makeConcept({ id: 'c2', name: 'Concept 2' });

		const cp1 = makeConceptProgress({ id: 'cp1', conceptId: 'c1' });
		const cp2 = makeConceptProgress({ id: 'cp2', conceptId: 'c2' });

		const conceptService = new FakeConceptService({ byBlock: [concept1, concept2] });
		const cpService = new FakeConceptProgressService({
			byUserBlock: [cp1, cp2]
		});
		const userBlockService = new FakeUserBlockService({
			byId: { id: 'ub1', blockId: 'b1' }
		});
		const adaptiveQuizService = new FakeAdaptiveQuizService({
			lastVersions: []
		});

		const { facade } = makeFacade({
			conceptService,
			conceptProgressService: cpService,
			userBlockService,
			adaptiveQuizService
		});

		const res = await facade.getConceptProgressByUserBlockId({ userBlockId: 'ub1' });

		expect(res.length).toBe(2);
		expect(res[0].concept.id).toBe('c1');
		expect(res[0].conceptProgress.id).toBe('cp1');
		expect(res[1].concept.id).toBe('c2');
		expect(res[1].conceptProgress.id).toBe('cp2');
	});

	it('throws when concept has no matching conceptProgress', async () => {
		const concept1 = makeConcept({ id: 'c1' });

		const conceptService = new FakeConceptService({ byBlock: [concept1] });
		const cpService = new FakeConceptProgressService({
			byUserBlock: []
		});
		const userBlockService = new FakeUserBlockService({
			byId: { id: 'ub1', blockId: 'b1' }
		});

		const { facade } = makeFacade({
			conceptService,
			conceptProgressService: cpService,
			userBlockService
		});

		await expect(facade.getConceptProgressByUserBlockId({ userBlockId: 'ub1' })).rejects.toThrow(
			'Concept progress not found for concept ID: c1'
		);
	});
});

describe('ConceptFacade - updateCompleteness', () => {
	it('marks concepts mastered when criteria are met', async () => {
		const cp1 = makeConceptProgress({
			id: 'cp1',
			score: 0.8,
			streak: 1,
			alfa: 160,
			beta: 40,
			askedA1: 5,
			askedA2: 0,
			askedB1: 0,
			askedB2: 0
		});

		const cp2 = makeConceptProgress({
			id: 'cp2',
			score: 0.5,
			streak: 1,
			alfa: 1,
			beta: 1,
			askedA1: 0,
			askedA2: 0,
			askedB1: 0,
			askedB2: 0
		});

		const cpService = new FakeConceptProgressService({
			incompleteByUserBlock: [cp1, cp2]
		});

		const { facade, conceptProgressService } = makeFacade({
			conceptProgressService: cpService
		});

		const result = await facade.updateCompleteness('ub1');
		expect(result).toBe(true);

		expect(conceptProgressService.calls.updateMany.length).toBe(1);
		expect(conceptProgressService.calls.updateMany[0].ids).toEqual(['cp1']);
		expect(conceptProgressService.calls.updateMany[0].patch).toEqual({ mastered: true });
	});
});

describe('ConceptFacade - checkAllConceptsCompleted', () => {
	it('sets userBlock.completed = true when all conceptProgress.mastered = true', async () => {
		const cp1 = makeConceptProgress({ mastered: true });
		const cp2 = makeConceptProgress({ id: 'cp2', conceptId: 'c2', mastered: true });

		const cpService = new FakeConceptProgressService({
			byUserBlock: [cp1, cp2]
		});
		const userBlockService = new FakeUserBlockService();

		const { facade } = makeFacade({
			conceptProgressService: cpService,
			userBlockService
		});

		const res = await facade.checkAllConceptsCompleted('ub1');
		expect(res).toBe(true);

		// userBlockService.update by mal byť zavolaný
		expect(userBlockService.calls.update.length).toBe(1);
		expect(userBlockService.calls.update[0]).toEqual({
			id: 'ub1',
			patch: { completed: true }
		});
	});

	it('does not set userBlock.completed when some are not mastered', async () => {
		const cp1 = makeConceptProgress({ mastered: true });
		const cp2 = makeConceptProgress({ id: 'cp2', conceptId: 'c2', mastered: false });

		const cpService = new FakeConceptProgressService({
			byUserBlock: [cp1, cp2]
		});
		const userBlockService = new FakeUserBlockService();

		const { facade } = makeFacade({
			conceptProgressService: cpService,
			userBlockService
		});

		const res = await facade.checkAllConceptsCompleted('ub1');
		expect(res).toBe(false);

		expect(userBlockService.calls.update.length).toBe(0);
	});
});

describe('ConceptFacade - updateConceptProgress', () => {
	it('aggregates answers per conceptProgress and updates stats', async () => {
		const cp1 = makeConceptProgress({
			id: 'cp1',
			conceptId: 'c1',
			correctA1: 0,
			askedA1: 0,
			alfa: 1,
			beta: 1,
			score: 0.5,
			streak: 0
		});

		const cpService = new FakeConceptProgressService({
			incompleteByUserBlock: [cp1]
		});

		const answer = makeAdaptiveQuizAnswer({
			id: 'a1',
			baseQuestionId: 'q1',
			isCorrect: true,
			createdAt: new Date('2024-01-01T10:00:00Z')
		});

		const answersService = new FakeAdaptiveQuizAnswerService({
			byAdaptiveQuizId: [answer]
		});

		const baseQuestion = makeBaseQuestion({
			id: 'q1',
			conceptId: 'c1',
			questionType: 'A1'
		});

		const bqService = new FakeBaseQuestionService({
			byIds: [baseQuestion]
		});

		const { facade, conceptProgressService } = makeFacade({
			conceptProgressService: cpService,
			adaptiveQuizAnswerService: answersService,
			baseQuestionService: bqService
		});

		const anyFacade = facade as any;
		anyFacade.updateCompleteness = async (_userBlockId: string) => {};
		anyFacade.checkAllConceptsCompleted = async (_userBlockId: string) => false;

		const res = await facade.updateConceptProgress('ub1', 'aq1');
		expect(res).toBe(false);

		expect(conceptProgressService.calls.update.length).toBe(1);
		const updateCall = conceptProgressService.calls.update[0];

		expect(updateCall.id).toBe('cp1');

		// pôvodne 0, po jednej správnej A1 odpovedi:
		expect(updateCall.patch.correctA1).toBe(1);
		expect(updateCall.patch.askedA1).toBe(1);

		// alfa = (1) + 1 = 2
		expect(updateCall.patch.alfa).toBe(2);
		// beta = (1) + (askedNow - correctNow) = 1 + (1 - 1) = 1
		expect(updateCall.patch.beta).toBe(1);
		// score ~ 0.67
		expect(updateCall.patch.score).toBeCloseTo(0.67, 2);
		expect(updateCall.patch.streak).toBe(1);
	});
});
