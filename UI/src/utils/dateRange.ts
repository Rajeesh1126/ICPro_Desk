/** Date and date-time formatting utilities for the whole app. */
type DateInput = string | Date | { toDate: () => Date } | null | undefined;

const toDate = (value: DateInput): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "object" && "toDate" in value) return value.toDate();

  // Parse date-only values at local noon so a time zone cannot shift the day.
  const date = ISO_DATE.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return null;
  // Browsers roll impossible dates over ("2026-02-30" → 2 Mar); reject them
  // instead of showing a different, real-looking date.
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (ymd && ISO_DATE.test(value)) {
    if (
      date.getFullYear() !== Number(ymd[1]) ||
      date.getMonth() + 1 !== Number(ymd[2]) ||
      date.getDate() !== Number(ymd[3])
    ) {
      return null;
    }
  }
  return date;
};

const pad = (value: number) => String(value).padStart(2, "0");
const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Fixed English month names so every screen reads the same, whatever the
// browser locale.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const toDisplayDate = (date: Date) =>
  `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
const toDisplayDateTime = (date: Date) =>
  `${toDisplayDate(date)}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;

/** En dash with spacing: the typographic date-range separator. */
export const RANGE_SEPARATOR = " – ";

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
export const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/;

/** Display date, e.g. "20 Oct 2026". */
export function formatDate(value: DateInput, fallback = "—") {
  const date = toDate(value);
  return date ? toDisplayDate(date) : fallback;
}

/** Display date-time, e.g. "20 Oct 2026, 14:54". */
export function formatDateTime(value: DateInput, fallback = "—") {
  const date = toDate(value);
  return date ? toDisplayDateTime(date) : fallback;
}

/**
 * Format a table cell value that might be an API date: ISO dates and
 * date-times get the display formats above; anything else is returned
 * unchanged.
 */
export function formatIfDate<T>(value: T): T | string {
  if (typeof value !== "string") return value;
  if (ISO_DATE.test(value)) return formatDate(value, value);
  if (ISO_DATE_TIME.test(value)) return formatDateTime(value, value);
  return value;
}

/**
 * Display range, shortened where the parts repeat:
 * "19 – 25 Oct 2026", "28 Sep – 4 Oct 2026", "28 Dec 2026 – 3 Jan 2027".
 */
export function formatDateRange(start: DateInput, end: DateInput) {
  const from = toDate(start);
  const to = toDate(end);
  if (!from && !to) return "Any date";
  if (!from) return `Until ${toDisplayDate(to!)}`;
  if (!to) return `From ${toDisplayDate(from)}`;
  if (toIsoDate(from) === toIsoDate(to)) return toDisplayDate(from);
  const sameYear = from.getFullYear() === to.getFullYear();
  const sameMonth = sameYear && from.getMonth() === to.getMonth();
  const left = sameMonth
    ? `${from.getDate()}`
    : sameYear
      ? `${from.getDate()} ${MONTHS[from.getMonth()]}`
      : toDisplayDate(from);
  return `${left}${RANGE_SEPARATOR}${toDisplayDate(to)}`;
}

/** Same as formatDateRange; kept for compact headers. */
export function formatFullDateRange(start: DateInput, end: DateInput) {
  return formatDateRange(start, end);
}

/** Inclusive length, e.g. "7 days"; null when either end is missing or reversed. */
export function formatRangeLength(start: DateInput, end: DateInput) {
  const from = toDate(start);
  const to = toDate(end);
  if (!from || !to) return null;
  const days =
    Math.round(
      (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
        Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) /
        86_400_000,
    ) + 1;
  return days > 0 ? `${days} ${days === 1 ? "day" : "days"}` : null;
}

/** ISO date (YYYY-MM-DD) for `<time dateTime>`. */
export const isoDate = (value: DateInput) => {
  const date = toDate(value);
  return date ? toIsoDate(date) : undefined;
};

/* ---- Calendar headings (local calendar dates; no time-zone shifting) ---- */

const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Weekday column labels for a Monday-first calendar. */
export const CALENDAR_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** "October 2026" (month is 0-based). */
export const formatMonthYear = (year: number, month: number) =>
  `${MONTHS_LONG[month]} ${year}`;

/** Agenda heading, e.g. "Wed, 21 Oct 2026". */
export const formatDayHeading = (year: number, month: number, day: number) => {
  const date = new Date(year, month, day);
  return `${WEEKDAYS_SHORT[date.getDay()]}, ${toDisplayDate(date)}`;
};

/** Screen-reader day name, e.g. "Wednesday 21 October 2026". */
export const formatDayLong = (year: number, month: number, day: number) => {
  const date = new Date(year, month, day);
  return `${WEEKDAYS_LONG[date.getDay()]} ${day} ${MONTHS_LONG[month]} ${year}`;
};
