import { DateTime } from "luxon";
import Meeting from "../models/Meeting.js";
import Participant from "../models/Participant.js";
import { sendEmail, renderMeetingEmail } from "../utils/mailer.js";

function ensureISOWithZone(dt, zone) {
  if (!dt) return null;
  // If already has offset/Z, return as-is
  if (/[zZ]|[+\-]\d{2}:?\d{2}$/.test(dt)) return dt;
  // Otherwise assume it's local to `zone`
  const parsed = DateTime.fromISO(dt, { zone });
  return parsed.isValid ? parsed.toISO() : dt;
}

export async function createManualMeeting(req, res) {
  try {
    const form = req.body || {};

    // Validate required fields for manual meeting
    if (!form.organizerTime) {
      return res.status(400).json({ error: "organizerTime is required for manual meetings" });
    }

    const t0 = Date.now();
    
    // Use provided times directly
    let { organizerTime, clientTime } = form;
    const reasoning = "Meeting scheduled manually by user";

    // normalize/compute
    const orgZone = form.organizerTimezone || "UTC";
    const cliZone = form.clientTimezone || null;

    organizerTime = ensureISOWithZone(organizerTime, orgZone);

    if (form.context === "international" && !clientTime && organizerTime && cliZone) {
      const dt = DateTime.fromISO(organizerTime).setZone(orgZone);
      const client = dt.setZone(cliZone);
      clientTime = client.toISO();
    }

    // generate meetingId
    const meetingId = `MTG${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`.toUpperCase();

    // persist meeting
    const toSave = {
      meetingId,
      title: form.title || form.platform || "Meeting",
      hostEmail: (form.hostEmail || form.email || "").toLowerCase() || undefined,
      platform: form.platform || "Google Meet",
      context: form.context,
      organizerTimezone: form.organizerTimezone,
      clientTimezone: form.clientTimezone,
      month: form.month,
      weekNumber: form.weekNumber,
      allowWeekends: !!form.allowWeekends,
      allowHolidays: !!form.allowHolidays,
      organizerTime,
      clientTime,
      reasoning
    };
    const meeting = new Meeting(toSave);
    await meeting.save();
    const tDb = Date.now();

    // create host participant row if hostEmail provided
    if (toSave.hostEmail) {
      await Participant.findOneAndUpdate(
        { meeting: meeting._id, email: toSave.hostEmail },
        { $setOnInsert: { role: "host", joinedAt: new Date() } },
        { upsert: true, new: true }
      );
      // email host
      try { await sendEmail({ to: toSave.hostEmail, subject: `Meeting scheduled: ${meeting.title}`, html: renderMeetingEmail(meeting) }); } catch {}
    }
    
    // optional initial participants array: form.participants: string[]
    if (Array.isArray(form.participants) && form.participants.length) {
      const ops = form.participants.map(e => ({
        updateOne: {
          filter: { meeting: meeting._id, email: String(e).toLowerCase() },
          update: { $setOnInsert: { role: "participant" } },
          upsert: true
        }
      }));
      try { if (ops.length) await Participant.bulkWrite(ops, { ordered: false }); } catch {}
      // email participants
      for (const e of form.participants) {
        const addr = String(e).toLowerCase();
        try { await sendEmail({ to: addr, subject: `Invitation: ${meeting.title}`, html: renderMeetingEmail(meeting) }); } catch {}
      }
    }

    res.json({ 
      organizerTime, 
      clientTime, 
      reasoning, 
      meetingId: meeting.meetingId, 
      _id: meeting._id, 
      timings: { dbMs: tDb - t0 } 
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
