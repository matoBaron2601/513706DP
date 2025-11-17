import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { page } from '$app/state';
import type { User } from '../schemas/userSchema';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export const getUserFromPage = () => {
	return {
		id: page.data.session?.user?.id ?? '',
		email: page.data.session?.user?.email ?? '',
		image: page.data.session?.user?.image ?? '',
		name: page.data.session?.user?.name ?? ''
	};
};

export const getUserByEmail = async (email: string): Promise<User> => {
	const result = await fetch(`/api/auth/email/${email}`);
	return await result.json();
};
