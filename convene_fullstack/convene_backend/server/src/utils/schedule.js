import { DateTime, Interval } from 'luxon';

const WORK_START = 9;
const WORK_END = 18;

export function getWeekRange({ year, month, week }) {
  const first = DateTime.utc(year, month, 1);
  const start = first.plus({ days: (week - 1) * 7 });
  const end = start.plus({ days: 7 });
  return Interval.fromDateTimes(start, end);
}

function isWeekend(dt) {
  const wk = dt.weekday; // 1=Mon, 7=Sun
  return wk === 6 || wk === 7;
}

export function* timeSlots({ intervalUTC, stepMins = 30 }) {
  let cursor = intervalUTC.start.startOf('minute');
  const end = intervalUTC.end;
  while (cursor < end) {
    yield cursor;
    cursor = cursor.plus({ minutes: stepMins });
  }
}

export function findSlotOrganizational({ intervalUTC, orgTz, allowWeekends }) {
  for (const t of timeSlots({ intervalUTC })) {
    const local = t.setZone(orgTz);
    const inHours = local.hour >= WORK_START && local.hour < WORK_END;
    if (!inHours) continue;
    if (!allowWeekends && isWeekend(local)) continue;
    return t;
  }
  return null;
}

export function findSlotInternational({ intervalUTC, orgTz, clientTz, allowWeekends }) {
  for (const t of timeSlots({ intervalUTC })) {
    const a = t.setZone(orgTz);
    const b = t.setZone(clientTz);
    const aOK = a.hour >= WORK_START && a.hour < WORK_END && (allowWeekends || !isWeekend(a));
    const bOK = b.hour >= WORK_START && b.hour < WORK_END && (allowWeekends || !isWeekend(b));
    if (aOK && bOK) return t;
  }
  return null;
}
