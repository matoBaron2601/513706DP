import { t } from 'elysia';
import { type Static } from 'elysia';

export const userSchema = t.Object({
	id: t.String(),
	name: t.String(),
	email: t.String(),
	profilePicture: t.String(),
});

export type User = Static<typeof userSchema>;

export const createUserSchema = t.Object({
	name: t.String(),
	email: t.String(),
	profilePicture: t.String()
});

export type CreateUser = Static<typeof createUserSchema>;

export const updateUserSchema = t.Object({
	name: t.Optional(t.String()),
	email: t.Optional(t.String()),
	profilePicture: t.Optional(t.String())
});
