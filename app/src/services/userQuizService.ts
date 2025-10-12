import type { Q } from 'vitest/dist/chunks/reporters.d.BFLkQcL6.js';
import type {
	UserQuizDto,
	CreateUserQuizDto,
	UpdateQuizDto,
	UpdateUserQuizDto
} from '../db/schema';
import type { UserQuizRepository } from '../repositories/userQuizRepository';
import type { Transaction } from '../types';

class UserQuizNotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'UserQuizNotFoundError';
	}
}

export class UserQuizService {
	constructor(private userQuizRepository: UserQuizRepository) {}

	async getUserQuizById(userQuizId: string): Promise<UserQuizDto> {
		const userQuiz = await this.userQuizRepository.getUserQuizById(userQuizId);
		if (!userQuiz) {
			throw new UserQuizNotFoundError(`UserQuiz with id ${userQuizId} not found`);
		}
		return userQuiz;
	}

	async createUserQuiz(newUserQuiz: CreateUserQuizDto, tx?: Transaction): Promise<UserQuizDto> {
		return this.userQuizRepository.createUserQuiz(newUserQuiz, tx);
	}

	async deleteUserQuizById(userQuizId: string): Promise<UserQuizDto> {
		const userQuiz = await this.userQuizRepository.deleteUserQuizById(userQuizId);
		if (!userQuiz) {
			throw new UserQuizNotFoundError(`UserQuiz with id ${userQuizId} not found`);
		}
		return userQuiz;
	}

	async updateUserQuiz(userQuizId: string, newUserQuiz: UpdateUserQuizDto, tx?: Transaction): Promise<UserQuizDto> {
		const userQuiz = await this.userQuizRepository.updateUserQuiz(userQuizId, newUserQuiz, tx);
		if (!userQuiz) {
			throw new UserQuizNotFoundError(`UserQuiz with id ${newUserQuiz.id} not found`);
		}
		return userQuiz;
	}

	async deleteUserQuizzesByQuizId(quizId: string, tx?: Transaction): Promise<UserQuizDto> {
		return this.userQuizRepository.deleteUserQuizzesByQuizId(quizId, tx);
	}

	async getUserQuizzesByUserEmail(userEmail: string): Promise<UserQuizDto[]> {
		return this.userQuizRepository.getUserQuizzesByUserEmail(userEmail);
	}
}
