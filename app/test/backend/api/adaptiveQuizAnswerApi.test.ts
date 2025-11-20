// test/api/adaptiveQuizAnswerApi.test.ts
import { describe, it, expect } from 'bun:test';
import type {
	AdaptiveQuizAnswer,
	SubmitAdaptiveQuizAnswer
} from '../../../src/schemas/adaptiveQuizAnswerSchema';
import type { AdaptiveQuizAnswerFacade } from '../../../src/facades/adaptiveQuizAnswerFacade';
import { createAdaptiveQuizAnswerApi } from '../../../src/routes/api/[...slugs]/adaptiveQuizAnswerApi';

function makeAdaptiveQuizAnswer(overrides: Partial<AdaptiveQuizAnswer> = {}): AdaptiveQuizAnswer {
	return {
		id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
		adaptiveQuizId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
		baseQuestionId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
		answerText: '42',
		isCorrect: true,
		time: 5,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	} as AdaptiveQuizAnswer;
}

class FakeAdaptiveQuizAnswerFacade {
	calls = {
		submitAnswer: [] as SubmitAdaptiveQuizAnswer[]
	};
	fixtures: { submitAnswer?: AdaptiveQuizAnswer } = {};

	constructor(fixtures: Partial<FakeAdaptiveQuizAnswerFacade['fixtures']> = {}) {
		this.fixtures = { ...this.fixtures, ...fixtures };
	}

	async submitAnswer(data: SubmitAdaptiveQuizAnswer): Promise<AdaptiveQuizAnswer> {
		this.calls.submitAnswer.push(data);
		return this.fixtures.submitAnswer ?? makeAdaptiveQuizAnswer(data);
	}
}

function createAppWithFacade(facade: FakeAdaptiveQuizAnswerFacade) {
	return createAdaptiveQuizAnswerApi({
		adaptiveQuizAnswerFacade: facade as unknown as AdaptiveQuizAnswerFacade
	});
}

describe('adaptiveQuizAnswerApi', () => {
	it('POST /adaptiveQuizAnswer creates an answer via facade.submitAnswer and returns it', async () => {
		const answer = makeAdaptiveQuizAnswer({
			id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
			adaptiveQuizId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
			baseQuestionId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
			answerText: 'My answer',
			isCorrect: false,
			time: 12
		});

		const facade = new FakeAdaptiveQuizAnswerFacade({ submitAnswer: answer });
		const app = createAppWithFacade(facade);

		const payload: SubmitAdaptiveQuizAnswer = {
			adaptiveQuizId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
			baseQuestionId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
			answerText: 'My answer',
			time: 12
		};

		const res = await app.handle(
			new Request('http://localhost/adaptiveQuizAnswer', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(payload)
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();

		expect(facade.calls.submitAnswer.length).toBe(1);
		expect(facade.calls.submitAnswer[0]).toEqual(payload);

		expect(body.id).toBe('dddddddd-dddd-dddd-dddd-dddddddddddd');
		expect(body.adaptiveQuizId).toBe(payload.adaptiveQuizId);
		expect(body.baseQuestionId).toBe(payload.baseQuestionId);
		expect(body.answerText).toBe(payload.answerText);
		expect(body.time).toBe(12);
	});
});
