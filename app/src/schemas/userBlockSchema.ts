import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from './baseSchema';

const baseUserBlockSchema = t.Object({
    userId: t.String(),
    blockId: t.String(),
    completed: t.Boolean()
});

export const userBlockSchema = t.Intersect([baseSchema, baseUserBlockSchema]);
export type UserBlock = Static<typeof userBlockSchema>;

export const createUserBlockSchema = t.Intersect([baseUserBlockSchema]);
export type CreateUserBlock = Static<typeof createUserBlockSchema>;

export const updateUserBlockSchema = t.Partial(createUserBlockSchema);
export type UpdateUserBlock = Static<typeof updateUserBlockSchema>;
