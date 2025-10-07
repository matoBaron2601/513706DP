import type { QuestionDto, CreateQuestionDto } from '../db/schema';
import type { QuestionRepository } from '../repositories/questionRepository';
import type { Transaction } from '../types';

class QuestionNotFoundError extends Error {
	constructor(message: string = 'Question not found') {
		super(message);
		this.name = 'QuestionNotFoundError';
	}
}

export class QuestionService {
	constructor(private questionRepository: QuestionRepository) {}

	async getQuestionById(questionId: string): Promise<QuestionDto> {
		const result = await this.questionRepository.getQuestionById(questionId);
		if (!result) {
			throw new QuestionNotFoundError(`Question with id ${questionId} not found`);
		}
		return result;
	}

	async createQuestionTransactional(
		newQuestion: CreateQuestionDto,
		tx: Transaction
	): Promise<QuestionDto> {
		return await this.questionRepository.createQuestionTransactional(newQuestion, tx);
	}

	async deleteQuestionByIdTransactional(questionId: string, tx: Transaction): Promise<QuestionDto> {
		const result = await this.questionRepository.deleteQuestionByIdTransactional(questionId, tx);
		if (!result) {
			throw new QuestionNotFoundError(`Question with id ${questionId} could not be deleted`);
		}
		return result;
	}

	async updateQuestion(newQuestion: QuestionDto): Promise<QuestionDto> {
		const result = await this.questionRepository.updateQuestion(newQuestion);
		if (!result) {
			throw new QuestionNotFoundError(`Question with id ${newQuestion.id} was not found`);
		}
		return result;
	}

	async getQuestionsByQuizIdTransactional(quizId: string, tx: Transaction): Promise<QuestionDto[]> {
		const result = await this.questionRepository.getQuestionsByQuizIdTransactional(quizId, tx);
		if (!result) {
			throw new QuestionNotFoundError(`Questions for quiz with id ${quizId} not found`);
		}
		return result;
	}

	async getQuestionsByQuizId(quizId: string): Promise<QuestionDto[]> {
		const result = await this.questionRepository.getQuestionsByQuizId(quizId);
		if (!result) {
			throw new QuestionNotFoundError(`Questions for quiz with id ${quizId} not found`);
		}
		return result;
	}
}
