import { describe, it, expect } from 'bun:test';
import { BaseQuizFacade } from '../../src/facades/baseQuizFacade';
import { db } from '../../src/db/client';

type BaseQuiz = any;
type BaseQuestion = any;
type BaseOption = any;
type BaseQuizWithQuestionsAndOptionsBlank = any;

function makeBaseQuiz(overrides: Partial<BaseQuiz> = {}): BaseQuiz {
	return {
		id: 'bq1',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

function makeBaseQuestion(overrides: Partial<BaseQuestion> = {}): BaseQuestion {
	return {
		id: 'q1',
		baseQuizId: 'bq1',
		conceptId: 'c1',
		questionText: 'What is 2+2?',
		correctAnswerText: '4',
		codeSnippet: '',
		questionType: 'A1',
		orderIndex: 1,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

function makeBaseOption(overrides: Partial<BaseOption> = {}): BaseOption {
	return {
		id: 'o1',
		baseQuestionId: 'q1',
		optionText: '4',
		isCorrect: true,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

class FakeBaseQuizService {
	fixtures: { byId?: BaseQuiz } = {};
	calls = {
		getById: [] as string[]
	};

	constructor(fixtures: { byId?: BaseQuiz } = {}) {
		this.fixtures = fixtures;
	}

	async getById(id: string): Promise<BaseQuiz> {
		this.calls.getById.push(id);
		return this.fixtures.byId ?? makeBaseQuiz({ id });
	}
}

class FakeBaseQuestionService {
	fixtures: {
		created?: BaseQuestion[];
		byBaseQuizId?: BaseQuestion[];
		byId?: BaseQuestion;
	} = {};
	calls = {
		create: [] as { data: any; tx: any }[],
		getByBaseQuizId: [] as string[],
		getById: [] as { id: string; tx: any }[]
	};

	constructor(fixtures: {
		created?: BaseQuestion[];
		byBaseQuizId?: BaseQuestion[];
		byId?: BaseQuestion;
	} = {}) {
		this.fixtures = fixtures;
	}

	async create(data: any, tx?: any): Promise<BaseQuestion> {
		this.calls.create.push({ data, tx });
		const nextId = `q${this.calls.create.length}`;
		const q = makeBaseQuestion({ id: nextId, ...data });
		if (!this.fixtures.created) this.fixtures.created = [];
		this.fixtures.created.push(q);
		return q;
	}

	async getByBaseQuizId(baseQuizId: string): Promise<BaseQuestion[]> {
		this.calls.getByBaseQuizId.push(baseQuizId);
		if (this.fixtures.byBaseQuizId) return this.fixtures.byBaseQuizId;
		return this.fixtures.created ?? [];
	}

	async getById(id: string, tx?: any): Promise<BaseQuestion> {
		this.calls.getById.push({ id, tx });
		if (this.fixtures.byId) return this.fixtures.byId;
		const fromCreated = (this.fixtures.created ?? []).find((q) => q.id === id);
		return fromCreated ?? makeBaseQuestion({ id });
	}
}

class FakeBaseOptionService {
	fixtures: {
		createdMany?: BaseOption[];
		byBaseQuestionIds?: BaseOption[];
		byBaseQuestionId?: BaseOption[];
	} = {};
	calls = {
		createMany: [] as { data: any[]; tx: any }[],
		getManyByBaseQuestionIds: [] as string[][],
		getByBaseQuestionId: [] as { id: string; tx: any }[]
	};

	constructor(fixtures: {
		createdMany?: BaseOption[];
		byBaseQuestionIds?: BaseOption[];
		byBaseQuestionId?: BaseOption[];
	} = {}) {
		this.fixtures = fixtures;
	}

	async createMany(data: any[], tx?: any): Promise<BaseOption[]> {
		this.calls.createMany.push({ data, tx });
		if (!this.fixtures.createdMany) {
			this.fixtures.createdMany = data.map((d, i) =>
				makeBaseOption({ id: `o${i + 1}`, ...d })
			);
		}
		return this.fixtures.createdMany;
	}

	async getManyByBaseQuestionIds(ids: string[]): Promise<BaseOption[]> {
		this.calls.getManyByBaseQuestionIds.push(ids);
		if (this.fixtures.byBaseQuestionIds) return this.fixtures.byBaseQuestionIds;
		return this.fixtures.createdMany ?? [];
	}

	async getByBaseQuestionId(id: string, tx?: any): Promise<BaseOption[]> {
		this.calls.getByBaseQuestionId.push({ id, tx });
		if (this.fixtures.byBaseQuestionId) {
			return this.fixtures.byBaseQuestionId.filter((o) => o.baseQuestionId === id);
		}
		const all = this.fixtures.byBaseQuestionIds ?? this.fixtures.createdMany ?? [];
		return all.filter((o) => o.baseQuestionId === id);
	}
}

class FakeOpenAiService {
	fixtures: { isAnswerCorrectResult?: boolean } = {};
	calls = {
		isAnswerCorrect: [] as { question: string; correctAnswer: string; answer: string }[]
	};

	constructor(fixtures: { isAnswerCorrectResult?: boolean } = {}) {
		this.fixtures = fixtures;
	}

	async isAnswerCorrect(
		question: string,
		correctAnswer: string,
		answer: string
	): Promise<boolean> {
		this.calls.isAnswerCorrect.push({ question, correctAnswer, answer });
		return this.fixtures.isAnswerCorrectResult ?? false;
	}
}

function makeFacade(deps?: {
	baseQuizService?: FakeBaseQuizService;
	baseQuestionService?: FakeBaseQuestionService;
	baseOptionService?: FakeBaseOptionService;
	openAiService?: FakeOpenAiService;
}) {
	const facade = new BaseQuizFacade();
	const anyFacade = facade as any;

	const baseQuizService = deps?.baseQuizService ?? new FakeBaseQuizService();
	const baseQuestionService =
		deps?.baseQuestionService ?? new FakeBaseQuestionService();
	const baseOptionService =
		deps?.baseOptionService ?? new FakeBaseOptionService();
	const openAiService = deps?.openAiService ?? new FakeOpenAiService();

	anyFacade.baseQuizService = baseQuizService;
	anyFacade.baseQuestionService = baseQuestionService;
	anyFacade.baseOptionsService = baseOptionService;
	anyFacade.openAiService = openAiService;

	return {
		facade,
		baseQuizService,
		baseQuestionService,
		baseOptionService,
		openAiService
	};
}

describe('BaseQuizFacade createBaseQuestionsAndOptions', () => {
	it('creates questions and options for each concept and returns their ids', async () => {
		const baseQuestionService = new FakeBaseQuestionService();
		const baseOptionService = new FakeBaseOptionService();

		const { facade } = makeFacade({
			baseQuestionService,
			baseOptionService
		});

		const originalTransaction = (db as any).transaction;
		(db as any).transaction = async (fn: any) => {
			return await fn({} as any);
		};

		const data = new Map<string, BaseQuizWithQuestionsAndOptionsBlank>();

		data.set('c1', {
			questions: [
				{
					questionText: 'Q1',
					correctAnswerText: 'A1',
					orderIndex: 1,
					codeSnippet: '',
					questionType: 'A1',
					options: [
						{ optionText: 'A1', isCorrect: true },
						{ optionText: 'X', isCorrect: false }
					]
				},
				{
					questionText: 'Q2',
					correctAnswerText: 'A2',
					orderIndex: 2,
					codeSnippet: '',
					questionType: 'A2',
					options: []
				}
			]
		});

		data.set('c2', {
			questions: [
				{
					questionText: 'Q3',
					correctAnswerText: 'A3',
					orderIndex: 1,
					codeSnippet: '',
					questionType: 'A1',
					options: [
						{ optionText: 'A3', isCorrect: true },
						{ optionText: 'Y', isCorrect: false }
					]
				}
			]
		});

		try {
			const ids = await facade.createBaseQuestionsAndOptions({
				data,
				baseQuizId: 'bq1'
			});

			expect(ids.length).toBe(3);
			expect(baseQuestionService.calls.create.length).toBe(3);
			expect(baseOptionService.calls.createMany.length).toBe(2);

			const firstCreate = baseQuestionService.calls.create[0].data;
			expect(firstCreate).toEqual({
				questionText: 'Q1',
				correctAnswerText: 'A1',
				baseQuizId: 'bq1',
				conceptId: 'c1',
				orderIndex: 1,
				codeSnippet: '',
				questionType: 'A1'
			});

			const secondCreate = baseQuestionService.calls.create[1].data;
			expect(secondCreate).toEqual({
				questionText: 'Q2',
				correctAnswerText: 'A2',
				baseQuizId: 'bq1',
				conceptId: 'c1',
				orderIndex: 2,
				codeSnippet: '',
				questionType: 'A2'
			});

			const firstOptionsCall = baseOptionService.calls.createMany[0].data;
			expect(firstOptionsCall.length).toBe(2);
			expect(firstOptionsCall[0]).toMatchObject({
				optionText: 'A1',
				isCorrect: true
			});

			const secondOptionsCall = baseOptionService.calls.createMany[1].data;
			expect(secondOptionsCall.length).toBe(2);
			expect(secondOptionsCall[0]).toMatchObject({
				optionText: 'A3',
				isCorrect: true
			});
		} finally {
			(db as any).transaction = originalTransaction;
		}
	});
});

describe('BaseQuizFacade getQuestionsWithOptionsByBaseQuizId', () => {
	it('returns baseQuiz with questions and attached options', async () => {
		const quiz = makeBaseQuiz({ id: 'bq1' });
		const questions = [
			makeBaseQuestion({ id: 'q1', baseQuizId: 'bq1' }),
			makeBaseQuestion({ id: 'q2', baseQuizId: 'bq1' })
		];
		const options = [
			makeBaseOption({ id: 'o1', baseQuestionId: 'q1', optionText: '4', isCorrect: true }),
			makeBaseOption({ id: 'o2', baseQuestionId: 'q1', optionText: '5', isCorrect: false }),
			makeBaseOption({ id: 'o3', baseQuestionId: 'q2', optionText: 'A', isCorrect: true })
		];

		const baseQuizService = new FakeBaseQuizService({ byId: quiz });
		const baseQuestionService = new FakeBaseQuestionService({
			byBaseQuizId: questions
		});
		const baseOptionService = new FakeBaseOptionService({
			byBaseQuestionIds: options
		});

		const { facade } = makeFacade({
			baseQuizService,
			baseQuestionService,
			baseOptionService
		});

		const res = await facade.getQuestionsWithOptionsByBaseQuizId('bq1');

		expect(res.id).toBe('bq1');
		expect(res.questions.length).toBe(2);

		const q1 = res.questions.find((q: any) => q.id === 'q1');
		const q2 = res.questions.find((q: any) => q.id === 'q2');

		expect(q1?.options.map((o: any) => o.id).sort()).toEqual(['o1', 'o2']);
		expect(q2?.options.map((o: any) => o.id)).toEqual(['o3']);
	});
});

describe('BaseQuizFacade isAnswerCorrect', () => {
	it('returns true when answer matches correct optionText and no OpenAI call is made', async () => {
		const question = makeBaseQuestion({
			id: 'q1',
			questionText: 'What is 2+2?',
			correctAnswerText: '4'
		});
		const options = [
			makeBaseOption({ id: 'o1', baseQuestionId: 'q1', optionText: '4', isCorrect: true }),
			makeBaseOption({ id: 'o2', baseQuestionId: 'q1', optionText: '5', isCorrect: false })
		];

		const baseQuestionService = new FakeBaseQuestionService({
			byId: question
		});
		const baseOptionService = new FakeBaseOptionService({
			byBaseQuestionId: options
		});
		const openAiService = new FakeOpenAiService({ isAnswerCorrectResult: false });

		const { facade, openAiService: openAi } = makeFacade({
			baseQuestionService,
			baseOptionService,
			openAiService
		});

		const res = await facade.isAnswerCorrect('q1', '4');

		expect(res).toBe(true);
		expect(openAi.calls.isAnswerCorrect.length).toBe(0);
	});

	it('returns false when answer does not match correct optionText', async () => {
		const question = makeBaseQuestion({
			id: 'q1',
			questionText: 'What is 2+2?',
			correctAnswerText: '4'
		});
		const options = [
			makeBaseOption({ id: 'o1', baseQuestionId: 'q1', optionText: '4', isCorrect: true }),
			makeBaseOption({ id: 'o2', baseQuestionId: 'q1', optionText: '5', isCorrect: false })
		];

		const baseQuestionService = new FakeBaseQuestionService({
			byId: question
		});
		const baseOptionService = new FakeBaseOptionService({
			byBaseQuestionId: options
		});
		const openAiService = new FakeOpenAiService({ isAnswerCorrectResult: true });

		const { facade, openAiService: openAi } = makeFacade({
			baseQuestionService,
			baseOptionService,
			openAiService
		});

		const res = await facade.isAnswerCorrect('q1', '5');

		expect(res).toBe(false);
		expect(openAi.calls.isAnswerCorrect.length).toBe(0);
	});

	it('delegates to OpenAI when there are no options', async () => {
		const question = makeBaseQuestion({
			id: 'q1',
			questionText: 'Explain HTTPS',
			correctAnswerText: 'A protocol for secure HTTP over TLS'
		});

		const baseQuestionService = new FakeBaseQuestionService({
			byId: question
		});
		const baseOptionService = new FakeBaseOptionService({
			byBaseQuestionId: []
		});
		const openAiService = new FakeOpenAiService({ isAnswerCorrectResult: true });

		const { facade, openAiService: openAi } = makeFacade({
			baseQuestionService,
			baseOptionService,
			openAiService
		});

		const res = await facade.isAnswerCorrect('q1', 'secure HTTP over TLS');

		expect(res).toBe(true);
		expect(openAi.calls.isAnswerCorrect.length).toBe(1);
		expect(openAi.calls.isAnswerCorrect[0]).toEqual({
			question: 'Explain HTTPS',
			correctAnswer: 'A protocol for secure HTTP over TLS',
			answer: 'secure HTTP over TLS'
		});
	});
});
