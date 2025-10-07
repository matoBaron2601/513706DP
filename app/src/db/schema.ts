import {
	pgTable,
	varchar,
	boolean,
	timestamp,
	pgEnum,
	numeric,
	integer
} from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const user = pgTable('user', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	email: varchar('email').notNull().unique(),
	name: varchar('name').notNull(),
	profilePicture: varchar('profilePicture').notNull(),
	deletedAt: timestamp('deletedAt')
});

export type UserDto = InferSelectModel<typeof user>;
export type CreateUserDto = InferInsertModel<typeof user>;
export type UpdateUserDto = Partial<CreateUserDto>;

export const quiz = pgTable('quiz', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	creatorId: varchar('creatorId')
		.notNull()
		.references(() => user.id),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	timePerQuestion: integer('timePerQuestion'),
	canGoBack: boolean('canGoBack'),
	deletedAt: timestamp('deletedAt')
});

export type QuizDto = InferSelectModel<typeof quiz>;
export type CreateQuizDto = InferInsertModel<typeof quiz>;

export const userQuiz = pgTable('userQuiz', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	userId: varchar('userId')
		.notNull()
		.references(() => user.id),
	quizId: varchar('quizId')
		.notNull()
		.references(() => quiz.id),
	openedAt: timestamp('openedAt').notNull().defaultNow(),
	submittedAt: timestamp('submittedAt'),
	deletedAt: timestamp('deletedAt')
});

export type UserQuizDto = InferSelectModel<typeof userQuiz>;
export type CreateUserQuizDto = InferInsertModel<typeof userQuiz>;

export const question = pgTable('question', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	quizId: varchar('quizId')
		.notNull()
		.references(() => quiz.id),
	text: varchar('text').notNull(),
	deletedAt: timestamp('deletedAt')
});

export type QuestionDto = InferSelectModel<typeof question>;
export type CreateQuestionDto = InferInsertModel<typeof question>;

export const option = pgTable('option', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	questionId: varchar('questionId')
		.notNull()
		.references(() => question.id),
	text: varchar('text').notNull(),
	isCorrect: boolean('isCorrect').notNull(),
	deletedAt: timestamp('deletedAt')
});

export type OptionDto = InferSelectModel<typeof option>;
export type CreateOptionDto = InferInsertModel<typeof option>;

export const userAnswer = pgTable('userAnswer', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	userId: varchar('userId')
		.notNull()
		.references(() => user.id),
	questionId: varchar('questionId')
		.notNull()
		.references(() => question.id),
	optionId: varchar('optionId')
		.notNull()
		.references(() => option.id),
	answeredAt: timestamp('answeredAt').notNull().defaultNow(),
	deletedAt: timestamp('deletedAt')
});

export const table = {
	quiz,
	question,
	option,
	user
} as const;
