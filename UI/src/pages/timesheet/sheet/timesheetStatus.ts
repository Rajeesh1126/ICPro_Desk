/**
 * Pure rules for the Time Sheet page header: what the selected week's status
 * allows, and why a submission would be refused. No React; unit-testable.
 */
import { describeHoursMinutes } from "../../../utils/hoursMinutes";
import {
  budgetOwnerMessage,
  dailyLimitMessage,
  type BudgetOwnerValidation,
  type DailyHoursValidation,
  type WeeklyHoursValidation,
  type WeeklyTimesheetLog,
} from "../submission/timesheetMath";

export const LOCKED_ACTION_MESSAGE =
  "This action is not available for the current time sheet status.";

/**
 * Week-level permissions. While the status is still loading nothing that
 * depends on it is offered.
 */
export function getTimesheetActionState(status: WeeklyTimesheetLog, loading: boolean) {
  const normalized = status.timesheet_status.toLowerCase();
  const isRejected = normalized === "rejected";
  const isSubmitted =
    !isRejected && (normalized === "submitted" || Boolean(status.submission_status));
  const isAccepted = normalized === "accepted";
  const isUnlockRequested = normalized === "requested";
  const actionsDisabled = loading || isSubmitted || isAccepted || isUnlockRequested;
  return {
    actionsDisabled,
    previewSubmitDisabled: actionsDisabled,
    unlockRequestDisabled: actionsDisabled,
  };
}

export const weeklyTargetMessage = (validation: WeeklyHoursValidation) =>
  `Entered hours must be at least estimated hours before submitting. Estimated: ${describeHoursMinutes(
    validation.estimatedHours * 3600,
  )}, entered: ${describeHoursMinutes(validation.actualHours * 3600)}.`;

/** First reason the week cannot be submitted yet, or null when it can. */
export function getSubmitBlocker({
  daily,
  weekly,
  budgetOwner,
}: {
  daily: DailyHoursValidation;
  weekly: WeeklyHoursValidation;
  budgetOwner: BudgetOwnerValidation;
}): string | null {
  if (daily.exceededDays.length > 0) return dailyLimitMessage(daily.exceededDays, "submitting");
  if (!weekly.isSatisfied) return weeklyTargetMessage(weekly);
  if (budgetOwner.missingCount > 0) return budgetOwnerMessage(budgetOwner.missingTaskNames, "submitting");
  return null;
}
