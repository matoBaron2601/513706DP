import { t } from 'elysia';
import { type Static } from 'elysia';
import { baseSchema } from './baseSchema';

const basePlacementQuizSchema = t.Object({
	name: t.String(),
	creatorId: t.String()
});

export const placementQuizSchema = t.Intersect([baseSchema, basePlacementQuizSchema]);
export type PlacementQuiz = Static<typeof placementQuizSchema>;

export const createPlacementQuizSchema = t.Intersect([basePlacementQuizSchema]);
export type CreatePlacementQuiz = Static<typeof createPlacementQuizSchema>;

export const updatePlacementQuizSchema = t.Partial(createPlacementQuizSchema);
export type UpdatePlacementQuiz = Static<typeof updatePlacementQuizSchema>;

// EXTENDED
export const createPlacementQuizWithBlockIdSchema = t.Intersect([createPlacementQuizSchema]);
export type CreatePlacementQuizWithBlockId = Static<typeof createPlacementQuizWithBlockIdSchema>;

export const createPlacementQuizRequestSchema = t.Object({
	blockId: t.String(),
	questionsPerConcept: t.Number()
});
export type CreatePlacementQuizRequest = Static<typeof createPlacementQuizRequestSchema>;

export const createPlacementQuizResponseSchema = t.Object({
	placementQuizId: t.String(),
	baseQuizId: t.String(),
	numberOfConcepts: t.Number(),
	questionsIds: t.Array(t.String())
});
export type CreatePlacementQuizResponse = Static<typeof createPlacementQuizResponseSchema>;
