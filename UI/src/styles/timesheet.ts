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
import { ELEVATION, RADIUS_PX, FONT } from "@/styles/tokens";

/** timesheet Column Widths declaration used across the frontend. */
export const timesheetColumnWidths = {
  job: 184,
  budgetOwner: 116,
  day: 62,
  total: 72,
  select: 38,
};

/**
 * Same minimum width for the outer grid and each job's nested table, so
 * columns line up. It matches the columns' total (job 184 + owner 116 +
 * 7 × 62 + total 72 + select 56 = 862), so the whole week fits from a
 * 1200px screen with the sidebar open; below 1200px the page uses the
 * day-by-day editor instead (Submission.tsx).
 */
export const timesheetGridMinWidth = { xs: 862, md: 862 };

const widths = timesheetColumnWidths;

/** timesheet Cell Sx declaration used across the frontend. */
export const timesheetCellSx = (theme: Theme, width: number | object) => ({
  ...stickyTableCellSx(theme),
  width,
  minWidth: width,
});

/**
 * Total / Select stay pinned on the right. A hairline plus a soft shadow
 * marks the edge, so day columns scrolled underneath are visibly covered.
 */
export const timesheetStickyRightSx = (theme: Theme, right: number, zIndex = 2) => ({
  position: "sticky" as const,
  right,
  zIndex,
  backgroundColor: theme.palette.background.paper,
  boxShadow: `-1px 0 0 ${theme.palette.divider}, ${ELEVATION[theme.palette.mode].stickyEdge}`,
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

/**
 * The same day tone for sticky header / footer cells. Rows scroll beneath
 * them, so the solid fill stays and the tint is painted as a layer on top.
 */
const timesheetPinnedDayToneSx = (
  theme: Theme,
  date: string,
  estimatedWeekHours: number,
  under?: string,
): Record<string, string> => {
  const tone = timesheetDayToneSx(theme, date, estimatedWeekHours);
  const color = String(tone.backgroundColor ?? tone.bgcolor ?? "").replace(" !important", "");
  if (!color) return {};
  const layer = `linear-gradient(${color}, ${color})`;
  // `under` keeps a surface's own layer (the header shade) beneath the tone.
  return { backgroundImage: under ? `${layer}, ${under} !important` : layer };
};

/* ---- Header ---------------------------------------------------------- */

/** timesheet Job Header Cell Sx declaration used across the frontend. */
export const timesheetJobHeaderCellSx = (theme: Theme) => ({
  ...stickyFirstColumnHeaderCell(theme),
  width: widths.job,
  minWidth: widths.job,
});

/** timesheet Owner Header Cell Sx declaration used across the frontend. */
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
  // Primary text: the tinted day column would drop secondary text below AA.
  color: theme.palette.text.primary,
  ...timesheetPinnedDayToneSx(
    theme,
    date,
    estimatedWeekHours,
    tableHeaderCellSx(theme).backgroundImage,
  ),
});

/** timesheet Total Header Cell Sx declaration used across the frontend. */
export const timesheetTotalHeaderCellSx = (theme: Theme) => ({
  ...tableHeaderCellSx(theme),
  textAlign: "center" as const,
  width: widths.total,
  minWidth: widths.total,
  ...timesheetStickyRightSx(theme, widths.select, 3),
});

/** timesheet Select Header Cell Sx declaration used across the frontend. */
export const timesheetSelectHeaderCellSx = (theme: Theme) => ({
  ...tableHeaderCellSx(theme),
  width: widths.select,
  minWidth: widths.select,
  ...timesheetStickyRightSx(theme, 0, 4),
});

/* ---- Footer (week totals) -------------------------------------------- */

/** timesheet Footer Cell Sx declaration used across the frontend. */
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

/** timesheet Job Footer Cell Sx declaration used across the frontend. */
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

/** timesheet Day Footer Cell Sx declaration used across the frontend. */
export const timesheetDayFooterCellSx = (
  theme: Theme,
  date: string,
  estimatedWeekHours: number,
) => ({
  ...timesheetFooterCellSx(theme, widths.day),
  ...timesheetPinnedDayToneSx(theme, date, estimatedWeekHours),
});

/** timesheet Total Footer Cell Sx declaration used across the frontend. */
export const timesheetTotalFooterCellSx = (theme: Theme) => ({
  ...timesheetFooterCellSx(theme, widths.total),
  ...timesheetStickyRightSx(theme, widths.select, 5),
});

/** timesheet Select Footer Cell Sx declaration used across the frontend. */
export const timesheetSelectFooterCellSx = (theme: Theme) => ({
  ...timesheetFooterCellSx(theme, widths.select, false),
  ...timesheetStickyRightSx(theme, 0, 6),
});

/* ---- Body rows ------------------------------------------------------- */

/** timesheet Job Cell Sx declaration used across the frontend. */
export const timesheetJobCellSx = (theme: Theme, bold = false) => ({
  ...stickyFirstColumnCell(theme),
  width: widths.job,
  minWidth: widths.job,
  ...(bold && { fontWeight: 600 }),
});

/** timesheet Owner Cell Sx declaration used across the frontend. */
export const timesheetOwnerCellSx = (theme: Theme) => ({
  ...timesheetCellSx(theme, widths.budgetOwner),
  p: 0.5,
});

/** timesheet Day Cell Sx declaration used across the frontend. */
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

/** timesheet Total Cell Sx declaration used across the frontend. */
export const timesheetTotalCellSx = (theme: Theme) => ({
  ...timesheetCellSx(theme, widths.total),
  ...timesheetStickyRightSx(theme, widths.select),
  fontWeight: 600,
});

/** timesheet Select Cell Sx declaration used across the frontend. */
export const timesheetSelectCellSx = (theme: Theme) => ({
  ...timesheetCellSx(theme, widths.select),
  ...timesheetStickyRightSx(theme, 0),
});

/** timesheet Task Select Cell Sx declaration used across the frontend. */
export const timesheetTaskSelectCellSx = (theme: Theme) => ({
  ...timesheetStickyRightSx(theme, 0),
  width: widths.select,
  minWidth: widths.select,
});

/**
 * Hours field: fills its day cell (a fixed width overflowed into the next
 * day) and has no fill of its own, so the day column's tint (today, weekend)
 * shows through evenly. Locked days use a dashed outline and muted text.
 */
export const timesheetHoursInputSx = (theme: Theme) => ({
  width: "100%",
  minWidth: 0,
  "& .MuiOutlinedInput-root": { bgcolor: "transparent" },
  "& .MuiOutlinedInput-root.Mui-disabled": {
    bgcolor: "transparent",
    cursor: "not-allowed",
  },
  "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.action.disabled,
    borderStyle: "dashed",
  },
  // No side padding: the centred value has the whole (narrow) cell.
  "& input": { textAlign: "center", py: 1, px: 0 },
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: theme.palette.text.disabled,
    cursor: "not-allowed",
  },
});

/** timesheet Small Text Sx declaration used across the frontend. */
export const timesheetSmallTextSx = { fontSize: FONT.sm } satisfies SxProps<Theme>;

/** timesheet Task Name Sx declaration used across the frontend. */
export const timesheetTaskNameSx = { fontSize: FONT.sm, pl: 7 } satisfies SxProps<Theme>;

/** timesheet Milestone Name Sx declaration used across the frontend. */
export const timesheetMilestoneNameSx = {
  display: "flex",
  alignItems: "center",
  pl: 3,
} satisfies SxProps<Theme>;

/** timesheet Project Name Row Sx declaration used across the frontend. */
export const timesheetProjectNameRowSx = {
  display: "flex",
  alignItems: "center",
} satisfies SxProps<Theme>;

/** timesheet Project Title Sx declaration used across the frontend. */
export const timesheetProjectTitleSx = {
  fontSize: FONT.sm,
  fontWeight: 600,
} satisfies SxProps<Theme>;

/** timesheet Project Code Sx declaration used across the frontend. */
export const timesheetProjectCodeSx = {
  fontSize: FONT.xs,
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

/** timesheet Day Hours Empty Sx declaration used across the frontend. */
// Secondary, not disabled: the dash must stay readable on the tinted today column.
export const timesheetDayHoursEmptySx = { color: "text.secondary" } satisfies SxProps<Theme>;

/* ---- Grid frame ------------------------------------------------------ */

/** p: 0 keeps the nested table's columns aligned with the grid's. */
export const timesheetNestedRowCellSx = { p: 0, borderBottom: 0 } satisfies SxProps<Theme>;

/** timesheet Nested Table Sx declaration used across the frontend. */
export const timesheetNestedTableSx = {
  ...tableWithMinWidthSx(timesheetGridMinWidth),
  "& .timesheet-jobs-cell": { padding: "8px 0px" },
};

/** timesheet Grid Table Sx declaration used across the frontend. */
export const timesheetGridTableSx = {
  ...tableWithMinWidthSx(timesheetGridMinWidth),
  "& .timesheet-jobs-cell": { padding: "8px 8px" },
};

/** timesheet Grid Container Sx declaration used across the frontend. */
export const timesheetGridContainerSx = (theme: Theme) => ({
  ...tableContainerSx,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: RADIUS_PX.lg,
});

/** Line above the week grid: the hours hint, then the Jobs search at its end. */
export const timesheetGridToolbarSx = {
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 2,
  pb: 0.75,
} satisfies SxProps<Theme>;

/** timesheet Hint Sx declaration used across the frontend. */
export const timesheetHintSx = {
  display: { xs: "none", sm: "block" },
  px: 1,
} satisfies SxProps<Theme>;

/** timesheet Empty Cell Sx declaration used across the frontend. */
export const timesheetEmptyCellSx = { py: 4, borderBottom: 0 } satisfies SxProps<Theme>;

/** timesheet Empty State Sx declaration used across the frontend. */
export const timesheetEmptyStateSx = {
  display: "grid",
  placeItems: "center",
} satisfies SxProps<Theme>;
