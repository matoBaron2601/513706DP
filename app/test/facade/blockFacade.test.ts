import { describe, it, expect } from 'bun:test';
import { BlockFacade } from '../../src/facades/blockFacade';
import { db } from '../../src/db/client';

type Block = any;
type Concept = any;
type ConceptWithBlock = any;

function makeBlock(overrides: Partial<Block> = {}): Block {
	return {
		id: 'b1',
		name: 'Block 1',
		courseId: 'course1',
		documentPath: 'doc1.txt',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
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
	};
}

class FakeBlockService {
	fixtures: { byCourseId?: Block[]; created?: Block } = {};
	calls = {
		getManyByCourseId: [] as string[],
		create: [] as { data: any; tx: any }[],
		getById: [] as string[]
	};

	constructor(fixtures: { byCourseId?: Block[]; created?: Block } = {}) {
		this.fixtures = fixtures;
	}

	async getManyByCourseId(courseId: string): Promise<Block[]> {
		this.calls.getManyByCourseId.push(courseId);
		return this.fixtures.byCourseId ?? [];
	}

	async create(data: any, tx?: any): Promise<Block> {
		this.calls.create.push({ data, tx });
		if (!this.fixtures.created) {
			this.fixtures.created = makeBlock({
				id: 'created-block',
				name: data.name,
				courseId: data.courseId,
				documentPath: data.documentPath
			});
		}
		return this.fixtures.created;
	}

	async getById(id: string): Promise<Block> {
		this.calls.getById.push(id);
		return this.fixtures.created ?? makeBlock({ id });
	}
}

class FakeConceptService {
	fixtures: { byBlockIds?: Concept[]; byBlockId?: Concept[]; createdMany?: ConceptWithBlock[] } =
		{};
	calls = {
		getManyByBlockIds: [] as string[][],
		getManyByBlockId: [] as string[],
		createMany: [] as { data: any[]; tx: any }[]
	};

	constructor(fixtures: { byBlockIds?: Concept[]; byBlockId?: Concept[] } = {}) {
		this.fixtures = fixtures;
	}

	async getManyByBlockIds(blockIds: string[]): Promise<Concept[]> {
		this.calls.getManyByBlockIds.push(blockIds);
		const all = this.fixtures.byBlockIds ?? [];
		return all.filter((c) => blockIds.includes(c.blockId));
	}

	async getManyByBlockId(blockId: string): Promise<Concept[]> {
		this.calls.getManyByBlockId.push(blockId);
		if (this.fixtures.byBlockId) {
			return this.fixtures.byBlockId.filter((c) => c.blockId === blockId);
		}
		return (this.fixtures.byBlockIds ?? []).filter((c) => c.blockId === blockId);
	}

	async createMany(data: any[], tx?: any): Promise<Concept[]> {
		this.calls.createMany.push({ data, tx });
		this.fixtures.createdMany = data.map((d, i) => ({
			id: `c${i + 1}`,
			...d
		}));
		return this.fixtures.createdMany;
	}
}

class FakeTypesenseService {
	fixtures: { exists?: boolean } = {};
	calls = {
		chunkForThisBlockIdAlreadyExists: [] as string[],
		createMany: [] as any[][]
	};

	constructor(fixtures: { exists?: boolean } = {}) {
		this.fixtures = fixtures;
	}

	async chunkForThisBlockIdAlreadyExists(blockId: string): Promise<boolean> {
		this.calls.chunkForThisBlockIdAlreadyExists.push(blockId);
		return this.fixtures.exists ?? false;
	}

	async createMany(docs: any[]): Promise<void> {
		this.calls.createMany.push(docs);
	}
}

class FakeOpenAiService {
	fixtures: { identifyConcepts?: string[]; preRetrievalTransform?: string } = {};
	calls = {
		identifyConcepts: [] as string[],
		preRetrievalTransform: [] as string[]
	};

	constructor(fixtures: { identifyConcepts?: string[]; preRetrievalTransform?: string } = {}) {
		this.fixtures = fixtures;
	}

	async identifyConcepts(text: string): Promise<string[]> {
		this.calls.identifyConcepts.push(text);
		return this.fixtures.identifyConcepts ?? [];
	}

	async preRetrievalTransform(text: string): Promise<string> {
		this.calls.preRetrievalTransform.push(text);
		return this.fixtures.preRetrievalTransform ?? text;
	}
}

class FakeChunkerService {
	fixtures: { chunks?: string[] } = {};
	calls = {
		chunk: [] as { strategy: string; text: string }[]
	};

	constructor(fixtures: { chunks?: string[] } = {}) {
		this.fixtures = fixtures;
	}

	async chunk(strategy: string, text: string): Promise<string[]> {
		this.calls.chunk.push({ strategy, text });
		return this.fixtures.chunks ?? ['chunk1', 'chunk2'];
	}
}

class FakeBucketService {
	fixtures: { fileText?: string | null } = {};
	calls = {
		getBlockDataFileString: [] as string[]
	};

	constructor(fixtures: { fileText?: string | null } = {}) {
		this.fixtures = fixtures;
	}

	async getBlockDataFileString(path: string): Promise<string | null> {
		this.calls.getBlockDataFileString.push(path);
		return this.fixtures.fileText ?? null;
	}
}

class FakeDocumentService {
	calls = {
		create: [] as { data: any; tx: any }[]
	};

	constructor() {}

	async create(data: any, tx?: any): Promise<any> {
		this.calls.create.push({ data, tx });
		return {
			id: 'doc1',
			...data
		};
	}
}

function makeFacade(deps?: {
	blockService?: FakeBlockService;
	conceptService?: FakeConceptService;
	typesenseService?: FakeTypesenseService;
	openAiService?: FakeOpenAiService;
	chunkerService?: FakeChunkerService;
	bucketService?: FakeBucketService;
	documentService?: FakeDocumentService;
}) {
	const facade = new BlockFacade();
	const anyFacade = facade as any;

	const blockService = deps?.blockService ?? new FakeBlockService();
	const conceptService = deps?.conceptService ?? new FakeConceptService();
	const typesenseService = deps?.typesenseService ?? new FakeTypesenseService();
	const openAiService = deps?.openAiService ?? new FakeOpenAiService();
	const chunkerService = deps?.chunkerService ?? new FakeChunkerService();
	const bucketService = deps?.bucketService ?? new FakeBucketService();
	const documentService = deps?.documentService ?? new FakeDocumentService();

	anyFacade.blockService = blockService;
	anyFacade.conceptService = conceptService;
	anyFacade.typesenseService = typesenseService;
	anyFacade.openAiService = openAiService;
	anyFacade.chunkerService = chunkerService;
	anyFacade.bucketService = bucketService;
	anyFacade.documentService = documentService;

	return {
		facade,
		blockService,
		conceptService,
		typesenseService,
		openAiService,
		chunkerService,
		bucketService,
		documentService
	};
}

describe('BlockFacade getManyByCourseId', () => {
	it('returns blocks with associated concepts', async () => {
		const b1 = makeBlock({ id: 'b1' });
		const b2 = makeBlock({ id: 'b2' });
		const c1 = makeConcept({ id: 'c1', blockId: 'b1', name: 'C1' });
		const c2 = makeConcept({ id: 'c2', blockId: 'b2', name: 'C2' });
		const c3 = makeConcept({ id: 'c3', blockId: 'b1', name: 'C3' });

		const blockService = new FakeBlockService({ byCourseId: [b1, b2] });
		const conceptService = new FakeConceptService({ byBlockIds: [c1, c2, c3] });

		const { facade } = makeFacade({ blockService, conceptService });

		const res = await facade.getManyByCourseId('course1');

		expect(res.length).toBe(2);
		expect(res[0].id).toBe('b1');
		expect(res[0].concepts.map((c: any) => c.id).sort()).toEqual(['c1', 'c3']);
		expect(res[1].id).toBe('b2');
		expect(res[1].concepts.map((c: any) => c.id)).toEqual(['c2']);
	});
});

describe('BlockFacade identifyConcepts', () => {
	it('returns identified concepts when fileText exists', async () => {
		const bucketService = new FakeBucketService({ fileText: 'some content' });
		const openAiService = new FakeOpenAiService({
			identifyConcepts: ['HTTP', 'TCP']
		});

		const { facade } = makeFacade({ bucketService, openAiService });

		const res = await facade.identifyConcepts('path/to/doc.txt');

		expect(res.documentPath).toBe('path/to/doc.txt');
		expect(res.concepts).toEqual(['HTTP', 'TCP']);
	});

	it('throws when fileText is missing', async () => {
		const bucketService = new FakeBucketService({ fileText: null });
		const { facade } = makeFacade({ bucketService });

		await expect(facade.identifyConcepts('path/to/doc.txt')).rejects.toThrow(
			'Failed to load file text for concept identification'
		);
	});
});

describe('BlockFacade createBlock', () => {
	it('creates block, document, concepts and typesense chunks', async () => {
		const blockService = new FakeBlockService();
		const conceptService = new FakeConceptService();
		const typesenseService = new FakeTypesenseService({ exists: false });
		const openAiService = new FakeOpenAiService({
			preRetrievalTransform: 'cleaned chunk'
		});
		const chunkerService = new FakeChunkerService({
			chunks: ['raw chunk 1', 'raw chunk 2']
		});
		const bucketService = new FakeBucketService({
			fileText: 'file content'
		});
		const documentService = new FakeDocumentService();

		const { facade } = makeFacade({
			blockService,
			conceptService,
			typesenseService,
			openAiService,
			chunkerService,
			bucketService,
			documentService
		});

		const originalTransaction = (db as any).transaction;
		(db as any).transaction = async (fn: any) => {
			return await fn({} as any);
		};

		const data = {
			name: 'New block',
			courseId: 'course1',
			documentPath: 'doc1.txt',
			chunkingStrategy: 'rtc' as 'rtc' | 'semantic',
			useLLMTransformation: true,
			concepts: [
				{ name: 'C1', difficultyIndex: 1 },
				{ name: 'C2', difficultyIndex: 2 }
			]
		};

		try {
			const res = await facade.createBlock(data);

			expect(res.name).toBe('New block');
			expect(res.courseId).toBe('course1');
			expect(res.concepts.length).toBe(2);
			expect(res.concepts[0].blockId).toBe(res.id);

			expect(blockService.calls.create.length).toBe(1);
			expect(conceptService.calls.createMany.length).toBe(1);
			expect(documentService.calls.create.length).toBe(1);
			expect(typesenseService.calls.createMany.length).toBe(1);
			expect(chunkerService.calls.chunk.length).toBe(1);
			expect(bucketService.calls.getBlockDataFileString.length).toBe(1);
		} finally {
			(db as any).transaction = originalTransaction;
		}
	});

	it('throws when typesense chunk already exists for block', async () => {
		const blockService = new FakeBlockService();
		const conceptService = new FakeConceptService();
		const typesenseService = new FakeTypesenseService({ exists: true });
		const bucketService = new FakeBucketService({ fileText: 'file content' });
		const chunkerService = new FakeChunkerService();
		const documentService = new FakeDocumentService();
		const openAiService = new FakeOpenAiService();

		const { facade } = makeFacade({
			blockService,
			conceptService,
			typesenseService,
			bucketService,
			chunkerService,
			documentService,
			openAiService
		});

		const originalTransaction = (db as any).transaction;
		(db as any).transaction = async (fn: any) => {
			return await fn({} as any);
		};

		const data = {
			name: 'New block',
			courseId: 'course1',
			documentPath: 'doc1.txt',
			chunkingStrategy: 'rtc' as 'rtc' | 'semantic',
			useLLMTransformation: false,
			concepts: [{ name: 'C1', difficultyIndex: 1 }]
		};

		await expect(facade.createBlock(data)).rejects.toThrow(
			'Typesense document for block with id created-block does already exist'
		);

		(db as any).transaction = originalTransaction;
	});

	it('throws when file text for block creation is missing', async () => {
		const blockService = new FakeBlockService();
		const conceptService = new FakeConceptService();
		const typesenseService = new FakeTypesenseService({ exists: false });
		const bucketService = new FakeBucketService({ fileText: null });
		const chunkerService = new FakeChunkerService();
		const documentService = new FakeDocumentService();
		const openAiService = new FakeOpenAiService();

		const { facade } = makeFacade({
			blockService,
			conceptService,
			typesenseService,
			bucketService,
			chunkerService,
			documentService,
			openAiService
		});

		const originalTransaction = (db as any).transaction;
		(db as any).transaction = async (fn: any) => {
			return await fn({} as any);
		};

		const data = {
			name: 'New block',
			courseId: 'course1',
			documentPath: 'doc1.txt',
			chunkingStrategy: 'rtc' as 'rtc' | 'semantic',
			useLLMTransformation: false,
			concepts: [{ name: 'C1', difficultyIndex: 1 }]
		};

		await expect(facade.createBlock(data)).rejects.toThrow(
			'Failed to load file text for block creation'
		);

		(db as any).transaction = originalTransaction;
	});
});

describe('BlockFacade getById', () => {
	it('returns block with concept names', async () => {
		const block = makeBlock({ id: 'b1', name: 'Block 1' });
		const c1 = makeConcept({ id: 'c1', blockId: 'b1', name: 'Concept A' });
		const c2 = makeConcept({ id: 'c2', blockId: 'b1', name: 'Concept B' });

		const blockService = new FakeBlockService({ created: block });
		const conceptService = new FakeConceptService({ byBlockId: [c1, c2] });

		const { facade } = makeFacade({ blockService, conceptService });

		const res = await facade.getById('b1');

		expect(res.id).toBe('b1');
		expect(res.concepts).toEqual(['Concept A', 'Concept B']);
	});
});
