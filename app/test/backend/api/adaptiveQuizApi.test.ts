import { describe, it, expect } from 'bun:test';
import type { AdaptiveQuiz, ComplexAdaptiveQuiz } from '../../../src/schemas/adaptiveQuizSchema';
import type { AdaptiveQuizService } from '../../../src/services/adaptiveQuizService';
import type { AdaptiveQuizFacade } from '../../../src/facades/adaptiveQuizFacade';
import { createAdaptiveQuizApi } from '../../../src/routes/api/[...slugs]/adaptiveQuizApi';

function makeAdaptiveQuiz(overrides: Partial<AdaptiveQuiz> = {}): AdaptiveQuiz {
	return {
		id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
		baseQuizId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
		userBlockId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
		placementQuizId: null,
		version: 1,
		isCompleted: false,
		readyForAnswering: true,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	} as AdaptiveQuiz;
}

function makeComplexAdaptiveQuiz(
	overrides: Partial<ComplexAdaptiveQuiz> = {}
): ComplexAdaptiveQuiz {
	return {
		...makeAdaptiveQuiz(),
		questions: [
			{
				id: 'qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq',
				baseQuizId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
				conceptId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
				questionText: 'What is 2 + 2?',
				correctAnswerText: '4',
				orderIndex: 1,
				codeSnippet: '',
				questionType: 'A1',
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: null,
				deletedAt: null,
				options: [],
				userAnswerText: null,
				isCorrect: null
			}
		],
		...overrides
	} as ComplexAdaptiveQuiz;
}

class FakeAdaptiveQuizService {
	calls = {
		getByUserBlockId: [] as string[],
		getLastAdaptiveQuizByUserBlockId: [] as string[]
	};
	fixtures: {
		getByUserBlockIdResult?: AdaptiveQuiz[];
		getLastAdaptiveQuizByUserBlockIdResult?: AdaptiveQuiz;
	} = {};

	constructor(fixtures: Partial<FakeAdaptiveQuizService['fixtures']> = {}) {
		this.fixtures = { ...this.fixtures, ...fixtures };
	}

	async getByUserBlockId(userBlockId: string): Promise<AdaptiveQuiz[]> {
		this.calls.getByUserBlockId.push(userBlockId);
		return (
			this.fixtures.getByUserBlockIdResult ?? [
				makeAdaptiveQuiz({ userBlockId }),
				makeAdaptiveQuiz({
					id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
					userBlockId,
					version: 2
				})
			]
		);
	}

	async getLastAdaptiveQuizByUserBlockId(userBlockId: string): Promise<AdaptiveQuiz> {
		this.calls.getLastAdaptiveQuizByUserBlockId.push(userBlockId);
		return (
			this.fixtures.getLastAdaptiveQuizByUserBlockIdResult ??
			makeAdaptiveQuiz({
				id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
				userBlockId,
				version: 3
			})
		);
	}
}

class FakeAdaptiveQuizFacade {
	calls = {
		finishAdaptiveQuiz: [] as string[],
		getComplexAdaptiveQuizById: [] as string[]
	};
	fixtures: {
		finishAdaptiveQuizResult?: AdaptiveQuiz;
		getComplexAdaptiveQuizByIdResult?: ComplexAdaptiveQuiz;
	} = {};

	constructor(fixtures: Partial<FakeAdaptiveQuizFacade['fixtures']> = {}) {
		this.fixtures = { ...this.fixtures, ...fixtures };
	}

	async finishAdaptiveQuiz(adaptiveQuizId: string): Promise<AdaptiveQuiz> {
		this.calls.finishAdaptiveQuiz.push(adaptiveQuizId);
		return (
			this.fixtures.finishAdaptiveQuizResult ??
			makeAdaptiveQuiz({
				id: adaptiveQuizId,
				isCompleted: true
			})
		);
	}

	async getComplexAdaptiveQuizById(adaptiveQuizId: string): Promise<ComplexAdaptiveQuiz> {
		this.calls.getComplexAdaptiveQuizById.push(adaptiveQuizId);
		return (
			this.fixtures.getComplexAdaptiveQuizByIdResult ??
			makeComplexAdaptiveQuiz({
				id: adaptiveQuizId
			})
		);
	}
}

function createAppWithDeps(opts?: {
	adaptiveQuizService?: FakeAdaptiveQuizService;
	adaptiveQuizFacade?: FakeAdaptiveQuizFacade;
}) {
	const adaptiveQuizService = opts?.adaptiveQuizService ?? new FakeAdaptiveQuizService();
	const adaptiveQuizFacade = opts?.adaptiveQuizFacade ?? new FakeAdaptiveQuizFacade();

	return {
		app: createAdaptiveQuizApi({
			adaptiveQuizService: adaptiveQuizService as unknown as AdaptiveQuizService,
			adaptiveQuizFacade: adaptiveQuizFacade as unknown as AdaptiveQuizFacade
		}),
		adaptiveQuizService,
		adaptiveQuizFacade
	};
}

describe('adaptiveQuizApi', () => {
	it('GET /adaptiveQuiz/:userBlockId returns quizzes for userBlockId', async () => {
		const service = new FakeAdaptiveQuizService();
		const { app, adaptiveQuizService } = createAppWithDeps({ adaptiveQuizService: service });

		const res = await app.handle(
			new Request('http://localhost/adaptiveQuiz/cccccccc-cccc-cccc-cccc-cccccccccccc', {
				method: 'GET'
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();

		expect(adaptiveQuizService.calls.getByUserBlockId).toEqual([
			'cccccccc-cccc-cccc-cccc-cccccccccccc'
		]);
		expect(Array.isArray(body)).toBe(true);
		expect(body.length).toBeGreaterThan(0);
		expect(body[0].userBlockId).toBe('cccccccc-cccc-cccc-cccc-cccccccccccc');
	});

	it('POST /adaptiveQuiz/complete/:adaptiveQuizId completes quiz via facade.finishAdaptiveQuiz', async () => {
		const facade = new FakeAdaptiveQuizFacade({
			finishAdaptiveQuizResult: makeAdaptiveQuiz({
				id: 'quiz-1',
				isCompleted: true
			})
		});
		const { app, adaptiveQuizFacade } = createAppWithDeps({ adaptiveQuizFacade: facade });

		const res = await app.handle(
			new Request('http://localhost/adaptiveQuiz/complete/quiz-1', {
				method: 'POST'
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();

		expect(adaptiveQuizFacade.calls.finishAdaptiveQuiz).toEqual(['quiz-1']);
		expect(body.id).toBe('quiz-1');
		expect(body.isCompleted).toBe(true);
	});

	it('GET /adaptiveQuiz/complexQuiz/:adaptiveQuizId returns complex quiz via facade.getComplexAdaptiveQuizById', async () => {
		const complex = makeComplexAdaptiveQuiz({
			id: 'quiz-complex'
		});
		const facade = new FakeAdaptiveQuizFacade({
			getComplexAdaptiveQuizByIdResult: complex
		});
		const { app, adaptiveQuizFacade } = createAppWithDeps({ adaptiveQuizFacade: facade });

		const res = await app.handle(
			new Request('http://localhost/adaptiveQuiz/complexQuiz/quiz-complex', {
				method: 'GET'
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();

		expect(adaptiveQuizFacade.calls.getComplexAdaptiveQuizById).toEqual(['quiz-complex']);
		expect(body.id).toBe('quiz-complex');
		expect(Array.isArray(body.questions)).toBe(true);
		expect(body.questions.length).toBeGreaterThan(0);
	});

	it('GET /adaptiveQuiz/last/:userBlockId returns last adaptive quiz via service', async () => {
		const service = new FakeAdaptiveQuizService({
			getLastAdaptiveQuizByUserBlockIdResult: makeAdaptiveQuiz({
				id: 'last-quiz',
				userBlockId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
				version: 5
			})
		});
		const { app, adaptiveQuizService } = createAppWithDeps({ adaptiveQuizService: service });

		const res = await app.handle(
			new Request('http://localhost/adaptiveQuiz/last/cccccccc-cccc-cccc-cccc-cccccccccccc', {
				method: 'GET'
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();

		expect(adaptiveQuizService.calls.getLastAdaptiveQuizByUserBlockId).toEqual([
			'cccccccc-cccc-cccc-cccc-cccccccccccc'
		]);
		expect(body.id).toBe('last-quiz');
		expect(body.version).toBe(5);
	});
});
