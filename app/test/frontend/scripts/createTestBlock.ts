import { db } from '../../../src/db/client';
import { table } from '../../../src/db/schema';
import { eq, and } from 'drizzle-orm';

export const createTestBlock = async () => {
	try {
		const courseData = await db
			.select()
			.from(table.course)
			.where(eq(table.course.name, 'Test Course'));

		const blockExists = await db
			.select()
			.from(table.block)
			.where(and(eq(table.block.name, 'Test Block'), eq(table.block.courseId, courseData[0].id)))
			.limit(1);

		if (blockExists.length > 0) {
			return;
		}

		const blockData = await db
			.insert(table.block)
			.values({
				courseId: courseData[0].id,
				name: 'Test Block',
				documentPath: '/path/to/test/block/document'
			})
			.returning();

		const baseQuiz = await db.insert(table.baseQuiz).values({}).returning();

		const concept = await db
			.insert(table.concept)
			.values({
				blockId: blockData[0].id,
				name: 'Test Concept',
				difficultyIndex: 1
			})
			.returning();

		const baseQuesion = await db
			.insert(table.baseQuestion)
			.values({
				baseQuizId: baseQuiz[0].id,
				questionText: 'Sample Question?',
				correctAnswerText: 'Answer1',
				conceptId: concept[0].id,
				codeSnippet: '',
				questionType: 'A1',
				orderIndex: 1
			})
			.returning();

		const baseOption1 = db.insert(table.baseOption).values({
			baseQuestionId: baseQuesion[0].id,
			optionText: 'Answer1',
			isCorrect: true
		});

		const baseOption2 = db.insert(table.baseOption).values({
			baseQuestionId: baseQuesion[0].id,
			optionText: 'Answer2',
			isCorrect: false
		});

		const baseOption3 = await db
			.insert(table.baseOption)
			.values({
				baseQuestionId: baseQuesion[0].id,
				optionText: 'Answer3',
				isCorrect: true
			})
			.returning();

		const baseOption4 = await db
			.insert(table.baseOption)
			.values({
				baseQuestionId: baseQuesion[0].id,
				optionText: 'Answer4',
				isCorrect: false
			})
			.returning();

		await Promise.all([baseOption1, baseOption2, baseOption3, baseOption4]);

		const placementQuiz = await db
			.insert(table.placementQuiz)
			.values({
				blockId: blockData[0].id,
				baseQuizId: baseQuiz[0].id
			})
			.returning();
		console.log('Test block created successfully', blockData, placementQuiz);
	} catch (error) {}
};
