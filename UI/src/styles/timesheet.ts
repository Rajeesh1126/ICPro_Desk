/**
 * Timesheet week grid (pages/timesheet/submission/SubmissionGrid.tsx).
 *
 * The grid is the one table whose geometry is page-specific: fixed day
 * columns, a job column pinned left and Total / Select pinned right, plus
 * nested milestone and task tables that must line up with the outer grid.
 * Header typography and the single header hairline still come from the theme.
 */
import { alpha, type Theme } from "@mui/material/styles";
import type { SxProps } from "@mui/material";
import {
  stickyFirstColumnCell,
  stickyFirstColumnHeaderCell,
  stickyTableCellSx,
  tableContainerSx,
  tableHeaderCellSx,
  tableWithMinWidthSx,
} from "@/styles/common";
import { RADIUS_PX } from "@/styles/tokens";

export const timesheetColumnWidths = {
  job: { xs: 200, sm: 300 },
  budgetOwner: 160,
  day: 100,
  total: 90,
  select: 70,
};

/**
 * Same minimum width for the outer grid and each job's nested table, so
 * columns line up. It matches the columns' total (job 300 + owner 160 +
 * 7 × 100 + total 90 + select 70) so no extra width pushes Sunday / Total
 * off-screen.
 */
export const timesheetGridMinWidth = { xs: 1180, md: 1320 };

const widths = timesheetColumnWidths;

export const timesheetCellSx = (theme: Theme, width: number | object) => ({
  ...stickyTableCellSx(theme),
  width,
  minWidth: width,
});

/** Total / Select stay pinned on the right; one hairline marks the edge. */
export const timesheetStickyRightSx = (theme: Theme, right: number, zIndex = 2) => ({
  position: "sticky" as const,
  right,
  zIndex,
  backgroundColor: theme.palette.background.paper,
  boxShadow: `-1px 0 0 ${theme.palette.divider}`,
});

const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** Non-working days get a quiet fill; today's column a light primary tint. */
export const timesheetDayToneSx = (
  theme: Theme,
  date: string,
  estimatedWeekHours: number,
) => {
  const weekday = new Date(`${date}T12:00:00`).getDay();
  const isToday = date === localDateKey(new Date());
  const isNonWorkingDay =
    weekday === 0 || (estimatedWeekHours === 45 && weekday === 6);
  return {
    ...(isNonWorkingDay
      ? { 
        bgcolor: alpha(
      theme.palette.action.hover,
      theme.palette.mode === "dark" ? 0.05 : 0.04,
    ),
    // backgroundColor: `${theme.palette.action.hover} !important` 
  }
      : {}),
    ...(isToday
      ? {
          // Keep today's column visible when the shared table-row hover style
          // applies a background directly to every body cell.
          backgroundColor: `${alpha(theme.palette.primary.main, 0.14)} !important`,
        }
      : {}),
  };
};

/* ---- Header ---------------------------------------------------------- */

export const timesheetJobHeaderCellSx = (theme: Theme) => ({
  ...stickyFirstColumnHeaderCell(theme),
  width: widths.job,
  minWidth: widths.job,
});

export const timesheetOwnerHeaderCellSx = (theme: Theme) => ({
  ...tableHeaderCellSx(theme),
  width: widths.budgetOwner,
  minWidth: widths.budgetOwner,
});

/** Hour columns are centred in every row, header included. */
export const timesheetDayHeaderCellSx = (
  theme: Theme,
  date: string,
  estimatedWeekHours: number,
) => ({
  ...tableHeaderCellSx(theme),
  textAlign: "center" as const,
  width: widths.day,
  minWidth: widths.day,
  ...timesheetDayToneSx(theme, date, estimatedWeekHours),
});

export const timesheetTotalHeaderCellSx = (theme: Theme) => ({
  ...tableHeaderCellSx(theme),
  textAlign: "center" as const,
  width: widths.total,
  minWidth: widths.total,
  ...timesheetStickyRightSx(theme, widths.select, 3),
});

export const timesheetSelectHeaderCellSx = (theme: Theme) => ({
  ...tableHeaderCellSx(theme),
  width: widths.select,
  minWidth: widths.select,
  ...timesheetStickyRightSx(theme, 0, 4),
});

/* ---- Footer (week totals) -------------------------------------------- */

export const timesheetFooterCellSx = (
  theme: Theme,
  width: number | object,
  bold = true,
) => ({
  ...timesheetCellSx(theme, width),
  ...(bold && { fontWeight: 600 }),
  bgcolor: "background.default",
  borderTop: `1px solid ${theme.palette.divider}`,
  // Sticky table sections are unreliable and force a costly table reflow
  // while nested rows expand. Pin the individual cells instead.
  position: "sticky" as const,
  bottom: 0,
  zIndex: 4,
});

export const timesheetJobFooterCellSx = (theme: Theme) => ({
  ...stickyFirstColumnCell(theme),
  width: widths.job,
  minWidth: widths.job,
  fontWeight: 600,
  bgcolor: "background.default",
  borderTop: `1px solid ${theme.palette.divider}`,
  bottom: 0,
  // This cell is sticky on both axes, so it must layer above the remaining
  // footer cells and the pinned body column.
  zIndex: 5,
});

export const timesheetDayFooterCellSx = (
  theme: Theme,
  date: string,
  estimatedWeekHours: number,
) => ({
  ...timesheetFooterCellSx(theme, widths.day),
  ...timesheetDayToneSx(theme, date, estimatedWeekHours),
});

export const timesheetTotalFooterCellSx = (theme: Theme) => ({
  ...timesheetFooterCellSx(theme, widths.total),
  ...timesheetStickyRightSx(theme, widths.select, 5),
});

export const timesheetSelectFooterCellSx = (theme: Theme) => ({
  ...timesheetFooterCellSx(theme, widths.select, false),
  ...timesheetStickyRightSx(theme, 0, 6),
});

/* ---- Body rows ------------------------------------------------------- */

export const timesheetJobCellSx = (theme: Theme, bold = false) => ({
  ...stickyFirstColumnCell(theme),
  width: widths.job,
  minWidth: widths.job,
  ...(bold && { fontWeight: 600 }),
});

export const timesheetOwnerCellSx = (theme: Theme) => ({
  ...timesheetCellSx(theme, widths.budgetOwner),
  p: 0.5,
});

export const timesheetDayCellSx = (
  theme: Theme,
  date: string,
  estimatedWeekHours: number,
) => ({
  ...timesheetCellSx(theme, widths.day),
  ...timesheetDayToneSx(theme, date, estimatedWeekHours),
});

/** A task's day cell holds an hours field, so it is tighter. */
export const timesheetDayInputCellSx = (
  theme: Theme,
  date: string,
  estimatedWeekHours: number,
) => ({
  width: widths.day,
  minWidth: widths.day,
  p: 0.5,
  ...timesheetDayToneSx(theme, date, estimatedWeekHours),
});

export const timesheetTotalCellSx = (theme: Theme) => ({
  ...timesheetCellSx(theme, widths.total),
  ...timesheetStickyRightSx(theme, widths.select),
  fontWeight: 600,
});

export const timesheetSelectCellSx = (theme: Theme) => ({
  ...timesheetCellSx(theme, widths.select),
  ...timesheetStickyRightSx(theme, 0),
});

export const timesheetTaskSelectCellSx = (theme: Theme) => ({
  ...timesheetStickyRightSx(theme, 0),
  width: widths.select,
  minWidth: widths.select,
});

/** Hours field: centred value; disabled days read clearly as unavailable. */
export const timesheetHoursInputSx = (theme: Theme) => ({
  width: 90,
  "& .MuiOutlinedInput-root.Mui-disabled": {
    bgcolor: theme.palette.action.disabledBackground,
    cursor: "not-allowed",
  },
  "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.action.disabled,
  },
  "& input": { textAlign: "center", py: 0.8 },
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: theme.palette.text.disabled,
    cursor: "not-allowed",
  },
});

export const timesheetSmallTextSx = { fontSize: "0.8125rem" } satisfies SxProps<Theme>;

export const timesheetTaskNameSx = { fontSize: "0.875rem", pl: 10 } satisfies SxProps<Theme>;

export const timesheetMilestoneNameSx = {
  display: "flex",
  alignItems: "center",
  pl: 5,
} satisfies SxProps<Theme>;

export const timesheetProjectNameRowSx = {
  display: "flex",
  alignItems: "center",
} satisfies SxProps<Theme>;

export const timesheetProjectTitleSx = {
  fontSize: "0.875rem",
  fontWeight: 600,
} satisfies SxProps<Theme>;

export const timesheetProjectCodeSx = {
  fontSize: "0.75rem",
  color: "text.secondary",
} satisfies SxProps<Theme>;

/** Select-all checkbox: hidden for "Others" jobs or jobs with nothing to pick. */
export const timesheetSelectAllSx = (visible: boolean) => ({
  display: visible ? "inline-flex" : "none",
});

/** Rolled-up hours in a collapsed row; empty days show a muted dash. */
export const timesheetDayHoursSx = {
  fontWeight: 600,
  color: "text.primary",
  fontVariantNumeric: "tabular-nums",
} satisfies SxProps<Theme>;

export const timesheetDayHoursEmptySx = { color: "text.disabled" } satisfies SxProps<Theme>;

/* ---- Grid frame ------------------------------------------------------ */

/** p: 0 keeps the nested table's columns aligned with the grid's. */
export const timesheetNestedRowCellSx = { p: 0, borderBottom: 0 } satisfies SxProps<Theme>;

export const timesheetNestedTableSx = {
  ...tableWithMinWidthSx(timesheetGridMinWidth),
  "& .timesheet-jobs-cell": { padding: "4px 0px" },
};

export const timesheetGridTableSx = {
  ...tableWithMinWidthSx(timesheetGridMinWidth),
  "& .timesheet-jobs-cell": { padding: "4px 8px" },
};

export const timesheetGridContainerSx = (theme: Theme) => ({
  ...tableContainerSx,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: RADIUS_PX.md,
});

export const timesheetHintSx = {
  display: { xs: "none", sm: "block" },
  px: 1,
  pb: 0.75,
} satisfies SxProps<Theme>;

export const timesheetHintScrollSx = {
  display: { sm: "inline", lg: "none" },
} satisfies SxProps<Theme>;

export const timesheetEmptyCellSx = { py: 4, borderBottom: 0 } satisfies SxProps<Theme>;

export const timesheetEmptyStateSx = {
  display: "grid",
  placeItems: "center",
} satisfies SxProps<Theme>;
