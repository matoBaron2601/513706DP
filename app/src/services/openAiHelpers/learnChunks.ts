export const learnChunksPrompt = (chunks: string[]): string => {
	return `
    You are an expert educational content creator.
    Your task is to learn the following knowledge:
    ${JSON.stringify(chunks)}
    DO not output anything yet, just learn the knowledge.`;
};
