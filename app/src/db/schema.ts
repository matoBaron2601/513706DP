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
import { QuestionType } from '../schemas/questionSchema';
import { updated } from '$app/state';
import { create } from 'domain';

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

export const quiz = pgTable('quiz', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	name: varchar('name').notNull(),
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
export type UpdateQuizDto = Partial<CreateQuizDto>;

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
	openedAt: timestamp('openedAt'),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	submittedAt: timestamp('submittedAt'),
	deletedAt: timestamp('deletedAt')
});

export type UserQuizDto = InferSelectModel<typeof userQuiz>;
export type CreateUserQuizDto = InferInsertModel<typeof userQuiz>;
export type UpdateUserQuizDto = Partial<CreateUserQuizDto>;

export const questionTypeEnum = pgEnum('questionType', [
	QuestionType.SingleChoice,
	QuestionType.MultipleChoice
]);
export const question = pgTable('question', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	quizId: varchar('quizId')
		.notNull()
		.references(() => quiz.id),
	text: varchar('text').notNull(),
	type: questionTypeEnum().default(QuestionType.SingleChoice).notNull(),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
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
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	deletedAt: timestamp('deletedAt')
});

export type OptionDto = InferSelectModel<typeof option>;
export type CreateOptionDto = InferInsertModel<typeof option>;

export const answer = pgTable('answer', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	userQuizId: varchar('userQuizId')
		.notNull()
		.references(() => userQuiz.id),
	questionId: varchar('questionId')
		.notNull()
		.references(() => question.id),
	optionId: varchar('optionId')
		.notNull()
		.references(() => option.id),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	deletedAt: timestamp('deletedAt')
});

export type AnswerDto = InferSelectModel<typeof answer>;
export type CreateAnswerDto = InferInsertModel<typeof answer>;

export const quizInvitation = pgTable('quizInvitation', {
	id: varchar('id')
		.$defaultFn(() => createId())
		.primaryKey(),
	quizId: varchar('quizId')
		.notNull()
		.references(() => quiz.id),
	maxUses: integer('maxUses').default(0).notNull(),
	currentUses: integer('currentUses').default(0).notNull(),
	expiresAt: timestamp('expiresAt'),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	deletedAt: timestamp('deletedAt')
});
export const table = {
	quiz,
	question,
	option,
	user,
	answer,
	userQuiz
} as const;
