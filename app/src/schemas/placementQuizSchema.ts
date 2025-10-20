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