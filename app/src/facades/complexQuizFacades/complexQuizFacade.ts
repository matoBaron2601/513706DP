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
import type { BaseQuestionWithOptions } from '../../schemas/commonSchemas/baseQuestionSchema';

export class ComplexQuizFacade {
	private openAiService: OpenAiService;
	private baseQuizService: BaseQuizService;
	private baseQuestionService: BaseQuestionService;
	private baseOptionsService: BaseOptionService;
	private complexQuizService: ComplexQuizService;
	private complexQuestionService: ComplexQuizQuestionService;
	private conceptService: ConceptService;
	private typesenseService: TypesenseService;

	constructor() {
		this.openAiService = new OpenAiService();
		this.baseQuizService = new BaseQuizService();
		this.baseQuestionService = new BaseQuestionService();
		this.baseOptionsService = new BaseOptionService();
		this.complexQuizService = new ComplexQuizService();
		this.complexQuestionService = new ComplexQuizQuestionService();
		this.conceptService = new ConceptService();
		this.typesenseService = new TypesenseService();
	}

	async createPlacementComplexQuiz(
		data: CreateComplexQuizExtended
	): Promise<{ baseQuizId: string; complexQuizId: string }> {
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
					version: 0
				},
				tx
			);

			for (const [conceptId, chunks] of Object.entries(contentToDocumentsMap)) {
				const conceptName = concepts.find((c) => c.id === conceptId)?.name;
				if (!conceptName || !chunks) continue;
				const placementQuestions = await this.openAiService.createPlacementQuestions(
					conceptName,
					concepts.map((c) => c.name),
					chunks
				);
				await this.createQuestionsAndOptions(
					conceptId,
					placementQuestions,
					baseQuizId,
					complexQuizId,
					tx
				);
			}

			return { baseQuizId, complexQuizId };
		});
	}

	private async createQuestionsAndOptions(
		conceptId: string,
		questions: BaseQuizWithQuestionsAndOptions,
		baseQuizId: string,
		complexQuizId: string,
		tx: Transaction
	): Promise<string[]> {
		const questionIds: string[] = [];

		for (const question of questions.questions) {
			console.log('Creating question:', question.questionText);
			console.log('Question', question);
			const { id: baseQuestionId } = await this.baseQuestionService.create(
				{
					questionText: question.questionText,
					correctAnswerText: question.correctAnswerText,
					baseQuizId: baseQuizId
				},
				tx
			);
			const complexQuestion = await this.complexQuestionService.create(
				{
					baseQuestionId: baseQuestionId,
					conceptId: conceptId,
					complexQuizId: complexQuizId
				},
				tx
			);
			questionIds.push(baseQuestionId);
			if (question.options.length === 0 || question.options === undefined) {
				continue;
			}
			const options = question.options.map((option) => ({
				optionText: option.optionText,
				baseQuestionId: baseQuestionId
			}));

			const baseOptions = await this.baseOptionsService.createMany(options, tx);
			console.log(`Created question ID: ${baseQuestionId} with ${baseOptions.length} options.`);
		}

		return questionIds;
	}

	async getNextQuiz(courseBlockId: string) {
		const complexQuiz = await this.complexQuizService.getQuizWithSmallerVersion(courseBlockId);
		return await this.getBaseQuestionWithOptions(complexQuiz.baseQuizId);
	}

	private async getBaseQuestionWithOptions(baseQuizId: string): Promise<BaseQuestionWithOptions[]> {
		const questions = await this.baseQuestionService.getByBaseQuizId(baseQuizId);

		const result: BaseQuestionWithOptions[] = [];

		for (const question of questions) {
			const options = await this.baseOptionsService.getByBaseQuestionId(question.id);

			const mappedOptions = options.map((option) => ({
				optionText: option.optionText
			}));

			const questionWithOptions: BaseQuestionWithOptions = {
				questionText: question.questionText,
				correctAnswerText: question.correctAnswerText,
				options: mappedOptions
			};

			result.push(questionWithOptions);
		}

		return result;
	}
}
