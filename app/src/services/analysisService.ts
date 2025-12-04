/**
 * @fileoverview
 * Service for managing analysis entities.
 */
import type { Transaction } from '../types';
import { AnalysisRepository } from '../repositories/analysisRepository';
import type { AnalysisDto } from '../schemas/analysisSchema';

export class AnalysisService {
	constructor(private repo: AnalysisRepository = new AnalysisRepository()) {}

	/**
	 * Get random questions for analysis
	 * @param count
	 * @param courseId
	 * @param tx
	 * @returns AnalysisDto[]
	 */
	async getRandomQuestions(
		count: number,
		courseId: string,
		tx?: Transaction
	): Promise<AnalysisDto[]> {
		return await this.repo.getRandomQuestions(count, courseId, tx);
	}
}
