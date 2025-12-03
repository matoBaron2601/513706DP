export const adaptiveQuizMessage = (
	concept: string,
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

      Based on the learned knowledge.
    You are an expert quiz creator in a RAG system.
    
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
      "orderIndex": ""
    }
  ]
}

--- STRICT RULES YOU MUST FOLLOW ---

General Rules:
• You MUST generate exactly:
   - ${numberOfA1Questions} × A1
   - ${numberOfA2Questions} × A2
   - ${numberOfB1Questions} × B1
   - ${numberOfB2Questions} × B2 
• Medium difficulty.  
• Correct answers must be unambiguous.  
• The answer must NOT appear in the question text or code snippet.  
• orderIndex must be "1", "2", "3", "4"....${numberOfQuestions} in order.  
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

--- Question History: Strict Non-Repetition Rules ---
Below is a list of previous questions already asked about ${concept}.

You MUST:
- NOT repeat any questionText from this list
- NOT reuse the same meaning or answer intent
- NOT produce questions whose correctAnswerText is identical in meaning
- NOT use the same scenario or structure with only minor wording changes

If a newly generated question is similar in topic, you MUST:
- Change the angle of the question, OR
- Focus on different details from the chunks, OR
- Select a different fact from the chunks

START OF QUESTION HISTORY
${JSON.stringify(questionHistory)}
END OF QUESTION HISTORY

Now generate the quiz following ALL rules above.
    `;
};
