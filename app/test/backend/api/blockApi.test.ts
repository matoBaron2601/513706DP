import { describe, it, expect } from 'bun:test';
import type { BlockDto } from '../../../src/db/schema';
import type {
	IdentifyConceptsResponse,
	CreateBlockRequest,
	CreateBlockResponse
} from '../../../src/schemas/blockSchema';
import type { BlockFacade } from '../../../src/facades/blockFacade';
import type { BlockService } from '../../../src/services/blockService';
import type { BucketService } from '../../../src/services/bucketService';
import { createBlockApi } from '../../../src/routes/api/[...slugs]/blockApi';

function makeBlock(overrides: Partial<BlockDto> = {}): BlockDto {
	return {
		id: 'b1',
		name: 'Block 1',
		courseId: 'c1',
		documentPath: 'doc.txt',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	} as BlockDto;
}

function makeIdentifyConceptsResponse(
	overrides: Partial<IdentifyConceptsResponse> = {}
): IdentifyConceptsResponse {
	return {
		documentPath: 'stored-doc.txt',
		concepts: ['A', 'B'],
		...overrides
	} as IdentifyConceptsResponse;
}

function makeCreateBlockResponse(
	overrides: Partial<CreateBlockResponse> = {}
): CreateBlockResponse {
	return {
		id: 'b-new',
		name: 'New block',
		courseId: 'c1',
		documentPath: 'some-doc.txt',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		concepts: [
			{
				id: 'c1',
				name: 'Concept 1',
				blockId: 'b-new',
				difficultyIndex: 1,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: null,
				deletedAt: null
			}
		],
		...overrides
	} as CreateBlockResponse;
}

class FakeBlockService {
	calls = {
		getById: [] as string[]
	};
	fixtures: { getById?: BlockDto } = {};

	constructor(fixtures: { getById?: BlockDto } = {}) {
		this.fixtures = fixtures;
	}

	async getById(id: string): Promise<BlockDto> {
		this.calls.getById.push(id);
		return this.fixtures.getById ?? makeBlock({ id });
	}
}

class FakeBlockFacade {
	calls = {
		getManyByCourseId: [] as string[],
		identifyConcepts: [] as string[],
		createBlock: [] as any[]
	};
	fixtures: {
		getManyByCourseId?: any[];
		identifyConcepts?: IdentifyConceptsResponse;
		createBlock?: CreateBlockResponse;
	} = {};

	constructor(fixtures: Partial<FakeBlockFacade['fixtures']> = {}) {
		this.fixtures = { ...this.fixtures, ...fixtures };
	}

	async getManyByCourseId(courseId: string): Promise<any[]> {
		this.calls.getManyByCourseId.push(courseId);
		return (
			this.fixtures.getManyByCourseId ?? [
				{
					...makeBlock({ id: 'b1', courseId }),
					concepts: []
				}
			]
		);
	}

	async identifyConcepts(documentPath: string): Promise<IdentifyConceptsResponse> {
		this.calls.identifyConcepts.push(documentPath);
		return this.fixtures.identifyConcepts ?? makeIdentifyConceptsResponse({ documentPath });
	}

	async createBlock(data: CreateBlockRequest): Promise<CreateBlockResponse> {
		this.calls.createBlock.push(data);
		return this.fixtures.createBlock ?? makeCreateBlockResponse();
	}
}

class FakeBucketService {
	calls = {
		uploadBlockDataFile: [] as any[]
	};
	fixtures: { uploadedName?: string } = {};

	constructor(fixtures: { uploadedName?: string } = {}) {
		this.fixtures = fixtures;
	}

	async uploadBlockDataFile(document: any): Promise<string> {
		this.calls.uploadBlockDataFile.push(document);
		return this.fixtures.uploadedName ?? 'stored-doc.txt';
	}
}

function createAppWithDeps(opts?: {
	blockService?: FakeBlockService;
	blockFacade?: FakeBlockFacade;
	bucketService?: FakeBucketService;
}) {
	const blockService = opts?.blockService ?? new FakeBlockService();
	const blockFacade = opts?.blockFacade ?? new FakeBlockFacade();
	const bucketService = opts?.bucketService ?? new FakeBucketService();
	return {
		app: createBlockApi({
			blockService: blockService as unknown as BlockService,
			blockFacade: blockFacade as unknown as BlockFacade,
			bucketService: bucketService as unknown as BucketService
		}),
		blockService,
		blockFacade,
		bucketService
	};
}

describe('blockApi', () => {
	it('GET /block/:id returns block by id and calls BlockService.getById', async () => {
		const block = makeBlock({ id: 'b123', name: 'My block' });
		const blockService = new FakeBlockService({ getById: block });
		const { app } = createAppWithDeps({ blockService });

		const res = await app.handle(new Request('http://localhost/block/b123', { method: 'GET' }));

		expect(res.status).toBe(200);
		const body = await res.json();

		expect(blockService.calls.getById).toEqual(['b123']);
		expect(body.id).toBe('b123');
		expect(body.name).toBe('My block');
	});

	it('GET /block/courseId/:id returns blocks with concepts via BlockFacade.getManyByCourseId', async () => {
		const fixture = [
			{
				...makeBlock({ id: 'b1', courseId: 'course-1' }),
				concepts: [{ id: 'c1', name: 'Concept 1' }]
			}
		];
		const blockFacade = new FakeBlockFacade({ getManyByCourseId: fixture });
		const { app } = createAppWithDeps({ blockFacade });

		const res = await app.handle(
			new Request('http://localhost/block/courseId/course-1', { method: 'GET' })
		);

		expect(res.status).toBe(200);
		const body = await res.json();

		expect(blockFacade.calls.getManyByCourseId).toEqual(['course-1']);
		expect(Array.isArray(body)).toBe(true);
		expect(body[0].courseId).toBe('course-1');
		expect(body[0].concepts[0].name).toBe('Concept 1');
	});

	it('POST /block/identifyConcepts uploads file and calls BlockFacade.identifyConcepts', async () => {
		const identifyRes = makeIdentifyConceptsResponse({
			documentPath: 'stored-name.txt',
			concepts: ['X', 'Y']
		});
		const blockFacade = new FakeBlockFacade({ identifyConcepts: identifyRes });
		const bucketService = new FakeBucketService({ uploadedName: 'stored-name.txt' });
		const { app } = createAppWithDeps({ blockFacade, bucketService });

		const form = new FormData();
		const file = new File(['dummy-file-content'], 'dummy.txt', { type: 'text/plain' });
		form.append('document', file);

		const res = await app.handle(
			new Request('http://localhost/block/identifyConcepts', {
				method: 'POST',
				body: form
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();

		expect(bucketService.calls.uploadBlockDataFile.length).toBe(1);
		expect(bucketService.calls.uploadBlockDataFile[0]).toBeInstanceOf(File);
		expect(bucketService.calls.uploadBlockDataFile[0].name).toBe('dummy.txt');

		expect(blockFacade.calls.identifyConcepts).toEqual(['stored-name.txt']);

		expect(body.documentPath).toBe('stored-name.txt');
		expect(body.concepts).toEqual(['X', 'Y']);
	});

	it('POST /block/createBlock calls BlockFacade.createBlock and returns created block', async () => {
		const created = makeCreateBlockResponse({
			id: 'b-created',
			name: 'Created Block'
		});
		const blockFacade = new FakeBlockFacade({ createBlock: created });
		const { app } = createAppWithDeps({ blockFacade });

		const payload: CreateBlockRequest = {
			name: 'Created Block',
			courseId: 'c1',
			documentPath: 'doc.txt',
			chunkingStrategy: 'rtc',
			useLLMTransformation: false,
			concepts: [
				{
					name: 'Concept 1',
					difficultyIndex: 1
				}
			]
		} as CreateBlockRequest;

		const res = await app.handle(
			new Request('http://localhost/block/createBlock', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(payload)
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();

		expect(blockFacade.calls.createBlock.length).toBe(1);
		expect(blockFacade.calls.createBlock[0]).toEqual(payload);

		expect(body.id).toBe('b-created');
		expect(body.name).toBe('Created Block');
		expect(body.concepts.length).toBe(1);
		expect(body.concepts[0].name).toBe('Concept 1');
	});
});
