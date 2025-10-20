import { AdaptiveQuizService } from '../services/adaptiveQuizService';

export class AdaptiveQuizFacade {
	private adaptiveQuizService: AdaptiveQuizService;

	constructor() {
		this.adaptiveQuizService = new AdaptiveQuizService();
	}

	public async getNextQuiz(userBlockId: string) {}
}
