import type { User } from '@auth/sveltekit';

/**
 * Fetches a creator's details by their ID. 
 * @param id 
 * @returns The creator's user data. 
 */
export const getCreatorById = async (id: string): Promise<User> => {
	const response = await fetch(`/api/auth/${id}`);
	if (!response.ok) {
		throw new Error('Failed to get creator by ID');
	}
	const data = await response.json();
	return data;
};
