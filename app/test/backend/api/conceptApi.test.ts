// test/api/conceptApi.test.ts
import { describe, it, expect } from 'bun:test';
import type {
	Concept,
	GetConceptProgressByUserBlockIdResponse
} from '../../../src/schemas/conceptSchema';
import type { ConceptFacade } from '../../../src/facades/conceptFacade';
import { createConceptApi } from '../../../src/routes/api/[...slugs]/conceptApi';
import type { ConceptProgress } from '../../../src/schemas/conceptProgressSchema';

function makeConcept(overrides: Partial<Concept> = {}): Concept {
	return {
		id: 'c1',
		name: 'Limits',
		blockId: 'b1',
		difficultyIndex: 1,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	} as Concept;
}

function makeConceptProgress(overrides: Partial<ConceptProgress> = {}): ConceptProgress {
	return {
		id: 'cp1',
		userBlockId: 'ub1',
		conceptId: 'c1',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
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
		...overrides
	} as ConceptProgress;
}

class FakeConceptFacade {
	calls = {
		getConceptProgressByUserBlockId: [] as { userBlockId: string }[]
	};

	constructor(
		private fixture: GetConceptProgressByUserBlockIdResponse = [
			{
				concept: makeConcept(),
				conceptProgress: makeConceptProgress()
			}
		]
	) {}

	async getConceptProgressByUserBlockId(params: {
		userBlockId: string;
	}): Promise<GetConceptProgressByUserBlockIdResponse> {
		this.calls.getConceptProgressByUserBlockId.push(params);
		return this.fixture;
	}
}

function createAppWithFacade(facade: FakeConceptFacade) {
	return createConceptApi(facade as unknown as ConceptFacade);
}

describe('conceptApi', () => {
	it('GET /concept/progress/:userBlockId calls facade and returns progress data', async () => {
		const fixture: GetConceptProgressByUserBlockIdResponse = [
			{
				concept: makeConcept({ id: 'c1', name: 'Derivatives' }),
				conceptProgress: makeConceptProgress({
					id: 'cp1',
					userBlockId: 'ub-123',
					conceptId: 'c1',
					score: 0.8,
					mastered: true
				})
			}
		];

		const facade = new FakeConceptFacade(fixture);
		const app = createAppWithFacade(facade);

		const res = await app.handle(
			new Request('http://localhost/concept/progress/ub-123', {
				method: 'GET'
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();

		expect(facade.calls.getConceptProgressByUserBlockId).toEqual([{ userBlockId: 'ub-123' }]);

		expect(Array.isArray(body)).toBe(true);
		expect(body[0].concept.id).toBe('c1');
		expect(body[0].concept.name).toBe('Derivatives');
		expect(body[0].conceptProgress.userBlockId).toBe('ub-123');
		expect(body[0].conceptProgress.score).toBe(0.8);
		expect(body[0].conceptProgress.mastered).toBe(true);
	});
});
