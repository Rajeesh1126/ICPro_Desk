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
  return Number.isNaN(date.getTime()) ? null : date;
};

const pad = (value: number) => String(value).padStart(2, "0");
const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const toIsoDateTime = (date: Date) =>
  `${toIsoDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

/** En dash with spacing: the typographic date-range separator. */
export const RANGE_SEPARATOR = " – ";

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
export const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/;

/** Date format: YYYY-MM-DD. */
export function formatDate(value: DateInput, fallback = "—") {
  const date = toDate(value);
  return date ? toIsoDate(date) : fallback;
}

/** Date-time format: YYYY-MM-DD HH:MM:SS. */
export function formatDateTime(value: DateInput, fallback = "—") {
  const date = toDate(value);
  return date ? toIsoDateTime(date) : fallback;
}

/**
 * Format a table cell value that might be an API date. ISO dates become
 * YYYY-MM-DD, ISO date-times become YYYY-MM-DD HH:MM:SS; anything else is
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
  if (!from) return `Until ${toIsoDate(to!)}`;
  if (!to) return `From ${toIsoDate(from)}`;
  if (toIsoDate(from) === toIsoDate(to)) return toIsoDate(from);
  return `${toIsoDate(from)}${RANGE_SEPARATOR}${toIsoDate(to)}`;
}

/** Explicit ISO dates for compact headers. */
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
