/**
 * Pure timesheet logic: no React, no API. Everything here takes plain data
 * and returns plain data, so it can be unit-tested directly.
 *
 * Hours are stored per task per date in h.mm notation ("1.30" = 1 h 30 m)
 * and summed as seconds.
 */
import type {
  AssignedTask,
  Milestone,
  SubmissionProject,
  TaskEntry,
} from "../../../types/dataTypes";
import {
  describeHoursMinutes,
  hoursMinutesToSeconds,
  MAX_DAILY_SECONDS,
  secondsToDecimalHours,
} from "../../../utils/hoursMinutes";

// ---------------------------------------------------------------------------
// Types shared with the Time Sheet page
// ---------------------------------------------------------------------------

export type WeekDay = {
  /** e.g. "Mon-05" */
  label: string;
  /** ISO date, e.g. "2026-10-05" */
  date: string;
};

export type TimesheetSubmitEntry = {
  assignId: number;
  date: string;
  /** Seconds. */
  hours: number;
};

export type SaveDraftResponse = {
  entries?: TimesheetSubmitEntry[];
  deleted_entries?: Array<Pick<TimesheetSubmitEntry, "assignId" | "date">>;
};

export type BudgetOwnerValidation = {
  missingCount: number;
  missingTaskNames: string[];
};

export type DailyHoursValidation = {
  exceededDays: string[];
};

export type WeeklyHoursValidation = {
  estimatedHours: number;
  actualHours: number;
  isSatisfied: boolean;
};

export type WeeklyTimesheetLog = {
  timesheet_status: string;
  submission_status?: boolean;
};

/** Identifies one task inside the project → milestone → task tree. */
export type TaskRef = {
  projectId: number;
  milestoneId: number;
  taskId: number;
};

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const FULL_DAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
};

/** The seven days (Mon–Sun) of the week starting at `weekStart` (ISO date). */
export const createWeekDays = (weekStart: string): WeekDay[] => {
  const startDate = new Date(`${weekStart}T00:00:00`);
  return DAY_LABELS.map((label, index) => {
    const date = addDays(startDate, index);
    return {
      label: `${label}-${String(date.getDate()).padStart(2, "0")}`,
      date: formatLocalDate(date),
    };
  });
};

/**
 * Weekly hours target: 45 h in a week containing the 2nd or 4th Saturday of
 * its month (those Saturdays are off), otherwise 54 h.
 */
export const getEstimatedWeekHours = (weekStart: string) => {
  const startDate = new Date(`${weekStart}T00:00:00`);
  for (let index = 0; index < 7; index++) {
    const date = addDays(startDate, index);
    const saturdayOccurrence = Math.ceil(date.getDate() / 7);
    if (date.getDay() === 6 && [2, 4].includes(saturdayOccurrence)) return 1;
  }
  return 1 ; // 1st, 3rd, 5th Saturday of the month is 9 hours and 6 days of 9 hours
};

/** Dates a not-yet-submitted week may be edited on: yesterday, today, tomorrow. */
export const getEditableDates = (today: Date) =>
  new Set([
    formatLocalDate(addDays(today, -1)),
    formatLocalDate(today),
    formatLocalDate(addDays(today, 1)),
  ]);

// ---------------------------------------------------------------------------
// Totals (seconds)
// ---------------------------------------------------------------------------

const entrySeconds = (task: AssignedTask, date: string) =>
  hoursMinutesToSeconds(task.entries[date] ?? 0);

export const getTaskTotal = (task: AssignedTask, weekDays: WeekDay[]) =>
  weekDays.reduce((total, day) => total + entrySeconds(task, day.date), 0);

export const getMilestoneTotal = (milestone: Milestone, weekDays: WeekDay[]) =>
  milestone.assigned_tasks.reduce((total, task) => total + getTaskTotal(task, weekDays), 0);

export const getProjectTotal = (project: SubmissionProject, weekDays: WeekDay[]) =>
  project.milestones.reduce(
    (total, milestone) => total + getMilestoneTotal(milestone, weekDays),
    0,
  );

/** Seconds entered on one day across a milestone's tasks. */
export const getMilestoneDayTotal = (milestone: Milestone, date: string) =>
  milestone.assigned_tasks.reduce((total, task) => total + entrySeconds(task, date), 0);

/** Seconds entered on one day across all of a job's milestones. */
export const getProjectDayTotal = (project: SubmissionProject, date: string) =>
  project.milestones.reduce(
    (total, milestone) => total + getMilestoneDayTotal(milestone, date),
    0,
  );

/** Seconds per day across every job, aligned with `weekDays`. */
export const getWeekDayTotals = (projects: SubmissionProject[], weekDays: WeekDay[]) =>
  weekDays.map((day) => ({
    date: day.date,
    hours: projects.reduce((total, project) => total + getProjectDayTotal(project, day.date), 0),
  }));

// ---------------------------------------------------------------------------
// Jobs and selection
// ---------------------------------------------------------------------------

/** The "Others" bucket: always editable, no budget owner, not selectable. */
export const isOthersProject = (project: SubmissionProject) =>
  project.code?.toLowerCase() === "others";

export const getProjectAssignedTaskIds = (project: SubmissionProject) =>
  project.milestones.flatMap((milestone) =>
    milestone.assigned_tasks.map((task) => task.assign_id),
  );

export const getSelectableProjectAssignedTaskIds = (project: SubmissionProject) =>
  isOthersProject(project) ? [] : getProjectAssignedTaskIds(project);

// ---------------------------------------------------------------------------
// Week status
// ---------------------------------------------------------------------------

export function getWeekLockState(status: WeeklyTimesheetLog) {
  const isRejected = status.timesheet_status === "Rejected";
  const isUnlocked = ["Unlocked", "Rejected"].includes(status.timesheet_status);
  const isSubmitted =
    status.timesheet_status === "Submitted" || Boolean(status.submission_status);
  const isAccepted = status.timesheet_status === "Accepted";
  const isLockedSubmitted = isSubmitted && !isUnlocked;
  return {
    isRejected,
    isUnlocked,
    isSubmitted,
    isAccepted,
    isLockedSubmitted,
    budgetOwnerDisabled: isLockedSubmitted || isAccepted,
  };
}

/** Whether hours on `date` may be edited for `project` in a week with `lock` state. */
export const canEditDate = (
  date: string,
  project: SubmissionProject,
  lock: ReturnType<typeof getWeekLockState>,
  editableDates: Set<string>,
) =>
  lock.isUnlocked ||
  (!lock.isSubmitted && (isOthersProject(project) || editableDates.has(date)));

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function getWeeklyHoursValidation(
  weekTotalSeconds: number,
  estimatedHours: number,
): WeeklyHoursValidation {
  const actualHours = secondsToDecimalHours(weekTotalSeconds);
  return { estimatedHours, actualHours, isSatisfied: actualHours >= estimatedHours };
}

/** Days over the 14-hour cap, as "Mon-05 (15 h)". */
export function getExceededDays(
  weekDayTotals: { date: string; hours: number }[],
  weekDays: WeekDay[],
): DailyHoursValidation {
  return {
    exceededDays: weekDayTotals
      .map((dayTotal, index) => ({
        label: weekDays[index]?.label ?? dayTotal.date,
        hours: dayTotal.hours,
      }))
      .filter((dayTotal) => dayTotal.hours > MAX_DAILY_SECONDS)
      .map((dayTotal) => `${dayTotal.label} (${describeHoursMinutes(dayTotal.hours)})`),
  };
}

/** Names of non-"Others" tasks that have hours but no budget owner. */
export const findTasksMissingBudgetOwner = (
  projects: SubmissionProject[],
  weekDays: WeekDay[],
) =>
  projects.flatMap((project) =>
    isOthersProject(project)
      ? []
      : project.milestones.flatMap((milestone) =>
          milestone.assigned_tasks
            .filter(
              (task) =>
                !task.assign_by && weekDays.some((day) => entrySeconds(task, day.date) > 0),
            )
            .map((task) => task.name || `Assigned task ${task.assign_id}`),
        ),
  );

/** "first, second, third and N more" */
const summariseList = (items: string[]) => {
  const remaining = items.length - 3;
  return `${items.slice(0, 3).join(", ")}${remaining > 0 ? ` and ${remaining} more` : ""}`;
};

export const budgetOwnerMessage = (taskNames: string[], action: string) =>
  `Select Budget Owner before ${action}: ${summariseList(taskNames)}.`;

export const dailyLimitMessage = (exceededDays: string[], action: string) =>
  `Daily total cannot exceed 14 hours before ${action}: ${summariseList(exceededDays)}.`;

// ---------------------------------------------------------------------------
// Entries sent to the API
// ---------------------------------------------------------------------------

/**
 * Entries to save/submit: every day that has hours, plus any day that had an
 * entry before (so clearing a day to empty deletes it on the server).
 */
export const buildSubmitEntries = (
  projects: SubmissionProject[],
  weekDays: WeekDay[],
): TimesheetSubmitEntry[] =>
  projects.flatMap((project) =>
    project.milestones.flatMap((milestone) =>
      milestone.assigned_tasks.flatMap((task) =>
        weekDays
          .map((day) => ({
            entry: { assignId: task.assign_id, date: day.date, hours: entrySeconds(task, day.date) },
            hasEntry: Object.prototype.hasOwnProperty.call(task.entries, day.date),
          }))
          .filter((item) => item.hasEntry || item.entry.hours > 0)
          .map((item) => item.entry),
      ),
    ),
  );

// ---------------------------------------------------------------------------
// Immutable updates of the project → milestone → task tree
// ---------------------------------------------------------------------------

/** Apply `update` to one task, copying only the path that changes. */
export const updateTask = (
  projects: SubmissionProject[],
  ref: TaskRef,
  update: (task: AssignedTask) => AssignedTask,
): SubmissionProject[] =>
  projects.map((project) =>
    project.id !== ref.projectId
      ? project
      : {
          ...project,
          milestones: project.milestones.map((milestone) =>
            milestone.id !== ref.milestoneId
              ? milestone
              : {
                  ...milestone,
                  assigned_tasks: milestone.assigned_tasks.map((task) =>
                    task.assign_id === ref.taskId ? update(task) : task,
                  ),
                },
          ),
        },
  );

export const findTask = (projects: SubmissionProject[], ref: TaskRef) =>
  projects
    .find((project) => project.id === ref.projectId)
    ?.milestones.find((milestone) => milestone.id === ref.milestoneId)
    ?.assigned_tasks.find((task) => task.assign_id === ref.taskId);

/** Set one day's hours (empty input is stored as 0). */
export const setTaskEntry = (
  projects: SubmissionProject[],
  ref: TaskRef,
  date: string,
  value: string | number,
) =>
  updateTask(projects, ref, (task) => ({
    ...task,
    entries: { ...task.entries, [date]: value },
  }));

/** Whether storing `value` would change the task's entry for `date`. */
export const isEntryChange = (
  projects: SubmissionProject[],
  ref: TaskRef,
  date: string,
  value: string | number,
) => String(findTask(projects, ref)?.entries[date] ?? 0) !== String(value);

export const setTaskBudgetOwner = (
  projects: SubmissionProject[],
  ref: TaskRef,
  owner: string | null,
) => updateTask(projects, ref, (task) => ({ ...task, assign_by: owner }));

/** Fold the server's save-draft response (saved and deleted entries) back in. */
export const applySavedDraft = (
  projects: SubmissionProject[],
  response: SaveDraftResponse,
): SubmissionProject[] => {
  const saved = Array.isArray(response.entries) ? response.entries : [];
  const deleted = Array.isArray(response.deleted_entries) ? response.deleted_entries : [];
  return projects.map((project) => ({
    ...project,
    milestones: project.milestones.map((milestone) => ({
      ...milestone,
      assigned_tasks: milestone.assigned_tasks.map((task) => {
        const taskSaved = saved.filter((entry) => entry.assignId === task.assign_id);
        const taskDeleted = deleted.filter((entry) => entry.assignId === task.assign_id);
        if (!taskSaved.length && !taskDeleted.length) return task;

        const entries: TaskEntry = { ...task.entries };
        taskDeleted.forEach((entry) => {
          delete entries[entry.date];
        });
        taskSaved.forEach((entry) => {
          entries[entry.date] = entry.hours;
        });
        return { ...task, entries };
      }),
    })),
  }));
};
