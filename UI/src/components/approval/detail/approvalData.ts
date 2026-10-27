/**
 * Data shaping and approval rules for the approval detail dialog. Pure
 * functions (no React), so grouping, totals and rating validation can be
 * unit-tested on their own.
 */
import type { ApiTaskRow, TaskRow } from "@/types/dataTypes";
import { hoursMinutesToSeconds } from "@/utils/hoursMinutes";

export interface ApprovalDetailResponse {
  rows: ApiTaskRow[];
  comments?: string;
  action_status?: boolean;
}

export type ApprovalAction = "Accepted" | "Rejected";

export type ApprovalWeekDay = { label: string; date: string };

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const EMPTY_WEEK = ["", "", "", "", "", "", ""];

export const RATING_OPTIONS = [
  { value: "0", label: "Select" },
  { value: "1", label: "Poor" },
  { value: "2", label: "Average" },
  { value: "3", label: "Good" },
  { value: "4", label: "Very Good" },
  { value: "5", label: "Excellent" },
];

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
 * followed by its "milestone" rows. Rows without a job are dropped. Also
 * returns the job ids so every job can start expanded.
 */
export function groupApprovalRows(apiRows: ApiTaskRow[]): { rows: TaskRow[]; projectIds: number[] } {
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

  return { rows, projectIds: Array.from(projects.keys()) };
}

/** Job rows always; task rows only under expanded jobs. */
export const getVisibleRows = (rows: TaskRow[], expandedProjects: number[]) =>
  rows.filter(
    (row) =>
      row.rowType === "project" ||
      (row.rowType === "milestone" && expandedProjects.includes(row.projectId)),
  );

/** Seconds entered per day across all task rows. */
export const getDayTotals = (rows: TaskRow[], dayCount: number) =>
  Array.from({ length: dayCount }, (_, dayIndex) =>
    rows
      .filter((row) => row.rowType === "milestone")
      .reduce((total, row) => total + hoursMinutesToSeconds(row.hours[dayIndex] || "0"), 0),
  );

export const toggleId = (ids: number[], id: number) =>
  ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];

/** A row is decided once accepted or rejected; its controls lock. */
export const isDecided = (row: TaskRow) =>
  ["accepted", "rejected"].includes(row.status.trim().toLowerCase());

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
      (Number.isFinite(rating) && rating >= 1 && rating <= 5))
  );
};

/** Rejection is available for submitted rows, regardless of rating. */
export const canRejectTask = (row: TaskRow) =>
  row.status.trim().toLowerCase() === "submitted";

/**
 * The rating to send with an action, or the warning to show instead.
 * Rejections and the "Others" job send 0; all other acceptances need a
 * rating from 1–5.
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
  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
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

export const setRowRating = (rows: TaskRow[], rowId: number, rating: string) =>
  rows.map((row) => (row.id === rowId ? { ...row, rating } : row));
