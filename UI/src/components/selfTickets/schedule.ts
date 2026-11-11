import type { SelfTicketData, SelfTicketSchedule } from "@/types/dataTypes";
import { formatDate, formatDateRange } from "@/utils/dateRange";
import { selfTicketDisplayDueDate } from "@/components/selfTickets/highlight";

/**
 * Do List schedule wording shared by the table, cards, calendar, detail
 * dialog, reports and the create form, so every surface says the same thing.
 */

export type ScheduleType = NonNullable<SelfTicketSchedule["schedule_type"]>;
export type RepeatFrequency = NonNullable<SelfTicketSchedule["repeat_frequency"]>;

export const SCHEDULE_TYPES: { value: ScheduleType; label: string; hint: string }[] = [
  { value: "static", label: "Event", hint: "A single task with a target date" },
  { value: "period", label: "Period", hint: "Runs every day from a start date to an end date" },
  { value: "recurring", label: "Recurring", hint: "Repeats on a schedule; each occurrence is completed on its own" },
];

export const REPEAT_FREQUENCIES: RepeatFrequency[] = ["daily", "weekly", "monthly", "yearly"];

/** Monday-first, matching the API's `repeat_weekdays` (Mon = 0). */
export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const FREQUENCY_UNITS: Record<RepeatFrequency, string> = {
  daily: "day",
  weekly: "week",
  monthly: "month",
  yearly: "year",
};

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** "One-time", "Continuous period" or "Recurring". */
export const scheduleLabel = (type: SelfTicketSchedule["schedule_type"]) =>
  SCHEDULE_TYPES.find((item) => item.value === type)?.label ?? SCHEDULE_TYPES[0].label;

/** Unit after "Repeat every N": "day", "weeks", … */
export const frequencyUnit = (frequency: SelfTicketSchedule["repeat_frequency"], count: number) => {
  const unit = FREQUENCY_UNITS[frequency ?? "monthly"];
  return count === 1 ? unit : `${unit}s`;
};

/** "3 days before due", "Every 2 days", or null when reminders are off. */
export function reminderSummary(task: SelfTicketSchedule & { reminder_interval?: number }) {
  if (task.reminder_mode === "before_due") {
    return task.reminder_days_before ? `${plural(task.reminder_days_before, "day")} before due` : null;
  }
  const interval = task.reminder_interval ?? 0;
  return interval ? `Every ${interval === 1 ? "day" : plural(interval, "day")}` : null;
}

/**
 * How a task repeats, in one line: "Every 2 weeks on Mon, Wed until 31 Dec
 * 2026", "1 – 5 Nov 2026", or "Once". `anchor` is the schedule's start date.
 */
export function scheduleSummary(task: SelfTicketSchedule, anchor: string) {
  if (task.schedule_type === "period") {
    return task.start_date && anchor ? formatDateRange(task.start_date, anchor) : "Start and end dates needed";
  }
  if (task.schedule_type !== "recurring") return "Once";

  const interval = task.repeat_interval || 1;
  const frequency = task.repeat_frequency ?? "monthly";
  const parts = [interval === 1 ? `Every ${FREQUENCY_UNITS[frequency]}` : `Every ${interval} ${frequencyUnit(frequency, interval)}`];

  if (frequency === "weekly") {
    const days = task.repeat_weekdays?.length ? task.repeat_weekdays : [anchorWeekday(anchor)];
    parts.push(`on ${[...days].sort((a, b) => a - b).map((day) => WEEKDAYS[day]?.slice(0, 3)).join(", ")}`);
  }
  if (frequency === "monthly") {
    const mode = task.monthly_day_mode ?? "specific";
    parts.push(
      mode === "first"
        ? "on the 1st"
        : mode === "last"
          ? "on the last day"
          : `on day ${task.repeat_day_of_month ?? anchorDayOfMonth(anchor)}`,
    );
  }
  if (anchor) parts.push(`from ${formatDate(anchor)}`);
  if (task.repeat_until) parts.push(`until ${formatDate(task.repeat_until)}`);
  return parts.join(" ");
}

/** Monday-first weekday of a "YYYY-MM-DD" date (Mon = 0). */
export function anchorWeekday(date: string) {
  const day = new Date(`${date}T00:00:00`).getDay();
  return Number.isNaN(day) ? 0 : (day + 6) % 7;
}

/** Day of month of a "YYYY-MM-DD" date, 1 when missing. */
export const anchorDayOfMonth = (date: string) => Number(date.split("-")[2]) || 1;

/** Label for a task's date on cards and detail facts. */
export const dueDateLabel = (type: SelfTicketSchedule["schedule_type"]) =>
  type === "recurring" ? "Next occurrence" : type === "period" ? "End date" : "Target date";

/**
 * Recurring tasks as one row per occurrence (date, status and alarm of that
 * occurrence), so the calendar and reports place each on its own day.
 * `keepUnscheduled` keeps a recurring task that has no occurrences yet.
 */
export function expandOccurrences(tasks: SelfTicketData[], keepUnscheduled = false): SelfTicketData[] {
  return tasks.flatMap((task) => {
    if (task.schedule_type !== "recurring") return [task];
    const occurrences = task.occurrences ?? [];
    if (!occurrences.length) return keepUnscheduled ? [task] : [];
    return occurrences.map((occurrence) => ({
      ...task,
      id: -occurrence.id,
      target_date: occurrence.scheduled_date,
      current_status: occurrence.current_status,
      alarm: occurrence.alarm,
      occurrences: [occurrence],
    }));
  });
}

/** The full task behind an expanded occurrence row (same task number). */
export const sourceTask = (tasks: SelfTicketData[], row: SelfTicketData) =>
  tasks.find((task) => task.number === row.number) ?? row;

/** Agenda line under a calendar item: owner plus how the task is scheduled. */
export function scheduleAgendaMeta(task: SelfTicketData) {
  const owner = task.creator_name || "Unassigned";
  if (task.schedule_type === "period") return `${owner} · ${scheduleSummary(task, task.target_date)}`;
  if (task.schedule_type === "recurring") {
    const interval = task.repeat_interval || 1;
    const frequency = task.repeat_frequency ?? "monthly";
    return `${owner} · Repeats ${interval === 1 ? frequency : `every ${interval} ${frequencyUnit(frequency, interval)}`}`;
  }
  return `${owner} · Target ${formatDate(selfTicketDisplayDueDate(task))}`;
}

/** "YYYY-MM-DD" for a local date. */
export function toInputDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** A "YYYY-MM-DD" date moved by `days` (empty input stays empty). */
export function shiftInputDate(date: string, days: number) {
  if (!date) return date;
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + days);
  return toInputDate(next);
}

/** Inclusive length of a period in days, or null when the dates are missing / reversed. */
export function periodDays(start: string | null | undefined, end: string | null | undefined) {
  if (!start || !end || start > end) return null;
  return Math.round((new Date(`${end}T00:00:00`).getTime() - new Date(`${start}T00:00:00`).getTime()) / 86_400_000) + 1;
}

/** What a "days before" reminder counts back from, per schedule type. */
export const reminderAnchorLabel = (type: SelfTicketSchedule["schedule_type"]) =>
  type === "recurring" ? "each occurrence" : type === "period" ? "the end date" : "the target date";
