import { Box, DialogTitle, IconButton, Typography } from "@mui/material";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { insetSx, RADIUS_PX, FONT } from "@/styles/tokens";
import type { ApprovalRow } from "@/types/dataTypes";
import {
  iconMediumSx,
  noShrinkSx,
} from "@/styles/common";
import Pill from "@/components/common/Pill";
import { statusColor, statusLabel } from "@/components/common/pillValues";
import { formatDateRange } from "@/utils/dateRange";

/** The review dialog's name: not the whole header. */
export const REVIEW_DIALOG_LABEL = "review-dialog-eyebrow review-dialog-name";

/** One line: eyebrow, employee name and week, overall status pill and close. */
export function ApprovalDetailHeader({
  employee,
  weekStart,
  onClose,
  onPrevious,
  onNext,
}: {
  employee: ApprovalRow;
  /** Monday of the reviewed week (YYYY-MM-DD). */
  weekStart: string;
  onClose: () => void;
  /** Move through the team without closing; omitted at the list's ends. */
  onPrevious?: () => void;
  onNext?: () => void;
}) {
  const weekEnd = (() => {
    const end = new Date(`${weekStart}T00:00:00`);
    end.setDate(end.getDate() + 6);
    return end;
  })();
  return (
    // Padding and surface come from the theme's MuiDialogTitle.
    <DialogTitle component="div" id="review-dialog-header" sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.5 }}>
      {/* One line: eyebrow, name, week. Wraps on phones only. */}
      <Box
        minWidth={0}
        sx={{
          display: "flex",
          alignItems: "baseline",
          flexWrap: { xs: "wrap", sm: "nowrap" },
          columnGap: 1,
        }}
      >
        <Typography
          sx={(theme) => ({
            fontSize: FONT.xs,
            fontWeight: 500,
            color: theme.palette.text.secondary,
            whiteSpace: "nowrap",
          })}
        >
          <span id="review-dialog-eyebrow">Timesheet review</span>
        </Typography>
        {/* Same heading level as the shared DialogHeader. */}
        <Typography
          id="review-dialog-name"
          component="h2"
          noWrap
          sx={(theme) => ({
            fontSize: FONT.md,
            fontWeight: 600,
            lineHeight: 1.25,
            minWidth: 0,
            color: theme.palette.text.primary,
          })}
        >
          {employee.name}
        </Typography>
        <Typography sx={(theme) => ({ fontSize: FONT.xs, color: theme.palette.text.secondary, whiteSpace: "nowrap" })}>
          {formatDateRange(weekStart, weekEnd)}
        </Typography>
      </Box>

      {/* The week's overall status, as the same pill the list shows. */}
      <Pill
        value={statusLabel(employee.overview)}
        color={statusColor(employee.overview)}
        dot
        sx={{ ml: "auto", mr: { xs: 0, sm: 1 }, flexShrink: 0 }}
      />

      <IconButton aria-label="Previous employee" disabled={!onPrevious} onClick={onPrevious}>
        <ChevronLeftOutlinedIcon sx={iconMediumSx} />
      </IconButton>
      <IconButton aria-label="Next employee" disabled={!onNext} onClick={onNext}>
        <ChevronRightOutlinedIcon sx={iconMediumSx} />
      </IconButton>

      <IconButton
        aria-label="Close dialog"
        onClick={onClose}
        sx={(theme) => ({
          color: theme.palette.text.secondary,
          "&:hover": { backgroundColor: theme.palette.action.hover, color: theme.palette.text.primary },
        })}
      >
        <CloseOutlinedIcon sx={iconMediumSx} />
      </IconButton>
    </DialogTitle>
  );
}

/** The employee's submission comments (read-only). */
export function ApprovalComments({ comments }: { comments: string }) {
  if (!comments.trim()) return null;
  return (
    <Box sx={noShrinkSx}>
      <Typography sx={(theme) => ({ fontSize: FONT.xs, fontWeight: 500, color: theme.palette.text.secondary, mb: 0.5 })}>
        Comments
      </Typography>
      <Box
        component="textarea"
        value={comments}
        readOnly
        disabled
        aria-label="Submission comments"
        sx={(theme) => ({
          width: "100%",
          minHeight: 36,
          resize: "vertical",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: RADIUS_PX.md,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          outline: "none",
          ...insetSx,
          fontFamily: "inherit",
          fontSize: FONT.xs,
          boxSizing: "border-box",
        })}
      />
    </Box>
  );
}
