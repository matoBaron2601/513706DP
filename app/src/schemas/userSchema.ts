import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from './baseSchema';

const baseUserSchema = t.Object({
	email: t.String(),
	name: t.String(),
	profilePicture: t.String()
});

export const userSchema = t.Intersect([baseSchema, baseUserSchema]);
export type User = Static<typeof userSchema>;

export const createUserSchema = t.Intersect([baseUserSchema]);
export type CreateUser = Static<typeof createUserSchema>;

export const updateUserSchema = t.Partial(createUserSchema);
export type UpdateUser = Static<typeof updateUserSchema>;
