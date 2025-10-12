import type { AnswerDto, CreateAnswerDto } from '../db/schema';
import type { AnswerRepository } from '../repositories/answerRepository';
import type { Transaction } from '../types';

export class AnswerNotFoundError extends Error {
	constructor(message: string = 'Answer not found') {
		super(message);
		this.name = 'AnswerNotFoundError';
	}
}

export class AnswerService {
	constructor(private answerRepository: AnswerRepository) {}

	async getAnswerById(answerId: string): Promise<AnswerDto> {
		const result = await this.answerRepository.getAnswerById(answerId);
		if (!result) {
			throw new AnswerNotFoundError(`Answer with id ${answerId} not found`);
		}
		return result;
	}

	async createAnswer(newAnswer: CreateAnswerDto, tx?: Transaction): Promise<AnswerDto> {
		return await this.answerRepository.createAnswer(newAnswer, tx);
	}

	async deleteAnswerById(answerId: string, tx?: Transaction): Promise<AnswerDto> {
		const result = await this.answerRepository.deleteAnswerById(answerId, tx);
		if (!result) {
			throw new AnswerNotFoundError(`Answer with id ${answerId} could not be deleted`);
		}
		return result;
	}

	async updateAnswer(answerId: string, newAnswer: AnswerDto, tx?: Transaction): Promise<AnswerDto> {
		const result = await this.answerRepository.updateAnswer(newAnswer, tx);
		if (!result) {
			throw new AnswerNotFoundError(`Answer with id ${answerId} was not found`);
		}
		return result;
	}
}
