/**
 * @fileoverview
 * This file defines the API endpoints for managing user blocks.
 * It uses the Elysia framework to create routes for creating user blocks
 * and retrieving user blocks by user ID and block ID.
 */

import { Elysia } from 'elysia';
import { UserBlockService } from '../../../services/userBlockService';
import { createUserBlockSchema } from '../../../schemas/userBlockSchema';
import { UserBlockFacade } from '../../../facades/userBlockFacade';

/**
 *  Creates an Elysia application with routes for user block management.
 * @param deps
 * @returns  An Elysia application with user block routes.
 */
export const createUserBlockApi = (deps?: {
	userBlockFacade?: UserBlockFacade;
	userBlockService?: UserBlockService;
}) => {
	const userBlockFacade = deps?.userBlockFacade ?? new UserBlockFacade();
	const userBlockService = deps?.userBlockService ?? new UserBlockService();

	return new Elysia({ prefix: 'userBlock' })
		.post(
			'/',
			async (req) => {
				return await userBlockFacade.getOrCreateUserBlock(req.body);
			},
			{
				body: createUserBlockSchema
			}
		)
		.get('/user/:userId/block/:blockId', async (req) => {
			const { userId, blockId } = req.params;
			return await userBlockService.getByUserIdAndBlockIdOrUndefined({ userId, blockId });
		});
};

export const userBlockApi = createUserBlockApi();
export default userBlockApi;
