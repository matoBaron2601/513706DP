import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
/**
 * @fileoverview
 * This file handles server-side loading for the layout route. It checks for user authentication
 * and redirects to the auth page if the user is not authenticated,
 * unless running in an end-to-end testing environment with auth bypass enabled.
 */
const AUTH_BYPASS = process.env.E2E_AUTH_BYPASS === 'true';

export const load: LayoutServerLoad = async (event) => {
	let session = await event.locals.auth();

	// Test-only fake session
	if (!session?.user && AUTH_BYPASS) {
		session = {
			user: {
				email: 'test@example.com',
				name: 'E2E Test User',
				image: 'https://d8iqbmvu05s9c.cloudfront.net/ajprhqgqg1otf7d5sm7u3brf27gv'
			},
			accessToken: 'test-token'
		} as any;
	}

	if (session?.user) {
		await fetch('http://localhost:5173/api/auth/getOrCreate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: session.user.email,
				name: session.user.name,
				profilePicture: session.user.image,
				accessToken: session.accessToken
			})
		});
	}

	const authPage = '/auth';

	// Only redirect to /auth if we're NOT bypassing auth
	if (!session && !AUTH_BYPASS && event.url.pathname !== authPage) {
		throw redirect(302, authPage);
	}

	return { session };
};
