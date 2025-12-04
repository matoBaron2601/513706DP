import type { UserBlock } from '../../../../../schemas/userBlockSchema';

/**
 * Fetch user blocks for a given user ID and course ID
 * @param userId 
 * @param courseId 
 * @returns UserBlock | undefined 
 */
export const getUserBlocks = async (userId: string, courseId: string): Promise<UserBlock | undefined> => {
	const response = await fetch(`/api/userBlock/user/${userId}/block/${courseId}`);
	if (!response.ok) {
		throw new Error('Failed to get course blocks');
	}
	const data = await response.json();
	return data;
};
