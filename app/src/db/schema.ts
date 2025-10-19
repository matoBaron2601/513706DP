import { pgTable, varchar, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const user = pgTable('user', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	email: varchar('email').notNull().unique(),
	name: varchar('name').notNull(),
	profilePicture: varchar('profilePicture').notNull(),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});
export type UserDto = InferSelectModel<typeof user>;
export type CreateUserDto = InferInsertModel<typeof user>;
export type UpdateUserDto = Partial<CreateUserDto>;

export const baseQuiz = pgTable('baseQuiz', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});
export type BaseQuizDto = InferSelectModel<typeof baseQuiz>;
export type CreateBaseQuizDto = InferInsertModel<typeof baseQuiz>;
export type UpdateBaseQuizDto = Partial<CreateBaseQuizDto>;

export const baseQuestion = pgTable('baseQuestion', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	baseQuizId: varchar('baseQuizId')
		.notNull()
		.references(() => baseQuiz.id),
	questionText: varchar('questionText').notNull(),
	correctAnswerText: varchar('correctAnswerText').notNull(),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});
export type BaseQuestionDto = InferSelectModel<typeof baseQuestion>;
export type CreateBaseQuestionDto = InferInsertModel<typeof baseQuestion>;
export type UpdateBaseQuestionDto = Partial<CreateBaseQuestionDto>;

export const baseOption = pgTable('baseOption', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	baseQuestionId: varchar('baseQuestionId')
		.notNull()
		.references(() => baseQuestion.id),
	optionText: varchar('optionText'),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});
export type BaseOptionDto = InferSelectModel<typeof baseOption>;
export type CreateBaseOptionDto = InferInsertModel<typeof baseOption>;
export type UpdateBaseOptionDto = Partial<CreateBaseOptionDto>;

export const baseAnswer = pgTable('baseAnswer', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	baseQuestionId: varchar('baseQuestionId')
		.notNull()
		.references(() => baseQuestion.id),
	answerText: varchar('answerText').notNull(),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});
export type BaseAnswerDto = InferSelectModel<typeof baseAnswer>;
export type CreateBaseAnswerDto = InferInsertModel<typeof baseAnswer>;
export type UpdateBaseAnswerDto = Partial<CreateBaseAnswerDto>;

export const oneTimeQuiz = pgTable('oneTimeQuiz', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	creatorId: varchar('creatorId')
		.notNull()
		.references(() => user.id),
	baseQuizId: varchar('baseQuizId')
		.notNull()
		.references(() => baseQuiz.id),
	name: varchar('name').notNull(),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});
export type OneTimeQuizDto = InferSelectModel<typeof oneTimeQuiz>;
export type CreateOneTimeQuizDto = InferInsertModel<typeof oneTimeQuiz>;
export type UpdateOneTimeQuizDto = Partial<CreateOneTimeQuizDto>;

export const course = pgTable('course', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	name: varchar('name').notNull(),
	creatorId: varchar('creatorId')
		.notNull()
		.references(() => user.id),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});
export type CourseDto = InferSelectModel<typeof course>;
export type CreateCourseDto = InferInsertModel<typeof course>;
export type UpdateCourseDto = Partial<CreateCourseDto>;

export const courseBlock = pgTable('courseBlock', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	courseId: varchar('courseId')
		.notNull()
		.references(() => course.id),
	name: varchar('name').notNull(),
	document: varchar('file').notNull(),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});
export type CourseBlockDto = InferSelectModel<typeof courseBlock>;
export type CreateCourseBlockDto = InferInsertModel<typeof courseBlock>;
export type UpdateCourseBlockDto = Partial<CreateCourseBlockDto>;

export const complexQuiz = pgTable('complexQuiz', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	baseQuizId: varchar('baseQuizId')
		.notNull()
		.references(() => baseQuiz.id),
	courseBlockId: varchar('courseBlockId')
		.notNull()
		.references(() => courseBlock.id),
	version: integer('version').notNull().default(0),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});
export type ComplexQuizDto = InferSelectModel<typeof complexQuiz>;
export type CreateComplexQuizDto = InferInsertModel<typeof complexQuiz>;
export type UpdateComplexQuizDto = Partial<CreateComplexQuizDto>;

export const concept = pgTable('concept', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	courseBlockId: varchar('courseBlockId')
		.notNull()
		.references(() => courseBlock.id),
	name: varchar('name').notNull(),
	learned: boolean('learned').notNull(),
	difficultyIndex: integer('difficultyIndex').notNull(),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});
export type ConceptDto = InferSelectModel<typeof concept>;
export type CreateConceptDto = InferInsertModel<typeof concept>;
export type UpdateConceptDto = Partial<CreateConceptDto>;

export const complexQuizQuestion = pgTable('complexQuizQuestion', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	baseQuestionId: varchar('baseQuestionId')
		.notNull()
		.references(() => baseQuestion.id),
	complexQuizId: varchar('complexQuizId')
		.notNull()
		.references(() => complexQuiz.id),
	conceptId: varchar('conceptId')
		.notNull()
		.references(() => concept.id),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});
export type ComplexQuizQuestionDto = InferSelectModel<typeof complexQuizQuestion>;
export type CreateComplexQuizQuestionDto = InferInsertModel<typeof complexQuizQuestion>;
export type UpdateComplexQuizQuestionDto = Partial<CreateComplexQuizQuestionDto>;

export const oneTimeQuizUser = pgTable('oneTimeQuizUser', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	oneTimeQuizId: varchar('oneTimeQuizId')
		.notNull()
		.references(() => oneTimeQuiz.id),
	userId: varchar('userId')
		.notNull()
		.references(() => user.id),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});
export type oneTimeUserQuizDto = InferSelectModel<typeof oneTimeQuizUser>;
export type CreateOneTimeUserQuizDto = InferInsertModel<typeof oneTimeQuizUser>;
export type UpdateOneTimeUserQuizDto = Partial<CreateOneTimeUserQuizDto>;

export const oneTimeUserAnswer = pgTable('oneTimeUserAnswer', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	oneTimeUserQuizId: varchar('oneTimeUserQuizId')
		.notNull()
		.references(() => oneTimeQuizUser.id),
	baseQuestionId: varchar('baseQuestionId')
		.notNull()
		.references(() => baseQuestion.id),
	baseAnswerId: varchar('baseAnswerId')
		.notNull()
		.references(() => baseAnswer.id),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});
export type OneTimeUserAnswerDto = InferSelectModel<typeof oneTimeUserAnswer>;
export type CreateOneTimeUserAnswerDto = InferInsertModel<typeof oneTimeUserAnswer>;
export type UpdateOneTimeUserAnswerDto = Partial<CreateOneTimeUserAnswerDto>;

export const complexQuizUser = pgTable('complexQuizUser', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	complexQuizId: varchar('complexQuizId')
		.notNull()
		.references(() => complexQuiz.id),
	userId: varchar('userId')
		.notNull()
		.references(() => user.id),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});
export type ComplexQuizUserDto = InferSelectModel<typeof complexQuizUser>;
export type CreateComplexQuizUserDto = InferInsertModel<typeof complexQuizUser>;
export type UpdateComplexQuizUserDto = Partial<CreateComplexQuizUserDto>;

export const complexQuizUserAnswer = pgTable('complexQuizUserAnswer', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	complexQuizUserId: varchar('complexQuizUserId')
		.notNull()
		.references(() => complexQuizUser.id),
	complexQuizQuestionId: varchar('complexQuizQuestionId')
		.notNull()
		.references(() => complexQuizQuestion.id),
	baseAnswerId: varchar('baseAnswerId')
		.notNull()
		.references(() => baseAnswer.id),
	answerText: varchar('answerText').notNull(),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});
export type ComplexQuizUserAnswerDto = InferSelectModel<typeof complexQuizUserAnswer>;
export type CreateComplexQuizUserAnswerDto = InferInsertModel<typeof complexQuizUserAnswer>;
export type UpdateComplexQuizUserAnswerDto = Partial<CreateComplexQuizUserAnswerDto>;

export const table = {
	user,
	baseQuiz,
	baseQuestion,
	baseOption,
	oneTimeQuiz,
	course,
	courseBlock,
	complexQuiz,
	concept,
	complexQuizQuestion
} as const;
