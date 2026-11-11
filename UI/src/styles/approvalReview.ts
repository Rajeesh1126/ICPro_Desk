/**
 * Timesheet review (approval drilldown) as one table: a single header row with
 * the days, then every job and its tasks, one line per task. Sized and tinted
 * like the app's data tables (52px rows, 14px text, the same header band). Used
 * by components/approval/detail/ApprovalWeekBoard.tsx.
 */
import { alpha, type Theme } from "@mui/material/styles";
import type { SxProps } from "@mui/material";
import { COLORS, FONT, RADIUS_PX, ROW_HEIGHT, STATUS_TONES } from "@/styles/tokens";
import { tableHeaderCellSx } from "@/styles/common";

const surface = (theme: Theme) =>
  theme.palette.mode === "dark" ? alpha(theme.palette.text.primary, 0.025) : theme.palette.background.paper;

/**
 * Task | seven days | total | status | rating and actions, from lg (1200px).
 * Shares of the table, like the data tables, so every column grows with the
 * dialog; the same tracks keep the header, job rows and tasks lined up.
 */
const REVIEW_COLUMNS =
  "minmax(180px, 2.4fr) minmax(0, 7fr) minmax(80px, 1fr) minmax(120px, 1.2fr) minmax(340px, 3fr)";

/** The table frame; scrolls with the dialog body (no inner scroller). */
export const reviewBoardSx: SxProps<Theme> = (theme) => ({
  flexShrink: 0,
  borderRadius: RADIUS_PX.md,
  border: `1px solid ${theme.palette.divider}`,
  bgcolor: surface(theme),
  // clip, not hidden: hidden would stop the header row from sticking.
  overflow: "clip",
});

export type ReviewStatTone = "default" | "primary" | "success" | "error";

/** Search, the awaiting filter and the task count. */
export const reviewToolbarSx: SxProps<Theme> = {
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 1,
  "& .MuiTextField-root": { flex: { xs: "1 1 100%", sm: "0 1 280px" } },
};

/** The "n of m tasks" count. */
export const reviewToolbarCountSx: SxProps<Theme> = {
  fontSize: FONT.xs,
  color: "text.secondary",
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
};

/** One line: total | stats | progress; wraps on phones. */
export const reviewSummarySx: SxProps<Theme> = (theme) => ({
  flexShrink: 0,
  display: "flex",
  flexWrap: { xs: "wrap", md: "nowrap" },
  alignItems: "center",
  columnGap: 2,
  rowGap: 0.5,
  px: 1.5,
  py: 0.5,
  borderRadius: RADIUS_PX.md,
  border: `1px solid ${theme.palette.divider}`,
  bgcolor: surface(theme),
});

/** "Total hours 60.00 h 3 tasks · 2 jobs", set off by a hairline on wide screens. */
export const reviewTotalSx: SxProps<Theme> = (theme) => ({
  display: "flex",
  alignItems: "baseline",
  gap: 0.75,
  whiteSpace: "nowrap",
  pr: { md: 2 },
  borderRight: { md: `1px solid ${theme.palette.divider}` },
  "& > span": { fontSize: FONT.xs, color: "text.secondary" },
  "& > strong": {
    fontSize: FONT.md,
    fontWeight: 700,
    color: "text.primary",
    fontVariantNumeric: "tabular-nums",
  },
});

/** The small stats. */
export const reviewStatsSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  columnGap: 2,
  rowGap: 0.5,
};

/** One stat: tone-coloured icon, bold value, quiet label. */
export const reviewStatSx =
  (tone: ReviewStatTone): SxProps<Theme> =>
  (theme) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 0.5,
    fontSize: FONT.xs,
    color: "text.secondary",
    whiteSpace: "nowrap",
    "& .MuiSvgIcon-root": {
      fontSize: FONT.sm,
      color: tone === "default" ? theme.palette.text.secondary : theme.palette[tone].main,
    },
    "& strong": {
      fontWeight: 700,
      fontVariantNumeric: "tabular-nums",
      color: tone === "default" ? theme.palette.text.primary : theme.palette[tone].main,
    },
  });

/** "Review progress 1 of 3" beside the segmented bar, at the line's right end. */
export const reviewProgressSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  flex: { xs: "1 1 100%", md: "0 1 340px" },
  ml: { md: "auto" },
  "& > span": { fontSize: FONT.xs, color: "text.secondary", whiteSpace: "nowrap" },
  "& strong": { color: "text.primary", fontWeight: 600, ml: 0.5 },
};

/** Segmented bar: accepted, rejected, awaiting and draft shares of the tasks. */
export const reviewProgressTrackSx: SxProps<Theme> = (theme) => ({
  display: "flex",
  flex: 1,
  minWidth: 60,
  gap: "4px",
  height: 6,
  borderRadius: RADIUS_PX.pill,
  overflow: "hidden",
  bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.08 : 0.06),
  "& .segment": { minWidth: 6 },
  "& .success": { bgcolor: theme.palette.success.main },
  "& .error": { bgcolor: theme.palette.error.main },
  "& .primary": { bgcolor: alpha(theme.palette.primary.main, 0.6) },
  "& .default": { bgcolor: alpha(theme.palette.text.primary, 0.2) },
});

/** The column header row: the data tables' header band. Stays in view while scrolling. */
export const reviewHeadRowSx: SxProps<Theme> = (theme) => ({
  ...tableHeaderCellSx(theme),
  // Sits over the dialog body's 12px padding, so no row shows above it.
  top: "-12px",
  zIndex: 1,
  display: "grid",
  gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: REVIEW_COLUMNS },
  alignItems: "center",
  columnGap: 2,
  minHeight: 35,
});

/** Below lg only the days have a heading: the other values explain themselves. */
export const reviewHeadCellSx = (align: "left" | "right" = "left"): SxProps<Theme> => ({
  display: { xs: "none", lg: "block" },
  textAlign: align,
});

/** A day heading, "Mon 03"; the weekend is dimmed like the Submission grid. */
export const reviewHeadDaySx = (weekend: boolean): SxProps<Theme> => ({
  textAlign: "center",
  whiteSpace: "nowrap",
  opacity: weekend ? 0.6 : 1,
});

/** One job: a tinted line above its tasks, hours under the Total column. */
export const reviewJobRowSx: SxProps<Theme> = (theme) => ({
  display: "grid",
  gridTemplateColumns: { xs: "minmax(0, 1fr) auto auto", lg: REVIEW_COLUMNS },
  alignItems: "center",
  columnGap: 2,
  minHeight: 40,
  px: 1,
  fontSize: FONT.sm,
  color: "text.secondary",
  borderBottom: `1px solid ${theme.palette.divider}`,
  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.12 : 0.07),
});

/** Job name and code, spanning the task and day columns. */
export const reviewJobNameSx: SxProps<Theme> = {
  gridColumn: { lg: "1 / 3" },
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  "& strong": { fontWeight: 600, color: "text.primary", mr: 1 },
};

/** Job hours, right-aligned over the task totals. */
export const reviewJobHoursSx: SxProps<Theme> = {
  textAlign: "right",
  fontWeight: 700,
  color: "text.primary",
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
};

/** The job's task count. */
export const reviewJobCountSx: SxProps<Theme> = {
  gridColumn: { lg: "4 / -1" },
  whiteSpace: "nowrap",
};

/**
 * One task. From lg (1200px) a single 52px line, the data tables' row height:
 * name, the seven days, total, status, then rating and actions. Below that the
 * days and the actions fold under the name, total and status.
 */
export const reviewTaskRowSx: SxProps<Theme> = (theme) => ({
  // Long weeks: off-screen rows skip layout and paint.
  contentVisibility: "auto",
  containIntrinsicBlockSize: `auto ${ROW_HEIGHT.standard}px`,
  display: "grid",
  alignItems: "center",
  columnGap: 2,
  rowGap: 1,
  gridTemplateColumns: { xs: "minmax(0, 1fr) auto auto", lg: REVIEW_COLUMNS },
  gridTemplateAreas: {
    xs: '"info total status" "days days days" "actions actions actions"',
    lg: '"info days total status actions"',
  },
  minHeight: ROW_HEIGHT.standard,
  px: 1,
  py: { xs: 1, lg: 0 },
  borderBottom: `1px solid ${theme.palette.divider}`,
  "&:last-of-type": { borderBottom: "none" },
  "&:nth-of-type(even)": {
    bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.025 : 0.018),
  },
  "&:hover": {
    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.036 : 0.045),
  },
});

/**
 * Task name with any rejection reason under it. Both wrap, so the full text is
 * always readable, by keyboard and on touch too; a long name makes its row
 * taller than the standard minimum.
 */
export const reviewTaskInfoSx: SxProps<Theme> = {
  gridArea: "info",
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  py: 0.5,
  fontSize: FONT.sm,
  lineHeight: 1.3,
};

/** The task name. */
export const reviewTaskNameSx: SxProps<Theme> = {
  fontWeight: 500,
  color: "text.primary",
  overflowWrap: "anywhere",
};

/** The rejection reason on a rejected task. */
export const reviewRejectionSx: SxProps<Theme> = (theme) => ({
  overflowWrap: "anywhere",
  color: theme.palette.mode === "dark" ? theme.palette.error.light : theme.palette.error.dark,
  "& .MuiSvgIcon-root": { fontSize: FONT.sm, mr: 0.25, verticalAlign: "-2px" },
});

/** The inline reject panel, under its task's row. */
export const reviewRejectPanelSx: SxProps<Theme> = (theme) => ({
  display: "flex",
  flexDirection: "column",
  gap: 1,
  px: 1,
  py: 1,
  borderBottom: `1px solid ${theme.palette.divider}`,
  bgcolor: STATUS_TONES[theme.palette.mode].danger.fill,
});

/** Cancel and Reject, at the panel's trailing edge. */
export const reviewRejectActionsSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 1,
};

/** Task total, right-aligned under the Total heading. */
export const reviewTaskTotalSx: SxProps<Theme> = {
  gridArea: "total",
  textAlign: "right",
  fontSize: FONT.sm,
  fontWeight: 700,
  color: "text.primary",
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
};

/** The status pill's column. */
export const reviewTaskStatusSx: SxProps<Theme> = {
  gridArea: "status",
  minWidth: 0,
};

const dayTracks = {
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  gap: "2px",
};

/** The seven days: always one row, on the same tracks as their headings. */
export const reviewDayGridSx: SxProps<Theme> = { ...dayTracks, gridArea: "days" };

/** The seven day headings, in the header's own column order. */
export const reviewHeadDaysSx: SxProps<Theme> = dayTracks;

/** One day's hours, tinted by the hours (a light heat-map). */
export const reviewDayCellSx =
  (weekend: boolean, share: number, hasHours: boolean): SxProps<Theme> =>
  (theme) => {
    const isDark = theme.palette.mode === "dark";
    return {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 0,
      height: 28,
      borderRadius: RADIUS_PX.xs,
      fontSize: FONT.sm,
      fontWeight: hasHours ? 600 : 400,
      fontVariantNumeric: "tabular-nums",
      color: hasHours ? "text.primary" : COLORS[theme.palette.mode].textTertiary,
      bgcolor: hasHours
        ? alpha(theme.palette.primary.main, (isDark ? 0.1 : 0.06) + share * 0.2)
        : alpha(theme.palette.text.primary, weekend ? (isDark ? 0.03 : 0.025) : 0),
    };
  };

/** Daily totals, pinned to the bottom of the dialog body while rows scroll. */
export const reviewTotalsRowSx: SxProps<Theme> = (theme) => ({
  ...tableHeaderCellSx(theme),
  position: "sticky",
  top: "auto",
  // Sits over the dialog body's 12px padding, like the header row.
  bottom: "-12px",
  zIndex: 1,
  display: "grid",
  gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: REVIEW_COLUMNS },
  alignItems: "center",
  columnGap: 2,
  minHeight: 35,
  borderTop: `1px solid ${theme.palette.divider}`,
  borderBottom: 0,
  color: "text.primary",
  fontVariantNumeric: "tabular-nums",
});

/** One day's total, on the same track as the day column above it. */
export const reviewTotalDaySx: SxProps<Theme> = { textAlign: "center" };

/** Rating + Accept + Reject; the rating takes the spare width on phones. */
export const reviewDecisionSx: SxProps<Theme> = {
  gridArea: "actions",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 1,
};

/** The rating select, a standard field in its own fixed width. */
export const reviewRatingSelectSx: SxProps<Theme> = {
  flex: { xs: "1 1 0", sm: "0 0 140px" },
  minWidth: 0,
  fontSize: FONT.sm,
  "& .MuiSelect-select": { py: 0.75 },
};
