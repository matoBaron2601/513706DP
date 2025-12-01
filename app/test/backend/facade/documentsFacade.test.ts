import { describe, it, expect } from 'bun:test';
import { DocumentFacade } from '../../../src/facades/documentFacade';
import type { CreateDocumentDto, DocumentDto } from '../../../src/db/schema';

type TypesenseDoc = {
	block_id: string;
	chunk_index: number;
	content: string;
	documentPath: string;
};

function makeDocument(overrides: Partial<DocumentDto> = {}): DocumentDto {
	return {
		id: 'd1',
		blockId: 'b1',
		filePath: 'file1.txt',
		isMain: true,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

class FakeDocumentService {
	fixtures: {
		created?: DocumentDto;
		deletedByFilePath?: DocumentDto;
	} = {};
	calls = {
		create: [] as CreateDocumentDto[],
		deleteByFilePath: [] as string[]
	};

	constructor(
		fixtures: {
			created?: DocumentDto;
			deletedByFilePath?: DocumentDto;
		} = {}
	) {
		this.fixtures = fixtures;
	}

	async create(dto: CreateDocumentDto): Promise<DocumentDto> {
		this.calls.create.push(dto);
		if (!this.fixtures.created) {
			this.fixtures.created = makeDocument({
				id: 'created-doc',
				blockId: dto.blockId,
				filePath: dto.filePath,
				isMain: dto.isMain
			});
		}
		return this.fixtures.created;
	}

	async deleteByFilePath(filePath: string): Promise<DocumentDto> {
		this.calls.deleteByFilePath.push(filePath);
		if (!this.fixtures.deletedByFilePath) {
			this.fixtures.deletedByFilePath = makeDocument({
				filePath
			});
		}
		return this.fixtures.deletedByFilePath;
	}
}

class FakeTypesenseService {
	calls = {
		createMany: [] as TypesenseDoc[][],
		deleteByDocumentPath: [] as { blockId: string; documentPath: string }[]
	};

	async createMany(docs: TypesenseDoc[]): Promise<void> {
		this.calls.createMany.push(docs);
	}

	async deleteByDocumentPath(blockId: string, documentPath: string): Promise<void> {
		this.calls.deleteByDocumentPath.push({ blockId, documentPath });
	}
}

class FakeChunkerService {
	fixtures: { chunks?: string[] } = {};
	calls = {
		chunk: [] as { strategy: string; text: string | null }[]
	};

	constructor(fixtures: { chunks?: string[] } = {}) {
		this.fixtures = fixtures;
	}

	async chunk(strategy: string, text: string | null): Promise<string[]> {
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

function makeFacade(deps?: {
	documentService?: FakeDocumentService;
	typesenseService?: FakeTypesenseService;
	chunkerService?: FakeChunkerService;
	bucketService?: FakeBucketService;
}) {
	const facade = new DocumentFacade();
	const anyFacade = facade as any;

	const documentService = deps?.documentService ?? new FakeDocumentService();
	const typesenseService = deps?.typesenseService ?? new FakeTypesenseService();
	const chunkerService = deps?.chunkerService ?? new FakeChunkerService();
	const bucketService = deps?.bucketService ?? new FakeBucketService({ fileText: 'file text' });

	anyFacade.documentService = documentService;
	anyFacade.typesenseService = typesenseService;
	anyFacade.chunkerService = chunkerService;
	anyFacade.bucketService = bucketService;

	return {
		facade,
		documentService,
		typesenseService,
		chunkerService,
		bucketService
	};
}

describe('DocumentFacade uploadDocument', () => {
	it('creates document, chunks text and indexes in typesense', async () => {
		const documentService = new FakeDocumentService();
		const typesenseService = new FakeTypesenseService();
		const chunkerService = new FakeChunkerService({
			chunks: ['chunk A', 'chunk B']
		});
		const bucketService = new FakeBucketService({
			fileText: 'file content'
		});

		const { facade } = makeFacade({
			documentService,
			typesenseService,
			chunkerService,
			bucketService
		});

		const input: CreateDocumentDto = {
			blockId: 'b1',
			filePath: 'file1.txt',
			isMain: true
		} as CreateDocumentDto;

		const res = await facade.uploadDocument(input);

		expect(documentService.calls.create.length).toBe(1);
		expect(documentService.calls.create[0]).toEqual(input);

		expect(bucketService.calls.getBlockDataFileString.length).toBe(1);
		expect(bucketService.calls.getBlockDataFileString[0]).toBe('file1.txt');

		expect(chunkerService.calls.chunk.length).toBe(1);
		expect(chunkerService.calls.chunk[0].strategy).toBe('rtc');
		expect(chunkerService.calls.chunk[0].text).toBe('file content');

		expect(typesenseService.calls.createMany.length).toBe(1);
		const docs = typesenseService.calls.createMany[0];
		expect(docs.length).toBe(2);
		expect(docs[0]).toEqual({
			block_id: 'b1',
			chunk_index: 0,
			content: 'chunk A',
			documentPath: 'file1.txt'
		});
		expect(docs[1]).toEqual({
			block_id: 'b1',
			chunk_index: 1,
			content: 'chunk B',
			documentPath: 'file1.txt'
		});

		expect(res.blockId).toBe('b1');
		expect(res.filePath).toBe('file1.txt');
	});
});

describe('DocumentFacade deleteDocument', () => {
	it('deletes document and removes it from typesense', async () => {
		const doc = makeDocument({ id: 'd1', blockId: 'b1', filePath: 'file1.txt' });
		const documentService = new FakeDocumentService({
			deletedByFilePath: doc
		});
		const typesenseService = new FakeTypesenseService();

		const { facade } = makeFacade({
			documentService,
			typesenseService
		});

		const res = await facade.deleteDocumentByFilePath('file1.txt');

		expect(documentService.calls.deleteByFilePath.length).toBe(1);
		expect(documentService.calls.deleteByFilePath[0]).toBe('file1.txt');

		expect(typesenseService.calls.deleteByDocumentPath.length).toBe(1);
		expect(typesenseService.calls.deleteByDocumentPath[0]).toEqual({
			blockId: 'b1',
			documentPath: 'file1.txt'
		});

		expect(res).toEqual(doc);
	});
});
