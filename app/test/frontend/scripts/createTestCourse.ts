import { db } from '../../../src/db/client';
import { table } from '../../../src/db/schema';
import { eq, and } from 'drizzle-orm';

export const createTestCourse = async () => {
	try {
		const userData = await db
			.select()
			.from(table.user)
			.where(eq(table.user.email, 'test@example.com'));

		const courseExists = await db
			.select()
			.from(table.course)
			.where(and(eq(table.course.name, 'Test Course'), eq(table.course.creatorId, userData[0].id)))
			.limit(1);

		if (courseExists.length > 0) {
			return;
		}

		const createdCourse = await db
			.insert(table.course)
			.values({
				name: 'Test Course',
				creatorId: userData[0].id,
				published: true
			})
			.returning();

		console.log('Test course created successfully', createdCourse);
	} catch (error) {
		console.error('Error creating test course: ', error);
	}
};
