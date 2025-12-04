/**
 * @fileoverview
 * This service handles interactions with the OpenAI API, including generating quizzes,
 */
import { config } from 'dotenv';
import type { BaseQuizWithQuestionsAndOptionsBlank } from '../schemas/baseQuizSchema';
import OpenAI from 'openai';
import { learnChunksPrompt } from './openAiHelpers/learnChunks';
import { placementQuizMessage } from './openAiHelpers/placementQuizMessage';
import { preRetrievalTransformMessage } from './openAiHelpers/preRetrievalTransformMessage';
import { identifyConceptsMessage } from './openAiHelpers/identifyConceptMessage';
import { isAnswerCorrectMessage } from './openAiHelpers/inAnswerCorrentMessage';
import { parseOpenAiResponse } from './openAiHelpers/parseOpenAiResponse';
import { ValidationError } from '../errors/AppError';
import { validatePlacementQuizMessage } from './openAiHelpers/validatePlacementQuizMessage';
import { adaptiveQuizMessage } from './openAiHelpers/adaptiveQuizMessage';
import { validateAdaptiveQuizMessage } from './openAiHelpers/validateAdaptiveQuizMessage';

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
});
config();

export type Role = 'user' | 'assistant' | 'system';

export interface ChoiceMessage {
	role: Role;
	content: string;
}

interface Choice {
	index: number;
	message: ChoiceMessage;
	finish_reason: string;
}

interface Usage {
	prompt_tokens: number;
	completion_tokens: number;
	total_tokens: number;
}

export interface OpenAIChatCompletionResponse {
	id: string;
	object: 'chat.completion';
	created: number;
	model: string;
	choices: Choice[];
	usage: Usage;
}

export interface EmbeddingResponse {
	object: 'list';
	data: EmbeddingData[];
}

export interface EmbeddingData {
	object: 'embedding';
	index: number;
	embedding: number[];
}

export class OpenAiService {
	/**
	 * Calls the OpenAI API with the provided messages. 
	 * @param messages 
	 * @returns OpenAI.Chat.ChatCompletion 
	 */
	async callOpenAI(messages: ChoiceMessage[]): Promise<OpenAI.Chat.ChatCompletion> {
		try {
			const response = await openai.chat.completions.create({
				model: 'gpt-4o-mini',
				messages
			});

			return response;
		} catch (error) {
			console.error('Error calling OpenAI:', error);
			throw error;
		}
	}

	/**
	 * Identify concepts from the given text using OpenAI.
	 * @param text The input text to analyze.
	 * @returns A list of identified concepts.
	 */
	async identifyConcepts(text: string): Promise<string[]> {
		const response = await this.callOpenAI([identifyConceptsMessage(text)]);
		const parsedOpenAiResponse = parseOpenAiResponse(response);
		const concepts = JSON.parse(parsedOpenAiResponse);

		const validateConceptsAreListOfStrings = (concepts: any): concepts is string[] => {
			return Array.isArray(concepts) && concepts.every((concept) => typeof concept === 'string');
		};

		const conceptsAreValid = validateConceptsAreListOfStrings(concepts);
		if (!conceptsAreValid) {
			throw new ValidationError('Invalid concepts format.');
		}

		return concepts;
	}

	/**
	 * Transform text before retrieval using OpenAI.
	 * @param text The input text to transform.
	 * @returns The transformed text.
	 */
	async preRetrievalTransform(text: string): Promise<string> {
		return (
			(await this.callOpenAI([preRetrievalTransformMessage(text)])).choices[0].message.content ?? ''
		);
	}

	/**
	 * Create placement questions for a given concept using OpenAI.
	 * @param concept The concept to create questions for.
	 * @param chunks The chunks of text to learn from.
	 * @returns A quiz with questions and options.
	 */
	async createPlacementQuestions(
		concept: string,
		chunks: string[]
	): Promise<BaseQuizWithQuestionsAndOptionsBlank> {
		const learnChunksMessage = {
			role: 'system' as Role,
			content: learnChunksPrompt(chunks)
		};

		const generateQuestionsMessage = {
			role: 'user' as Role,
			content: placementQuizMessage(concept)
		};

		const validatedPlacementQuizMessage = {
			role: 'system' as Role,
			content: validatePlacementQuizMessage(concept)
		};

		const response = await this.callOpenAI([
			learnChunksMessage,
			generateQuestionsMessage,
			validatedPlacementQuizMessage
		]);
		const parsedOpenAiResponse = parseOpenAiResponse(response);
		const parsedQuiz = JSON.parse(parsedOpenAiResponse);

		if (!this.isValidBaseQuizWithQuestionsAndOptions(parsedQuiz)) {
			throw new ValidationError('Invalid quiz format.');
		}

		return parsedQuiz as BaseQuizWithQuestionsAndOptionsBlank;
	}

	/**
	 * Create adaptive quiz questions for a given concept using OpenAI.
	 * @param concept The concept to create questions for.
	 * @param concepts The list of all concepts.
	 * @param chunks The chunks of text to learn from.
	 * @param numberOfQuestionsA1 Number of A1 level questions.
	 * @param numberOfQuestionsA2 Number of A2 level questions.
	 * @param numberOfQuestionsB1 Number of B1 level questions.
	 * @param numberOfQuestionsB2 Number of B2 level questions.
	 * @param questionHistory History of previous questions and answers.
	 */
	async createAdaptiveQuizQuestions(
		concept: string,
		concepts: string[],
		chunks: string[],
		numberOfQuestionsA1: number,
		numberOfQuestionsA2: number,
		numberOfQuestionsB1: number,
		numberOfQuestionsB2: number,
		questionHistory: {
			questionText: string;
			correctAnswerText: string;
			isCorrect: boolean;
		}[]
	): Promise<BaseQuizWithQuestionsAndOptionsBlank> {
		const learnChunksMessage = {
			role: 'system' as Role,
			content: learnChunksPrompt(chunks)
		};

		const generateQuestionsMessage = {
			role: 'user' as Role,
			content: adaptiveQuizMessage(
				concept,
				numberOfQuestionsA1,
				numberOfQuestionsA2,
				numberOfQuestionsB1,
				numberOfQuestionsB2,
				questionHistory
			)
		};

		const validatedAdaptiveQuizMessage = {
			role: 'user' as Role,
			content: validateAdaptiveQuizMessage(concept)
		};

		const response = await this.callOpenAI([
			learnChunksMessage,
			generateQuestionsMessage,
			validatedAdaptiveQuizMessage
		]);

		const responseContent =
			response.choices[0].message.content?.replace(/```json|```/g, '').trim() || '';
		let parsedQuiz: any;
		try {
			parsedQuiz = JSON.parse(responseContent);
		} catch (e) {
			throw new Error('Error parsing JSON: ' + e);
		}

		if (!this.isValidBaseQuizWithQuestionsAndOptions(parsedQuiz)) {
			throw new Error('Invalid quiz format.');
		}

		return parsedQuiz as BaseQuizWithQuestionsAndOptionsBlank;
	}

	/**
	 * Check if the provided answer is correct using OpenAI.
	 * @param question The question text.
	 * @param correctAnswer The correct answer text.
	 * @param answer The answer to check.
	 * @returns True if the answer is correct, false otherwise.
	 */
	async isAnswerCorrect(question: string, correctAnswer: string, answer: string): Promise<boolean> {
		const response = await this.callOpenAI([
			isAnswerCorrectMessage(question, correctAnswer, answer)
		]);
		const content = response.choices[0].message.content?.trim().toLowerCase() || '';
		return content === 'yes';
	}

	/**
	 * Validate the structure of a quiz object.
	 * @param obj The quiz object to validate.
	 * @returns True if the object is a valid quiz, false otherwise.
	 */
	private async isValidBaseQuizWithQuestionsAndOptions(obj: any): Promise<boolean> {
		if (!Array.isArray(obj.questions)) return false;

		for (const question of obj.questions) {
			if (typeof question.questionText !== 'string') return false;
			if (typeof question.correctAnswerText !== 'string') return false;

			if (!Array.isArray(question.options)) return false;
			for (const option of question.options) {
				if (typeof option.optionText !== 'string') return false;
			}
		}

		return true;
	}
}
