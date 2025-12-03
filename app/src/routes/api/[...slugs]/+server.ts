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
import documentApi from './documentApi';
import { AppError } from '../../../errors/AppError';

const AUTH_BYPASS = process.env.E2E_AUTH_BYPASS === 'true';

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
	.use(documentApi)

//     const handler: RequestHandler = async (event) => {
//     const { request, url, locals } = event;

//     // Bypass auth-related paths
//     if (!url.pathname.startsWith('/api/auth')) {
//         let session = await locals.auth?.();

//         // E2E Test Bypass (Maintain original logic)
//         if (!session?.user && typeof AUTH_BYPASS !== 'undefined' && AUTH_BYPASS) {
//             session = {
//                 user: {
//                     email: 'test@example.com',
//                     name: 'E2E Test User',
//                     image: 'https://d8iqbmvu05s9c.cloudfront.net/ajprhqgqg1otf7d5sm7u3brf27gv'
//                 },
//                 accessToken: 'test-token'
//             } as any;
//         }

//         // Unauthorized Check
//         if (!session?.user) {
//             return new Response(
//                 JSON.stringify({
//                     code: 'UNAUTHORIZED',
//                     message: 'Unauthorized',
//                     details: null
//                 }),
//                 {
//                     status: 401,
//                     headers: { 'content-type': 'application/json' }
//                 }
//             );
//         }

//         const headers = new Headers(request.headers);
//         headers.set('x-user-email', session.user.email ?? '');

//         let bodyForElysia: ReadableStream | undefined = undefined;

//         if (request.body) {
//             const [body1, bodyClone] = request.body.tee();
//             bodyForElysia = body1;
//         }

//         const reqForElysia = new Request(request.url, {
//             method: request.method,
//             headers: headers,
//             body: bodyForElysia,
//             signal: request.signal,
//             referrer: request.referrer,
//             referrerPolicy: request.referrerPolicy,
//             mode: request.mode,
//             credentials: request.credentials,
//             cache: request.cache,
//             integrity: request.integrity
//         });
        
//         return app.handle(reqForElysia);
//     }
//     return app.handle(request);
// };
const handler: RequestHandler = async (event) => {
	const { request, url, locals } = event;
	if (!url.pathname.startsWith('/api/auth')) {
		let session = await locals.auth?.();

		if (!session?.user && AUTH_BYPASS) {
			session = {
				user: {
					email: 'test@example.com',
					name: 'E2E Test User',
					image: 'testimage.png'
				},
				accessToken: 'test-token'
			} as any;
		}

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
