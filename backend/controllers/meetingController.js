import Meeting from "../models/Meeting.js";
import Participant from "../models/Participant.js";
import { sendEmail, renderMeetingEmail } from "../utils/mailer.js";

export async function listMeetings(req, res) {
  try {
    const docs = await Meeting.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function getMeetingById(req, res) {
  try {
    const doc = await Meeting.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function getMeetingByMeetingId(req, res) {
  try {
    const doc = await Meeting.findOne({ meetingId: req.params.meetingId });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function joinMeeting(req, res) {
  try {
    const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });
    if (!meeting) return res.status(404).json({ error: "Meeting not found" });
    if (meeting.status === "cancelled") return res.status(400).json({ error: "Meeting cancelled" });

    // Use authenticated user's email instead of request body
    const email = req.user.email.toLowerCase();
    const name = req.user.name;

    // Check if user is already a participant or if they can join
    let participant = await Participant.findOne({ 
      meeting: meeting._id, 
      email: email 
    });

    if (!participant) {
      // Create new participant record
      participant = new Participant({
        meeting: meeting._id,
        user: req.user._id,
        email: email,
        name: name,
        role: "participant",
        joinedAt: new Date()
      });
      await participant.save();
    } else {
      // Update existing participant
      participant.joinedAt = new Date();
      participant.name = name;
      await participant.save();
    }

    // notify joiner
    try { 
      await sendEmail({ 
        to: email, 
        subject: `Joined: ${meeting.title}`, 
        html: renderMeetingEmail(meeting) 
      }); 
    } catch {}

    res.json({ meeting, participant });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function listMeetingsByEmail(req, res) {
  try {
    // Use authenticated user's email instead of query parameter
    const email = req.user.email.toLowerCase();
    const parts = await Participant.find({ email }).populate("meeting").sort({ createdAt: -1 });
    const meetings = parts.map(p => p.meeting).filter(Boolean);
    res.json(meetings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function addParticipants(req, res) {
  try {
    const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });
    if (!meeting) return res.status(404).json({ error: "Meeting not found" });
    const { emails = [], names = {} } = req.body || {};
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: "emails array required" });
    }
    const ops = emails.map((e) => ({
      updateOne: {
        filter: { meeting: meeting._id, email: String(e).toLowerCase() },
        update: { $setOnInsert: { role: "participant" }, $set: { name: names[e] } },
        upsert: true
      }
    }));
    if (ops.length) {
      await Participant.bulkWrite(ops, { ordered: false });
    }
    const list = await Participant.find({ meeting: meeting._id }).sort({ createdAt: -1 });

    // notify all added emails
    for (const e of emails) {
      const addr = String(e).toLowerCase();
      try { await sendEmail({ to: addr, subject: `Invitation: ${meeting.title}`, html: renderMeetingEmail(meeting) }); } catch {}
    }

    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function listParticipants(req, res) {
  try {
    const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });
    if (!meeting) return res.status(404).json({ error: "Meeting not found" });
    const list = await Participant.find({ meeting: meeting._id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
