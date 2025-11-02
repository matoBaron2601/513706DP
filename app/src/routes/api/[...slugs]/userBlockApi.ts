import { Elysia } from 'elysia';
import { UserBlockService } from '../../../services/userBlockService';
import { createUserBlockSchema } from '../../../schemas/userBlockSchema';
import { UserBlockFacade } from '../../../facades/userBlockFacade';

const userBlockFacade = new UserBlockFacade();
const userBlockService = new UserBlockService();

export const userBlockApi = new Elysia({ prefix: 'userBlock' })
	.post(
		'/',
		async (req) => {
			return await userBlockFacade.handleUserBlockLogic(req.body);
		},
		{
			body: createUserBlockSchema
		}
	)
	.get('/user/:userId/block/:blockId', async (req) => {
		const { userId, blockId } = req.params;
		return await userBlockService.getByBothIdsOrUndefined({ userId, blockId });
	});

export default userBlockApi;
