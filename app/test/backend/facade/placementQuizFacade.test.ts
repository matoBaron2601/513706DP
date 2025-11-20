import { describe, it, expect } from 'bun:test';
import { PlacementQuizFacade } from '../../../src/facades/placementQuizFacade';
import { db } from '../../../src/db/client';
import type {
	BaseQuizWithQuestionsAndOptions,
	BaseQuizWithQuestionsAndOptionsBlank
} from '../../../src/schemas/baseQuizSchema';
import type { CreatePlacementQuizRequest } from '../../../src/schemas/placementQuizSchema';
import type { Concept } from '../../../src/schemas/conceptSchema';

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

function makeBaseQuizWithQuestions(
	overrides: Partial<BaseQuizWithQuestionsAndOptions> = {}
): BaseQuizWithQuestionsAndOptions {
	return {
		id: 'bq1',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		questions: [],
		...overrides
	} as BaseQuizWithQuestionsAndOptions;
}

class FakeConceptService {
	fixtures: { conceptsByBlock?: Concept[] } = {};
	calls = {
		getManyByBlockId: [] as string[]
	};

	constructor(fixtures: { conceptsByBlock?: Concept[] } = {}) {
		this.fixtures = fixtures;
	}

	async getManyByBlockId(blockId: string): Promise<Concept[]> {
		this.calls.getManyByBlockId.push(blockId);
		return (
			this.fixtures.conceptsByBlock ?? [
				makeConcept({ id: 'c1', name: 'C1', blockId, difficultyIndex: 2 }),
				makeConcept({ id: 'c2', name: 'C2', blockId, difficultyIndex: 1 })
			]
		);
	}
}

class FakeTypesenseService {
	fixtures: { chunksByConcept?: Record<string, string[]> } = {};
	calls = {
		getChunksByConcept: [] as { conceptName: string; blockId: string }[]
	};

	constructor(fixtures: { chunksByConcept?: Record<string, string[]> } = {}) {
		this.fixtures = fixtures;
	}

	async getChunksByConcept(conceptName: string, blockId: string): Promise<string[]> {
		this.calls.getChunksByConcept.push({ conceptName, blockId });
		if (this.fixtures.chunksByConcept && this.fixtures.chunksByConcept[conceptName]) {
			return this.fixtures.chunksByConcept[conceptName];
		}
		return [`chunk-${conceptName}-1`, `chunk-${conceptName}-2`];
	}
}

class FakeBaseQuizService {
	fixtures: { created?: { id: string } } = {};
	calls = {
		create: [] as { data: any; tx: any }[]
	};

	constructor(fixtures: { created?: { id: string } } = {}) {
		this.fixtures = fixtures;
	}

	async create(data: any, tx?: any): Promise<{ id: string }> {
		this.calls.create.push({ data, tx });
		const baseQuiz = this.fixtures.created ?? { id: 'bq-new' };
		this.fixtures.created = baseQuiz;
		return baseQuiz;
	}
}

class FakePlacementQuizService {
	fixtures: { created?: { id: string; blockId: string; baseQuizId: string } } = {};
	calls = {
		create: [] as { data: any; tx: any }[]
	};

	constructor(
		fixtures: {
			created?: { id: string; blockId: string; baseQuizId: string };
		} = {}
	) {
		this.fixtures = fixtures;
	}

	async create(
		data: { blockId: string; baseQuizId: string },
		tx?: any
	): Promise<{ id: string; blockId: string; baseQuizId: string }> {
		this.calls.create.push({ data, tx });
		const placementQuiz = this.fixtures.created ?? {
			id: 'pq-new',
			blockId: data.blockId,
			baseQuizId: data.baseQuizId
		};
		this.fixtures.created = placementQuiz;
		return placementQuiz;
	}
}

class FakeOpenAiService {
	fixtures: { placementByConcept?: Record<string, BaseQuizWithQuestionsAndOptionsBlank> } = {};
	calls = {
		createPlacementQuestions: [] as {
			concept: string;
			concepts: string[];
			chunks: string[];
		}[]
	};

	constructor(
		fixtures: {
			placementByConcept?: Record<string, BaseQuizWithQuestionsAndOptionsBlank>;
		} = {}
	) {
		this.fixtures = fixtures;
	}

	async createPlacementQuestions(
		concept: string,
		concepts: string[],
		chunks: string[]
	): Promise<BaseQuizWithQuestionsAndOptionsBlank> {
		this.calls.createPlacementQuestions.push({ concept, concepts, chunks });
		if (this.fixtures.placementByConcept && this.fixtures.placementByConcept[concept]) {
			return this.fixtures.placementByConcept[concept];
		}
		return {
			questions: [
				{
					questionText: `Q about ${concept}`,
					correctAnswerText: 'A',
					orderIndex: 1,
					codeSnippet: '',
					questionType: 'A1',
					options: [
						{ optionText: 'A', isCorrect: true },
						{ optionText: 'B', isCorrect: false },
						{ optionText: 'C', isCorrect: false },
						{ optionText: 'D', isCorrect: false }
					]
				}
			]
		};
	}
}

class FakeBaseQuizFacade {
	fixtures: {
		createdQuestionIds?: string[];
		byBaseQuizId?: BaseQuizWithQuestionsAndOptions;
	} = {};
	calls = {
		createBaseQuestionsAndOptions: [] as {
			data: Map<string, BaseQuizWithQuestionsAndOptionsBlank>;
			baseQuizId: string;
		}[],
		getQuestionsWithOptionsByBaseQuizId: [] as string[]
	};

	constructor(
		fixtures: {
			createdQuestionIds?: string[];
			byBaseQuizId?: BaseQuizWithQuestionsAndOptions;
		} = {}
	) {
		this.fixtures = fixtures;
	}

	async createBaseQuestionsAndOptions(args: {
		data: Map<string, BaseQuizWithQuestionsAndOptionsBlank>;
		baseQuizId: string;
	}): Promise<string[]> {
		this.calls.createBaseQuestionsAndOptions.push(args);
		return this.fixtures.createdQuestionIds ?? ['q1', 'q2', 'q3'];
	}

	async getQuestionsWithOptionsByBaseQuizId(
		baseQuizId: string
	): Promise<BaseQuizWithQuestionsAndOptions> {
		this.calls.getQuestionsWithOptionsByBaseQuizId.push(baseQuizId);
		return (
			this.fixtures.byBaseQuizId ??
			makeBaseQuizWithQuestions({
				id: baseQuizId,
				questions: []
			})
		);
	}
}

function makeFacade(deps?: {
	conceptService?: FakeConceptService;
	typesenseService?: FakeTypesenseService;
	baseQuizService?: FakeBaseQuizService;
	placementQuizService?: FakePlacementQuizService;
	openAiService?: FakeOpenAiService;
	baseQuizFacade?: FakeBaseQuizFacade;
}) {
	const facade = new PlacementQuizFacade();
	const anyFacade = facade as any;

	const conceptService = deps?.conceptService ?? new FakeConceptService();
	const typesenseService = deps?.typesenseService ?? new FakeTypesenseService();
	const baseQuizService = deps?.baseQuizService ?? new FakeBaseQuizService();
	const placementQuizService = deps?.placementQuizService ?? new FakePlacementQuizService();
	const openAiService = deps?.openAiService ?? new FakeOpenAiService();
	const baseQuizFacade = deps?.baseQuizFacade ?? new FakeBaseQuizFacade();

	anyFacade.conceptService = conceptService;
	anyFacade.typesenseService = typesenseService;
	anyFacade.baseQuizService = baseQuizService;
	anyFacade.placementQuizService = placementQuizService;
	anyFacade.openAiService = openAiService;
	anyFacade.baseQuizFacade = baseQuizFacade;

	return {
		facade,
		conceptService,
		typesenseService,
		baseQuizService,
		placementQuizService,
		openAiService,
		baseQuizFacade
	};
}

describe('PlacementQuizFacade generatePlacementQuizQuestions', () => {
	it('generates questions per concept sorted by difficulty and uses typesense/OpenAI per concept', async () => {
		const concepts = [
			makeConcept({ id: 'c1', name: 'Arrays', difficultyIndex: 2, blockId: 'block1' }),
			makeConcept({ id: 'c2', name: 'Variables', difficultyIndex: 1, blockId: 'block1' }),
			makeConcept({ id: 'c3', name: 'Loops', difficultyIndex: 3, blockId: 'block1' })
		];

		const conceptService = new FakeConceptService({ conceptsByBlock: concepts });
		const typesenseService = new FakeTypesenseService({
			chunksByConcept: {
				Variables: ['v1', 'v2'],
				Arrays: ['a1'],
				Loops: ['l1', 'l2', 'l3']
			}
		});
		const openAiService = new FakeOpenAiService();

		const { facade } = makeFacade({
			conceptService,
			typesenseService,
			openAiService
		});

		const map = await facade.generatePlacementQuizQuestions('block1');

		expect(conceptService.calls.getManyByBlockId).toEqual(['block1']);

		const tsCalls = typesenseService.calls.getChunksByConcept;
		expect(tsCalls.map((c) => c.conceptName)).toEqual(['Variables', 'Arrays', 'Loops']);

		const aiCalls = openAiService.calls.createPlacementQuestions;
		expect(aiCalls.length).toBe(3);
		expect(aiCalls[0].concept).toBe('Variables');
		expect(aiCalls[1].concept).toBe('Arrays');
		expect(aiCalls[2].concept).toBe('Loops');

		const keys = Array.from(map.keys());
		expect(keys.sort()).toEqual(['c1', 'c2', 'c3']);

		const valueC2 = map.get('c2');
		expect(valueC2).toBeDefined();
		expect(Array.isArray(valueC2?.questions)).toBe(true);
	});

	it('returns empty map when there are no concepts', async () => {
		const conceptService = new FakeConceptService({ conceptsByBlock: [] });
		const typesenseService = new FakeTypesenseService();
		const openAiService = new FakeOpenAiService();

		const { facade } = makeFacade({
			conceptService,
			typesenseService,
			openAiService
		});

		const map = await facade.generatePlacementQuizQuestions('blockX');

		expect(map.size).toBe(0);
		expect(typesenseService.calls.getChunksByConcept.length).toBe(0);
		expect(openAiService.calls.createPlacementQuestions.length).toBe(0);
	});
});

describe('PlacementQuizFacade createPlacementQuiz', () => {
	it('creates base quiz, placement quiz, generates questions, persists them and returns full quiz', async () => {
		const baseQuizService = new FakeBaseQuizService({ created: { id: 'bq-created' } });
		const placementQuizService = new FakePlacementQuizService();
		const baseQuizFacade = new FakeBaseQuizFacade({
			createdQuestionIds: ['q1', 'q2'],
			byBaseQuizId: makeBaseQuizWithQuestions({
				id: 'bq-created',
				questions: [
					{
						id: 'q1',
						baseQuizId: 'bq-created',
						conceptId: 'c1',
						questionText: 'Q1',
						correctAnswerText: 'A1',
						codeSnippet: '',
						orderIndex: 1,
						createdAt: new Date('2024-01-01T00:00:00Z'),
						updatedAt: null,
						deletedAt: null,
						options: []
					}
				]
			})
		});

		const generateMap = new Map<string, BaseQuizWithQuestionsAndOptionsBlank>();
		generateMap.set('c1', {
			questions: [
				{
					questionText: 'Q1',
					correctAnswerText: 'A1',
					orderIndex: 1,
					codeSnippet: '',
					questionType: 'A1',
					options: [
						{ optionText: 'A1', isCorrect: true },
						{ optionText: 'B', isCorrect: false },
						{ optionText: 'C', isCorrect: false },
						{ optionText: 'D', isCorrect: false }
					]
				}
			]
		});

		const { facade } = makeFacade({
			baseQuizService,
			placementQuizService,
			baseQuizFacade
		});

		const anyFacade = facade as any;
		anyFacade.generatePlacementQuizQuestions = async (_blockId: string) => generateMap;

		const originalTransaction = (db as any).transaction;
		(db as any).transaction = async (fn: any) => {
			return await fn({} as any);
		};

		try {
			const req: CreatePlacementQuizRequest = {
				blockId: 'block-123'
			} as CreatePlacementQuizRequest;

			const res = await facade.createPlacementQuiz(req);

			expect(baseQuizService.calls.create.length).toBe(1);
			expect(baseQuizService.calls.create[0].data).toEqual({});

			expect(placementQuizService.calls.create.length).toBe(1);
			expect(placementQuizService.calls.create[0].data.blockId).toBe('block-123');
			expect(placementQuizService.calls.create[0].data.baseQuizId).toBe('bq-created');

			expect(baseQuizFacade.calls.createBaseQuestionsAndOptions.length).toBe(1);
			const call = baseQuizFacade.calls.createBaseQuestionsAndOptions[0];
			expect(call.baseQuizId).toBe('bq-created');
			expect(call.data.size).toBe(1);
			expect(call.data.get('c1')?.questions[0].questionText).toBe('Q1');

			expect(baseQuizFacade.calls.getQuestionsWithOptionsByBaseQuizId.length).toBe(1);
			expect(baseQuizFacade.calls.getQuestionsWithOptionsByBaseQuizId[0]).toBe('bq-created');

			expect(res.id).toBe('bq-created');
			expect(res.questions.length).toBe(1);
			expect(res.questions[0].id).toBe('q1');
		} finally {
			(db as any).transaction = originalTransaction;
		}
	});
});
