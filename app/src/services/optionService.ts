import { type OptionDto, type CreateOptionDto, option } from '../db/schema';
import type { OptionRepository } from '../repositories/optionRepository';
import type { Transaction } from '../types';

class OptionNotFoundError extends Error {
	constructor(message: string = 'Option not found') {
		super(message);
		this.name = 'OptionNotFoundError';
	}
}

export class OptionService {
	constructor(private optionRepository: OptionRepository) {}

	async getOptionById(optionId: string): Promise<OptionDto> {
		const result = await this.optionRepository.getOptionById(optionId);
		if (!result) {
			throw new OptionNotFoundError(`Option with id ${optionId} not found`);
		}
		return result;
	}

	async createOptionTransactional(newOption: CreateOptionDto, tx: Transaction): Promise<OptionDto> {
		const result = await tx.insert(option).values(newOption).returning();
		return result[0];
	}

	async deleteOptionByIdTransactional(optionId: string, tx: Transaction): Promise<OptionDto> {
		const result = await this.optionRepository.deleteOptionByIdTransactional(optionId, tx);
		if (!result) {
			throw new OptionNotFoundError(`Option with id ${optionId} could not be deleted`);
		}
		return result;
	}

	async updateOption(newOption: OptionDto): Promise<OptionDto> {
		const result = await this.optionRepository.updateOption(newOption);
		if (!result) {
			throw new OptionNotFoundError(`Option with id ${newOption.id} was not found`);
		}
		return result;
	}

	async getOptionsByQuestionIdTransactional(
		questionId: string,
		tx: Transaction
	): Promise<OptionDto[]> {
		const result = await this.optionRepository.getOptionsByQuestionIdTransactional(questionId, tx);
		if (!result) {
			throw new OptionNotFoundError(`Options for question with id ${questionId} not found`);
		}
		return result;
	}

	async getOptionsByQuestionId(
		questionId: string,
	): Promise<OptionDto[]> {
		const result = await this.optionRepository.getOptionsByQuestionId(questionId);
		if (!result) {
			throw new OptionNotFoundError(`Options for question with id ${questionId} not found`);
		}
		return result;
	}
}
