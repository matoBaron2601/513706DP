// src/app.d.ts
import type { DefaultSession } from '@auth/sveltekit';

declare global {
	namespace App {
		interface Locals {
			auth: import('@auth/sveltekit').SvelteKitAuthLocals;
		}
	}
}

// rozšírenie Session z @auth/sveltekit
declare module '@auth/sveltekit' {
	interface Session extends DefaultSession {
		accessToken?: string;
		refreshToken?: string;
	}
}
