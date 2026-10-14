/**
 * Pure rules for the Time Sheet page header: what the selected week's status
 * allows, and why a submission would be refused. No React; unit-testable.
 */
import {
  budgetOwnerMessage,
  dailyLimitMessage,
  requiredDayHoursMessage,
  type BudgetOwnerValidation,
  type DailyHoursValidation,
  type WeeklyTimesheetLog,
} from "../submission/timesheetMath";

export const LOCKED_ACTION_MESSAGE =
  "This action is not available for the current time sheet status.";

/**
 * Week-level permissions. While the status is still loading nothing that
 * depends on it is offered.
 */
export function getTimesheetActionState(
  status: WeeklyTimesheetLog,
  loading: boolean,
) {
  const normalized = status.timesheet_status.toLowerCase();
  const isRejected = normalized === "rejected";
  const isSubmitted =
    !isRejected &&
    (normalized === "submitted" || Boolean(status.submission_status));
  const isAccepted = normalized === "accepted";
  const isUnlockRequested = normalized === "requested";
  const actionsDisabled =
    loading || isSubmitted || isAccepted || isUnlockRequested;
  return {
    actionsDisabled,
    previewSubmitDisabled: actionsDisabled,
    unlockRequestDisabled: actionsDisabled,
  };
}

export function getPreviewBlocker(daily: DailyHoursValidation): string | null {
  if (daily.exceededDays.length > 0)
    return dailyLimitMessage(daily.exceededDays, "previewing");
  if (daily.missingRequiredDays.length > 0) {
    return requiredDayHoursMessage(daily.missingRequiredDays, "previewing");
  }
  return null;
}

/** First reason the week cannot be submitted yet, or null when it can. */
export function getSubmitBlocker({
  daily,
  budgetOwner,
}: {
  daily: DailyHoursValidation;
  budgetOwner: BudgetOwnerValidation;
}): string | null {
  if (daily.exceededDays.length > 0)
    return dailyLimitMessage(daily.exceededDays, "submitting");
  if (daily.missingRequiredDays.length > 0) {
    return requiredDayHoursMessage(daily.missingRequiredDays, "submitting");
  }
  if (budgetOwner.missingCount > 0)
    return budgetOwnerMessage(budgetOwner.missingTaskNames, "submitting");
  return null;
}
