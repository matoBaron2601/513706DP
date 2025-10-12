import type { User } from '../../schemas/userSchema';

const getUserByEmail = async (email: string): Promise<User> => {
	const response = await fetch(`/api/user/email/${email}`);
	if (!response.ok) {
		throw new Error('Failed to fetch user');
	}
	return response.json();
};

export default getUserByEmail;
