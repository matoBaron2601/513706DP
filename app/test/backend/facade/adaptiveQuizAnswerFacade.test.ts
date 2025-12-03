import { BaseQuizFacade } from "../../../src/facades/baseQuizFacade";
import type { SubmitAdaptiveQuizAnswer, AdaptiveQuizAnswer } from "../../../src/schemas/adaptiveQuizAnswerSchema";
import { AdaptiveQuizAnswerService } from "../../../src/services/adaptiveQuizAnswerService";

export class AdaptiveQuizAnswerFacade {
    private adaptiveQuizAnswerService: AdaptiveQuizAnswerService;
    private baseQuizFacade: BaseQuizFacade;

    constructor(
        // Inject dependencies for testability
        adaptiveQuizAnswerService: AdaptiveQuizAnswerService = new AdaptiveQuizAnswerService(),
        baseQuizFacade: BaseQuizFacade = new BaseQuizFacade()
    ) {
        this.adaptiveQuizAnswerService = adaptiveQuizAnswerService;
        this.baseQuizFacade = baseQuizFacade;
    }

    // Submits an answer, checks correctness, and stores the result
    async submitAnswer(
        createAdaptiveQuizAnswer: SubmitAdaptiveQuizAnswer
    ): Promise<AdaptiveQuizAnswer> {
        const { baseQuestionId, answerText } = createAdaptiveQuizAnswer;
        
        // 1. Check if the answer is correct using the BaseQuizFacade
        const isAnswerCorrect = await this.baseQuizFacade.isAnswerCorrect(
            baseQuestionId, 
            answerText
        );
        
        // 2. Create the adaptive quiz answer record
        const adaptiveQuizAnswer = await this.adaptiveQuizAnswerService.create({
            answerText,
            isCorrect: isAnswerCorrect,
            baseQuestionId,
            adaptiveQuizId: createAdaptiveQuizAnswer.adaptiveQuizId,
            time: createAdaptiveQuizAnswer.time
        });
        
        return adaptiveQuizAnswer;
    }
}