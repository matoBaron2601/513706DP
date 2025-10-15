import { t } from 'elysia';
import { type Static } from 'elysia';

export const baseSchema = t.Object({
	id: t.String(),
	createdAt: t.Date(),
	updatedAt: t.Nullable(t.Date()),
	deletedAt: t.Nullable(t.Date())
});

export type Base = Static<typeof baseSchema>;
