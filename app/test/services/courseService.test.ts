import { describe, it, expect } from 'bun:test';
import type { CourseDto, CreateCourseDto, UpdateCourseDto, BlockDto, UserDto } from '../../src/db/schema';
import type { Transaction } from '../../src/types';
import type { GetCoursesRequest, GetCoursesResponse } from '../../src/schemas/courseSchema';
import { CourseService } from '../../src/services/courseService';
import { CourseRepository } from '../../src/repositories/courseRepository';
import { BlockRepository } from '../../src/repositories/blockRepository';
import { UserRepository } from '../../src/repositories/userRepository';
import { NotFoundError, ConflictError, UnauthorizedError } from '../../src/errors/AppError';

function makeCourse(overrides: Partial<CourseDto> = {}): CourseDto {
	return {
		id: 'course1',
		name: 'Test course',
		creatorId: 'user1',
		published: false,
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

function makeBlock(overrides: Partial<BlockDto> = {}): BlockDto {
	return {
		id: 'b1',
		name: 'Block 1',
		courseId: 'course1',
		documentPath: '/doc',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

function makeUser(overrides: Partial<UserDto> = {}): UserDto {
	return {
		id: 'user1',
		name: 'User',
		email: 'user@example.com',
		profilePicture: 'pic',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: null,
		deletedAt: null,
		...overrides
	};
}

type CourseRepoFixtures = {
	getByIdResult?: CourseDto | undefined;
	createResult?: CourseDto;
	updateResult?: CourseDto | undefined;
	getByIdsResult?: CourseDto[];
	getManyByCreatorIdResult?: CourseDto[];
	getAllResult?: GetCoursesResponse[];
};

type BlockRepoFixtures = {
	getManyByCourseIdResult?: BlockDto[];
};

type UserRepoFixtures = {
	getByEmailResult?: UserDto | undefined;
};

class FakeCourseRepository implements Partial<CourseRepository> {
	public fixtures: CourseRepoFixtures;
	public receivedTxs: {
		getById?: Transaction | undefined;
		create?: Transaction | undefined;
		update?: Transaction | undefined;
		getByIds?: Transaction | undefined;
		getManyByCreatorId?: Transaction | undefined;
		getAll?: Transaction | undefined;
	} = {};

	constructor(fixtures: CourseRepoFixtures) {
		this.fixtures = fixtures;
	}

	async getById(id: string, tx?: Transaction): Promise<CourseDto | undefined> {
		this.receivedTxs.getById = tx;
		return this.fixtures.getByIdResult;
	}

	async create(data: CreateCourseDto, tx?: Transaction): Promise<CourseDto> {
		this.receivedTxs.create = tx;
		if (!this.fixtures.createResult) {
			this.fixtures.createResult = makeCourse({
				id: 'created',
				name: data.name,
				creatorId: data.creatorId
			});
		}
		return this.fixtures.createResult;
	}

	async update(
		id: string,
		data: UpdateCourseDto,
		tx?: Transaction
	): Promise<CourseDto | undefined> {
		this.receivedTxs.update = tx;
		return this.fixtures.updateResult;
	}

	async getByIds(ids: string[], tx?: Transaction): Promise<CourseDto[]> {
		this.receivedTxs.getByIds = tx;
		return this.fixtures.getByIdsResult ?? [];
	}

	async getManyByCreatorId(creatorId: string, tx?: Transaction): Promise<CourseDto[]> {
		this.receivedTxs.getManyByCreatorId = tx;
		return this.fixtures.getManyByCreatorIdResult ?? [];
	}

	async getAll(filter?: GetCoursesRequest, tx?: Transaction): Promise<GetCoursesResponse[]> {
		this.receivedTxs.getAll = tx;
		return this.fixtures.getAllResult ?? [];
	}
}

class FakeBlockRepository implements Partial<BlockRepository> {
	public fixtures: BlockRepoFixtures;
	public receivedTxs: {
		getManyByCourseId?: Transaction | undefined;
	} = {};

	constructor(fixtures: BlockRepoFixtures) {
		this.fixtures = fixtures;
	}

	async getManyByCourseId(courseId: string, tx?: Transaction): Promise<BlockDto[]> {
		this.receivedTxs.getManyByCourseId = tx;
		return this.fixtures.getManyByCourseIdResult ?? [];
	}
}

class FakeUserRepository implements Partial<UserRepository> {
	public fixtures: UserRepoFixtures;
	public receivedTxs: {
		getByEmail?: Transaction | undefined;
	} = {};

	constructor(fixtures: UserRepoFixtures) {
		this.fixtures = fixtures;
	}

	async getByEmail(email: string, tx?: Transaction): Promise<UserDto | undefined> {
		this.receivedTxs.getByEmail = tx;
		return this.fixtures.getByEmailResult;
	}
}

describe('CourseService', () => {
	// getById

	it('getById: returns course when found', async () => {
		const course = makeCourse({ id: 'course1' });
		const courseRepo = new FakeCourseRepository({ getByIdResult: course }) as unknown as CourseRepository;
		const blockRepo = new FakeBlockRepository({}) as unknown as BlockRepository;
		const userRepo = new FakeUserRepository({}) as unknown as UserRepository;

		const svc = new CourseService(courseRepo, blockRepo, userRepo);

		const res = await svc.getById('course1');
		expect(res).toEqual(course);
	});

	it('getById: throws NotFoundError when not found', async () => {
		const courseRepo = new FakeCourseRepository({ getByIdResult: undefined }) as unknown as CourseRepository;
		const blockRepo = new FakeBlockRepository({}) as unknown as BlockRepository;
		const userRepo = new FakeUserRepository({}) as unknown as UserRepository;

		const svc = new CourseService(courseRepo, blockRepo, userRepo);

		await expect(svc.getById('missing')).rejects.toBeInstanceOf(NotFoundError);
	});

	// create

	it('create: delegates to repository.create', async () => {
		const created = makeCourse({ id: 'course2' });
		const courseRepo = new FakeCourseRepository({ createResult: created }) as unknown as CourseRepository;
		const blockRepo = new FakeBlockRepository({}) as unknown as BlockRepository;
		const userRepo = new FakeUserRepository({}) as unknown as UserRepository;

		const svc = new CourseService(courseRepo, blockRepo, userRepo);

		const input = {
			name: 'New course',
			creatorId: 'user1',
			published: false
		} as CreateCourseDto;

		const res = await svc.create(input);
		expect(res).toEqual(created);
	});

	// update

	it('update: returns updated course when repo returns value', async () => {
		const updated = makeCourse({ id: 'course1', name: 'Updated' });
		const courseRepo = new FakeCourseRepository({ updateResult: updated }) as unknown as CourseRepository;
		const blockRepo = new FakeBlockRepository({}) as unknown as BlockRepository;
		const userRepo = new FakeUserRepository({}) as unknown as UserRepository;

		const svc = new CourseService(courseRepo, blockRepo, userRepo);

		const patch = { name: 'Updated' } as UpdateCourseDto;
		const res = await svc.update('course1', patch);
		expect(res).toEqual(updated);
	});

	it('update: throws NotFoundError when repo returns undefined', async () => {
		const courseRepo = new FakeCourseRepository({ updateResult: undefined }) as unknown as CourseRepository;
		const blockRepo = new FakeBlockRepository({}) as unknown as BlockRepository;
		const userRepo = new FakeUserRepository({}) as unknown as UserRepository;

		const svc = new CourseService(courseRepo, blockRepo, userRepo);

		const patch = { name: 'Updated' } as UpdateCourseDto;
		await expect(svc.update('missing', patch)).rejects.toBeInstanceOf(NotFoundError);
	});

	// getByIds

	it('getByIds: returns array of courses', async () => {
		const rows = [makeCourse({ id: 'course1' }), makeCourse({ id: 'course2' })];
		const courseRepo = new FakeCourseRepository({ getByIdsResult: rows }) as unknown as CourseRepository;
		const blockRepo = new FakeBlockRepository({}) as unknown as BlockRepository;
		const userRepo = new FakeUserRepository({}) as unknown as UserRepository;

		const svc = new CourseService(courseRepo, blockRepo, userRepo);

		const res = await svc.getByIds(['course1', 'course2']);
		expect(res).toEqual(rows);
	});

	it('getByIds: returns empty array when none', async () => {
		const courseRepo = new FakeCourseRepository({ getByIdsResult: [] }) as unknown as CourseRepository;
		const blockRepo = new FakeBlockRepository({}) as unknown as BlockRepository;
		const userRepo = new FakeUserRepository({}) as unknown as UserRepository;

		const svc = new CourseService(courseRepo, blockRepo, userRepo);

		const res = await svc.getByIds(['course1', 'course2']);
		expect(res).toEqual([]);
	});

	// getManyByCreatorId

	it('getManyByCreatorId: returns courses for creator', async () => {
		const rows = [makeCourse({ id: 'course1', creatorId: 'user1' })];
		const courseRepo = new FakeCourseRepository({ getManyByCreatorIdResult: rows }) as unknown as CourseRepository;
		const blockRepo = new FakeBlockRepository({}) as unknown as BlockRepository;
		const userRepo = new FakeUserRepository({}) as unknown as UserRepository;

		const svc = new CourseService(courseRepo, blockRepo, userRepo);

		const res = await svc.getManyByCreatorId('user1');
		expect(res).toEqual(rows);
	});

	// getAll

	it('getAll: delegates to repository.getAll', async () => {
		const rows: GetCoursesResponse[] = [
			{
				id: 'course1',
				name: 'C1',
				creatorId: 'user1',
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: null,
				deletedAt: null,
				published: true,
				blocksCount: 2
			}
		];

		const courseRepo = new FakeCourseRepository({ getAllResult: rows }) as unknown as CourseRepository;
		const blockRepo = new FakeBlockRepository({}) as unknown as BlockRepository;
		const userRepo = new FakeUserRepository({}) as unknown as UserRepository;

		const svc = new CourseService(courseRepo, blockRepo, userRepo);

		const res = await svc.getAll({ name: 'C1' });
		expect(res).toEqual(rows);
	});

	// delete (soft delete)

	it('delete: soft-deletes course when user is creator', async () => {
		const course = makeCourse({ id: 'course1', creatorId: 'user1' });
		const deleted = { ...course, deletedAt: new Date('2024-01-02T00:00:00Z') };

		const courseRepo = new FakeCourseRepository({
			getByIdResult: course,
			updateResult: deleted
		}) as unknown as CourseRepository;
		const blockRepo = new FakeBlockRepository({}) as unknown as BlockRepository;
		const userRepo = new FakeUserRepository({
			getByEmailResult: makeUser({ id: 'user1', email: 'user@example.com' })
		}) as unknown as UserRepository;

		const svc = new CourseService(courseRepo, blockRepo, userRepo);

		const res = await svc.delete('course1', 'user@example.com');
		expect(res).toEqual(deleted);
	});

	it('delete: throws NotFoundError when user not found', async () => {
		const course = makeCourse({ id: 'course1', creatorId: 'user1' });
		const courseRepo = new FakeCourseRepository({
			getByIdResult: course
		}) as unknown as CourseRepository;
		const blockRepo = new FakeBlockRepository({}) as unknown as BlockRepository;
		const userRepo = new FakeUserRepository({
			getByEmailResult: undefined
		}) as unknown as UserRepository;

		const svc = new CourseService(courseRepo, blockRepo, userRepo);

		await expect(svc.delete('course1', 'nope@example.com')).rejects.toBeInstanceOf(NotFoundError);
	});

	it('delete: throws NotFoundError when course not found', async () => {
		const courseRepo = new FakeCourseRepository({
			getByIdResult: undefined
		}) as unknown as CourseRepository;
		const blockRepo = new FakeBlockRepository({}) as unknown as BlockRepository;
		const userRepo = new FakeUserRepository({
			getByEmailResult: makeUser({ id: 'user1', email: 'user@example.com' })
		}) as unknown as UserRepository;

		const svc = new CourseService(courseRepo, blockRepo, userRepo);

		await expect(svc.delete('missing', 'user@example.com')).rejects.toBeInstanceOf(NotFoundError);
	});

	it('delete: throws UnauthorizedError when user is not creator', async () => {
		const course = makeCourse({ id: 'course1', creatorId: 'otherUser' });
		const courseRepo = new FakeCourseRepository({
			getByIdResult: course
		}) as unknown as CourseRepository;
		const blockRepo = new FakeBlockRepository({}) as unknown as BlockRepository;
		const userRepo = new FakeUserRepository({
			getByEmailResult: makeUser({ id: 'user1', email: 'user@example.com' })
		}) as unknown as UserRepository;

		const svc = new CourseService(courseRepo, blockRepo, userRepo);

		await expect(svc.delete('course1', 'user@example.com')).rejects.toBeInstanceOf(UnauthorizedError);
	});

	it('delete: throws NotFoundError when update returns undefined after checks', async () => {
		const course = makeCourse({ id: 'course1', creatorId: 'user1' });
		const courseRepo = new FakeCourseRepository({
			getByIdResult: course,
			updateResult: undefined
		}) as unknown as CourseRepository;
		const blockRepo = new FakeBlockRepository({}) as unknown as BlockRepository;
		const userRepo = new FakeUserRepository({
			getByEmailResult: makeUser({ id: 'user1', email: 'user@example.com' })
		}) as unknown as UserRepository;

		const svc = new CourseService(courseRepo, blockRepo, userRepo);

		await expect(svc.delete('course1', 'user@example.com')).rejects.toBeInstanceOf(NotFoundError);
	});

	// publishCourse

	it('publishCourse: publishes course when user is creator and has blocks', async () => {
		const course = makeCourse({ id: 'course1', creatorId: 'user1', published: false });
		const published = { ...course, published: true };

		const courseRepo = new FakeCourseRepository({
			getByIdResult: course,
			updateResult: published
		}) as unknown as CourseRepository;

		const blockRepo = new FakeBlockRepository({
			getManyByCourseIdResult: [makeBlock({ courseId: 'course1' })]
		}) as unknown as BlockRepository;

		const userRepo = new FakeUserRepository({
			getByEmailResult: makeUser({ id: 'user1', email: 'user@example.com' })
		}) as unknown as UserRepository;

		const svc = new CourseService(courseRepo, blockRepo, userRepo);

		const res = await svc.publishCourse('course1', 'user@example.com');
		expect(res).toEqual(published);
	});

	it('publishCourse: throws ConflictError when no blocks', async () => {
		const course = makeCourse({ id: 'course1', creatorId: 'user1', published: false });

		const courseRepo = new FakeCourseRepository({
			getByIdResult: course,
			updateResult: undefined // not reached if conflict thrown
		}) as unknown as CourseRepository;

		const blockRepo = new FakeBlockRepository({
			getManyByCourseIdResult: []
		}) as unknown as BlockRepository;

		const userRepo = new FakeUserRepository({
			getByEmailResult: makeUser({ id: 'user1', email: 'user@example.com' })
		}) as unknown as UserRepository;

		const svc = new CourseService(courseRepo, blockRepo, userRepo);

		await expect(
			svc.publishCourse('course1', 'user@example.com')
		).rejects.toBeInstanceOf(ConflictError);
	});

	it('publishCourse: throws NotFoundError when update returns undefined', async () => {
		const course = makeCourse({ id: 'course1', creatorId: 'user1', published: false });

		const courseRepo = new FakeCourseRepository({
			getByIdResult: course,
			updateResult: undefined
		}) as unknown as CourseRepository;

		const blockRepo = new FakeBlockRepository({
			getManyByCourseIdResult: [makeBlock({ courseId: 'course1' })]
		}) as unknown as BlockRepository;

		const userRepo = new FakeUserRepository({
			getByEmailResult: makeUser({ id: 'user1', email: 'user@example.com' })
		}) as unknown as UserRepository;

		const svc = new CourseService(courseRepo, blockRepo, userRepo);

		await expect(
			svc.publishCourse('course1', 'user@example.com')
		).rejects.toBeInstanceOf(NotFoundError);
	});

	// unpublishCourse

	it('unpublishCourse: unpublishes course when user is creator', async () => {
		const course = makeCourse({ id: 'course1', creatorId: 'user1', published: true });
		const unpublished = { ...course, published: false };

		const courseRepo = new FakeCourseRepository({
			getByIdResult: course,
			updateResult: unpublished
		}) as unknown as CourseRepository;

		const blockRepo = new FakeBlockRepository({}) as unknown as BlockRepository;

		const userRepo = new FakeUserRepository({
			getByEmailResult: makeUser({ id: 'user1', email: 'user@example.com' })
		}) as unknown as UserRepository;

		const svc = new CourseService(courseRepo, blockRepo, userRepo);

		const res = await svc.unpublishCourse('course1', 'user@example.com');
		expect(res).toEqual(unpublished);
	});

	it('unpublishCourse: throws NotFoundError when update returns undefined', async () => {
		const course = makeCourse({ id: 'course1', creatorId: 'user1', published: true });

		const courseRepo = new FakeCourseRepository({
			getByIdResult: course,
			updateResult: undefined
		}) as unknown as CourseRepository;

		const blockRepo = new FakeBlockRepository({}) as unknown as BlockRepository;

		const userRepo = new FakeUserRepository({
			getByEmailResult: makeUser({ id: 'user1', email: 'user@example.com' })
		}) as unknown as UserRepository;

		const svc = new CourseService(courseRepo, blockRepo, userRepo);

		await expect(
			svc.unpublishCourse('course1', 'user@example.com')
		).rejects.toBeInstanceOf(NotFoundError);
	});

	// transaction wiring example

	it('passes transaction through to repositories (example: delete)', async () => {
		const course = makeCourse({ id: 'course1', creatorId: 'user1' });
		const deleted = { ...course, deletedAt: new Date('2024-01-02T00:00:00Z') };

		const fakeCourseRepo = new FakeCourseRepository({
			getByIdResult: course,
			updateResult: deleted
		});
		const fakeBlockRepo = new FakeBlockRepository({});
		const fakeUserRepo = new FakeUserRepository({
			getByEmailResult: makeUser({ id: 'user1', email: 'user@example.com' })
		});

		const courseRepo = fakeCourseRepo as unknown as CourseRepository;
		const blockRepo = fakeBlockRepo as unknown as BlockRepository;
		const userRepo = fakeUserRepo as unknown as UserRepository;

		const svc = new CourseService(courseRepo, blockRepo, userRepo);
		const tx = {} as Transaction;

		await svc.delete('course1', 'user@example.com', tx);

		expect(fakeCourseRepo.receivedTxs.getById).toBe(tx);
		expect(fakeCourseRepo.receivedTxs.update).toBe(tx);
		expect(fakeUserRepo.receivedTxs.getByEmail).toBe(tx);
	});
});
