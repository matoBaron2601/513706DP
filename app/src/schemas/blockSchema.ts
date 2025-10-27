import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from './baseSchema';
import { baseConceptSchema } from './conceptSchema';

const baseBlockSchema = t.Object({
	courseId: t.String(),
	name: t.String(),
	documentPath: t.String()
});

export const blockSchema = t.Intersect([baseSchema, baseBlockSchema]);
export type CourseBlock = Static<typeof blockSchema>;

export const createBlockSchema = t.Intersect([baseBlockSchema]);
export type CreateBlock = Static<typeof createBlockSchema>;

export const updateBlockSchema = t.Partial(createBlockSchema);
export type UpdateBlock = Static<typeof updateBlockSchema>;

// EXTENDED

export const identifyConceptsRequestSchema = t.Object({
	document: t.File()
});
export type IdentifyConceptsRequest = Static<typeof identifyConceptsRequestSchema>;

export const IdentifyConceptsResponseSchema = t.Object({
	concepts: t.Array(t.String()),
	documentPath: t.String()
});
export type IdentifyConceptsResponse = Static<typeof IdentifyConceptsResponseSchema>;

export const identifyConceptsInternalSchema = t.Intersect([
	createBlockSchema,
	t.Object({
		document: t.String()
	})
]);
export type IdentifyConceptsInternal = Static<typeof identifyConceptsInternalSchema>;

export const createBlockRequestSchema = t.Intersect([
	createBlockSchema,
	t.Object({
		concepts: t.Array(
			t.Object({
				name: t.String(),
				difficultyIndex: t.Number()
			})
		),
		chunkingStrategy: t.Enum({
			rtc: 'rtc',
			semantic: 'semantic'
		}),
		retrievalMethod: t.Enum({
			sparse: 'sparse',
			hybrid: 'hybrid'
		}),
		useLLMTransformation: t.Boolean()
	})
]);
export type CreateBlockRequest = Static<typeof createBlockRequestSchema>;

export const createBlockResponseSchema = t.Intersect([
	blockSchema,
	t.Object({
		concepts: t.Array(baseConceptSchema)
	})
]);
export type CreateBlockResponse = Static<typeof createBlockResponseSchema>;

export const getManyByCourseIdRequestSchema = t.Object({
	courseId: t.String()
});
export type GetManyByCourseIdRequest = Static<typeof getManyByCourseIdRequestSchema>;

export const getManyByCourseIdResponseSchema = t.Array(
	t.Intersect([
		blockSchema,
		t.Object({
			concepts: t.Array(t.String())
		})
	])
);
export type GetManyByCourseIdResponse = Static<typeof getManyByCourseIdResponseSchema>;
