import type { Transaction } from '../types';
import { AnalysisRepository } from '../repositories/analysisRepository';
import type { AnalysisDto } from '../schemas/analysisSchema';

export class AnalysisService {
	constructor(private repo: AnalysisRepository = new AnalysisRepository()) {}

	async getRandomQuestions(
		count: number,
		courseId: string,
		tx?: Transaction
	): Promise<AnalysisDto[]> {
		return await this.repo.getRandomQuestions(count, courseId, tx);
	}
}
