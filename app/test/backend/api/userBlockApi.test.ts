import { describe, it, expect } from 'bun:test';
import type { UserBlock, CreateUserBlock } from '../../../src/schemas/userBlockSchema';
import type { UserBlockFacade } from '../../../src/facades/userBlockFacade';
import type { UserBlockService } from '../../../src/services/userBlockService';
import { createUserBlockApi } from '../../../src/routes/api/[...slugs]/userBlockApi';

function makeUserBlock(overrides: Partial<UserBlock> = {}): UserBlock {
    return {
        id: 'ub1',
        userId: '11111111-1111-1111-1111-111111111111',
        blockId: '22222222-2222-2222-2222-222222222222',
        completed: false,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: null,
        deletedAt: null,
        ...overrides
    } as UserBlock;
}

class FakeUserBlockFacade {
    calls = {
        // FIX: Renamed to match the facade method name
        getOrCreateUserBlock: [] as CreateUserBlock[]
    };
    fixtures: { 
        // FIX: Renamed to match the facade method name
        getOrCreateUserBlock?: UserBlock 
    } = {};

    constructor(fixtures: Partial<FakeUserBlockFacade['fixtures']> = {}) {
        this.fixtures = { ...this.fixtures, ...fixtures };
    }

    // FIX: Renamed the method
    async getOrCreateUserBlock(data: CreateUserBlock): Promise<UserBlock> {
        this.calls.getOrCreateUserBlock.push(data);
        return this.fixtures.getOrCreateUserBlock ?? makeUserBlock(data);
    }
}

class FakeUserBlockService {
    calls = {
        // FIX: Renamed to match the service method name
        getByUserIdAndBlockIdOrUndefined: [] as { userId: string; blockId: string }[]
    };
    fixtures: { 
        // FIX: Renamed to match the service method name
        getByUserIdAndBlockIdOrUndefined?: UserBlock | undefined 
    } = {};

    constructor(fixtures: Partial<FakeUserBlockService['fixtures']> = {}) {
        this.fixtures = { ...this.fixtures, ...fixtures };
    }

    // FIX: Renamed the method
    async getByUserIdAndBlockIdOrUndefined(data: {
        userId: string;
        blockId: string;
    }): Promise<UserBlock | undefined> {
        this.calls.getByUserIdAndBlockIdOrUndefined.push(data);
        return this.fixtures.getByUserIdAndBlockIdOrUndefined;
    }
}

function createAppWithDeps(opts?: {
    userBlockFacade?: FakeUserBlockFacade;
    userBlockService?: FakeUserBlockService;
}) {
    const userBlockFacade = opts?.userBlockFacade ?? new FakeUserBlockFacade();
    const userBlockService = opts?.userBlockService ?? new FakeUserBlockService();

    return {
        app: createUserBlockApi({
            userBlockFacade: userBlockFacade as unknown as UserBlockFacade,
            userBlockService: userBlockService as unknown as UserBlockService
        }),
        userBlockFacade,
        userBlockService
    };
}

describe('userBlockApi', () => {
    it('POST /userBlock creates or returns existing userBlock via facade.getOrCreateUserBlock', async () => {
        const ub = makeUserBlock({
            id: 'ub-123',
            userId: '11111111-1111-1111-1111-111111111111',
            blockId: '22222222-2222-2222-2222-222222222222',
            completed: false
        });

        // FIX: Use the new fixture name
        const facade = new FakeUserBlockFacade({ getOrCreateUserBlock: ub });
        const { app } = createAppWithDeps({ userBlockFacade: facade });

        const payload: CreateUserBlock = {
            userId: '11111111-1111-1111-1111-111111111111',
            blockId: '22222222-2222-2222-2222-222222222222',
            completed: false
        };

        const res = await app.handle(
            new Request('http://localhost/userBlock', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(payload)
            })
        );

        expect(res.status).toBe(200);
        const body = await res.json();

        // FIX: Use the new call name
        expect(facade.calls.getOrCreateUserBlock.length).toBe(1);
        expect(facade.calls.getOrCreateUserBlock[0]).toEqual(payload);

        expect(body.id).toBe('ub-123');
        expect(body.userId).toBe(payload.userId);
        expect(body.blockId).toBe(payload.blockId);
        expect(body.completed).toBe(false);
    });

    it('GET /userBlock/user/:userId/block/:blockId returns userBlock when found', async () => {
        const ub = makeUserBlock({
            id: 'ub-found',
            userId: '11111111-1111-1111-1111-111111111111',
            blockId: '22222222-2222-2222-2222-222222222222'
        });

        // FIX: Use the new fixture name
        const service = new FakeUserBlockService({
            getByUserIdAndBlockIdOrUndefined: ub
        });
        const { app } = createAppWithDeps({ userBlockService: service });

        const res = await app.handle(
            new Request(
                'http://localhost/userBlock/user/11111111-1111-1111-1111-111111111111/block/22222222-2222-2222-2222-222222222222',
                {
                    method: 'GET',
                    headers: { 'x-user-email': 'user@example.com' }
                }
            )
        );

        expect(res.status).toBe(200);
        const body = await res.json();

        // FIX: Use the new call name
        expect(service.calls.getByUserIdAndBlockIdOrUndefined.length).toBe(1);
        expect(service.calls.getByUserIdAndBlockIdOrUndefined[0]).toEqual({
            userId: '11111111-1111-1111-1111-111111111111',
            blockId: '22222222-2222-2222-2222-222222222222'
        });

        expect(body.id).toBe('ub-found');
        expect(body.userId).toBe('11111111-1111-1111-1111-111111111111');
        expect(body.blockId).toBe('22222222-2222-2222-2222-222222222222');
    });

    it('GET /userBlock/user/:userId/block/:blockId returns empty body when not found', async () => {
        // FIX: Use the new fixture name
        const service = new FakeUserBlockService({
            getByUserIdAndBlockIdOrUndefined: undefined
        });
        const { app } = createAppWithDeps({ userBlockService: service });

        const res = await app.handle(
            new Request(
                'http://localhost/userBlock/user/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/block/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                {
                    method: 'GET',
                    headers: { 'x-user-email': 'user@example.com' }
                }
            )
        );

        expect(res.status).toBe(200);
        const text = await res.text();

        // FIX: Use the new call name
        expect(service.calls.getByUserIdAndBlockIdOrUndefined.length).toBe(1);
        expect(service.calls.getByUserIdAndBlockIdOrUndefined[0]).toEqual({
            userId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            blockId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
        });

        expect(text).toBe('');
    });
});