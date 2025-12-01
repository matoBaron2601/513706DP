import type { CreateUserBlock, UserBlock } from '../../../../../../../schemas/userBlockSchema';

export const getUserBlock = async (createUserBlock: CreateUserBlock): Promise<UserBlock> => {
	const response = await fetch(`/api/userBlock`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(createUserBlock)
	});

	if (!response.ok) {
		throw new Error('Failed to get course block');
	}
	return await response.json();
};

