/**
 * Readable date ranges for the whole app.
 *
 *   6 – 12 Oct 2026            same month
 *   28 Sep – 4 Oct 2026        same year
 *   28 Dec 2025 – 3 Jan 2026   across years
 *   9 Oct 2026                 single day
 *
 * Accepts ISO dates ("2026-10-06"), datetimes, Date or dayjs-like objects.
 */
type DateInput = string | Date | { toDate: () => Date } | null | undefined;

const toDate = (value: DateInput): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "object" && "toDate" in value) return value.toDate();
  // Date-only strings are parsed at local noon so time zones never shift the day.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
};

const day = (date: Date) => String(date.getDate());
const paddedDay = (date: Date) => String(date.getDate()).padStart(2, "0");
// Fixed three-letter months: locale data varies (e.g. "Sept" vs "Sep").
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const month = (date: Date) => MONTHS[date.getMonth()];
const full = (date: Date) => `${day(date)} ${month(date)} ${date.getFullYear()}`;
const fullPadded = (date: Date) => `${paddedDay(date)} ${month(date)} ${date.getFullYear()}`;

/** En dash with thin spacing: the typographic range separator. */
export const RANGE_SEPARATOR = " – ";

export function formatDate(value: DateInput, fallback = "—") {
  const date = toDate(value);
  return date ? full(date) : fallback;
}

/** "8 Oct 2026, 14:22" — dates with a time of day (logs, created/updated). */
export function formatDateTime(value: DateInput, fallback = "—") {
  const date = toDate(value);
  if (!date) return fallback;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${full(date)}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/;

/**
 * Format a table cell value that might be an API date. ISO dates become
 * "8 Oct 2026", ISO date-times "8 Oct 2026, 14:22"; anything else is
 * returned unchanged.
 */
export function formatIfDate<T>(value: T): T | string {
  if (typeof value !== "string") return value;
  if (ISO_DATE.test(value)) return formatDate(value, value);
  if (ISO_DATE_TIME.test(value)) return formatDateTime(value, value);
  return value;
}

export function formatDateRange(start: DateInput, end: DateInput) {
  const from = toDate(start);
  const to = toDate(end);
  if (!from && !to) return "Any date";
  if (!from) return `Until ${full(to!)}`;
  if (!to) return `From ${full(from)}`;

  const sameYear = from.getFullYear() === to.getFullYear();
  const sameMonth = sameYear && from.getMonth() === to.getMonth();
  if (sameMonth && from.getDate() === to.getDate()) return full(from);
  if (sameMonth) return `${day(from)}${RANGE_SEPARATOR}${day(to)} ${month(to)} ${to.getFullYear()}`;
  if (sameYear) {
    return `${day(from)} ${month(from)}${RANGE_SEPARATOR}${day(to)} ${month(to)} ${to.getFullYear()}`;
  }
  return `${full(from)}${RANGE_SEPARATOR}${full(to)}`;
}

/** "06 Oct 2026 – 12 Oct 2026" — explicit full dates for compact headers. */
export function formatFullDateRange(start: DateInput, end: DateInput) {
  const from = toDate(start);
  const to = toDate(end);
  if (!from && !to) return "Any date";
  if (!from) return `Until ${fullPadded(to!)}`;
  if (!to) return `From ${fullPadded(from)}`;
  if (from.getTime() === to.getTime()) return fullPadded(from);
  return `${fullPadded(from)}${RANGE_SEPARATOR}${fullPadded(to)}`;
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

/** ISO date (yyyy-mm-dd) for `<time dateTime>`. */
export const isoDate = (value: DateInput) => {
  const date = toDate(value);
  if (!date) return undefined;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
