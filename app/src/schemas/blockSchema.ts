import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from './baseSchema';

const baseBlockSchema = t.Object({
	courseId: t.String(),
	name: t.String()
});

export const blockSchema = t.Intersect([baseSchema, baseBlockSchema]);
export type CourseBlock = Static<typeof blockSchema>;

export const createBlockSchema = t.Intersect([baseBlockSchema]);
export type CreateBlock = Static<typeof createBlockSchema>;

export const updateBlockSchema = t.Partial(createBlockSchema);
export type UpdateBlock = Static<typeof updateBlockSchema>;

// EXTENDED
export const blockWithConceptsSchema = t.Intersect([
	blockSchema,
	t.Object({
		concepts: t.Array(t.String())
	})
]);
export type BlockWithConcepts = Static<typeof blockWithConceptsSchema>;

export const createBlockWithDocumentSchema = t.Intersect([
	createBlockSchema,
	t.Object({
		document: t.File()
	})
]);
export type BlockWithDocument = Static<typeof createBlockWithDocumentSchema>;

export const createBlockWithDocumentPathSchema = t.Intersect([
	createBlockSchema,
	t.Object({
		document: t.String()
	})
]);
export type CreateBlockWithDocumentPath = Static<typeof createBlockWithDocumentPathSchema>;
