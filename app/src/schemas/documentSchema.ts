import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from './baseSchema';

const baseDocumentSchema = t.Object({
	blockId: t.String(),
	filePath: t.String(),
	isMain: t.Boolean()
});

export const documentSchema = t.Intersect([baseSchema, baseDocumentSchema]);
export type Document = Static<typeof documentSchema>;

export const createDocumentSchema = t.Intersect([baseDocumentSchema]);
export type CreateDocument = Static<typeof createDocumentSchema>;

export const updateDocumentSchema = t.Partial(createDocumentSchema);
export type UpdateDocument = Static<typeof updateDocumentSchema>;

export const createDocumentRequestSchema = t.Object({
	document: t.File(),
	blockId: t.String()
});

export type CreateDocumentRequest = Static<typeof createDocumentRequestSchema>;

export const deleteDocumentRequestSchema = t.Object({
	documentPath: t.String()
});

export type DeleteDocumentRequest = Static<typeof deleteDocumentRequestSchema>;
