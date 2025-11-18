import type { RequestHandler } from './$types';
import { Elysia } from 'elysia';
import { openapi } from '@elysiajs/openapi';
import authApi from './authApi';
import courseApi from './courseApi';
import courseBlockApi from './blockApi';
import { conceptApi } from './conceptApi';
import userBlockApi from './userBlockApi';
import adaptiveQuizAnswerApi from './adaptiveQuizAnswerApi';
import adaptiveQuizApi from './adaptiveQuizApi';
import { placementQuizApi } from './placementQuizApi';
import { bucketApi } from './bucketApi';
import documentApi from './documentApi';
import { AppError } from '../../../errors/AppError';

const app = new Elysia({ prefix: '/api' })
	.onError(({ error, set }) => {
		if (error instanceof AppError) {
			set.status = error.status;
			return {
				code: error.code,
				message: error.message,
				details: error.details ?? null
			};
		}

		console.error('UNHANDLED_ERROR', error);
		set.status = 500;
		return {
			code: 'INTERNAL_ERROR',
			message: 'Internal server error',
			details: null
		};
	})
	.use(openapi())
	.use(authApi)
	.use(courseApi)
	.use(courseBlockApi)
	.use(conceptApi)
	.use(userBlockApi)
	.use(adaptiveQuizApi)
	.use(adaptiveQuizAnswerApi)
	.use(placementQuizApi)
	.use(bucketApi)
	.use(documentApi);

const handler: RequestHandler = async (event) => {
	const { request, url, locals } = event;

	if (!url.pathname.startsWith('/api/auth')) {
		const session = await locals.auth?.();

		if (!session?.user) {
			return new Response(
				JSON.stringify({
					code: 'UNAUTHORIZED',
					message: 'Unauthorized',
					details: null
				}),
				{
					status: 401,
					headers: { 'content-type': 'application/json' }
				}
			);
		}

		const headers = new Headers(request.headers);
		headers.set('x-user-email', session.user.email ?? '');
		const reqForElysia = new Request(request, { headers });

		return app.handle(reqForElysia);
	}

	return app.handle(request);
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
