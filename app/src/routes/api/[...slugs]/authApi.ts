import { Elysia, t } from 'elysia';
import { UserRepository } from '../../../repositories/userRepository';
import { UserService } from '../../../services/userService';
import { createUserSchema, updateUserSchema } from '../../../schemas/userSchema';

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

export const authApi = new Elysia({ prefix: 'auth' })

	.get('/:id', async (req) => {
		return await userService.getUserById(req.params.id);
	})
	.post(
		'/',
		async (req) => {
			return await userService.createUser(req.body);
		},
		{
			body: createUserSchema
		}
	)
	.put(
		'/:id',
		async (req) => {
			return await userService.updateUser(req.params.id, req.body);
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
