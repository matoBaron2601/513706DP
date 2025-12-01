import { Elysia } from 'elysia';
import { UserBlockService } from '../../../services/userBlockService';
import { createUserBlockSchema } from '../../../schemas/userBlockSchema';
import { UserBlockFacade } from '../../../facades/userBlockFacade';

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
