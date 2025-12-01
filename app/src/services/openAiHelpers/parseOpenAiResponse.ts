import type { OpenAI } from 'openai/client';

export const parseOpenAiResponse = (
	openAiResponse: OpenAI.Chat.Completions.ChatCompletion
): string => {
	return (
		openAiResponse.choices[0].message.content
			?.replace(/```json|```/g, '')
			.replace('`', "'")
			.trim() || ''
	);
};
