import type { ChoiceMessage, Role } from '../openAIService';

export const preRetrievalTransformMessage = (text: string): ChoiceMessage => {
	return {
		role: 'user' as Role,
		content: `
			Clean the following text for retrieval preprocessing:
				- Remove page numbers, footers, headers, and formatting artifacts
				- Preserve ALL original content, including:
					* headings and subheadings  
					* bullet lists and numbering  
					* code blocks, equations, tables  
					* URLs, citations, technical terms  
				- Do NOT summarize, rewrite, paraphrase, or add new information
				- Keep the original sentence meaning and ordering exactly
				- If unsure whether something is content or an artifact, keep it

				Return well-formatted plain English text.

				Text:
				---
				${text}
				---`
	};
};
