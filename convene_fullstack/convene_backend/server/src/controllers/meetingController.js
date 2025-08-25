import { body, validationResult } from 'express-validator';
import { DateTime } from 'luxon';
import Meeting from '../models/Meeting.js';
import { getWeekRange, findSlotOrganizational, findSlotInternational } from '../utils/schedule.js';
import { createZoomMeeting } from '../config/zoom.js';
import { sendInviteEmail } from '../utils/email.js';

export const validateCreate = [
  body('title').trim().notEmpty(),
  body('type').isIn(['online', 'offline']),
  body('platform').optional().isIn(['zoom', 'google', 'microsoft', 'other', 'offline']),
  body('context').isIn(['organizational', 'international']),
  body('month').isInt({ min: 1, max: 12 }),
  body('week').isInt({ min: 1, max: 6 }),
  body('orgTimezone').notEmpty(),
  body('clientTimezone').optional().isString(),
  body('allowWeekends').isBoolean(),
  body('allowHolidays').optional().isBoolean(),
  body('durationMins').optional().isInt({ min: 15, max: 240 }),
  body('location').optional().isString(),
  body('participants').optional().isArray(),
];

function badReqIfAny(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
}

export async function createMeeting(req, res) {
  const bad = badReqIfAny(req, res);
  if (bad) return;

  const owner = req.user.id;
  const {
    title, type, platform = (req.body.type === 'offline' ? 'offline' : 'zoom'),
    context, month, week,
    orgTimezone, clientTimezone,
    allowWeekends = false, allowHolidays = true,
    durationMins = 30, location, participants = []
  } = req.body;

  // Week window for current year
  const year = DateTime.utc().year;
  const intervalUTC = getWeekRange({ year, month, week });

  // Find time slot
  let slot = null;
  if (context === 'organizational') {
    slot = findSlotOrganizational({ intervalUTC, orgTz: orgTimezone, allowWeekends });
  } else {
    slot = findSlotInternational({ intervalUTC, orgTz: orgTimezone, clientTz: clientTimezone, allowWeekends });
  }
  if (!slot) return res.status(409).json({ error: 'No slot available in selected window' });

  const scheduledStartUTC = slot.toJSDate();
  const scheduledEndUTC = slot.plus({ minutes: durationMins }).toJSDate();

  const meeting = new Meeting({
    owner, title, type, platform, context, month, week,
    orgTimezone, clientTimezone, allowWeekends, allowHolidays,
    durationMins, scheduledStartUTC, scheduledEndUTC, timezoneUsed: 'UTC',
    location, participants: participants.map(e => ({ email: e }))
  });

  // If online + zoom, create Zoom meeting
  if (type === 'online' && platform === 'zoom') {
    const startISO = DateTime.fromJSDate(scheduledStartUTC).toUTC().toISO();
    const zoomInfo = await createZoomMeeting({
      topic: title,
      start_time: startISO,
      duration: durationMins,
      timezone: 'UTC'
    });
    meeting.zoom = {
      meetingId: String(zoomInfo.id),
      joinUrl: zoomInfo.join_url,
      startUrl: zoomInfo.start_url,
      password: zoomInfo.password || null,
    };
  }

  await meeting.save();

  // Email invites
  const whenLocalOrg = DateTime.fromJSDate(scheduledStartUTC).setZone(orgTimezone).toFormat('DDDD t');
  for (const p of meeting.participants) {
    await sendInviteEmail({
      to: p.email,
      title,
      whenLocal: whenLocalOrg,
      joinUrl: meeting.zoom?.joinUrl,
      location: meeting.location,
    });
    p.invitedAt = new Date();
  }
  await meeting.save();

  res.status(201).json(meeting);
}

export async function listMeetings(req, res) {
  const items = await Meeting.find({ owner: req.user.id }).sort({ createdAt: -1 }).lean();
  res.json(items);
}

export async function getMeeting(req, res) {
  const m = await Meeting.findOne({ _id: req.params.id, owner: req.user.id });
  if (!m) return res.status(404).json({ error: 'Not found' });
  res.json(m);
}

export const validateAddParticipants = [
  body('participants').isArray({ min: 1 })
];

export async function addParticipants(req, res) {
  const bad = badReqIfAny(req, res);
  if (bad) return;
  const m = await Meeting.findOne({ _id: req.params.id, owner: req.user.id });
  if (!m) return res.status(404).json({ error: 'Not found' });

  const emails = req.body.participants;
  for (const email of emails) {
    if (!m.participants.find(p => p.email === email)) {
      m.participants.push({ email });
    }
  }
  await m.save();
  res.json(m);
}
