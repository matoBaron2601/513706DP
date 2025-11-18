// src/auth.ts
import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,API_JWT_SECRET } from '$env/static/private';
import jwt from 'jsonwebtoken';

export const { handle } = SvelteKitAuth({
	providers: [
		Google({
			clientId: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET
		})
	],
	secret: 'YourSuperSecretKey',
	callbacks: {
		async jwt({ token, account }) {
			if (account) {
				token.access_token = account.access_token;
			}
			return token;
		},
		async session({ session, token }) {
			session.accessToken = jwt.sign(
				{
					sub: token.sub,
					email: token.email
				},
				API_JWT_SECRET,
				{ expiresIn: '30m' }
			);
			return session;
		}
	}
});
