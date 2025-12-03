import { describe, it, expect } from 'bun:test';
import type { CourseDto } from '../../../src/db/schema';
import type { GetCoursesResponse } from '../../../src/schemas/courseSchema';
import type { CourseService } from '../../../src/services/courseService';
import { createCourseApi } from '../../../src/routes/api/[...slugs]/courseApi';

function makeCourse(overrides: Partial<CourseDto> = {}): CourseDto {
    return {
        id: 'c1',
        name: 'Test course',
        creatorId: 'u1',
        published: false,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: null,
        deletedAt: null,
        ...overrides
    } as CourseDto;
}

// --- NEW/MODIFIED CODE HERE ---

class FakeCourseFacade {
    // Placeholder for the method used by the API, even though we don't test this route here.
    async getAvailableCoursesWithBlockCount(id: string): Promise<any> {
        return [];
    }
}

// --- NEW/MODIFIED CODE HERE ---

class FakeCourseService {
    calls = {
        getById: [] as string[],
        // getAll is no longer needed since the route POST /course/filtered is not in the API
        create: [] as any[],
        delete: [] as { id: string; email: string }[],
        publishCourse: [] as { id: string; email: string }[],
        unpublishCourse: [] as { id: string; email: string }[]
    };

    fixtures: {
        getById?: CourseDto;
        getAll?: GetCoursesResponse[]; // Kept for completeness, though not used
        create?: CourseDto;
        delete?: CourseDto;
        publishCourse?: CourseDto;
        unpublishCourse?: CourseDto;
    } = {};

    constructor(fixtures: Partial<FakeCourseService['fixtures']> = {}) {
        this.fixtures = { ...this.fixtures, ...fixtures };
    }

    async getById(id: string): Promise<CourseDto> {
        this.calls.getById.push(id);
        return this.fixtures.getById ?? makeCourse({ id });
    }

    // Keep getAll for the service, but the test using it is removed
    async getAll(filter: any): Promise<GetCoursesResponse[]> {
        // this.calls.getAll.push(filter); // Removed call logging as test is removed
        return this.fixtures.getAll ?? [];
    }

    async create(data: any): Promise<CourseDto> {
        this.calls.create.push(data);
        return (
            this.fixtures.create ??
            makeCourse({
                id: 'created',
                name: data.name,
                creatorId: data.creatorId
            })
        );
    }

    async delete(id: string, email: string): Promise<CourseDto> {
        this.calls.delete.push({ id, email });
        return this.fixtures.delete ?? makeCourse({ id });
    }

    async publishCourse(id: string, email: string): Promise<CourseDto> {
        this.calls.publishCourse.push({ id, email });
        return this.fixtures.publishCourse ?? makeCourse({ id, published: true });
    }

    async unpublishCourse(id: string, email: string): Promise<CourseDto> {
        this.calls.unpublishCourse.push({ id, email });
        return this.fixtures.unpublishCourse ?? makeCourse({ id, published: false });
    }
}

function createAppWithService(service: FakeCourseService) {
    return createCourseApi(new FakeCourseFacade() as any, service as unknown as CourseService);
}

describe('courseApi', () => {
    it('GET /course/:id calls service.getById and returns course', async () => {
        const course = makeCourse({ id: 'c123', name: 'Algorithms' });
        const service = new FakeCourseService({ getById: course });
        const app = createAppWithService(service);

        const res = await app.handle(new Request('http://localhost/course/c123', { method: 'GET' }));

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(service.calls.getById).toEqual(['c123']);
        expect(body.id).toBe('c123');
        expect(body.name).toBe('Algorithms');
    });

    it('POST /course calls service.create and returns created course', async () => {
        const created = makeCourse({ id: 'new', name: 'New Course', creatorId: 'creator-1' });
        const service = new FakeCourseService({ create: created });
        const app = createAppWithService(service);

        const payload = {
            name: 'New Course',
            creatorId: 'creator-1',
            published: false
        };

        const res = await app.handle(
            new Request('http://localhost/course', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(payload)
            })
        );

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(service.calls.create.length).toBe(1);
        expect(service.calls.create[0]).toEqual(payload);
        expect(body.id).toBe('new');
        expect(body.name).toBe('New Course');
    });

    it('DELETE /course/:id calls service.delete with id and email header', async () => {
        const course = makeCourse({ id: 'c-del' });
        const service = new FakeCourseService({ delete: course });
        const app = createAppWithService(service);

        const res = await app.handle(
            new Request('http://localhost/course/c-del', {
                method: 'DELETE',
                headers: { 'x-user-email': 'user@example.com' }
            })
        );

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(service.calls.delete.length).toBe(1);
        expect(service.calls.delete[0]).toEqual({ id: 'c-del', email: 'user@example.com' });
        expect(body.id).toBe('c-del');
    });

    it('PUT /course/:id/publish calls service.publishCourse', async () => {
        const course = makeCourse({ id: 'c-pub', published: true });
        const service = new FakeCourseService({ publishCourse: course });
        const app = createAppWithService(service);

        const res = await app.handle(
            new Request('http://localhost/course/c-pub/publish', {
                method: 'PUT',
                headers: { 'x-user-email': 'creator@example.com' }
            })
        );

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(service.calls.publishCourse.length).toBe(1);
        expect(service.calls.publishCourse[0]).toEqual({
            id: 'c-pub',
            email: 'creator@example.com'
        });
        expect(body.published).toBe(true);
    });

    it('PUT /course/:id/unpublish calls service.unpublishCourse', async () => {
        const course = makeCourse({ id: 'c-unpub', published: false });
        const service = new FakeCourseService({ unpublishCourse: course });
        const app = createAppWithService(service);

        const res = await app.handle(
            new Request('http://localhost/course/c-unpub/unpublish', {
                method: 'PUT',
                headers: { 'x-user-email': 'creator@example.com' }
            })
        );

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(service.calls.unpublishCourse.length).toBe(1);
        expect(service.calls.unpublishCourse[0]).toEqual({
            id: 'c-unpub',
            email: 'creator@example.com'
        });
        expect(body.published).toBe(false);
    });
});