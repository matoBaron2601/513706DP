import { Elysia} from 'elysia';
import { UserBlockService } from '../../../services/userBlockService';
import { createUserBlockSchema } from '../../../schemas/userBlockSchema';

const userBlockService = new UserBlockService();

export const userBlockApi = new Elysia({ prefix: 'userBlock' })
    .post(
        '/',
        async (req) => {
            return await userBlockService.getOrCreateByUserId(req.body);
        },
        {
            body: createUserBlockSchema
        }
    );

export default userBlockApi;
