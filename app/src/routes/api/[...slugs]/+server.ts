import { Elysia, t } from 'elysia';
import { typesenseApi } from './typesenseApi';
import { chunkerApi } from './chunkerApi';
import { openapi } from '@elysiajs/openapi';
import userApi from './userApi';
import { quizApi } from './quizApi';
import authApi from './authApi';

const app = new Elysia({
	prefix: '/api'
})
	.use(openapi())
	.use(authApi)
	.use(userApi)
	.use(quizApi)
	.use(typesenseApi)
	.use(chunkerApi);

type RequestHandler = (v: { request: Request }) => Response | Promise<Response>;

export const GET: RequestHandler = ({ request }) => app.handle(request);
export const POST: RequestHandler = ({ request }) => app.handle(request);
export const DELETE: RequestHandler = ({ request }) => app.handle(request);
export const PUT: RequestHandler = ({ request }) => app.handle(request);
export const PATCH: RequestHandler = ({ request }) => app.handle(request);
