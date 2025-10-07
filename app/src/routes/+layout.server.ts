import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (session?.user) {
		await fetch('http://localhost:5173/api/auth/getOrCreate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: session.user.email,
				name: session.user.name,
				profilePicture: session.user.image
			})
		});
	}

	const authPage = '/auth';

	if (!session && event.url.pathname !== authPage) {
		throw redirect(302, authPage);
	}

	return {
		session
	};
};
