import { describe, it, expect } from 'bun:test';
import type { DocumentDto } from '../../../src/db/schema';
import type { DocumentService } from '../../../src/services/documentService';
import type { DocumentFacade } from '../../../src/facades/documentFacade';
import type { BucketService } from '../../../src/services/bucketService';
import { createDocumentApi } from '../../../src/routes/api/[...slugs]/documentApi';

function makeDocument(overrides: Partial<DocumentDto> = {}): DocumentDto {
	return {
		id: 'doc1',
		blockId: 'b1',
		filePath: 'file.txt',
		isMain: false,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	} as DocumentDto;
}

class FakeDocumentService {
	calls = {
		getById: [] as string[],
		getByBlockId: [] as string[]
	};
	fixtures: {
		getById?: DocumentDto;
		getByBlockId?: DocumentDto[];
	} = {};

	constructor(fixtures: Partial<FakeDocumentService['fixtures']> = {}) {
		this.fixtures = { ...this.fixtures, ...fixtures };
	}

	async getById(id: string): Promise<DocumentDto> {
		this.calls.getById.push(id);
		return this.fixtures.getById ?? makeDocument({ id });
	}

	async getByBlockId(blockId: string): Promise<DocumentDto[]> {
		this.calls.getByBlockId.push(blockId);
		return (
			this.fixtures.getByBlockId ?? [
				makeDocument({ id: 'doc1', blockId }),
				makeDocument({ id: 'doc2', blockId, filePath: 'file2.txt' })
			]
		);
	}
}

class FakeDocumentFacade {
	calls = {
		uploadDocument: [] as any[],
		deleteDocument: [] as string[]
	};
	fixtures: {
		uploadDocument?: DocumentDto;
		deleteDocument?: DocumentDto;
	} = {};

	constructor(fixtures: Partial<FakeDocumentFacade['fixtures']> = {}) {
		this.fixtures = { ...this.fixtures, ...fixtures };
	}

	async uploadDocument(data: { blockId: string; filePath: string; isMain: boolean }) {
		this.calls.uploadDocument.push(data);
		return (
			this.fixtures.uploadDocument ??
			makeDocument({ blockId: data.blockId, filePath: data.filePath, isMain: data.isMain })
		);
	}

	async deleteDocument(filePath: string) {
		this.calls.deleteDocument.push(filePath);
		return this.fixtures.deleteDocument ?? makeDocument({ filePath });
	}
}

class FakeBucketService {
	calls = {
		uploadBlockDataFile: [] as any[]
	};
	fixtures: { uploadedPath?: string } = {};

	constructor(fixtures: Partial<FakeBucketService['fixtures']> = {}) {
		this.fixtures = { ...this.fixtures, ...fixtures };
	}

	async uploadBlockDataFile(document: any): Promise<string> {
		this.calls.uploadBlockDataFile.push(document);
		return this.fixtures.uploadedPath ?? 'uploaded/path.txt';
	}
}

function createAppWithDeps(opts?: {
	documentService?: FakeDocumentService;
	documentFacade?: FakeDocumentFacade;
	bucketService?: FakeBucketService;
}) {
	const documentService = opts?.documentService ?? new FakeDocumentService();
	const documentFacade = opts?.documentFacade ?? new FakeDocumentFacade();
	const bucketService = opts?.bucketService ?? new FakeBucketService();

	return {
		app: createDocumentApi({
			documentService: documentService as unknown as DocumentService,
			documentFacade: documentFacade as unknown as DocumentFacade,
			bucketService: bucketService as unknown as BucketService
		}),
		documentService,
		documentFacade,
		bucketService
	};
}

describe('documentApi', () => {
	it('GET /document/:id returns document by id and calls DocumentService.getById', async () => {
		const doc = makeDocument({ id: 'doc-123', filePath: 'some.txt' });
		const documentService = new FakeDocumentService({ getById: doc });

		const { app } = createAppWithDeps({ documentService });

		const res = await app.handle(
			new Request('http://localhost/document/doc-123', {
				method: 'GET'
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();

		expect(documentService.calls.getById).toEqual(['doc-123']);
		expect(body.id).toBe('doc-123');
		expect(body.filePath).toBe('some.txt');
	});

	it('GET /document/blockId/:blockId returns documents for given block and calls getByBlockId', async () => {
		const docs = [
			makeDocument({ id: 'doc1', blockId: 'b-1', filePath: 'a.txt' }),
			makeDocument({ id: 'doc2', blockId: 'b-1', filePath: 'b.txt' })
		];
		const documentService = new FakeDocumentService({ getByBlockId: docs });

		const { app } = createAppWithDeps({ documentService });

		const res = await app.handle(
			new Request('http://localhost/document/blockId/b-1', {
				method: 'GET'
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();

		expect(documentService.calls.getByBlockId).toEqual(['b-1']);
		expect(Array.isArray(body)).toBe(true);
		expect(body.length).toBe(2);
		expect(body[0].blockId).toBe('b-1');
		expect(body[0].filePath).toBe('a.txt');
	});

	it('POST /document uploads file via BucketService and creates document via DocumentFacade', async () => {
		const documentFacade = new FakeDocumentFacade({
			uploadDocument: makeDocument({
				id: 'doc-uploaded',
				blockId: 'block-1',
				filePath: 'uploaded/path.txt',
				isMain: false
			})
		});
		const bucketService = new FakeBucketService({ uploadedPath: 'uploaded/path.txt' });

		const { app } = createAppWithDeps({ documentFacade, bucketService });

		const form = new FormData();
		const file = new File(['file-content'], 'myfile.txt', { type: 'text/plain' });

		// createDocumentRequestSchema pravdepodobne očakáva:
		// { blockId: string (uuid?), document: File }
		form.append('blockId', 'block-1');
		form.append('document', file);

		const res = await app.handle(
			new Request('http://localhost/document', {
				method: 'POST',
				body: form
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();

		// BucketService
		expect(bucketService.calls.uploadBlockDataFile.length).toBe(1);
		expect(bucketService.calls.uploadBlockDataFile[0]).toBeInstanceOf(File);
		expect(bucketService.calls.uploadBlockDataFile[0].name).toBe('myfile.txt');

		// DocumentFacade
		expect(documentFacade.calls.uploadDocument.length).toBe(1);
		expect(documentFacade.calls.uploadDocument[0]).toEqual({
			blockId: 'block-1',
			filePath: 'uploaded/path.txt',
			isMain: false
		});

		expect(body.id).toBe('doc-uploaded');
		expect(body.blockId).toBe('block-1');
		expect(body.filePath).toBe('uploaded/path.txt');
		expect(body.isMain).toBe(false);
	});

	it('DELETE /document deletes by documentPath via DocumentFacade.deleteDocument', async () => {
		const deletedDoc = makeDocument({ id: 'doc-del', filePath: 'to-delete.txt' });
		const documentFacade = new FakeDocumentFacade({ deleteDocument: deletedDoc });

		const { app } = createAppWithDeps({ documentFacade });

		const payload = { documentPath: 'to-delete.txt' };

		const res = await app.handle(
			new Request('http://localhost/document', {
				method: 'DELETE',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(payload)
			})
		);

		expect(res.status).toBe(200);
		const body = await res.json();

		expect(documentFacade.calls.deleteDocument).toEqual(['to-delete.txt']);
		expect(body.id).toBe('doc-del');
		expect(body.filePath).toBe('to-delete.txt');
	});
});
