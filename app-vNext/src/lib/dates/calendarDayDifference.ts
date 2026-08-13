const DAY_MS = 86_400_000;

function calendarDayNumber(value: Date) {
  return Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()) / DAY_MS;
}

function dateOnlyDayNumber(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
  return Date.UTC(year, month - 1, day) / DAY_MS;
}

/** Calendar-day difference in the user's local day, without elapsed-hour or DST rounding. */
export function calendarDayDifference(target: string | Date, now = new Date()) {
  const targetDay = typeof target === "string" ? dateOnlyDayNumber(target) : calendarDayNumber(target);
  if (targetDay === null || Number.isNaN(now.getTime())) return null;
  return targetDay - calendarDayNumber(now);
}
