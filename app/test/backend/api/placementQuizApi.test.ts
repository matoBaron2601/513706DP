import { describe, it, expect } from 'bun:test';
import type { PlacementQuizFacade } from '../../../src/facades/placementQuizFacade';
import type { BaseQuizWithQuestionsAndOptions } from '../../../src/schemas/baseQuizSchema';
import type { CreatePlacementQuizRequest } from '../../../src/schemas/placementQuizSchema';
import { createPlacementQuizApi } from '../../../src/routes/api/[...slugs]/placementQuizApi';

function makeBaseQuizWithQuestionsAndOptions(
	overrides: Partial<BaseQuizWithQuestionsAndOptions> = {}
): BaseQuizWithQuestionsAndOptions {
	return {
		id: '11111111-1111-1111-1111-111111111111',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		questions: [
			{
				id: '22222222-2222-2222-2222-222222222222',
				baseQuizId: '11111111-1111-1111-1111-111111111111',
				conceptId: '33333333-3333-3333-3333-333333333333',
				questionText: 'What is 2 + 2?',
				correctAnswerText: '4',
				orderIndex: 1,
				codeSnippet: '',
				questionType: 'A1',
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: null,
				deletedAt: null,
				options: [
					{
						id: '44444444-4444-4444-4444-444444444444',
						baseQuestionId: '22222222-2222-2222-2222-222222222222',
						optionText: '4',
						isCorrect: true,
						createdAt: new Date('2024-01-01T00:00:00Z'),
						updatedAt: null,
						deletedAt: null
					}
				]
			}
		],
		...overrides
	} as BaseQuizWithQuestionsAndOptions;
}

class FakePlacementQuizFacade {
	calls = {
		createPlacementQuiz: [] as CreatePlacementQuizRequest[]
	};
	fixtures: {
		createPlacementQuiz?: BaseQuizWithQuestionsAndOptions;
	} = {};

	constructor(fixtures: Partial<FakePlacementQuizFacade['fixtures']> = {}) {
		this.fixtures = { ...this.fixtures, ...fixtures };
	}

	async createPlacementQuiz(
		data: CreatePlacementQuizRequest
	): Promise<BaseQuizWithQuestionsAndOptions> {
		this.calls.createPlacementQuiz.push(data);
		return this.fixtures.createPlacementQuiz ?? makeBaseQuizWithQuestionsAndOptions();
	}
}

function createAppWithDeps(opts?: { placementQuizFacade?: FakePlacementQuizFacade }) {
	const placementQuizFacade = opts?.placementQuizFacade ?? new FakePlacementQuizFacade();

	return {
		app: createPlacementQuizApi({
			placementQuizFacade: placementQuizFacade as unknown as PlacementQuizFacade
		}),
		placementQuizFacade
	};
}

describe('placementQuizApi', () => {
	it('POST /placementQuiz creates placement quiz via facade and returns it', async () => {
		const quiz = makeBaseQuizWithQuestionsAndOptions({
			id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
		});

		const facade = new FakePlacementQuizFacade({
			createPlacementQuiz: quiz
		});
		const { app } = createAppWithDeps({ placementQuizFacade: facade });

		const payload: CreatePlacementQuizRequest = {
			blockId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
		} as CreatePlacementQuizRequest;

		const res = await app.handle(
			new Request('http://localhost/placementQuiz', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(payload)
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();

		expect(facade.calls.createPlacementQuiz.length).toBe(1);
		expect(facade.calls.createPlacementQuiz[0]).toEqual(payload);

		expect(body.id).toBe('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
		expect(Array.isArray(body.questions)).toBe(true);
		expect(body.questions.length).toBeGreaterThan(0);
		expect(body.questions[0].questionText).toBe('What is 2 + 2?');
	});
});
