import type { TicketData } from "@/types/dataTypes";

/** Ticket statuses that still need work (used for "overdue"). */
const ACTIVE_TICKET_STATUSES = [
  "open",
  "revised",
  "reopened",
  "in progress",
  "assigned",
  "not-satisfied",
  "accepted",
  "recall requested",
  "date revision",
  "pending",
];

/** Local midnight of a date-only or date-time value, or null when invalid. */
function dueDay(value: string | null | undefined) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).setHours(0, 0, 0, 0);
  }
  const date = new Date(value.replace(" ", "T"));
  const timestamp = date.getTime();
  date.setHours(0, 0, 0, 0);
  return Number.isNaN(timestamp) ? null : date.getTime();
}

export function isActiveTicket(ticket: Pick<TicketData, "current_status">) {
  return ACTIVE_TICKET_STATUSES.includes(ticket.current_status?.toLowerCase() ?? "");
}

/** Active and due today or earlier: the single "overdue" rule for tickets. */
export function isOverdueTicket(ticket: Pick<TicketData, "current_status" | "target_date">) {
  const day = dueDay(ticket.target_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return day !== null && day <= today.getTime() && isActiveTicket(ticket);
}

/* -------------------------------------------------------------------------- */
/* Target-date calendar helpers (pure; no React)                               */
/* -------------------------------------------------------------------------- */

/** A local calendar date (month is 0-based). */
export type CalendarDay = { year: number; month: number; day: number };

/** "YYYY-MM-DD" key for a local calendar date. */
export const calendarKey = ({ year, month, day }: CalendarDay) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

/** Today's local calendar date, read at call time (never hard-coded). */
export const todayCalendarDay = (): CalendarDay => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
};

/**
 * Reads a target date as the calendar date it names. "2026-10-21" and
 * "2026-10-21T00:00:00Z" both mean 21 Oct: the date part is taken as written
 * (no UTC conversion), so a ticket never moves to a neighbouring day.
 * Missing or impossible dates (e.g. 2026-02-30) return null — never today.
 */
export function parseCalendarDate(value: unknown): CalendarDay | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const check = new Date(year, month, day);
  if (check.getFullYear() !== year || check.getMonth() !== month || check.getDate() !== day) {
    return null;
  }
  return { year, month, day };
}

/** Stable order inside a day: ticket number (natural), then id. */
export const compareTickets = (
  a: { number?: string; id?: number },
  b: { number?: string; id?: number },
) =>
  String(a.number ?? "").localeCompare(String(b.number ?? ""), undefined, { numeric: true }) ||
  (a.id ?? 0) - (b.id ?? 0);

/**
 * Groups tickets by their target date. Tickets without a valid date go to
 * `undated` (shown in their own section, never dropped or put on today).
 */
export function groupByTargetDate<T extends { target_date?: string | null; number?: string; id?: number }>(
  tickets: T[],
): { byDate: Map<string, T[]>; undated: T[] } {
  const byDate = new Map<string, T[]>();
  const undated: T[] = [];
  for (const ticket of tickets) {
    const date = parseCalendarDate(ticket.target_date);
    if (!date) {
      undated.push(ticket);
      continue;
    }
    const key = calendarKey(date);
    const list = byDate.get(key);
    if (list) list.push(ticket);
    else byDate.set(key, [ticket]);
  }
  byDate.forEach((list) => list.sort(compareTickets));
  undated.sort(compareTickets);
  return { byDate, undated };
}

/** Moves a month cursor by `delta` months across year boundaries. */
export const shiftMonth = (year: number, month: number, delta: number) => {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
};

/** Moves a calendar date by `delta` days (handles month/year/leap days). */
export const shiftDay = (date: CalendarDay, delta: number): CalendarDay => {
  const next = new Date(date.year, date.month, date.day + delta);
  return { year: next.getFullYear(), month: next.getMonth(), day: next.getDate() };
};

/**
 * The 42 days (6 Monday-first weeks) shown for a month, so every month —
 * including those that need six rows — has the same stable grid.
 */
export function monthGrid(year: number, month: number): (CalendarDay & { inMonth: boolean; key: string })[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Monday = 0
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, month, 1 - offset + index);
    const day = { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() };
    return { ...day, inMonth: day.month === month, key: calendarKey(day) };
  });
}

/** Keys of every day in a month, in order (for the agenda and counts). */
export const monthKeys = (year: number, month: number) =>
  Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, index) =>
    calendarKey({ year, month, day: index + 1 }),
  );
