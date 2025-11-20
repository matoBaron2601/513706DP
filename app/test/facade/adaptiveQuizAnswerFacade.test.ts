import { describe, it, expect } from 'bun:test';
import { AdaptiveQuizAnswerFacade } from '../../src/facades/adaptiveQuizAnswerFacade';
import type {
	AdaptiveQuizAnswer,
	SubmitAdaptiveQuizAnswer
} from '../../src/schemas/adaptiveQuizAnswerSchema';

class FakeAdaptiveQuizAnswerService {
	fixtures: { created?: AdaptiveQuizAnswer } = {};
	calls = {
		create: [] as any[]
	};

	constructor(fixtures: { created?: AdaptiveQuizAnswer } = {}) {
		this.fixtures = fixtures;
	}

	async create(data: any): Promise<AdaptiveQuizAnswer> {
		this.calls.create.push(data);
		if (!this.fixtures.created) {
			this.fixtures.created = {
				id: 'a1',
				adaptiveQuizId: data.adaptiveQuizId,
				baseQuestionId: data.baseQuestionId,
				answerText: data.answerText,
				isCorrect: data.isCorrect,
				time: data.time,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: null,
				deletedAt: null
			} as AdaptiveQuizAnswer;
		}
		return this.fixtures.created;
	}
}

class FakeBaseQuizFacade {
	fixtures: { isAnswerCorrectResult: boolean } = { isAnswerCorrectResult: true };
	calls = {
		isAnswerCorrect: [] as { baseQuestionId: string; answerText: string }[]
	};

	constructor(fixtures: { isAnswerCorrectResult?: boolean } = {}) {
		if (fixtures.isAnswerCorrectResult !== undefined) {
			this.fixtures.isAnswerCorrectResult = fixtures.isAnswerCorrectResult;
		}
	}

	async isAnswerCorrect(baseQuestionId: string, answerText: string): Promise<boolean> {
		this.calls.isAnswerCorrect.push({ baseQuestionId, answerText });
		return this.fixtures.isAnswerCorrectResult;
	}
}

class FakeBaseQuestionService {
	fixtures: { baseQuizId?: string } = {};
	calls = {
		getBaseQuizIdByQuestionId: [] as string[]
	};

	constructor(fixtures: { baseQuizId?: string } = {}) {
		this.fixtures = fixtures;
	}

	async getBaseQuizIdByQuestionId(questionId: string): Promise<string> {
		this.calls.getBaseQuizIdByQuestionId.push(questionId);
		return this.fixtures.baseQuizId ?? 'bq1';
	}
}

function makeFacade(deps?: {
	adaptiveQuizAnswerService?: FakeAdaptiveQuizAnswerService;
	baseQuizFacade?: FakeBaseQuizFacade;
	baseQuestionService?: FakeBaseQuestionService;
}) {
	const facade = new AdaptiveQuizAnswerFacade();
	const anyFacade = facade as any;

	const adaptiveQuizAnswerService =
		deps?.adaptiveQuizAnswerService ?? new FakeAdaptiveQuizAnswerService();
	const baseQuizFacade = deps?.baseQuizFacade ?? new FakeBaseQuizFacade();
	const baseQuestionService =
		deps?.baseQuestionService ?? new FakeBaseQuestionService();

	anyFacade.adaptiveQuizAnswerService = adaptiveQuizAnswerService;
	anyFacade.baseQuizFacade = baseQuizFacade;
	anyFacade.baseQuestionService = baseQuestionService;

	return {
		facade,
		adaptiveQuizAnswerService,
		baseQuizFacade,
		baseQuestionService
	};
}

describe('AdaptiveQuizAnswerFacade submitAnswer', () => {
	it('creates answer with isCorrect = true when baseQuizFacade returns true', async () => {
		const adaptiveQuizAnswerService = new FakeAdaptiveQuizAnswerService();
		const baseQuizFacade = new FakeBaseQuizFacade({ isAnswerCorrectResult: true });
		const baseQuestionService = new FakeBaseQuestionService({ baseQuizId: 'bq1' });

		const { facade } = makeFacade({
			adaptiveQuizAnswerService,
			baseQuizFacade,
			baseQuestionService
		});

		const payload: SubmitAdaptiveQuizAnswer = {
			baseQuestionId: 'q1',
			answerText: '4',
			adaptiveQuizId: 'aq1',
			time: 12
		} as SubmitAdaptiveQuizAnswer;

		const res = await facade.submitAnswer(payload);

		expect(baseQuizFacade.calls.isAnswerCorrect.length).toBe(1);
		expect(baseQuizFacade.calls.isAnswerCorrect[0]).toEqual({
			baseQuestionId: 'q1',
			answerText: '4'
		});

		expect(baseQuestionService.calls.getBaseQuizIdByQuestionId.length).toBe(1);
		expect(baseQuestionService.calls.getBaseQuizIdByQuestionId[0]).toBe('q1');

		expect(adaptiveQuizAnswerService.calls.create.length).toBe(1);
		expect(adaptiveQuizAnswerService.calls.create[0]).toEqual({
			answerText: '4',
			isCorrect: true,
			baseQuestionId: 'q1',
			adaptiveQuizId: 'aq1',
			time: 12
		});

		expect(res.isCorrect).toBe(true);
		expect(res.baseQuestionId).toBe('q1');
		expect(res.adaptiveQuizId).toBe('aq1');
		expect(res.answerText).toBe('4');
	});

	it('creates answer with isCorrect = false when baseQuizFacade returns false', async () => {
		const adaptiveQuizAnswerService = new FakeAdaptiveQuizAnswerService();
		const baseQuizFacade = new FakeBaseQuizFacade({ isAnswerCorrectResult: false });
		const baseQuestionService = new FakeBaseQuestionService({ baseQuizId: 'bq1' });

		const { facade } = makeFacade({
			adaptiveQuizAnswerService,
			baseQuizFacade,
			baseQuestionService
		});

		const payload: SubmitAdaptiveQuizAnswer = {
			baseQuestionId: 'q2',
			answerText: 'wrong',
			adaptiveQuizId: 'aq2',
			time: 20
		} as SubmitAdaptiveQuizAnswer;

		const res = await facade.submitAnswer(payload);

		expect(baseQuizFacade.calls.isAnswerCorrect.length).toBe(1);
		expect(baseQuizFacade.calls.isAnswerCorrect[0]).toEqual({
			baseQuestionId: 'q2',
			answerText: 'wrong'
		});

		expect(baseQuestionService.calls.getBaseQuizIdByQuestionId.length).toBe(1);
		expect(baseQuestionService.calls.getBaseQuizIdByQuestionId[0]).toBe('q2');

		expect(adaptiveQuizAnswerService.calls.create.length).toBe(1);
		expect(adaptiveQuizAnswerService.calls.create[0]).toEqual({
			answerText: 'wrong',
			isCorrect: false,
			baseQuestionId: 'q2',
			adaptiveQuizId: 'aq2',
			time: 20
		});

		expect(res.isCorrect).toBe(false);
		expect(res.baseQuestionId).toBe('q2');
		expect(res.adaptiveQuizId).toBe('aq2');
		expect(res.answerText).toBe('wrong');
	});
});
