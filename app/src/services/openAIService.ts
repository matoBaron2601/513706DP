import axios from 'axios';
import { config } from 'dotenv';
import type { BaseQuizWithQuestionsAndOptionsBlank } from '../schemas/baseQuizSchema';
import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});
config();

interface ChoiceMessage {
	role: 'user' | 'assistant';
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
	async callOpenAI(prompt: string): Promise<OpenAI.Chat.ChatCompletion> {
		try {
			const response = await openai.chat.completions.create({
				model: 'gpt-4o-mini',
				messages: [{ role: 'user', content: prompt }]
			});

			return response;
		} catch (error) {
			console.error('Error calling OpenAI:', error);
			throw error;
		}
	}

	async createPlacementQuestions(
		concept: string,
		concepts: string[],
		chunks: string[],
		questionsPerConcept: number
	): Promise<BaseQuizWithQuestionsAndOptionsBlank> {
		const response = await this.callOpenAI(
			placementQuizPrompt(concept, concepts, chunks, questionsPerConcept)
		);
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

	async preRetrievalTransform(text: string): Promise<string> {
		return (
			(
				await this
					.callOpenAI(`Rewrite the following text to remove formatting artifacts, page numbers, and section headers, while correcting any inconsistencies. 
			Ensure all technical details, examples, URLs, and code are fully preserved and that no semantic content is omitted or summarized. 
			Produce a clear, concise, self-contained English paragraph. Do not add information.
			Text:
			---
			${text}
			---`)
			).choices[0].message.content ?? ''
		);
	}

	async createAdaptiveQuizQuestions(
		concept: string,
		concepts: string[],
		chunks: string[],
		numberOfQuestions: number
	): Promise<BaseQuizWithQuestionsAndOptionsBlank> {
		const response = await this.callOpenAI(
			adaptiveQuizPrompt(concept, concepts, chunks, numberOfQuestions)
		);
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

	async identifyConcepts(text: string): Promise<string[]> {
		const response = await this.callOpenAI(`
					You are an expert in identifying key concepts from a given text.
					Thet text will be about some IT topic.
					Your task is to extract and list the most important concepts mentioned in the text.
					Do not push it, just provide the most 8 relevant ones, it does not have to be many if 
					there are not many or they are not really different or relevant.
					Provide the concepts as a JSON array of strings.
					Provide answers as ['concept1', 'concept2', 'concept3'....] and nothing else.
					Concepts should in order from easiest to most difficult combined from most relevant to less relevant.
					If some concept is generalization of other concepts, put generalization first but name it with "General" prefix.
					Here is the text: ${text}
					`);
		const content = response.choices[0].message.content;
		const cleanedString = content?.replace(/```json|```/g, '').trim() || '';
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

	async isAnswerCorrect(question: string, correctAnswer: string, answer: string): Promise<boolean> {
		const response = await this.callOpenAI(`
			You are an expert in evaluating answers to questions.
			Given the question, the correct answer, and a user's answer, determine if the user's answer is correct.
			Respond with a simple "Yes" if the answer is correct or "No" if it is incorrect.
			Do not be hard on users, if the answer is close enough or partially correct, consider it correct. Allow for typos and small mistakes.

			Here are the details:

			Question: ${question}
			Correct Answer: ${correctAnswer}
			User's Answer: ${answer}

			Is the user's answer correct? Respond with only "Yes" or "No".
		`);
		const content = response.choices[0].message.content?.trim().toLowerCase() || '';
		return content === 'yes';
	}
}

const placementQuizPrompt = (
	concept: string,
	concepts: string[],
	chunks: string[],
	numberOfQuestions: number
) => {
	return `
	You are an expert quiz creator. You are part of a Retrieval-Augmented Generation (RAG) system that creates quizzes based on provided content chunks and parameters.

Your task:
Create a placement quiz about the concept = ${concept}, with exactly ${numberOfQuestions} questions, based **solely** on the provided <chunks> below.

You must NOT create questions about other related concepts:
${concepts.filter((c) => c !== concept).join(', ')}

---

### Question Types

You must include **both** theoretical and practical questions in every quiz:

A) Theoretical questions — test understanding of ${concept}:
1. Multiple Choice Questions (4 options, 1 correct)
2. Fill-in-the-Blank Questions (no options)

B) Practical questions — test real-world or coding application of ${concept}. The question starts with "Given the following code snippet" or similar phrasing:
1. Multiple Choice Questions (4 options, 1 correct) — must include a short relevant code snippet.
2. Fill-in-the-Blank Questions — must include a short relevant code snippet.

At least **40%** of the questions must be practical (type B).  
If no code examples exist in the chunks, you must still create realistic code scenarios relevant to the concept.
Do not include codeSnippet in questionText. Do not give answers in code snippets.
Include questinonType property in each question with value "A1", "A2", "B1" or "B2" depending on the type of question.
---

### Content Requirements
- All questions must be directly about ${concept}.
- Do not include or reference other concepts listed above.
- Each question must be answerable by someone with general knowledge of ${concept}, even if they haven’t seen the chunks.
- Code snippets must be short (max 10 lines) and directly relevant.
- Do not include explanations or reasoning — only the JSON object.

---

### Output Format
You must return a **valid JSON object** following this schema exactly:

{
  "questions": [
    {
      "questionText": string,
      "correctAnswerText": string,
      "orderIndex": string,
      "codeSnippet": string,
	  "questionType": "B1" | "B2" | "A1" | "A2",
      "options": [
        { "optionText": string }
      ]
    }
  ]
}

If a question is Fill-in-the-Blank, the options array must be empty ([]).

---

### Chunks
START OF CHUNKS DATA
${JSON.stringify(chunks)}
END OF CHUNKS DATA

---

### Final Instructions
- Produce **exactly ${numberOfQuestions}** total questions.
- Include a **mix** of both theoretical (A) and practical (B) types.
- Ensure valid JSON with no extra text, comments, or explanations outside the JSON object.

	`;
};

const adaptiveQuizPrompt = (
	concept: string,
	concepts: string[],
	chunks: string[],
	numberOfQuestions: number
) => {
	return `
	You are an expert quiz creator. You are part of RAG system that creates quizzes based on provided content chunks and parameters.
	Your task is to create an adaptive quiz about a concept=${concept} with a specified number of questions=${numberOfQuestions} based solely on the provided <chunks> which are provided below.
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
			orderIndex: string;
			options: {
				optionText: string;
			}[];
		})[];
	}
		
	
	You can either crate a question with 4 options where one is correct
	OR
	you can create a question with blank list [] and it will be fill in question.

	Both types of questions can be programming question with code snippets (you must provide code snippets).
	Which to choose is up to you, just make sure that the question makes sense and an answer can be found in the chunks.

	Ensure that questions are about a concept ${concept} and are relevant to the provided chunks.
	Ensure that the JSON is properly formatted and valid.

	Do not include any explanations or additional text outside the JSON structure.
	Your response must be a valid JSON object as per the schema provided above.`;
};
