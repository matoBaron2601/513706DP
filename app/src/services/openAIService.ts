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
		chunks: string[]
	): Promise<BaseQuizWithQuestionsAndOptionsBlank> {
		const response = await this.callOpenAI(placementQuizPrompt(concept, concepts, chunks));
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
		const response = await this.callOpenAI(
			adaptiveQuizPrompt(
				concept,
				concepts,
				chunks,
				numberOfQuestionsA1,
				numberOfQuestionsA2,
				numberOfQuestionsB1,
				numberOfQuestionsB2,
				questionHistory
			)
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

			If users answer is blank, respond with "No".
			Is the user's answer correct? Respond with only "Yes" or "No".

			
		`);
		const content = response.choices[0].message.content?.trim().toLowerCase() || '';
		return content === 'yes';
	}
}

const placementQuizPrompt = (concept: string, concepts: string[], chunks: string[]) => {
	return `
You are an expert quiz creator in a RAG system.

Create a placement quiz about the concept = ${concept}, with exactly 4 questions, based **solely** on the provided <chunks>.

You must NOT create questions about other related concepts:
${concepts.filter((c) => c !== concept).join(', ')}

--- HARD RULES (MUST PASS) ---
1) questionText is plain sentences only. No code, no backticks, no code fences, no angle brackets, no {}, no ;, no line starting with common code keywords (e.g., function, const, let, class, if, for, while, return, import).
2) Any code MUST appear only in codeSnippet (never in questionText).
3) For A1/A2 (theory): codeSnippet MUST be an empty string "".
4) For B1/B2 (practical): codeSnippet MUST be non-empty (max 10 lines). Do not include answers in code.
5) Do not include explanations; output only the JSON object.
6) You MUST generate exactly 4 questions in total:
   - Exactly one A1 question (theoretical multiple choice, no codeSnippet).
   - Exactly one A2 question (theoretical fill-in-the-blank, no options, no codeSnippet).
   - Exactly one B1 question (practical multiple choice with a non-empty codeSnippet).
   - Exactly one B2 question (practical fill-in-the-blank with a non-empty codeSnippet, no options).
   No extra, missing, or duplicate types.

--- Question Types ---
A) Theoretical — about ${concept}
   A1: Multiple Choice (4 options, 1 correct)
   A2: Fill-in-the-Blank (no options)
B) Practical — real-world/coding application of ${concept}
   B1: Multiple Choice (4 options, 1 correct), start with “Given the following code snippet” or similar, codeSnippet included
   B2: Short coding task, user need to write max 3 lines of code according to questionsText requirements. Code snipper in question can be included (user can be ask to correct code or add something to it)

--- Output Schema (exact) ---
{
  "questions": [
    {
      "questionText": string,        // no code / no backticks
      "correctAnswerText": string,
      "orderIndex": string,
      "codeSnippet": string,         // "" for A1/A2; non-empty for B1/B2
      "questionType": "B1" | "B2" | "A1" | "A2",
      "options": [ { "optionText": string, "isCorrect": boolean } ] // empty [] for A2/B2
    }
  ]
}

--- Content Requirements ---
- All questions directly about ${concept}. Ignore other listed concepts.
- Each question answerable with general knowledge of ${concept}, even without the chunks.
- Practical questions must include a short, relevant codeSnippet (≤10 lines).
- Do not put any code or backticks in questionText.

In generation, take inspiration from the following chunks. Do not fully copy any content, but ensure the questions are relevant to the material provided.
--- Chunks ---
START OF CHUNKS DATA
${JSON.stringify(chunks)}
END OF CHUNKS DATA

--- Final Instructions ---
- Produce exactly 4 total questions: 1x A1, 1x A2, 1x B1, 1x B2.
- Validate the HARD RULES yourself. If any rule is violated, regenerate internally until all rules pass.
- Return only the JSON object. No extra text.
`;
};

const adaptiveQuizPrompt = (
	concept: string,
	concepts: string[],
	chunks: string[],
	numberOfA1Questions: number,
	numberOfA2Questions: number,
	numberOfB1Questions: number,
	numberOfB2Questions: number,
	questionHistory: {
		questionText: string;
		correctAnswerText: string;
		isCorrect: boolean;
	}[]
) => {
	const numberOfQuestions =
		numberOfA1Questions + numberOfA2Questions + numberOfB1Questions + numberOfB2Questions;
	return `
You are an expert quiz creator in a RAG system.

Create a placement quiz about the concept = ${concept}, with exactly ${numberOfQuestions} questions, based **solely** on the provided <chunks>.
You must NOT create questions about other related concepts:
${concepts.filter((c) => c !== concept).join(', ')}

--- HARD RULES (MUST PASS) ---
1) questionText is plain sentences only. No code, no backticks, no code fences, no angle brackets, no {}, no ;, no line starting with common code keywords (e.g., function, const, let, class, if, for, while, return, import).
2) Any code MUST appear only in codeSnippet (never in questionText).
3) For A1/A2 (theory): codeSnippet MUST be an empty string "".
4) For B1/B2 (practical): codeSnippet MUST be non-empty (max 10 lines). Do not include answers in code.
5) Do not include explanations; output only the JSON object.
6) You MUST generate exactly ${numberOfQuestions} questions in total:
   - Exactly ${numberOfA1Questions} A1 questions (theoretical multiple choice, no codeSnippet).
   - Exactly ${numberOfA2Questions} A2 questions (theoretical fill-in-the-blank, no options, no codeSnippet).
   - Exactly ${numberOfB1Questions} B1 questions (practical multiple choice with a non-empty codeSnippet).
   - Exactly ${numberOfB2Questions} B2 questions (practical fill-in-the-blank with a non-empty codeSnippet, no options).
   No extra, missing, or duplicate types.
7) Avoid reusing questions from history:
   - Do NOT repeat any questionText that appears in questionHistory.
   - Do NOT create questions whose correctAnswerText is effectively identical in meaning to those in questionHistory for the same concept.
   - If a question would overlap strongly with history, rephrase or choose a different angle while staying within this prompt's rules.

--- Question Types ---
A) Theoretical — about ${concept}
   A1: Multiple Choice (4 options, 1 correct)
   A2: Fill-in-the-Blank (no options)
B) Practical — real-world/coding application of ${concept}
   B1: Multiple Choice (4 options, 1 correct), start with “Given the following code snippet” or similar, codeSnippet included
   B2: Short coding task, user need to write max 3 lines of code according to questionsText requirements. Code snipper in question can be included (user can be ask to correct code or add something to it)

--- Output Schema (exact) ---
{
  "questions": [
    {
      "questionText": string,        // no code / no backticks
      "correctAnswerText": string,
      "orderIndex": string,
      "codeSnippet": string,         // "" for A1/A2; non-empty for B1/B2
      "questionType": "B1" | "B2" | "A1" | "A2",
      "options": [ { "optionText": string, "isCorrect": boolean } ] // empty [] for A2/B2
    }
  ]
}

--- Content Requirements ---
- All questions directly about ${concept}. Ignore other listed concepts.
- Each question answerable with general knowledge of ${concept}, even without the chunks.
- Practical questions must include a short, relevant codeSnippet (≤10 lines).
- Do not put any code or backticks in questionText.

In generation, take inspiration from the following chunks. Do not fully copy any content, but ensure the questions are relevant to the material provided.
--- Chunks ---
START OF CHUNKS DATA
${JSON.stringify(chunks)}
END OF CHUNKS DATA


---Question History ---
These are previous questions asked about the concept ${concept}. Avoid repeating or closely paraphrasing these questions or their answers.
START OF QUESTION HISTORY
${JSON.stringify(questionHistory)}
END OF QUESTION HISTORY

--- Final Instructions ---
- Produce exactly 4 total questions: ${numberOfA1Questions}x A1, ${numberOfA2Questions}x A2, ${numberOfB1Questions}x B1, ${numberOfB2Questions}x B2.
- Validate the HARD RULES yourself. If any rule is violated, regenerate internally until all rules pass.
- Return only the JSON object. No extra text.
`;
};
