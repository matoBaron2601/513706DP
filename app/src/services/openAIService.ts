import axios from 'axios';
import { config } from 'dotenv';
import { ca } from 'zod/v4/locales';
import type { BaseQuizWithQuestionsAndOptions } from '../schemas/baseQuizSchema';

config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface ChoiceMessage {
	role: 'user' | 'assistant'; // role can be 'user' or 'assistant'
	content: string; // the generated message content
}

interface Choice {
	index: number; // index of the choice
	message: ChoiceMessage; // message content
	finish_reason: string; // reason for finishing the response
}

interface Usage {
	prompt_tokens: number; // number of tokens in the prompt
	completion_tokens: number; // number of tokens in the completion
	total_tokens: number; // total number of tokens used
}

export interface OpenAIChatCompletionResponse {
	id: string; // unique identifier for the completion request
	object: 'chat.completion'; // type of the object returned
	created: number; // timestamp of creation in Unix time
	model: string; // model used (e.g., 'gpt-4.0-turbo')
	choices: Choice[]; // array of choices returned
	usage: Usage; // token usage statistics
}

const createPlacementPrompt = (
	concept: string,
	concepts: string[],
	chunks: string[],
	numberOfQuestions: number
) => {
	return `
	You are an expert quiz creator. You are part of RAG system that creates quizzes based on provided content chunks and parameters.
	Your task is to create a placement quiz about a concept=${concept} with a specified number of questions=${numberOfQuestions} based solely on the provided <chunks> which are provided below.
	Other concepts from the block, that you should NOT create questons about are =${concepts.filter((c) => c !== concept).join(', ')}.
	
	Chunks: 
	START OF CHUNKS DATA
	${JSON.stringify(chunks)}
	END OF CHUNKS DATA

	Your output should strictly adhere to the following JSON schema:
	{
		questions: ({
			questionText: string;
			correctAnswerText: string;
			options: {
				optionText: string;
			}[];
		})[];
	}


	You can either crate a question with 4 options where one is correct
	OR
	you can create a question with blank list [] and it will be fill in question.
	Which to choose is up to you, just make sure that the question makes sense and an answer can be found in the chunks.

	Ensure that questions are about a concept ${concept} and are relevant to the provided chunks.
	Ensure that the JSON is properly formatted and valid.

	Do not include any explanations or additional text outside the JSON structure.
	Your response must be a valid JSON object as per the schema provided above.
	`;
};

export class OpenAiService {
	async callOpenAI(
		chunks: string[],
		numberOfQuestions: number,
		prompt: string
	): Promise<OpenAIChatCompletionResponse> {
		const response = await axios.post(
			'https://api.openai.com/v1/chat/completions',
			{
				model: 'gpt-4o-mini',
				messages: [{ role: 'user', content: '' }]
			},
			{
				headers: {
					Authorization: `Bearer ${OPENAI_API_KEY}`,
					'Content-Type': 'application/json'
				}
			}
		);

		return response.data;
	}

	async createPlacementQuestions(
		concept: string,
		concepts: string[],
		chunks: string[]
	): Promise<BaseQuizWithQuestionsAndOptions> {
		const response = await axios.post(
			'https://api.openai.com/v1/chat/completions',
			{
				model: 'gpt-4o-mini',
				messages: [
					{
						role: 'user',
						content: createPlacementPrompt(concept, concepts, chunks, 3)
					}
				]
			},
			{
				headers: {
					Authorization: `Bearer ${OPENAI_API_KEY}`,
					'Content-Type': 'application/json'
				}
			}
		);
		const responseContent = response.data.choices[0].message.content
			.replace(/```json|```/g, '')
			.trim();
		let parsedQuiz: any;
		try {
			parsedQuiz = JSON.parse(responseContent);
		} catch (e) {
			throw new Error('Error parsing JSON: ' + e);
		}

		// Validate the parsed object
		if (!this.isValidBaseQuizWithQuestionsAndOptions(parsedQuiz)) {
			throw new Error('Invalid quiz format.');
		}

		return parsedQuiz as BaseQuizWithQuestionsAndOptions;
	}

	async identifyConcepts(text: string): Promise<string[]> {
		const response = await axios.post(
			'https://api.openai.com/v1/chat/completions',
			{
				model: 'gpt-4o-mini',
				messages: [
					{
						role: 'user',
						content: `
					You are an expert in identifying key concepts from a given text.
					Thet text will be about some IT topic.
					Your task is to extract and list the most important concepts mentioned in the text.
					Do not push it, just provide the most 8 relevant ones, it does not have to be many if 
					there are not many or they are not really different or relevant.
					Provide the concepts as a JSON array of strings.
					Provide answers as ['concept1', 'concept2', 'concept3'....] and nothing else.
					Concepts should in order from easiest to most difficult combined from most relevant to less relevant.
					Here is the text: ${text}
					`
					}
				]
			},
			{
				headers: {
					Authorization: `Bearer ${OPENAI_API_KEY}`,
					'Content-Type': 'application/json'
				}
			}
		);
		const content = response.data.choices[0].message.content;
		const cleanedString = content.replace(/```json|```/g, '').trim();
		const jsonString = cleanedString.replace(/'/g, '"');
		const concepts = JSON.parse(jsonString);
		try {
			if (Array.isArray(concepts) && concepts.every((c) => typeof c === 'string')) {
				return concepts;
			} else {
				throw new Error('Invalid response format');
			}
		} catch (error) {
			console.error('Error parsing concepts from OpenAI response:', error);
			return [];
		}
	}

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
