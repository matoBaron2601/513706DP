/**
 * @fileoverview
 * This file defines the API endpoints for user authentication and management.
 * It uses the Elysia framework to create routes for getting user details,
 * creating new users, updating existing users, and getting or creating users
 * based on provided information.
 */

import { Elysia } from 'elysia';
import { UserService } from '../../../services/userService';
import { createUserSchema, updateUserSchema } from '../../../schemas/userSchema';

/**
 *  Creates an Elysia application with routes for user authentication and management.
 * @param userService
 * @returns An Elysia application with auth routes.
 */
export const createAuthApi = (userService: UserService = new UserService()) =>
	new Elysia({ prefix: 'auth' })
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

export const authApi = createAuthApi();
export default authApi;
