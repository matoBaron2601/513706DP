import { Elysia, t } from 'elysia';
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
const app = new Elysia({
	prefix: '/api'
})
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

type RequestHandler = (v: { request: Request }) => Response | Promise<Response>;

export const GET: RequestHandler = ({ request }) => app.handle(request);
export const POST: RequestHandler = ({ request }) => app.handle(request);
export const DELETE: RequestHandler = ({ request }) => app.handle(request);
export const PUT: RequestHandler = ({ request }) => app.handle(request);
export const PATCH: RequestHandler = ({ request }) => app.handle(request);
