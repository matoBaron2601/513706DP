import axios from 'axios';
import { config } from 'dotenv';
import { ca } from 'zod/v4/locales';

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

const createPrompt = (chunks: string[], numberOfQuestions: number, prompt: string) => {
	return `
	You are an expert quiz creator. You are part of RAG system that creates quizzes based on provided content chunks and parameters.

	Your task is to create a quiz with a specified number of questions based solely on the provided content chunks.
	
	 
	Content chunks: ${JSON.stringify(chunks)}
	Number of questions: ${numberOfQuestions}

	Here is the additional prompt by our client to guide your quiz creation: ${prompt}

	Your output should strictly adhere to the following JSON schema:
	
	{
	"quiz": {
		"creatorId": "",
		"name": "",
		"timePerQuestion": null,
		"canGoBack": null
	},
	"questions": [
		{
		"text": "",
		"options": [
			{
			"text": "",
			"isCorrect": boolean
			}
		]
		}
	]
	}

	Each question should have one correct answer and three incorrect options.
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
				messages: [{ role: 'user', content: createPrompt(chunks, numberOfQuestions, prompt) }]
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

	async indetifyContepts(text: string): Promise<string[]> {
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

	//not working bcs of response format
	async assingConceptsToChunks(chunks: string[], concepts: string[]): Promise<string[]> {
		const response = await axios.post(
			'https://api.openai.com/v1/chat/completions',
			{
				model: 'gpt-4o-mini',
				messages: [
					{
						role: 'user',
						content: `
					You are an expert in text analysis and categorization.
					Your task is to assign exactly one of the provided concepts to each chunk of text, choosing the most relevant concept for each chunk.
					If a chunk does not relate to any concept, return an X string for that chunk.
					Here are the chunks: ${JSON.stringify(chunks)}
					Here are the concepts: ${JSON.stringify(concepts)}
					Provide answer as list in same order as chunks in the following format ['concept1', 'concept2', '', 'concept3'....] where each concept corresponds to the chunk at the same index.
					No JSON, just string in format ['concept1', 'concept2', '', 'concept3'....]
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
		const jsonString = content.replace(/'/g, '"');
		const parsedConcepts = JSON.parse(jsonString);
		try {
			if (Array.isArray(parsedConcepts) && parsedConcepts.every((c) => typeof c === 'string')) {
				return parsedConcepts;
			} else {
				throw new Error('Invalid response format');
			}
		} catch (error) {
			console.error('Error parsing concepts from OpenAI response:', error);
			return [];
		}
	}
}
