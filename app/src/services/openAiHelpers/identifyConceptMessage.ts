import type { ChoiceMessage, Role } from '../openAIService';

export const identifyConceptsMessage = (text: string): ChoiceMessage => {
	return {
		role: 'user' as Role,
		content: `
			You are an AI assistant extracting key technical concepts from IT-related text.

			Rules:
			- Return 3-8 highly relevant concepts (only if present in the text)
			- Concepts must be unique and meaningful (no generic words)
			- Preserve domain terminology exactly as it appears
			- Order by relevance (most relevant first)
			- Format strictly as a JSON array of strings with no explanation
			Text:
			${text}

			Output example:
			["concept1", "concept2", "concept3"...] //can be 3-8 concepts, depenging on how many are present
			`
	};
};
