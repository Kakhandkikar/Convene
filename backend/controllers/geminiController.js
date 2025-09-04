import { DateTime } from "luxon";
import { callGemini } from "../utils/gemini.js";
import Meeting from "../models/Meeting.js";

function ensureISOWithZone(dt, zone) {
  if (!dt) return null;
  // If already has offset/Z, return as-is
  if (/[zZ]|[+\-]\d{2}:?\d{2}$/.test(dt)) return dt;
  // Otherwise assume it's local to `zone`
  const parsed = DateTime.fromISO(dt, { zone });
  return parsed.isValid ? parsed.toISO() : dt;
}

export async function generate(req, res) {
  try {
    const form = req.body || {};
    const result = await callGemini(form);
    let { organizerTime, clientTime, reasoning } = result;

    // normalize/compute
    const orgZone = form.organizerTimezone || "UTC";
    const cliZone = form.clientTimezone || null;

    organizerTime = ensureISOWithZone(organizerTime, orgZone);

    if (form.context === "international" && !clientTime && organizerTime && cliZone) {
      const dt = DateTime.fromISO(organizerTime).setZone(orgZone);
      const client = dt.setZone(cliZone);
      clientTime = client.toISO();
    }

    // persist (optional)
    const toSave = {
      title: form.title || form.platform || "Meeting",
      participants: form.participants || [],
      platform: form.platform || "Google Meet",
      context: form.context,
      organizerTimezone: form.organizerTimezone,
      clientTimezone: form.clientTimezone,
      month: form.month,
      weekNumber: form.weekNumber,
      allowWeekends: form.allowWeekends,
      allowHolidays: form.allowHolidays,
      organizerTime,
      clientTime,
      reasoning
    };
    const doc = new Meeting(toSave);
    await doc.save();

    res.json({ organizerTime, clientTime, reasoning, _id: doc._id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
