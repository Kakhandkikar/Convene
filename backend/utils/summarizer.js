import { callGeminiSummaryText } from "./geminiSummary.js";

export async function summarizeRetrospectives(retrospectives) {
  try {
    // Build the prompt for Gemini (concise, plain text)
    const prompt = buildSummaryPrompt(retrospectives);
    
    // Call Gemini API with the prompt
    const result = await callGeminiSummaryText(prompt);

    // Normalize common Gemini response shapes
    let text = "";
    if (!result) text = "";
    else if (typeof result === "string") text = result;
    else if (result.summary) text = String(result.summary);
    else if (result.response) text = String(result.response);
    else if (result.candidates?.[0]?.content) text = String(result.candidates[0].content);
    else if (result.text) text = String(result.text);

    return sanitizePlainText(text);
  } catch (error) {
    console.error('Error in summarizeRetrospectives:', error);
    throw new Error('Failed to generate summary: ' + error.message);
  }
}

function buildSummaryPrompt(retrospectives) {
  const isSingle = Array.isArray(retrospectives) && retrospectives.length === 1;
  const retrospectivesText = retrospectives.map((r, index) => {
    const participant = r.participant || {};
    const scores = r.scores ? JSON.stringify(r.scores) : 'No scores provided';
    
    return `
Participant ${index + 1} (${participant.email || r.email}):
Content: ${r.content}
Scores: ${scores}
Submitted: ${r.createdAt ? new Date(r.createdAt).toLocaleString() : 'Unknown'}
---`;
  }).join('\n');

  return `
You are generating a concise meeting retrospective summary.

CONSTRAINTS:
- Output MUST be plain text. Do NOT use markdown (#, *, **, headings) or emojis.
- Keep it ${isSingle ? 'under 120 words' : 'under 200 words'}.
- Prefer short sentences and, if needed, simple hyphen bullets ('- ').

Include:
- Key themes and sentiment (1-2 lines)
- 2-4 actionable next steps (bulleted with '- ')
- 1-2 positives to continue (bulleted with '- ')

RETROSPECTIVE DATA (verbatim):
${retrospectivesText}

Write the final answer now as plain text only.
`;
}

function sanitizePlainText(input) {
  if (!input) return "";
  let text = String(input);
  // Remove common markdown artifacts
  text = text.replace(/^\s*#{1,6}\s*/gm, "");     // headings
  text = text.replace(/\*\*(.*?)\*\*/g, "$1");  // bold
  text = text.replace(/\*(.*?)\*/g, "$1");        // italics / bullets
  text = text.replace(/^\s*[-•]\s*/gm, "- ");     // normalize bullets
  // Collapse excessive whitespace
  text = text.replace(/[\r\t]/g, " ").replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

export async function callGeminiForSummary(prompt) {
  try {
    // Use the existing Gemini utility but with a specific prompt structure
    const result = await callGemini({ 
      prompt: prompt,
      // Add any specific parameters for summary generation
      maxTokens: 2000,
      temperature: 0.7
    });
    
    return result;
  } catch (error) {
    console.error('Error calling Gemini for summary:', error);
    throw error;
  }
}
