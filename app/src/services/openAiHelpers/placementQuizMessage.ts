export const placementQuizMessage = (concept: string): string => {
	return `
    You MUST generate exactly 4 questions: 
- Question 1 → type A1 
- Question 2 → type A2 
- Question 3 → type B1 
- Question 4 → type B2 

Concept to test: "${concept}"

Your output MUST be valid JSON only, matching the schema EXACTLY. 
Never add explanations or text outside the JSON.

--- JSON Output Schema ---
{
  "questions": [
    {
      "questionType": "A1 | A2 | B1 | B2",
      "questionText": "",
      "codeSnippet": "",
      "correctAnswerText": "",
      "options": [ { "optionText": "", "isCorrect": true/false } ],
      "orderIndex": "1 | 2 | 3 | 4"
    }
  ]
}

--- STRICT RULES YOU MUST FOLLOW ---

General Rules:
• Generate 4 questions only, one per type.  
• Medium difficulty.  
• Correct answers must be unambiguous.  
• The answer must NOT appear in the question text or code snippet.  
• orderIndex must be "1", "2", "3", "4" in order.  
• Output MUST follow the schema exactly.  

A1 – Theoretical Multiple Choice:
• codeSnippet = ""  
• 4 options, exactly 1 correct  
• correctAnswerText must match the correct optionText  

A2 – Fill-in-the-blank:
• questionText must contain exactly one blank: "____"  
• options = []  
• codeSnippet = ""  
• correctAnswerText is the correct 1-word answer  

B1 – Practical MCQ:
• Must include a non-empty code snippet  
• 4 options, exactly 1 correct  
• correctAnswerText must match the correct option  

B2 – Practical Coding:
• Must include a code snippet containing: /* your code here */  
• options = []  
• correctAnswerText = correct 1–2 line code the student should write  

--- JSON Structure Template ---
{
  "questions": [
    {
      "questionType": "",
      "questionText": "",
      "codeSnippet": "",
      "correctAnswerText": "",
      "options": [],
      "orderIndex": "1"
    },
    {
      "questionType": "",
      "questionText": "",
      "codeSnippet": "",
      "correctAnswerText": "",
      "options": [],
      "orderIndex": "2"
    },
    {
      "questionType": "",
      "questionText": "",
      "codeSnippet": "",
      "correctAnswerText": "",
      "options": [],
      "orderIndex": "3"
    },
    {
      "questionType": "",
      "questionText": "",
      "codeSnippet": "",
      "correctAnswerText": "",
      "options": [],
      "orderIndex": "4"
    }
  ]
}

Now generate the quiz following ALL rules above.
    `;
};
