import {
  Box,
  Button,
  Chip,
  Skeleton,
  Typography,
} from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import {
  ellipsisChipSx,
  pillSkeletonSx,
  timesheetFooterActionsSx,
  timesheetFooterBarSx,
  timesheetFooterNoteSx,
  timesheetFooterStatusSx,
  timesheetFooterTargetSx,
  timesheetSaveDraftButtonSx,
} from "@/styles/common";
import { formatDateTime } from "@/utils/dateRange";
import { describeHoursMinutes } from "@/utils/hoursMinutes";
import type { WeeklyTimesheetLog } from "@/pages/timesheet/submission/timesheetMath";

interface SubmissionActionBarProps {
  estimatedWeekHours: number;
  /** Seconds entered this week. */
  weekTotal: number;
  targetMet: boolean;
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
  weeklyStatus: WeeklyTimesheetLog;
  weeklyStatusLoading: boolean;
  isRejected: boolean;
  isSubmitted: boolean;
  saveDisabled: boolean;
  saving: boolean;
  onSave: () => void;
  /** Opens Preview / Submit (same action as the header Actions menu). */
  onSubmit?: () => void;
  /** Shows Submit only after every mandatory working day has valid hours. */
  showSubmit: boolean;
  submitDisabled?: boolean;
}

/**
 * Bottom bar of the Time Sheet: weekly target vs. entered hours, draft state,
 * week status and Save Draft. Turns amber while hours are unsaved.
 */
export default function SubmissionActionBar({
  estimatedWeekHours,
  weekTotal,
  targetMet,
  hasUnsavedChanges,
  lastSavedAt,
  weeklyStatus,
  weeklyStatusLoading,
  isRejected,
  isSubmitted,
  saveDisabled,
  saving,
  onSave,
  onSubmit,
  showSubmit,
  submitDisabled = false,
}: SubmissionActionBarProps) {
  return (
    <Box sx={timesheetFooterBarSx(hasUnsavedChanges)}>
      <Box sx={timesheetFooterStatusSx}>
        <Typography sx={timesheetFooterTargetSx(targetMet)}>
          Estimated: {describeHoursMinutes(estimatedWeekHours * 3600)} ·
          Entered: {describeHoursMinutes(weekTotal)}
        </Typography>
        <Typography
          variant="caption"
          aria-live="polite"
          aria-atomic="true"
          color={hasUnsavedChanges ? "warning.main" : "text.secondary"}
          sx={timesheetFooterNoteSx(hasUnsavedChanges)}
        >
          {hasUnsavedChanges
            ? "Unsaved hours. Click Save Draft before leaving this page."
            : lastSavedAt
              ? `Draft saved at ${formatDateTime(lastSavedAt)}.`
              : "No draft saved yet. Save draft to keep these entries."}
        </Typography>
      </Box>

      <Box sx={timesheetFooterActionsSx}>
        {!hasUnsavedChanges &&
          (weeklyStatusLoading ? (
            <Skeleton
              variant="rounded"
              width={150}
              height={24}
              sx={pillSkeletonSx}
              aria-label="Loading week status"
            />
          ) : (
            <Chip
              label={`Status: ${weeklyStatus.timesheet_status || "Not Submitted"}`}
              color={isRejected ? "error" : isSubmitted ? "success" : "default"}
              variant="outlined"
              sx={ellipsisChipSx}
            />
          ))}
        <Button
          variant={hasUnsavedChanges ? "contained" : "outlined"}
          startIcon={<SaveOutlinedIcon />}
          onClick={onSave}
          disabled={saveDisabled}
          sx={timesheetSaveDraftButtonSx(hasUnsavedChanges)}
        >
          {saving ? "Saving..." : "Save Draft"}
        </Button>
        {showSubmit && onSubmit && (
          <Button
            variant="contained"
            startIcon={<SendOutlinedIcon />}
            onClick={onSubmit}
            disabled={submitDisabled}
          >
            Submit
          </Button>
        )}
      </Box>
    </Box>
  );
}
