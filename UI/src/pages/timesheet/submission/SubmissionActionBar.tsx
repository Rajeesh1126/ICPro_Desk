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
      // sx={{
      //   display: "flex",
      //   justifyContent: "space-between",
      //   alignItems: { xs: "stretch", md: "center" },
      //   gap: 1.25,
      //   borderRadius: 1,
      //   flexWrap: "wrap",
      //   mt: 1.5,
      //   py: INSET_Y,
      //   px: INSET_X,
      //   border: "1px solid",
      //   borderColor: hasUnsavedChanges
      //     ? theme.palette.warning.main
      //     : theme.palette.divider,
      //   backgroundColor: hasUnsavedChanges
      //     ? alpha(theme.palette.warning.main, isDark ? 0.14 : 0.08)
      //     : theme.palette.background.paper,
      //   boxShadow: hasUnsavedChanges
      //     ? `0 -6px 18px ${alpha(theme.palette.warning.main, isDark ? 0.12 : 0.14)}`
      //     : "none",
      //   transition: theme.transitions.create(
      //     ["background-color", "border-color", "box-shadow"],
      //     {
      //       duration: theme.transitions.duration.shorter,
      //     },
      //   ),
      // }}
      sx={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: { xs: 'stretch', md: 'center' },
  gap: 1.25,
  borderRadius: 1,
  flexWrap: 'wrap',
  mt: 1.5,
  py: INSET_Y,
  px: INSET_X,
  border: '1px solid',
  
  // 1. Set stable default styling when there are NO unsaved changes
  borderColor: hasUnsavedChanges ? 'transparent' : theme.palette.divider,
  backgroundColor: hasUnsavedChanges ? 'transparent' : theme.palette.background.paper,
  boxShadow: 'none',

  // 2. Trigger the synced border blink + ambient glow animation
  animation: hasUnsavedChanges ? 'borderContainerBlink 1.5s infinite ease-in-out alternate' : 'none',

  '@keyframes borderContainerBlink': {
    '0%': {
      // "Dim / Off" phase: Border dims to an understated accent, minimal shadow
      borderColor: alpha(theme.palette.warning.main, isDark ? 0.3 : 0.4),
      backgroundColor: alpha(theme.palette.warning.main, isDark ? 0.05 : 0.03),
      boxShadow: `0 -4px 10px ${alpha(theme.palette.warning.main, isDark ? 0.04 : 0.05)}`,
    },
    '100%': {
      // "Bright / On" phase: Border gets vivid, background deepens, ambient glow pushes up
      borderColor: theme.palette.warning.main,
      backgroundColor: alpha(theme.palette.warning.main, isDark ? 0.16 : 0.1),
      boxShadow: `0 -8px 24px ${alpha(theme.palette.warning.main, isDark ? 0.16 : 0.18)}`,
    },
  },

  // 3. Keep your original transition configurations intact for turning the state on/off
  transition: theme.transitions.create(
    ['background-color', 'border-color', 'box-shadow'],
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
            fontWeight: hasUnsavedChanges ? 800 : undefined,
            // Only call attention to an actionable save; the animation stops
            // while saving or when the button is otherwise unavailable.
            animation:
              hasUnsavedChanges && !saveDisabled
                ? "save-draft-attention 700ms ease-in-out infinite"
                : "none",
            "@keyframes save-draft-attention": {
              "0%, 100%": {
                boxShadow: `0 0 0 1px ${alpha(theme.palette.warning.main, 0.35)}`,
                transform: "scale(1)",
              },
              "50%": {
                boxShadow: `0 0 16px 4px ${alpha(theme.palette.warning.main, 0.8)}`,
                transform: "scale(1.035)",
              },
            },
            "@media (prefers-reduced-motion: reduce)": {
              animation: "none",
              boxShadow: hasUnsavedChanges
                ? `0 0 0 2px ${theme.palette.warning.main}`
                : "none",
            },
            "&:hover": {
              bgcolor: hasUnsavedChanges ? "warning.dark" : undefined,
            },
          }}
//           sx={{
//   bgcolor: hasUnsavedChanges ? 'warning.main' : 'primary.main', 
//   fontWeight: 'bold',
//   position: 'relative',
  
//   // 1. Adjusted to 1.2s for a snappier, more urgent blink rhythm
//   animation: hasUnsavedChanges ? 'blinkGlow 1.2s infinite ease-in-out alternate' : 'none',
  
//   '@keyframes blinkGlow': {
//     '0%': {
//       // Dips down to look "dimmed / off"
//       boxShadow: (theme) => `0 0 4px ${theme.palette.warning.main}33`, // faint glow
//       opacity: 0.75,
//       filter: 'brightness(0.9)',
//     },
//     '50%': {
//       // Midpoint ramp up
//       opacity: 0.9,
//     },
//     '100%': {
//       // Explodes into full "bright / on" blink state
//       boxShadow: (theme) => `0 0 25px ${theme.palette.warning.main}, 0 0 40px ${theme.palette.warning.light}88`,
//       opacity: 1,
//       filter: 'brightness(1.2)',
//     },
//   },
  
//   '&:hover': {
//     bgcolor: hasUnsavedChanges ? 'warning.dark' : 'primary.dark',
//     opacity: 1,
//     filter: 'brightness(1.1)',
//     // Lock it into a high-intensity static glow on hover
//     boxShadow: (theme) => hasUnsavedChanges 
//       ? `0 0 25px ${theme.palette.warning.main}, 0 0 45px ${theme.palette.warning.light}`
//       : 'none',
//     animation: 'none', 
//   },
// }}
        >
          {saving ? "Saving..." : "Save Draft"}
        </Button>
      </Box>
    </Box>
  );
}
