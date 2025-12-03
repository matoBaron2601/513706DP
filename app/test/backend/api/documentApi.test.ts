import { describe, it, expect } from 'bun:test';
import type { DocumentDto } from '../../../src/db/schema';
import type { DocumentService } from '../../../src/services/documentService';
import type { DocumentFacade } from '../../../src/facades/documentFacade';
import type { BucketService } from '../../../src/services/bucketService';
import { createDocumentApi } from '../../../src/routes/api/[...slugs]/documentApi';

// Note: Using DocumentDto as per the user's provided code structure
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
        getById?: DocumentDto | undefined;
        getByBlockId?: DocumentDto[];
    } = {};

    constructor(fixtures: Partial<FakeDocumentService['fixtures']> = {}) {
        this.fixtures = { ...this.fixtures, ...fixtures };
    }

    async getById(id: string): Promise<DocumentDto | undefined> {
        this.calls.getById.push(id);
        return this.fixtures.getById;
    }

    async getByBlockId(blockId: string): Promise<DocumentDto[]> {
        this.calls.getByBlockId.push(blockId);
        return this.fixtures.getByBlockId ?? [];
    }
}

class FakeDocumentFacade {
    calls = {
        uploadDocument: [] as any[],
        // FIX: Renamed to match the API route
        deleteDocumentByFilePath: [] as string[]
    };
    fixtures: {
        uploadDocument?: DocumentDto;
        // FIX: Renamed to match the API route
        deleteDocumentByFilePath?: DocumentDto;
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

    // FIX: Renamed the method to match the API route
    async deleteDocumentByFilePath(filePath: string) {
        this.calls.deleteDocumentByFilePath.push(filePath);
        return this.fixtures.deleteDocumentByFilePath ?? makeDocument({ filePath });
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
    // Re-defined constants for consistency
    const BLOCK_ID = 'b-1';
    const DOCUMENT_ID = 'doc-123';
    const FILE_PATH = 'uploaded/path.txt';

    it('GET /document/:id returns document by id and calls DocumentService.getById', async () => {
        const doc = makeDocument({ id: DOCUMENT_ID, filePath: 'some.txt' });
        const documentService = new FakeDocumentService({ getById: doc });

        const { app } = createAppWithDeps({ documentService });

        const res = await app.handle(
            new Request(`http://localhost/document/${DOCUMENT_ID}`, {
                method: 'GET'
            })
        );

        expect(res.status).toBe(200);
        const body = await res.json();

        expect(documentService.calls.getById).toEqual([DOCUMENT_ID]);
        expect(body.id).toBe(DOCUMENT_ID);
        expect(body.filePath).toBe('some.txt');
    });

    it('GET /document/:id returns 200 with empty body when not found', async () => {
        const documentService = new FakeDocumentService({ getById: undefined });
        const { app } = createAppWithDeps({ documentService });

        const res = await app.handle(
            new Request(`http://localhost/document/${DOCUMENT_ID}`, {
                method: 'GET'
            })
        );

        expect(res.status).toBe(200);
        expect(await res.text()).toBe('');
        expect(documentService.calls.getById).toEqual([DOCUMENT_ID]);
    });


    it('GET /document/blockId/:blockId returns documents for given block and calls getByBlockId', async () => {
        const docs = [
            makeDocument({ id: 'doc1', blockId: BLOCK_ID, filePath: 'a.txt' }),
            makeDocument({ id: 'doc2', blockId: BLOCK_ID, filePath: 'b.txt' })
        ];
        const documentService = new FakeDocumentService({ getByBlockId: docs });

        const { app } = createAppWithDeps({ documentService });

        const res = await app.handle(
            new Request(`http://localhost/document/blockId/${BLOCK_ID}`, {
                method: 'GET'
            })
        );

        expect(res.status).toBe(200);
        const body = await res.json();

        expect(documentService.calls.getByBlockId).toEqual([BLOCK_ID]);
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(2);
        expect(body[0].blockId).toBe(BLOCK_ID);
        expect(body[0].filePath).toBe('a.txt');
    });

    it('GET /document/blockId/:blockId returns empty array when no documents found', async () => {
        const documentService = new FakeDocumentService({ getByBlockId: [] });
        const { app } = createAppWithDeps({ documentService });

        const res = await app.handle(
            new Request(`http://localhost/document/blockId/${BLOCK_ID}`, {
                method: 'GET'
            })
        );

        expect(res.status).toBe(200);
        const body = await res.json();

        expect(documentService.calls.getByBlockId).toEqual([BLOCK_ID]);
        expect(body).toEqual([]);
    });

    it('POST /document uploads file via BucketService and creates document via DocumentFacade', async () => {
        const documentFacade = new FakeDocumentFacade({
            uploadDocument: makeDocument({
                id: 'doc-uploaded',
                blockId: BLOCK_ID,
                filePath: FILE_PATH,
                isMain: false
            })
        });
        const bucketService = new FakeBucketService({ uploadedPath: FILE_PATH });

        const { app } = createAppWithDeps({ documentFacade, bucketService });

        // Test with FormData for file upload, matching user's intent in the failing test
        const form = new FormData();
        const file = new File(['file-content'], 'myfile.txt', { type: 'text/plain' });

        form.append('blockId', BLOCK_ID);
        form.append('document', file);

        const res = await app.handle(
            new Request('http://localhost/document', {
                method: 'POST',
                body: form
            })
        );

        expect(res.status).toBe(200);
        const body = await res.json();

        // BucketService assertions
        expect(bucketService.calls.uploadBlockDataFile.length).toBe(1);
        // Assert that the request body parser passed the File object to the service
        expect(bucketService.calls.uploadBlockDataFile[0]).toBeInstanceOf(File);
        expect(bucketService.calls.uploadBlockDataFile[0].name).toBe('myfile.txt');

        // DocumentFacade assertions
        expect(documentFacade.calls.uploadDocument.length).toBe(1);
        expect(documentFacade.calls.uploadDocument[0]).toEqual({
            blockId: BLOCK_ID,
            filePath: FILE_PATH,
            isMain: false
        });

        expect(body.id).toBe('doc-uploaded');
        expect(body.blockId).toBe(BLOCK_ID);
        expect(body.filePath).toBe(FILE_PATH);
        expect(body.isMain).toBe(false);
    });

    it('DELETE /document deletes by documentPath via DocumentFacade.deleteDocumentByFilePath', async () => {
        const deletedDoc = makeDocument({ id: 'doc-del', filePath: 'to-delete.txt' });
        // FIX: Use the correct method name in fixtures
        const documentFacade = new FakeDocumentFacade({ deleteDocumentByFilePath: deletedDoc });

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

        // FIX: Use the correct method name in calls
        expect(documentFacade.calls.deleteDocumentByFilePath).toEqual(['to-delete.txt']);
        expect(body.id).toBe('doc-del');
        expect(body.filePath).toBe('to-delete.txt');
    });
});