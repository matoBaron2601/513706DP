import { Elysia, t } from 'elysia';
import { UserService } from '../../../services/userService';
import { createUserSchema, updateUserSchema } from '../../../schemas/commonSchemas/userSchema';

const userService = new UserService();

export const authApi = new Elysia({ prefix: 'auth' })

	.get('/:id', async (req) => {
		return await userService.getById(req.params.id);
	})
	.get('/email/:email', async (req) => {
		return await userService.getByEmail(req.params.email);
	})
	.post(
		'/',
		async (req) => {
			return await userService.create(req.body);
		},
		{
			body: createUserSchema
		}
	)
	.put(
		'/:id',
		async (req) => {
			return await userService.update(req.params.id, req.body);
		},
		{
			body: updateUserSchema
		}
	)

	.post(
		'/getOrCreate',
		async (req) => {
			return await userService.getOrCreateUser(req.body);
		},
		{
			body: createUserSchema
		}
	);

export default authApi;
