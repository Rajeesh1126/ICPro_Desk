/**
 * Date display helpers used across tables, cards and dialogs.
 * They delegate to `utils/dateRange` so the whole app shows one format:
 * "8 Oct 2026" and "8 Oct 2026, 14:22". Empty or invalid values render
 * as "—" (never as the current date).
 */
import { formatDate } from "@/utils/dateRange";

export { formatDate, formatDateTime } from "@/utils/dateRange";

export type DueTone = "overdue" | "today" | "soon" | "upcoming" | "none";

const toLocalDay = (value: string) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).getTime();
  }
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

/**
 * Target-date label for cards: "Today", "Tomorrow", "in N days" up to
 * 10 days ahead, otherwise the regular formatted date.
 */
export function formatDueDate(value: string | null | undefined): {
  label: string;
  tone: DueTone;
} {
  if (!value) return { label: "—", tone: "none" };
  const day = toLocalDay(value);
  if (day === null) return { label: formatDate(value), tone: "none" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((day - today.getTime()) / 86_400_000);

  if (diff < 0) return { label: formatDate(value), tone: "overdue" };
  if (diff === 0) return { label: "Today", tone: "today" };
  if (diff === 1) return { label: "Tomorrow", tone: "soon" };
  if (diff <= 10) return { label: `in ${diff} days`, tone: "soon" };
  return { label: formatDate(value), tone: "upcoming" };
}

/**
 * Banner wording for a passed / reached target date, e.g. "Overdue by 3 days"
 * or "Due today". Null when the date is still ahead, missing or invalid.
 */
export function formatOverdueLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  const day = toLocalDay(value);
  if (day === null) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const late = Math.round((today.getTime() - day) / 86_400_000);
  if (late > 0) return `Overdue by ${late} day${late === 1 ? "" : "s"}`;
  if (late === 0) return "Due today";
  return null;
}
