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
import analysisApi from './analysisApi';

const AUTH_BYPASS = process.env.E2E_AUTH_BYPASS === 'true';

const app = new Elysia({ prefix: '/api' })
	.get('/health', () => 'OK')
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
	.use(analysisApi);

// Assuming 'app' (your Elysia app instance) and 'AUTH_BYPASS' (a boolean constant) 
// are available in the scope where this handler is defined.

/**
 * The core request handler for processing requests before passing them to the Elysia app.
 * This function adds the authenticated user's email to the request headers 
 * while ensuring the request body stream is not consumed in the process.
 * * @param event The SvelteKit/Standard Request event object.
 * @returns A Response object or the result of app.handle(reqForElysia).
 */
const handler: RequestHandler = async (event) => {
    const { request, url, locals } = event;

    // Bypass auth-related paths
    if (!url.pathname.startsWith('/api/auth')) {
        let session = await locals.auth?.();

        // E2E Test Bypass (Maintain original logic)
        if (!session?.user && typeof AUTH_BYPASS !== 'undefined' && AUTH_BYPASS) {
            session = {
                user: {
                    email: 'test@example.com',
                    name: 'E2E Test User',
                    image: 'testimage.png'
                },
                accessToken: 'test-token'
            } as any;
        }

        // Unauthorized Check
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

        // 1. Prepare the new headers, adding the user email
        const headers = new Headers(request.headers);
        headers.set('x-user-email', session.user.email ?? '');

        // 2. FIX: Preserve the body stream by using tee()
        // Check if the request has a body (it is null for GET/HEAD).
        // If present, tee() splits the stream to allow it to be safely used in the new Request object.
        let bodyForElysia: ReadableStream | undefined = undefined;

        if (request.body) {
            // tee() splits the original request body stream into two new, identical streams.
            const [body1, bodyClone] = request.body.tee();
            bodyForElysia = body1;
            // bodyClone is unused and will be garbage collected.
        }

        // 3. Create a new Request object using the new headers and the preserved body stream
        const reqForElysia = new Request(request.url, {
            method: request.method,
            headers: headers,
            // bodyForElysia will be a ReadableStream for POST/PUT requests, or undefined if request.body was null.
            body: bodyForElysia,
            // Pass the original request's properties to maintain full fidelity
            signal: request.signal,
            referrer: request.referrer,
            referrerPolicy: request.referrerPolicy,
            mode: request.mode,
            credentials: request.credentials,
            cache: request.cache,
            integrity: request.integrity
        });
        
        // Ensure to use the correct Request type for logging, if necessary.
        // We log the Request object, which now has the correct body reference.
        console.log('Req for Elysia Headers:', reqForElysia);
        
        // Pass the new request with the preserved body to the Elysia app
        return app.handle(reqForElysia);
    }

    // For /api/auth paths, pass the original request directly to the Elysia app
    return app.handle(request);
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
