export const validatePlacementQuizMessage = (concept: string): string => {
	return `
    Now, validate your previous response which was a JSON object representing a placement quiz on the concept of "${concept}". 
    If you find any issues with the format, correct and output them according to the following rules.

    - if there is ANY code in the questionText, you must move it to the corespondent codeSnippet. 
    If codeSnippet present in B2 questions and user should add something to the code, it must contains /* your code here */ as a place for it.

    -ensure that answer user shoud fill, is not already included in questionText or codeSnippet. 
    If so, modify questionText or codeSnippet to remove it.

    -ensure that questions are clear and unambiguous, and have all necessary information for answering it.

    -Focus on B1 and B2 questions. Make sure they make sense and are relevant to the concept. 
    All information needed for answering the question must be present in questionText and codeSnippet. 
    If not, modify the question to include the necessary details. Make sure the questions are clear and unambiguous.
    
    
    --- Output Schema ---
    {
        "questions": [
            {
            "questionType": "A1" | "A2" | "B1" | "B2",
            "questionText": string,
            "codeSnippet": string,
            "correctAnswerText": string,
            "options": [ { "optionText": string, "isCorrect": boolean } ]
            "orderIndex": string,
            }
        ]
    }
    `;
};
