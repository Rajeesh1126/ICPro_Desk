import {
  Box,
  Button,
  Chip,
  Skeleton,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { INSET_X, INSET_Y } from "../../../styles/tokens";
import { formatDateTime } from "../../../utils/dateRange";
import { describeHoursMinutes } from "../../../utils/hoursMinutes";
import type { WeeklyTimesheetLog } from "./timesheetMath";

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
}: SubmissionActionBarProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: { xs: "stretch", md: "center" },
        gap: 1.25,
        borderRadius: 1,
        flexWrap: "wrap",
        mt: 1.5,
        py: INSET_Y,
        px: INSET_X,
        borderTop: "1px solid",
        borderColor: hasUnsavedChanges
          ? theme.palette.warning.main
          : theme.palette.divider,
        backgroundColor: hasUnsavedChanges
          ? alpha(theme.palette.warning.main, isDark ? 0.14 : 0.08)
          : theme.palette.background.paper,
        boxShadow: hasUnsavedChanges
          ? `0 -6px 18px ${alpha(theme.palette.warning.main, isDark ? 0.12 : 0.14)}`
          : "none",
        transition: theme.transitions.create(
          ["background-color", "border-color", "box-shadow"],
          {
            duration: theme.transitions.duration.shorter,
          },
        ),
      }}
    >
      <Box sx={{ minWidth: { xs: "100%", md: 360 }, flex: 1 }}>
        <Typography
          sx={{
            display: "none",
            fontSize: 13,
            fontWeight: 700,
            color: targetMet
              ? theme.palette.success.main
              : theme.palette.warning.main,
          }}
        >
          Estimated: {describeHoursMinutes(estimatedWeekHours * 3600)} ·
          Entered: {describeHoursMinutes(weekTotal)}
        </Typography>
        <Typography
          variant="caption"
          color={hasUnsavedChanges ? "warning.main" : "text.secondary"}
          sx={{
            display: "block",
            mt: 0.25,
            lineHeight: 1.35,
            fontWeight: hasUnsavedChanges ? 800 : 400,
          }}
        >
          {hasUnsavedChanges ? (
            "Daily hours changed. Click Save Draft before closing or switching work."
          ) : lastSavedAt ? (
            `Draft saved at ${formatDateTime(lastSavedAt)}. Auto-save is not available.`
          ) : (
            <>
              <Box component="span" sx={{ fontWeight: 700 }}>
                Attention:
              </Box>{" "}
              Auto-save is currently unavailable. To prevent data loss, please
              ensure you save as a draft or submit your progress before exiting
              the page.
            </>
          )}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "space-between", sm: "flex-end" },
          gap: 1,
          width: { xs: "100%", md: "auto" },
          flexWrap: "wrap",
        }}
      >
        {!hasUnsavedChanges &&
          (weeklyStatusLoading ? (
            <Skeleton
              variant="rounded"
              width={150}
              height={24}
              sx={{ borderRadius: 5 }}
              aria-label="Loading week status"
            />
          ) : (
            <Chip
              label={`Status: ${weeklyStatus.timesheet_status || "Not Submitted"}`}
              color={isRejected ? "error" : isSubmitted ? "success" : "default"}
              variant="outlined"
              sx={{
                fontWeight: 700,
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            />
          ))}
        <Button
          variant="contained"
          startIcon={<SaveOutlinedIcon />}
          onClick={onSave}
          disabled={saveDisabled}
          sx={{
            bgcolor: hasUnsavedChanges ? "warning.main" : undefined,
            color: hasUnsavedChanges ? "warning.contrastText" : undefined,
            "&:hover": {
              bgcolor: hasUnsavedChanges ? "warning.dark" : undefined,
            },
          }}
        >
          {saving ? "Saving..." : "Save Draft"}
        </Button>
      </Box>
    </Box>
  );
}
