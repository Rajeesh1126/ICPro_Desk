import { neutralColor } from "@/components/common/pillValues";
import Pill from "@/components/common/Pill";
import { FONT } from "@/styles/tokens";
import {
  Box,
  Button,
  Skeleton,
  Typography,
} from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { alpha, useTheme } from "@mui/material/styles";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MotionBox, RollingValue } from "@/animations/MotionPrimitives";
import { EASE_OUT } from "@/animations/presets";
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
  /** Save Draft is offered only while the week is Not Submitted, Rejected or Unlocked. */
  canSaveDraft: boolean;
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
  canSaveDraft,
  saving,
  onSave,
  onSubmit,
  showSubmit,
  submitDisabled = false,
}: SubmissionActionBarProps) {
  const theme = useTheme();
  const glow = alpha(theme.palette.warning.main, 0.35);
  const noGlow = alpha(theme.palette.warning.main, 0);
  // A save from before this bar mounted is old news; only flash new saves.
  const [mountedSaveTime] = useState<number | undefined>(() => lastSavedAt?.getTime());
  const savedTime = lastSavedAt?.getTime();
  const status = weeklyStatus.timesheet_status || "Not Submitted";
  const note = !canSaveDraft && !weeklyStatusLoading
    ? `This week is ${status.toLowerCase()}; drafts can't be saved.`
    : hasUnsavedChanges
      ? "Unsaved hours. Click Save Draft before leaving this page."
      : lastSavedAt
        ? `Draft saved at ${formatDateTime(lastSavedAt)}.`
        : "No draft saved yet. Save draft to keep these entries.";
  return (
    <MotionBox
      sx={timesheetFooterBarSx(hasUnsavedChanges)}
      // One soft warning glow when edits first become unsaved.
      animate={
        hasUnsavedChanges
          ? { boxShadow: [`0 0 0 0 ${noGlow}`, `0 0 0 4px ${glow}`, `0 0 0 0 ${noGlow}`] }
          : { boxShadow: `0 0 0 0 ${noGlow}` }
      }
      transition={{ duration: 0.9, ease: "easeOut" }}
    >
      <Box sx={timesheetFooterStatusSx}>
        <Typography sx={timesheetFooterTargetSx(targetMet)}>
          Estimated: {describeHoursMinutes(estimatedWeekHours * 3600)} ·
          Entered: <RollingValue value={weekTotal}>{describeHoursMinutes(weekTotal)}</RollingValue>
        </Typography>
        <Typography
          variant="caption"
          aria-live="polite"
          aria-atomic="true"
          color={hasUnsavedChanges ? "warning.main" : "text.secondary"}
          sx={timesheetFooterNoteSx(hasUnsavedChanges)}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={note}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
              style={{ display: "inline-block" }}
            >
              {note}
            </motion.span>
          </AnimatePresence>
        </Typography>
      </Box>

      <Box sx={timesheetFooterActionsSx}>
        {/* A tick pops in after each new save, then fades away. */}
        {savedTime !== undefined && savedTime !== mountedSaveTime && !hasUnsavedChanges && (
          <motion.span
            key={savedTime}
            role="presentation"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.15, 1, 1] }}
            transition={{ duration: 2, times: [0, 0.15, 0.75, 1] }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              color: theme.palette.success.main,
              fontSize: FONT.sm,
              fontWeight: 600,
            }}
          >
            <CheckCircleRoundedIcon fontSize="small" /> Saved
          </motion.span>
        )}
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
            <Pill
              value={`Status: ${weeklyStatus.timesheet_status || "Not submitted"}`}
              color={isRejected ? "error" : isSubmitted ? "success" : neutralColor}
              dot
              sx={ellipsisChipSx}
            />
          ))}
        {canSaveDraft && (
          <Button
            variant={hasUnsavedChanges ? "contained" : "outlined"}
            startIcon={<SaveOutlinedIcon />}
            onClick={onSave}
            disabled={saveDisabled}
            sx={timesheetSaveDraftButtonSx(hasUnsavedChanges)}
          >
            {saving ? "Saving..." : "Save Draft"}
          </Button>
        )}
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
    </MotionBox>
  );
}
