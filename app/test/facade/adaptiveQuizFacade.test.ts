import { describe, it, expect } from 'bun:test';
import { AdaptiveQuizFacade } from '../../src/facades/adaptiveQuizFacade';
import { db } from '../../src/db/client';
import type {
	AdaptiveQuiz,
	ComplexAdaptiveQuiz
} from '../../src/schemas/adaptiveQuizSchema';
import type { AdaptiveQuizAnswer } from '../../src/schemas/adaptiveQuizAnswerSchema';
import type {
	BaseQuizWithQuestionsAndOptions,
	BaseQuizWithQuestionsAndOptionsBlank
} from '../../src/schemas/baseQuizSchema';
import type { Concept } from '../../src/schemas/conceptSchema';
import type { ConceptProgress } from '../../src/schemas/conceptProgressSchema';

function makeAdaptiveQuiz(overrides: Partial<AdaptiveQuiz> = {}): AdaptiveQuiz {
	return {
		id: 'aq1',
		baseQuizId: 'bq1',
		userBlockId: 'ub1',
		placementQuizId: 'pq1',
		version: 1,
		isCompleted: false,
		readyForAnswering: true,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	} as AdaptiveQuiz;
}

function makeAdaptiveQuizAnswer(
	overrides: Partial<AdaptiveQuizAnswer> = {}
): AdaptiveQuizAnswer {
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
	} as AdaptiveQuizAnswer;
}

function makeBaseQuizWithQuestions(
	overrides: Partial<BaseQuizWithQuestionsAndOptions> = {}
): BaseQuizWithQuestionsAndOptions {
	return {
		id: 'bq1',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		questions: [
			{
				id: 'q1',
				baseQuizId: 'bq1',
				conceptId: 'c1',
				questionText: 'Q1',
				correctAnswerText: 'A1',
				codeSnippet: '',
				questionType: 'A1',
				orderIndex: 1,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: null,
				deletedAt: null,
				options: [
					{
						id: 'o1',
						baseQuestionId: 'q1',
						optionText: 'A1',
						isCorrect: true,
						createdAt: new Date('2024-01-01T00:00:00Z'),
						updatedAt: null,
						deletedAt: null
					}
				]
			},
			{
				id: 'q2',
				baseQuizId: 'bq1',
				conceptId: 'c1',
				questionText: 'Q2',
				correctAnswerText: 'A2',
				codeSnippet: '',
				questionType: 'A1',
				orderIndex: 2,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: null,
				deletedAt: null,
				options: []
			}
		],
		...overrides
	} as BaseQuizWithQuestionsAndOptions;
}

function makeConceptProgress(overrides: Partial<ConceptProgress> = {}): ConceptProgress {
	return {
		id: 'cp1',
		userBlockId: 'ub1',
		conceptId: 'c1',
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
		variance: 0.1,
		score: 0.5,
		streak: 0,
		mastered: false,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	} as ConceptProgress;
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
	} as Concept;
}

class FakeAdaptiveQuizService {
	fixtures: {
		byId?: AdaptiveQuiz;
		updated?: AdaptiveQuiz;
		lastByUserBlock?: AdaptiveQuiz;
		byUserBlockId?: AdaptiveQuiz[];
	} = {};
	calls = {
		getById: [] as string[],
		update: [] as { id: string; patch: any }[],
		getLastAdaptiveQuizByUserBlockId: [] as string[],
		create: [] as { data: any; tx: any }[],
		getByUserBlockId: [] as string[]
	};

	constructor(fixtures: {
		byId?: AdaptiveQuiz;
		updated?: AdaptiveQuiz;
		lastByUserBlock?: AdaptiveQuiz;
		byUserBlockId?: AdaptiveQuiz[];
	} = {}) {
		this.fixtures = fixtures;
	}

	async getById(id: string): Promise<AdaptiveQuiz> {
		this.calls.getById.push(id);
		return this.fixtures.byId ?? makeAdaptiveQuiz({ id });
	}

	async update(id: string, patch: any): Promise<AdaptiveQuiz> {
		this.calls.update.push({ id, patch });
		const updated = {
			...makeAdaptiveQuiz({ id }),
			...patch
		};
		this.fixtures.updated = updated;
		return updated;
	}

	async getLastAdaptiveQuizByUserBlockId(userBlockId: string): Promise<AdaptiveQuiz> {
		this.calls.getLastAdaptiveQuizByUserBlockId.push(userBlockId);
		return (
			this.fixtures.lastByUserBlock ??
			makeAdaptiveQuiz({ id: 'aq-last', userBlockId, version: 1 })
		);
	}

	async create(data: any, tx?: any): Promise<AdaptiveQuiz> {
		this.calls.create.push({ data, tx });
		return makeAdaptiveQuiz({
			id: 'aq-new',
			...data
		});
	}

	async getByUserBlockId(userBlockId: string): Promise<AdaptiveQuiz[]> {
		this.calls.getByUserBlockId.push(userBlockId);
		return (
			this.fixtures.byUserBlockId ?? [
				makeAdaptiveQuiz({ id: 'aq1', userBlockId }),
				makeAdaptiveQuiz({ id: 'aq2', userBlockId })
			]
		);
	}
}

class FakeBaseQuizFacade {
	fixtures: { byBaseQuizId?: BaseQuizWithQuestionsAndOptions } = {};
	calls = {
		getQuestionsWithOptionsByBaseQuizId: [] as string[],
		createBaseQuestionsAndOptions: [] as {
			data: Map<string, BaseQuizWithQuestionsAndOptionsBlank>;
			baseQuizId: string;
			tx?: any;
		}[]
	};

	constructor(fixtures: { byBaseQuizId?: BaseQuizWithQuestionsAndOptions } = {}) {
		this.fixtures = fixtures;
	}

	async getQuestionsWithOptionsByBaseQuizId(
		baseQuizId: string
	): Promise<BaseQuizWithQuestionsAndOptions> {
		this.calls.getQuestionsWithOptionsByBaseQuizId.push(baseQuizId);
		return this.fixtures.byBaseQuizId ?? makeBaseQuizWithQuestions();
	}

	async createBaseQuestionsAndOptions(args: {
		data: Map<string, BaseQuizWithQuestionsAndOptionsBlank>;
		baseQuizId: string;
	}): Promise<string[]> {
		this.calls.createBaseQuestionsAndOptions.push({ ...args, tx: undefined });
		return ['q1', 'q2'];
	}
}

class FakeAdaptiveQuizAnswerService {
	fixtures: {
		byAdaptiveQuizId?: AdaptiveQuizAnswer[];
		questionHistory?: any[];
	} = {};
	calls = {
		getManyByAdaptiveQuizId: [] as string[],
		getQuestionHistory: [] as { quizIds: string[]; conceptId: string }[]
	};

	constructor(fixtures: {
		byAdaptiveQuizId?: AdaptiveQuizAnswer[];
		questionHistory?: any[];
	} = {}) {
		this.fixtures = fixtures;
	}

	async getManyByAdaptiveQuizId(adaptiveQuizId: string): Promise<AdaptiveQuizAnswer[]> {
		this.calls.getManyByAdaptiveQuizId.push(adaptiveQuizId);
		return (
			this.fixtures.byAdaptiveQuizId ?? [
				makeAdaptiveQuizAnswer({ id: 'a1', baseQuestionId: 'q1', answerText: '42', isCorrect: true }),
				makeAdaptiveQuizAnswer({ id: 'a2', baseQuestionId: 'q2', answerText: '5', isCorrect: false })
			]
		);
	}

	async getQuestionHistory(quizIds: string[], conceptId: string): Promise<any[]> {
		this.calls.getQuestionHistory.push({ quizIds, conceptId });
		return this.fixtures.questionHistory ?? [];
	}
}

class FakeConceptProgressService {
	fixtures: { incompleteByUserBlockId?: ConceptProgress[] } = {};
	calls = {
		getManyIncompleteByUserBlockId: [] as string[]
	};

	constructor(fixtures: { incompleteByUserBlockId?: ConceptProgress[] } = {}) {
		this.fixtures = fixtures;
	}

	async getManyIncompleteByUserBlockId(userBlockId: string): Promise<ConceptProgress[]> {
		this.calls.getManyIncompleteByUserBlockId.push(userBlockId);
		return this.fixtures.incompleteByUserBlockId ?? [];
	}
}

class FakeBaseQuizService {
	fixtures: { created?: any } = {};
	calls = {
		create: [] as { data: any; tx: any }[]
	};

	constructor(fixtures: { created?: any } = {}) {
		this.fixtures = fixtures;
	}

	async create(data: any, tx?: any): Promise<any> {
		this.calls.create.push({ data, tx });
		const baseQuiz = this.fixtures.created ?? { id: 'bq-new', ...data };
		this.fixtures.created = baseQuiz;
		return baseQuiz;
	}
}

class FakeOpenAiService {
	fixtures: { createAdaptiveQuizQuestionsResult?: BaseQuizWithQuestionsAndOptionsBlank } = {};
	calls = {
		createAdaptiveQuizQuestions: [] as any[]
	};

	constructor(fixtures: {
		createAdaptiveQuizQuestionsResult?: BaseQuizWithQuestionsAndOptionsBlank;
	} = {}) {
		this.fixtures = fixtures;
	}

	async createAdaptiveQuizQuestions(
		conceptName: string,
		conceptNames: string[],
		chunks: string[],
		nA1: number,
		nA2: number,
		nB1: number,
		nB2: number,
		history: any[]
	): Promise<BaseQuizWithQuestionsAndOptionsBlank> {
		this.calls.createAdaptiveQuizQuestions.push({
			conceptName,
			conceptNames,
			chunks,
			nA1,
			nA2,
			nB1,
			nB2,
			history
		});
		return (
			this.fixtures.createAdaptiveQuizQuestionsResult ?? {
				questions: []
			}
		);
	}
}

class FakeConceptService {
	fixtures: { byBlockId?: Concept[]; byId?: Concept } = {};
	calls = {
		getManyByBlockId: [] as string[],
		getById: [] as string[]
	};

	constructor(fixtures: { byBlockId?: Concept[]; byId?: Concept } = {}) {
		this.fixtures = fixtures;
	}

	async getManyByBlockId(blockId: string): Promise<Concept[]> {
		this.calls.getManyByBlockId.push(blockId);
		return this.fixtures.byBlockId ?? [makeConcept({ id: 'c1', blockId })];
	}

	async getById(id: string): Promise<Concept> {
		this.calls.getById.push(id);
		return this.fixtures.byId ?? makeConcept({ id });
	}
}

class FakeTypesenseService {
	fixtures: { chunksByConcept?: string[] } = {};
	calls = {
		getChunksByConcept: [] as { conceptName: string; blockId: string }[]
	};

	constructor(fixtures: { chunksByConcept?: string[] } = {}) {
		this.fixtures = fixtures;
	}

	async getChunksByConcept(conceptName: string, blockId: string): Promise<string[]> {
		this.calls.getChunksByConcept.push({ conceptName, blockId });
		return this.fixtures.chunksByConcept ?? ['chunk1', 'chunk2'];
	}
}

class FakeConceptFacade {
	fixtures: { updateConceptProgressResult?: boolean } = {};
	calls = {
		updateConceptProgress: [] as { userBlockId: string; adaptiveQuizId: string }[]
	};

	constructor(fixtures: { updateConceptProgressResult?: boolean } = {}) {
		this.fixtures = fixtures;
	}

	async updateConceptProgress(
		userBlockId: string,
		adaptiveQuizId: string
	): Promise<boolean> {
		this.calls.updateConceptProgress.push({ userBlockId, adaptiveQuizId });
		return this.fixtures.updateConceptProgressResult ?? false;
	}
}

class FakeUserBlockService {
	fixtures: { byId?: { id: string; blockId: string } } = {};
	calls = {
		getById: [] as string[]
	};

	constructor(fixtures: { byId?: { id: string; blockId: string } } = {}) {
		this.fixtures = fixtures;
	}

	async getById(id: string): Promise<{ id: string; blockId: string }> {
		this.calls.getById.push(id);
		return this.fixtures.byId ?? { id, blockId: 'b1' };
	}
}

function makeFacade(deps?: {
	adaptiveQuizService?: FakeAdaptiveQuizService;
	baseQuizFacade?: FakeBaseQuizFacade;
	adaptiveQuizAnswerService?: FakeAdaptiveQuizAnswerService;
	conceptProgressService?: FakeConceptProgressService;
	baseQuizService?: FakeBaseQuizService;
	openAiService?: FakeOpenAiService;
	conceptService?: FakeConceptService;
	typesenseService?: FakeTypesenseService;
	conceptFacade?: FakeConceptFacade;
	userBlockService?: FakeUserBlockService;
	generateAdaptiveQuizImpl?: (
		userBlockId: string,
		baseQuizId: string,
		adaptiveQuizId: string
	) => Promise<boolean>;
}) {
	const facade = new AdaptiveQuizFacade();
	const anyFacade = facade as any;

	const adaptiveQuizService = deps?.adaptiveQuizService ?? new FakeAdaptiveQuizService();
	const baseQuizFacade = deps?.baseQuizFacade ?? new FakeBaseQuizFacade();
	const adaptiveQuizAnswerService =
		deps?.adaptiveQuizAnswerService ?? new FakeAdaptiveQuizAnswerService();
	const conceptProgressService =
		deps?.conceptProgressService ?? new FakeConceptProgressService();
	const baseQuizService = deps?.baseQuizService ?? new FakeBaseQuizService();
	const openAiService = deps?.openAiService ?? new FakeOpenAiService();
	const conceptService = deps?.conceptService ?? new FakeConceptService();
	const typesenseService = deps?.typesenseService ?? new FakeTypesenseService();
	const conceptFacade = deps?.conceptFacade ?? new FakeConceptFacade();
	const userBlockService = deps?.userBlockService ?? new FakeUserBlockService();

	anyFacade.adaptiveQuizService = adaptiveQuizService;
	anyFacade.baseQuizFacade = baseQuizFacade;
	anyFacade.adaptiveQuizAnswerService = adaptiveQuizAnswerService;
	anyFacade.conceptProgressService = conceptProgressService;
	anyFacade.baseQuizService = baseQuizService;
	anyFacade.openAiService = openAiService;
	anyFacade.conceptService = conceptService;
	anyFacade.typesenseService = typesenseService;
	anyFacade.conceptFacade = conceptFacade;
	anyFacade.userBlockService = userBlockService;

	let generateCalls: {
		userBlockId: string;
		baseQuizId: string;
		adaptiveQuizId: string;
	}[] = [];

	if (deps?.generateAdaptiveQuizImpl) {
		anyFacade.generateAdaptiveQuiz = async (
			userBlockId: string,
			baseQuizId: string,
			adaptiveQuizId: string
		) => {
			generateCalls.push({ userBlockId, baseQuizId, adaptiveQuizId });
			return deps.generateAdaptiveQuizImpl!(
				userBlockId,
				baseQuizId,
				adaptiveQuizId
			);
		};
	} else {
		anyFacade.generateAdaptiveQuiz = async (
			userBlockId: string,
			baseQuizId: string,
			adaptiveQuizId: string
		) => {
			generateCalls.push({ userBlockId, baseQuizId, adaptiveQuizId });
			return true;
		};
	}

	return {
		facade,
		adaptiveQuizService,
		baseQuizFacade,
		adaptiveQuizAnswerService,
		conceptProgressService,
		baseQuizService,
		openAiService,
		conceptService,
		typesenseService,
		conceptFacade,
		userBlockService,
		getGenerateCalls: () => generateCalls
	};
}

describe('AdaptiveQuizFacade getComplexAdaptiveQuizById', () => {
	it('returns adaptive quiz with questions enriched by user answers', async () => {
		const adaptiveQuiz = makeAdaptiveQuiz({
			id: 'aq1',
			baseQuizId: 'bq1'
		});
		const baseQuiz = makeBaseQuizWithQuestions();
		const answers = [
			makeAdaptiveQuizAnswer({
				id: 'a1',
				adaptiveQuizId: 'aq1',
				baseQuestionId: 'q1',
				answerText: '42',
				isCorrect: true
			}),
			makeAdaptiveQuizAnswer({
				id: 'a2',
				adaptiveQuizId: 'aq1',
				baseQuestionId: 'q2',
				answerText: '5',
				isCorrect: false
			})
		];

		const adaptiveQuizService = new FakeAdaptiveQuizService({ byId: adaptiveQuiz });
		const baseQuizFacade = new FakeBaseQuizFacade({ byBaseQuizId: baseQuiz });
		const adaptiveQuizAnswerService = new FakeAdaptiveQuizAnswerService({
			byAdaptiveQuizId: answers
		});

		const { facade } = makeFacade({
			adaptiveQuizService,
			baseQuizFacade,
			adaptiveQuizAnswerService
		});

		const res = await facade.getComplexAdaptiveQuizById('aq1');

		expect(res.id).toBe('aq1');
		expect(res.questions.length).toBe(2);

		const q1 = res.questions.find((q: any) => q.id === 'q1');
		const q2 = res.questions.find((q: any) => q.id === 'q2');

		expect(q1?.userAnswerText).toBe('42');
		expect(q1?.isCorrect).toBe(true);

		expect(q2?.userAnswerText).toBe('5');
		expect(q2?.isCorrect).toBeNull();
	});
});

describe('AdaptiveQuizFacade finishAdaptiveQuiz', () => {
	it('marks quiz as completed and returns it when all concepts are completed', async () => {
		const updatedQuiz = makeAdaptiveQuiz({
			id: 'aq1',
			userBlockId: 'ub1',
			isCompleted: true
		});

		const adaptiveQuizService = new FakeAdaptiveQuizService({
			updated: updatedQuiz
		});
		const conceptFacade = new FakeConceptFacade({
			updateConceptProgressResult: true
		});

		const { facade, getGenerateCalls } = makeFacade({
			adaptiveQuizService,
			conceptFacade,
			generateAdaptiveQuizImpl: async () => true
		});

		const originalTransaction = (db as any).transaction;
		(db as any).transaction = async (fn: any) => {
			return await fn({} as any);
		};

		try {
			const res = await facade.finishAdaptiveQuiz('aq1');

			expect(res.id).toBe('aq1');
			expect(res.isCompleted).toBe(true);

			expect(adaptiveQuizService.calls.update.length).toBe(1);
			expect(adaptiveQuizService.calls.update[0]).toEqual({
				id: 'aq1',
				patch: { isCompleted: true }
			});

			expect(getGenerateCalls().length).toBe(0);
		} finally {
			(db as any).transaction = originalTransaction;
		}
	});

	it('creates new base quiz and adaptive quiz, triggers generation when not all concepts completed', async () => {
		const updatedQuiz = makeAdaptiveQuiz({
			id: 'aq1',
			userBlockId: 'ub1',
			isCompleted: true
		});

		const adaptiveQuizService = new FakeAdaptiveQuizService({
			updated: updatedQuiz,
			lastByUserBlock: makeAdaptiveQuiz({
				id: 'aq-last',
				userBlockId: 'ub1',
				version: 2
			})
		});

		const conceptFacade = new FakeConceptFacade({
			updateConceptProgressResult: false
		});

		const baseQuizService = new FakeBaseQuizService({
			created: { id: 'bq-new' }
		});

		const generateCalls: {
			userBlockId: string;
			baseQuizId: string;
			adaptiveQuizId: string;
		}[] = [];

		const { facade } = makeFacade({
			adaptiveQuizService,
			conceptFacade,
			baseQuizService,
			generateAdaptiveQuizImpl: async (userBlockId, baseQuizId, adaptiveQuizId) => {
				generateCalls.push({ userBlockId, baseQuizId, adaptiveQuizId });
				return true;
			}
		});

		const originalTransaction = (db as any).transaction;
		(db as any).transaction = async (fn: any) => {
			return await fn({} as any);
		};

		try {
			const res = await facade.finishAdaptiveQuiz('aq1');

			expect(res.id).toBe('aq1');
			expect(res.isCompleted).toBe(true);

			expect(adaptiveQuizService.calls.update.length).toBe(1);
			expect(adaptiveQuizService.calls.update[0]).toEqual({
				id: 'aq1',
				patch: { isCompleted: true }
			});

			expect(adaptiveQuizService.calls.getLastAdaptiveQuizByUserBlockId.length).toBe(1);
			expect(adaptiveQuizService.calls.getLastAdaptiveQuizByUserBlockId[0]).toBe('ub1');

			expect(baseQuizService.calls.create.length).toBe(1);
			expect(baseQuizService.calls.create[0].data).toEqual({});

			expect(adaptiveQuizService.calls.create.length).toBe(1);
			const createdAdaptiveQuizCall = adaptiveQuizService.calls.create[0];
			expect(createdAdaptiveQuizCall.data.userBlockId).toBe('ub1');
			expect(createdAdaptiveQuizCall.data.baseQuizId).toBe('bq-new');
			expect(createdAdaptiveQuizCall.data.version).toBe(3);
			expect(createdAdaptiveQuizCall.data.isCompleted).toBe(false);
			expect(createdAdaptiveQuizCall.data.readyForAnswering).toBe(false);

			expect(generateCalls.length).toBe(1);
			expect(generateCalls[0]).toEqual({
				userBlockId: 'ub1',
				baseQuizId: 'bq-new',
				adaptiveQuizId: 'aq-new'
			});
		} finally {
			(db as any).transaction = originalTransaction;
		}
	});
});
