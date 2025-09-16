    import fetch from "node-fetch";

    function buildPrompt(form) {
      return `You are an intelligent meeting scheduling assistant. 
Your job is to select the best possible date and time for a meeting, given constraints. 
Always return your answer in valid JSON only (no extra text).

INPUT (JSON):
${JSON.stringify(form, null, 2)}

RULES:
1. Meetings should be scheduled within standard working hours (09:00–18:00 local time).
2. If "context" = "organizational":
   - Use the organizer’s timezone.
   - Pick the best time within the requested month and week.
   - Respect the weekend/holiday constraints.
3. If "context" = "international":
   - Find a time that overlaps within working hours of BOTH timezones.
   - If no perfect overlap exists, propose the closest compromise (minimize inconvenience).
   - Respect weekend/holiday constraints in both regions.
4. "weekNumber" corresponds to which week of the month (1 = first week, 2 = second week, etc.).
5. If "allowWeekends" = false, avoid scheduling on Saturday/Sunday.
6. If "allowHolidays" = false, avoid globally recognized public holidays (New Year’s, Christmas, etc.).

OUTPUT (strict JSON):
{
  "organizerTime": "YYYY-MM-DDTHH:mm:ssZ",
  "clientTime": "YYYY-MM-DDTHH:mm:ssZ",
  "reasoning": "Explain briefly why this time was chosen (max 2 sentences)."
}`;
    }

    export async function callGemini(form) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="+apiKey;
      const body = { contents: [{ parts: [{ text: buildPrompt(form) }]}]};

      // Add timeout to avoid hanging forever
      const controller = new AbortController();
      const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS || 15000);
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      let resp;
      try {
        resp = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: controller.signal });
      } catch (e) {
        if (e.name === 'AbortError') {
          throw new Error(`Gemini API timeout after ${timeoutMs}ms`);
        }
        throw e;
      } finally {
        clearTimeout(timeout);
      }
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error("Gemini API error: " + t);
      }
      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const match = text.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : text;
      let parsed;
      try { parsed = JSON.parse(jsonStr); } catch (e) { throw new Error("Invalid JSON from Gemini: " + text); }
      return parsed;
    }

    // Raw text helper for non-scheduling prompts (e.g., summaries)
    export async function callGeminiText(prompt) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="+apiKey;
      const body = { contents: [{ parts: [{ text: String(prompt) }]}]};
      const resp = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error("Gemini API error: " + t);
      }
      const data = await resp.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return typeof raw === "string" ? raw : String(raw);
    }