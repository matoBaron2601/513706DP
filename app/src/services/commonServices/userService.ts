import type { CreateUserDto, UpdateUserDto, UserDto } from '../../db/schema';
import { UserRepository } from '../../repositories/commonRepositories/userRepository';
import type { Transaction } from '../../types';
import { NotFoundError } from '../utils/notFoundError';

export class UserService {
	private repo: UserRepository;

	constructor() {
		this.repo = new UserRepository();
	}

	async getById(userId: string, tx?: Transaction): Promise<UserDto> {
		const user = await this.repo.getById(userId, tx);
		if (!user) throw new NotFoundError(`User with id ${userId} not found`);
		return user;
	}

	async getByEmail(email: string, tx?: Transaction): Promise<UserDto> {
		const user = await this.repo.getByEmail(email, tx);
		if (!user) throw new NotFoundError(`User with email ${email} not found`);
		return user;
	}

	async create(newUser: CreateUserDto, tx?: Transaction): Promise<UserDto> {
		return await this.repo.create(newUser, tx);
	}

	async update(userId: string, updateUser: UpdateUserDto, tx?: Transaction): Promise<UserDto> {
		const user = await this.repo.update(userId, updateUser, tx);
		if (!user) throw new NotFoundError(`User with id ${userId} not found`);
		return user;
	}

	async delete(userId: string, tx?: Transaction): Promise<UserDto> {
		const user = await this.repo.delete(userId, tx);
		if (!user) throw new NotFoundError(`User with id ${userId} not found`);
		return user;
	}

	async getByIds(userIds: string[], tx?: Transaction): Promise<UserDto[]> {
		return await this.repo.getByIds(userIds, tx);
	}

	async getOrCreateUser(userData: CreateUserDto): Promise<UserDto> {
		try {
			const existingUser = await this.repo.getByEmail(userData.email);
			if (!existingUser) {
				return await this.repo.create(userData);
			}
			return existingUser;
		} catch (e) {
			if (e instanceof NotFoundError) {
				return await this.repo.create(userData);
			}
		}

		return await this.repo.create(userData);
	}
}
