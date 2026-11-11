/**
 * Data shaping and approval rules for the approval detail dialog. Pure
 * functions (no React), so grouping, totals and rating validation can be
 * unit-tested on their own.
 */
import type { ApiTaskRow, TaskRow } from "@/types/dataTypes";
import { hoursMinutesToSeconds } from "@/utils/hoursMinutes";

/** Approval Detail Response declaration used across the frontend. */
export interface ApprovalDetailResponse {
  rows: ApiTaskRow[];
  comments?: string;
  action_status?: boolean;
}

/** Approval Action declaration used across the frontend. */
export type ApprovalAction = "Accepted" | "Rejected";

/** Approval Week Day declaration used across the frontend. */
export type ApprovalWeekDay = { label: string; date: string };

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const EMPTY_WEEK = ["", "", "", "", "", "", ""];

/** RATING_OPTIONS declaration used across the frontend. */
export const RATING_OPTIONS = [
  { value: "0", label: "Select" },
  { value: "1", label: "Not Reviewed" },
  { value: "2", label: "Average" },
  { value: "3", label: "Good" },
  { value: "4", label: "Excellent" },
];

/** Highest rating value in RATING_OPTIONS. */
const MAX_RATING = Number(RATING_OPTIONS[RATING_OPTIONS.length - 1].value);

/** The "Others" job carries no rating. */
export const isOthersProject = (project?: string) =>
  (project || "").trim().toLowerCase() === "others";

const localIsoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** Seven columns from `weekStart` (YYYY-MM-DD), labelled like "Mon-06". */
export function buildWeekDays(weekStart: string): ApprovalWeekDay[] {
  if (!weekStart) return [];
  const startDate = new Date(`${weekStart}T00:00:00`);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return {
      label: `${DAY_NAMES[date.getDay()]}-${String(date.getDate()).padStart(2, "0")}`,
      date: localIsoDate(date),
    };
  });
}

/**
 * Flattens API rows into table rows: one "project" header row per job,
 * followed by its "milestone" rows. Rows without a job are dropped.
 */
export function groupApprovalRows(apiRows: ApiTaskRow[]): TaskRow[] {
  const projects = new Map<number, {
    project: string;
    description?: string;
    tasks: ApiTaskRow[];
  }>();

  apiRows.forEach((row) => {
    if (row.projectId === null || row.projectId === undefined) return;
    const entry = projects.get(row.projectId) ?? {
      project: row.project,
      description: row.description,
      tasks: [],
    };
    entry.description ||= row.description;
    entry.tasks.push(row);
    projects.set(row.projectId, entry);
  });

  const rows: TaskRow[] = [];
  projects.forEach(({ project, description, tasks }, projectId) => {
    rows.push({
      id: projectId,
      projectId,
      project,
      description,
      task: "",
      budgetOwner: "",
      hours: [...EMPTY_WEEK],
      rating: "",
      status: "",
      rowType: "project",
    });
    tasks.forEach((task) => {
      rows.push({
        id: task.id,
        projectId: task.projectId,
        project,
        description,
        task: task.task,
        budgetOwner: task.budgetOwner,
        hours: Array.isArray(task.hours) ? task.hours : [...EMPTY_WEEK],
        rating: String(task.rating ?? ""),
        status: task.status || "Pending",
        rowType: "milestone",
        approvedStatus: task.approvedStatus,
        rejectionReason: task.rejectionReason,
      });
    });
  });

  return rows;
}

/** Seconds entered per day across all task rows. */
export const getDayTotals = (rows: TaskRow[], dayCount: number) =>
  Array.from({ length: dayCount }, (_, dayIndex) =>
    rows
      .filter((row) => row.rowType === "milestone")
      .reduce((total, row) => total + hoursMinutesToSeconds(row.hours[dayIndex] || "0"), 0),
  );

/** Week at a glance for the review header: hours, days logged, review progress. */
export function getReviewSummary(rows: TaskRow[], dayTotals: number[]) {
  const tasks = rows.filter((row) => row.rowType === "milestone");
  const statusOf = (row: TaskRow) => row.status.trim().toLowerCase();
  return {
    totalSeconds: dayTotals.reduce((sum, seconds) => sum + seconds, 0),
    taskCount: tasks.length,
    jobCount: rows.filter((row) => row.rowType === "project").length,
    daysLogged: dayTotals.filter((seconds) => seconds > 0).length,
    awaiting: tasks.filter((row) => statusOf(row) === "submitted").length,
    accepted: tasks.filter((row) => statusOf(row) === "accepted").length,
    rejected: tasks.filter((row) => statusOf(row) === "rejected").length,
    draft: tasks.filter((row) => statusOf(row) === "draft").length,
  };
}

/**
 * Accepting is available for submitted rows with a valid rating. The Others
 * job intentionally has no rating control, so it can be accepted with the
 * existing zero-rating payload.
 */
export const canDecideTask = (row: TaskRow) => {
  const rating = Number(row.rating);
  return (
    row.status.trim().toLowerCase() === "submitted" &&
    (isOthersProject(row.project) ||
      (Number.isFinite(rating) && rating >= 1 && rating <= MAX_RATING))
  );
};

/** Why a task can't be accepted or rejected yet (only submitted tasks can). */
export const notReviewableReason = (row: TaskRow) => {
  const status = row.status.trim().toLowerCase();
  if (status === "draft") return "Not submitted yet: nothing to review";
  if (status === "accepted" || status === "rejected") return `Already ${status}`;
  return `Only submitted tasks can be reviewed (this one is ${status || "not submitted"})`;
};

/** Rejection is available for submitted rows, regardless of rating. */
export const canRejectTask = (row: TaskRow) =>
  row.status.trim().toLowerCase() === "submitted";

/**
 * The rating to send with an action, or the warning to show instead.
 * Rejections and the "Others" job send 0; all other acceptances need a
 * rating from 1–4.
 */
export function getActionRating(
  row: TaskRow,
  action: ApprovalAction,
): { rating: number } | { error: string } {
  if (row.status.trim().toLowerCase() !== "submitted") {
    return { error: "Only submitted entries can be accepted or rejected." };
  }
  if (action === "Rejected") return { rating: 0 };
  if (isOthersProject(row.project)) return { rating: 0 };
  if (!row.rating || row.rating === "0") {
    return { error: "Please select a rating before accepting." };
  }
  const rating = Number(row.rating);
  if (Number.isNaN(rating) || rating < 1 || rating > MAX_RATING) {
    return { error: "Please select a valid rating before accepting." };
  }
  return { rating };
}

/** Row state after the server accepted an action. */
export const applyActionResult = (
  rows: TaskRow[],
  rowId: number,
  action: ApprovalAction,
  rating: number,
  comments: string,
) =>
  rows.map((row) =>
    row.id === rowId
      ? {
          ...row,
          status: action,
          rating: String(rating),
          rejectionReason: action === "Rejected" ? comments : null,
        }
      : row,
  );

/** set Row Rating declaration used across the frontend. */
export const setRowRating = (rows: TaskRow[], rowId: number, rating: string) =>
  rows.map((row) => (row.id === rowId ? { ...row, rating } : row));
