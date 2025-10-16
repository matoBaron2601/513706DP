import { db } from '../../db/client';
import { type ConceptDto } from '../../db/schema';
import type { BaseQuizWithQuestionsAndOptions } from '../../schemas/commonSchemas/baseQuizSchema';
import type { CreateComplexQuizExtended } from '../../schemas/complexQuizSchemas/complexQuizSchema';
import { BaseQuestionService } from '../../services/commonServices/baseQuestionService';
import { BaseQuizService } from '../../services/commonServices/baseQuizService';
import { ComplexQuizService } from '../../services/complexQuizServices/complexQuizService';
import { ConceptService } from '../../services/complexQuizServices/conceptService';
import { TypesenseService } from '../../typesense/typesenseService';
import { BaseOptionService } from '../../services/commonServices/baseOptionService';
import type { Transaction } from '../../types';
import { ComplexQuizQuestionService } from '../../services/complexQuizServices/complexQuizQuestion';
import { OpenAiService } from '../../services/commonServices/openAIService';

export class ComplexQuizFacade {
	constructor(
		private openAiService: OpenAiService,
		private baseQuizService: BaseQuizService,
		private baseQuestionService: BaseQuestionService,
		private baseOptionsService: BaseOptionService,
		private complexQuizService: ComplexQuizService,
		private complexQuestionService: ComplexQuizQuestionService,
		private conceptService: ConceptService,
		private typesenseService: TypesenseService
	) {
		this.openAiService = new OpenAiService();
		this.baseQuizService = new BaseQuizService();
		this.baseQuestionService = new BaseQuestionService();
		this.baseOptionsService = new BaseOptionService();
		this.complexQuizService = new ComplexQuizService();
		this.complexQuestionService = new ComplexQuizQuestionService();
		this.conceptService = new ConceptService();
		this.typesenseService = new TypesenseService();
	}

	async createInitialComplexQuiz(data: CreateComplexQuizExtended) {
		return await db.transaction(async (tx) => {
			const concepts: ConceptDto[] = await this.conceptService.getByCourseBlockId(
				data.courseBlockId,
				tx
			);

			const contentToDocumentsMap = await this.typesenseService.createContentToDocumentsMap(
				concepts,
				data.courseBlockId
			);

			const { id: baseQuizId } = await this.baseQuizService.create({}, tx);
			const { id: complexQuizId } = await this.complexQuizService.create(
				{
					baseQuizId,
					courseBlockId: data.courseBlockId,
					version: 1
				},
				tx
			);

			for (const [conceptId, chunks] of Object.entries(contentToDocumentsMap)) {
				const conceptName = concepts.find((c) => c.id === conceptId)?.name;
				if(!conceptName || !chunks) continue;
				const baseQuiz = await this.openAiService.createInitialQuiz(conceptName, chunks);
				await this.createQuestionsAndOptions(
					conceptId,
					baseQuiz,
					baseQuizId,
					complexQuizId,
					tx
				);
			}

			return contentToDocumentsMap;
		});
	}

	private async createQuestionsAndOptions(
		conceptId: string,
		baseQuiz: BaseQuizWithQuestionsAndOptions,
		baseQuizId: string,
		complexQuizId: string,
		tx: Transaction
	): Promise<string[]> {
		const questionIds: string[] = [];

		for (const mockedQuestion of baseQuiz.questions) {
			const { id: baseQuestionId } = await this.baseQuestionService.create(
				{
					questionText: mockedQuestion.questionText,
					correctAnswerText: mockedQuestion.correctAnswerText,
					baseQuizId: baseQuizId
				},
				tx
			);
			await this.complexQuestionService.create(
				{
					baseQuestionId: baseQuestionId,
					conceptId: conceptId,
					complexQuizId: complexQuizId
				},
				tx
			);
			questionIds.push(baseQuestionId);
			const options = mockedQuestion.options.map((option) => ({
				optionText: option.optionText,
				baseQuestionId: baseQuestionId
			}));

			await this.baseOptionsService.createMany(options, tx);
		}

		return questionIds;
	}
}
