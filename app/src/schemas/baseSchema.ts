import { t } from 'elysia';
import { type Static } from 'elysia';

export const baseSchema = t.Object({
	id: t.String(),
	createdAt: t.String(),
	updatedAt: t.Nullable(t.String()),
	deletedAt: t.Nullable(t.String())
});

export type Base = Static<typeof baseSchema>;
