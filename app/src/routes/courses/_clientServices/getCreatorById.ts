import type { User } from '@auth/sveltekit';

export const getCreatorById = async (id: string): Promise<User> => {
	const response = await fetch(`/api/auth/${id}`);
	if (!response.ok) {
		throw new Error('Failed to get creator by ID');
	}
	const data = await response.json();
	return data;
};
