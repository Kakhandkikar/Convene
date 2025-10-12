import fetch from "node-fetch";

// Gemini raw-text helper dedicated for retrospective summaries.
// Keeps scheduling (utils/gemini.js) untouched.
export async function callGeminiSummaryText(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
  const body = { contents: [{ parts: [{ text: String(prompt) }]}] };

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error("Gemini API error: " + t);
  }

  const data = await resp.json();
  // Common shapes: candidates[0].content.parts[0].text
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return typeof text === "string" ? text : String(text);
}






