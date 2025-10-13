import axios from 'axios';
import { config } from 'dotenv';

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

const createPrompt = (chunks: string[], numberOfQuestions: number, prompt:string) => {
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
}
