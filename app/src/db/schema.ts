import { pgTable, varchar, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { is, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';

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
	conceptId: varchar('conceptId')
		.notNull()
		.references(() => concept.id),
	orderIndex: integer('orderIndex').notNull().default(0),
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

export const block = pgTable('block', {
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

export type BlockDto = InferSelectModel<typeof block>;
export type CreateBlockDto = InferInsertModel<typeof block>;
export type UpdateBlockDto = Partial<CreateBlockDto>;

export const concept = pgTable('concept', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	blockId: varchar('blockId')
		.notNull()
		.references(() => block.id),
	name: varchar('name').notNull(),
	difficultyIndex: integer('difficultyIndex').notNull(),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});

export type ConceptDto = InferSelectModel<typeof concept>;
export type CreateConceptDto = InferInsertModel<typeof concept>;
export type UpdateConceptDto = Partial<CreateConceptDto>;

export const userBlock = pgTable('userBlock', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	userId: varchar('userId')
		.notNull()
		.references(() => user.id),
	blockId: varchar('blockId')
		.notNull()
		.references(() => block.id),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});

export type UserBlockDto = InferSelectModel<typeof userBlock>;
export type CreateUserBlockDto = InferInsertModel<typeof userBlock>;
export type UpdateUserBlockDto = Partial<CreateUserBlockDto>;

export const conceptProgress = pgTable('conceptProgress', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	userBlockId: varchar('userBlockId')
		.notNull()
		.references(() => userBlock.id),
	conceptId: varchar('conceptId')
		.notNull()
		.references(() => concept.id),
	completed: boolean('completed').notNull().default(false),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});
export type ConceptProgressDto = InferSelectModel<typeof conceptProgress>;
export type CreateConceptProgressDto = InferInsertModel<typeof conceptProgress>;
export type UpdateConceptProgressDto = Partial<CreateConceptProgressDto>;

export const conceptProgressRecord = pgTable('conceptProgressRecord', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	conceptProgressId: varchar('conceptProgressId')
		.notNull()
		.references(() => conceptProgress.id),
	adaptiveQuizId: varchar('adaptiveQuizId')
		.notNull()
		.references(() => adaptiveQuiz.id),
	correctCount: integer('correctCount').notNull(),
	count: integer('count').notNull(),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});

export type ConceptProgressRecordDto = InferSelectModel<typeof conceptProgressRecord>;
export type CreateConceptProgressRecordDto = InferInsertModel<typeof conceptProgressRecord>;
export type UpdateConceptProgressRecordDto = Partial<CreateConceptProgressRecordDto>;

export const placementQuiz = pgTable('placementQuiz', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	blockId: varchar('blockId')
		.notNull()
		.references(() => block.id),
	baseQuizId: varchar('baseQuizId')
		.notNull()
		.references(() => baseQuiz.id),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});

export type PlacementQuizDto = InferSelectModel<typeof placementQuiz>;
export type CreatePlacementQuizDto = InferInsertModel<typeof placementQuiz>;
export type UpdatePlacementQuizDto = Partial<CreatePlacementQuizDto>;

export const adaptiveQuiz = pgTable('adaptiveQuiz', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	userBlockId: varchar('userBlockId')
		.notNull()
		.references(() => userBlock.id),
	baseQuizId: varchar('baseQuizId')
		.notNull()
		.references(() => baseQuiz.id),
	placementQuizId: varchar('placementQuizId').references(() => placementQuiz.id),
	version: integer('version').notNull().default(0),
	isCompleted: boolean('isCompleted').notNull().default(false),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});

export type AdaptiveQuizDto = InferSelectModel<typeof adaptiveQuiz>;
export type CreateAdaptiveQuizDto = InferInsertModel<typeof adaptiveQuiz>;
export type UpdateAdaptiveQuizDto = Partial<CreateAdaptiveQuizDto>;

export const adaptiveQuizAnswer = pgTable('adaptiveQuizAnswer', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	adaptiveQuizId: varchar('adaptiveQuizId')
		.notNull()
		.references(() => adaptiveQuiz.id),
	baseQuestionId: varchar('baseQuestionId')
		.notNull()
		.references(() => baseQuestion.id),
	answerText: varchar('answerText').notNull(),
	isCorrect: boolean('isCorrect').notNull(),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});
export type AdaptiveQuizAnswerDto = InferSelectModel<typeof adaptiveQuizAnswer>;
export type CreateAdaptiveQuizAnswerDto = InferInsertModel<typeof adaptiveQuizAnswer>;
export type UpdateAdaptiveQuizAnswerDto = Partial<CreateAdaptiveQuizAnswerDto>;

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

export const oneTimeQuizConcept = pgTable('oneTimeQuizConcept', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	oneTimeQuizId: varchar('oneTimeQuizId')
		.notNull()
		.references(() => oneTimeQuiz.id),
	conceptId: varchar('conceptId')
		.notNull()
		.references(() => concept.id),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});

export type OneTimeQuizConceptDto = InferSelectModel<typeof oneTimeQuizConcept>;
export type CreateOneTimeQuizConceptDto = InferInsertModel<typeof oneTimeQuizConcept>;
export type UpdateOneTimeQuizConceptDto = Partial<CreateOneTimeQuizConceptDto>;

export const oneTimeQuizAnswer = pgTable('oneTimeQuizAnswer', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	oneTimeQuizId: varchar('oneTimeQuizId')
		.notNull()
		.references(() => oneTimeQuiz.id),
	baseQuestionId: varchar('baseQuestionId')
		.notNull()
		.references(() => baseQuestion.id),
	answerText: varchar('answerText').notNull(),
	isCorrect: boolean('isCorrect').notNull(),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt')
});
export type OneTimeQuizAnswerDto = InferSelectModel<typeof oneTimeQuizAnswer>;
export type CreateOneTimeQuizAnswerDto = InferInsertModel<typeof oneTimeQuizAnswer>;
export type UpdateOneTimeQuizAnswerDto = Partial<CreateOneTimeQuizAnswerDto>;

export const table = {
	user,
	course,
	block,
	concept,
	placementQuiz,
	userBlock,
	conceptProgress,
	conceptProgressRecord,
	oneTimeQuizConcept,
	adaptiveQuiz,
	adaptiveQuizAnswer,
	oneTimeQuiz,
	oneTimeQuizAnswer,
	baseQuiz,
	baseQuestion,
	baseOption
} as const;
