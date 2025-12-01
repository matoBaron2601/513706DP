import type { UserBlock } from '../../../../../schemas/userBlockSchema';

const getUserBlocks = async (userId: string, courseId: string): Promise<UserBlock | undefined> => {
	const response = await fetch(`/api/userBlock/user/${userId}/block/${courseId}`);
	if (!response.ok) {
		throw new Error('Failed to get course blocks');
	}
	const data = await response.json();
	return data;
};

export default getUserBlocks;
