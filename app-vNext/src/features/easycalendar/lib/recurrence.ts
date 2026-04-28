export const CUSTOM_WEEKDAYS_VALUE = "CUSTOM_WEEKDAYS";

export const RECURRENCE_OPTIONS = [
  { value: "", label: "Does not repeat" },
  { value: "FREQ=DAILY", label: "Daily" },
  { value: "FREQ=WEEKLY", label: "Weekly" },
  { value: CUSTOM_WEEKDAYS_VALUE, label: "Custom weekdays" },
  { value: "FREQ=MONTHLY", label: "Monthly" },
];

export const RECURRENCE_WEEKDAYS = [
  { code: "SU", label: "Sun" },
  { code: "MO", label: "Mon" },
  { code: "TU", label: "Tue" },
  { code: "WE", label: "Wed" },
  { code: "TH", label: "Thu" },
  { code: "FR", label: "Fri" },
  { code: "SA", label: "Sat" },
];

export function getRepeatSelectValue(rule: string) {
  return rule.toUpperCase().startsWith("FREQ=WEEKLY;BYDAY=")
    ? CUSTOM_WEEKDAYS_VALUE
    : rule;
}

export function getWeekdayCodesFromRule(rule: string) {
  const match = rule.toUpperCase().match(/BYDAY=([A-Z,]+)/);
  if (!match) return [];

  return match[1]
    .split(",")
    .filter((code) => RECURRENCE_WEEKDAYS.some((weekday) => weekday.code === code));
}

export function buildCustomWeekdaysRule(codes: string[]) {
  const orderedCodes = RECURRENCE_WEEKDAYS
    .map((weekday) => weekday.code)
    .filter((code) => codes.includes(code));

  return orderedCodes.length ? `FREQ=WEEKLY;BYDAY=${orderedCodes.join(",")}` : "";
}

export function getWeekdayCodeForDateInput(dateInput: string) {
  const [year, month, day] = dateInput.split("-").map(Number);
  if (!year || !month || !day) return "MO";

  return RECURRENCE_WEEKDAYS[new Date(year, month - 1, day).getDay()]?.code || "MO";
}
