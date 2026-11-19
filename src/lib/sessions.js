export const TIME_ZONE = "America/New_York";
export const SESSIONS = [
  {
    id: "ny",
    name: "New York",
    hour: 9,
    minute: 30,
    time: "9:30 AM",
    days: "Mon–Fri",
    weekdays: [1, 2, 3, 4, 5],
  },
  {
    id: "asia",
    name: "Asia",
    hour: 20,
    minute: 0,
    time: "8:00 PM",
    days: "Sun–Thu",
    weekdays: [0, 1, 2, 3, 4],
  },
];
const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function localParts(date) {
  return Object.fromEntries(
    partsFormatter
      .formatToParts(date)
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, Number(p.value)]),
  );
}

// Offset conversion uses the IANA zone rather than hard-coding EST/EDT.
function fromNewYork(year, month, day, hour, minute) {
  const desired = Date.UTC(year, month - 1, day, hour, minute);
  let result = desired;
  for (let i = 0; i < 3; i++) {
    const p = localParts(new Date(result));
    result +=
      desired -
      Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  }
  return new Date(result);
}

export function nextSession(session, now = new Date()) {
  const local = localParts(now);
  for (let ahead = 0; ahead < 9; ahead++) {
    const day = new Date(
      Date.UTC(local.year, local.month - 1, local.day + ahead),
    );
    if (!session.weekdays.includes(day.getUTCDay())) continue;
    const start = fromNewYork(
      day.getUTCFullYear(),
      day.getUTCMonth() + 1,
      day.getUTCDate(),
      session.hour,
      session.minute,
    );
    if (start > now) return start;
  }
  return null;
}

export function getNextSession(now = new Date()) {
  return SESSIONS.map((session) => ({
    ...session,
    start: nextSession(session, now),
  })).sort((a, b) => a.start - b.start)[0];
}

export function countdown(start, now = new Date()) {
  const seconds = Math.max(0, Math.floor((start - now) / 1000));
  const hours = Math.floor(seconds / 3600);
  return `${String(hours).padStart(2, "0")}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function newYorkClock(now = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
}
