import { Elysia, t } from 'elysia';
import { openapi } from '@elysiajs/openapi';
import authApi from './authApi';
import courseApi from './courseApi';
import courseBlockApi from './blockApi';
import { conceptApi } from './conceptApi';
import { userBlock } from '../../../db/schema';
import userBlockApi from './userBlockApi';
const app = new Elysia({
	prefix: '/api'
})
	.use(openapi())
	.use(authApi)
	.use(courseApi)
	.use(courseBlockApi)
	.use(conceptApi)
	.use(userBlockApi);

type RequestHandler = (v: { request: Request }) => Response | Promise<Response>;

export const GET: RequestHandler = ({ request }) => app.handle(request);
export const POST: RequestHandler = ({ request }) => app.handle(request);
export const DELETE: RequestHandler = ({ request }) => app.handle(request);
export const PUT: RequestHandler = ({ request }) => app.handle(request);
export const PATCH: RequestHandler = ({ request }) => app.handle(request);
