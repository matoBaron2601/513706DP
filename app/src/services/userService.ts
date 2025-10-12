import { user, type CreateUserDto, type UpdateUserDto, type UserDto } from '../db/schema';
import type { UserRepository } from '../repositories/userRepository';
import type { Credentials } from 'google-auth-library';

export class UserNotFoundError extends Error {
	constructor(message: string = 'User not found') {
		super(message);
		this.name = 'UserNotFoundError';
	}
}

export class UserCouldNotBeCreatedError extends Error {
	constructor(message: string = 'User could not be created') {
		super(message);
		this.name = 'UserCouldNotBeCreatedError';
	}
}

export class UserService {
	constructor(private userRepository: UserRepository) {}

	async getUserById(userId: string): Promise<UserDto> {
		const result = await this.userRepository.getUserById(userId);
		if (!result) {
			throw new UserNotFoundError(`User with id ${userId} not found`);
		}
		return result;
	}

	async getUserByEmail(email: string): Promise<UserDto> {
		const result = await this.userRepository.getUserByEmail(email);
		if (!result) {
			throw new UserNotFoundError(`User with email ${email} not found`);
		}
		return result;
	}

	async createUser(newUser: CreateUserDto): Promise<UserDto> {
		const result = await this.userRepository.getUserByEmail(newUser.email);
		if (result) {
			throw new UserCouldNotBeCreatedError(`User with email ${newUser.email} already exists`);
		}
		return this.userRepository.createUser(newUser);
	}

	async deleteUserById(userId: string): Promise<UserDto> {
		const result = await this.userRepository.deleteUserById(userId);
		if (!result) {
			throw new UserNotFoundError(`User with id ${userId} could not be deleted`);
		}
		return result;
	}

	async deleteUserByEmail(email: string): Promise<UserDto> {
		const user = this.getUserByEmail(email);
		const result = await this.userRepository.deleteUserById((await user).id);
		if (!result) {
			throw new UserNotFoundError(`User with email ${email} could not be deleted`);
		}
		return result;
	}

	async updateUser(userId: string, updateUser: UpdateUserDto): Promise<UserDto> {
		const result = await this.userRepository.updateUser(userId, updateUser);
		if (!result) {
			throw new UserNotFoundError(`User with id ${userId} was not found`);
		}
		return result;
	}

	async getOrCreateUser(userData: CreateUserDto): Promise<UserDto> {
		try {
			const existingUser = await this.userRepository.getUserByEmail(userData.email);
			if (!existingUser) {
				return await this.userRepository.createUser(userData);
			}
			return existingUser;
		} catch (e) {
			if (e instanceof UserNotFoundError) {
				return await this.userRepository.createUser(userData);
			}
		}

		return await this.userRepository.createUser(userData);
	}

	async getUsersByIds(userIds: string[]): Promise<UserDto[]> {
		return await this.userRepository.getUsersByIds(userIds);
	}

	// async getUserFromGoogle(tokens: Credentials): Promise<UserDto> {
	// 	const result = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
	// 		headers: {
	// 			Authorization: `Bearer ${tokens.access_token}`
	// 		}
	// 	});
	// 	const profile: {
	// 		sub: string;
	// 		name?: string;
	// 		picture?: string;
	// 		email?: string;
	// 	} = await result.json();
	// 	return {
	// 		id: profile.sub,
	// 		name: profile.name || '',
	// 		email: profile.email || '',
	// 		profilePicture: profile.picture || '',

	// 	};
	// }
}
