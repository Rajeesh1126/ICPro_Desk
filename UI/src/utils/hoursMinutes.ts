/**
 * Timesheet hours use h.mm notation: the part after the dot is MINUTES, not a
 * decimal fraction. "1.30" is 1 h 30 m; "7.5" is read as "7.50", i.e. 7 h 50 m.
 * A colon is accepted too: "7:30" is 7 h 30 m.
 */

/** Normalise typed input: accept ":" as the separator. */
export const normaliseHoursInput = (value: string) => value.replace(":", ".");

/** Seconds represented by an h.mm value (0 when empty or invalid). */
export function hoursMinutesToSeconds(value: number | string) {
  const raw = normaliseHoursInput(String(value ?? "").trim());
  if (!raw) return 0;
  const [hoursPart = "0", minutesPart = ""] = raw.split(".");
  const hours = Number(hoursPart || 0);
  const minutes = minutesPart === "" ? 0 : Number(minutesPart.padEnd(2, "0").slice(0, 2));
  if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes < 0 || minutes > 59) return 0;
  return hours * 3600 + minutes * 60;
}

const split = (seconds: number) => {
  const totalMinutes = Math.round(Math.max(0, Number(seconds) || 0) / 60);
  return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
};

/** h.mm string for display, e.g. 5400 s → "1.30". Minutes never reach 60. */
export function formatHoursMinutes(seconds: number) {
  const { hours, minutes } = split(seconds);
  return `${hours}.${String(minutes).padStart(2, "0")}`;
}

/** Same value as a number (legacy callers that call `.toFixed(2)`). */
export const hoursMinutesValue = (seconds: number) => Number(formatHoursMinutes(seconds));

/** Unambiguous words, e.g. "7 h 30 m", "45 h", "0 h". */
export function describeHoursMinutes(seconds: number) {
  const { hours, minutes } = split(seconds);
  if (!minutes) return `${hours} h`;
  return `${hours} h ${minutes} m`;
}

/** Decimal hours (7 h 30 m → 7.5) for comparisons and arithmetic only. */
export const secondsToDecimalHours = (seconds: number) => Number((seconds / 3600).toFixed(2));

/** Display form of a stored entry: "7.5" → "7.50", "" stays "". */
export function formatEntryValue(value: number | string | undefined | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const seconds = hoursMinutesToSeconds(raw);
  // Zero shows as empty so the "0.00" placeholder reads as "nothing entered".
  return seconds ? formatHoursMinutes(seconds) : "";
}

/** Daily cap enforced by the timesheet. */
export const MAX_DAILY_SECONDS = 14 * 3600;

/**
 * Why a typed value cannot be accepted, or null when it is fine (or still
 * being typed, e.g. "7.").
 */
export function hoursInputError(value: string): string | null {
  const raw = normaliseHoursInput(value.trim());
  if (!raw) return null;
  if (!/^\d*(\.\d{0,2})?$/.test(raw)) return "Use h.mm, e.g. 7.30";
  const minutesPart = raw.split(".")[1] ?? "";
  if (minutesPart && Number(minutesPart.padEnd(2, "0")) > 59) return "Minutes must be 00–59";
  if (hoursMinutesToSeconds(raw) > MAX_DAILY_SECONDS) return "Max 14 h per day";
  return null;
}
