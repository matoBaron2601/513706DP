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

Create a placement quiz about the concept = ${concept}, with exactly ${numberOfQuestions} questions, based **solely** on the provided <chunks> for all knowledge content.


--- HARD RULES (MUST PASS) ---
1) questionText is plain sentences only. No code, no backticks, no code fences, no angle brackets, no {}, no ;, no line starting with code keywords like: function, const, let, class, if, for, while, return, import.
2) Any code MUST appear only in codeSnippet (never in questionText).
3) For A1/A2: codeSnippet MUST be an empty string "".
4) For B1/B2: codeSnippet MUST be non-empty (≤10 lines). Do not include answers in code.
5) All questionText, options, and correct answers MUST be strictly derivable from the chunks only. No new facts, no unreferenced APIs or terminology.
6) Code snippets may be newly invented, but:
   - Must remain consistent with ${concept} as presented in the chunks
   - Must NOT introduce new libraries, frameworks, or technologies not found in the chunks
7) You MUST generate exactly:
   - ${numberOfA1Questions} × A1
   - ${numberOfA2Questions} × A2
   - ${numberOfB1Questions} × B1
   - ${numberOfB2Questions} × B2
No extra, missing, or duplicate types.
8) Avoid repeating questionHistory:
   - Do NOT reuse questionText from history
   - Do NOT reuse or restate the identical correctAnswerText conceptually
   - If similarity is detected, choose a different angle from the chunks
9) When A1 or B1 questions, one of the options MUST be exactly the correctAnswerText
--- Question Types ---
A1 = Theoretical Multiple Choice (no code)
A2 = Theoretical Fill-in-the-Blank (no options, no code)
B1 = Practical Multiple Choice (codeSnippet required)
B2 = Practical Fill-in-the-blank task (codeSnippet required)

--- Output Schema (exact) ---
{
  "questions": [
    {
      "questionText": string,
      "correctAnswerText": string,
      "orderIndex": string,
      "codeSnippet": string,
      "questionType": "B1" | "B2" | "A1" | "A2",
      "options": [ { "optionText": string, "isCorrect": boolean } ]
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

--- Final Instructions ---
- Produce exactly ${numberOfQuestions} questions: 
  ${numberOfA1Questions}×A1, ${numberOfA2Questions}×A2, 
  ${numberOfB1Questions}×B1, ${numberOfB2Questions}×B2
- Validate all HARD RULES yourself before responding
- Respond ONLY with the JSON object. No extra text.
- Ensure that questionType is one of "A1", "A2", "B1", or "B2" as specified.
`;
};