import { Elysia} from 'elysia';
import { UserBlockService } from '../../../services/userBlockService';
import { createUserBlockSchema } from '../../../schemas/userBlockSchema';
import { UserBlockFacade } from '../../../facades/userBlockFacade';

const userBlockFacade = new UserBlockFacade();

export const userBlockApi = new Elysia({ prefix: 'userBlock' })
    .post(
        '/',
        async (req) => {
            return await userBlockFacade.handleUserBlockLogic(req.body);
        },
        {
            body: createUserBlockSchema
        }
    );

export default userBlockApi;
