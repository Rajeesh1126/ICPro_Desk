/** Target-date calendar shared by the work-item pages. */
import { type SxProps } from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
import { FONT, MOTION, RADIUS, RADIUS_PX, TABULAR_NUMS } from "@/styles/tokens";

// components/common/TicketPageParts.tsx — Tickets target-date calendar
/** Outer calendar frame shared by the month grid and agenda views. */
export const calendarShellSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
  height: "100%",
  minHeight: 0,
  overflowY: { xs: "auto", lg: "hidden" },
};

/** One row at every width: [prev next  Month / count] ... [Today]. */
export const calendarToolbarSx: SxProps<Theme> = (theme) => ({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: { xs: 0.75, md: 2 },
  // A flat row above the grid; the grid is the only framed surface.
  py: { xs: 0.25, sm: 0.5 },
  color: theme.palette.text.primary,
});

/** Shared calendar nav  styles style or helper for the related interface. */
export const calendarNavSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: { xs: 0.5, sm: 1.5 },
  minWidth: 0,
  flexWrap: "nowrap",
};

/**
 * Previous / next month: round buttons on a light primary tint, so the
 * month stepper reads as a control apart from the other icon buttons.
 */
export const calendarNavControlsSx: SxProps<Theme> = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  pl: 0.5,
  flexShrink: 0,
  "& .MuiIconButton-root": {
    width: 34,
    height: 34,
    minWidth: 0,
    minHeight: 0,
    "@media (pointer: coarse)": { width: 40, height: 40 },
    borderRadius: RADIUS.full,
    color: "primary.main",
    bgcolor: alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.14 : 0.08,
    ),
    "&:hover": {
      bgcolor: alpha(
        theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.22 : 0.14,
      ),
    },
  },
});

/** Shared calendar title block  styles style or helper for the related interface. */
export const calendarTitleBlockSx: SxProps<Theme> = {
  display: "flex",
  alignItems: { xs: "flex-start", md: "baseline" },
  flexDirection: { xs: "column", md: "row" },
  gap: { xs: 0, md: 0.75 },
  minWidth: 0,
  "& > *": { maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
};

/** Shared calendar toolbar actions  styles style or helper for the related interface. */
export const calendarToolbarActionsSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: { xs: 0.5, sm: 1 },
  minWidth: 0,
  flexWrap: "nowrap",
  "& .MuiButton-root": { minWidth: 0, px: 1 },
};

/** Header "Overdue": phones show only the count; the label stays in aria-label. */
export const calendarOverdueButtonSx: SxProps<Theme> = {
  minWidth: 0,
  px: 1,
  ...TABULAR_NUMS,
  "& .MuiButton-startIcon": { mr: { xs: 0.5, sm: 1 } },
};

/** Shared calendar heading  styles style or helper for the related interface. */
export const calendarHeadingSx: SxProps<Theme> = {
  fontSize: { xs: FONT.md, sm: FONT.md },
  fontWeight: 600,
  letterSpacing: "-0.01em",
  color: "text.primary",
  whiteSpace: "nowrap",
  ...TABULAR_NUMS,
};

/** Shared calendar count  styles style or helper for the related interface. */
export const calendarCountSx: SxProps<Theme> = {
  fontSize: { xs: FONT.xs, sm: FONT.sm },
  color: "text.secondary",
  ...TABULAR_NUMS,
};

/** Month grid beside the always-visible selected-day agenda (stacked below lg). */
export const calendarBodySx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "minmax(0, 1fr)",
    lg: "minmax(0, 1fr) minmax(300px, 330px)",
  },
  alignItems: "stretch",
  gap: 1,
  // Below lg the shell scrolls; the body keeps its natural height so the
  // grid is never squeezed (header hidden, last week clipped).
  flex: { xs: "0 0 auto", lg: "1 1 auto" },
  minHeight: 0,
  // The month slide moves the grid sideways briefly; clip (not hidden, so
  // no scroll container) keeps it from showing a horizontal scrollbar.
  overflowX: "clip",
};

export const calendarPanelBase = (theme: Theme) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: RADIUS_PX.lg,
  bgcolor: "background.paper",
  overflow: "hidden",
});

/** 7 columns × (weekday header + 6 weeks): stable for every month. */
export const calendarGridSx: SxProps<Theme> = (theme) => ({
  ...calendarPanelBase(theme),
  display: "grid",
  // Sunday is the seventh column in the Monday-first calendar grid. Use the
  // standard disabled background as a visual cue without disabling the day.
  "& > [role='row'] > :nth-of-type(7)": {
    bgcolor: alpha(
      theme.palette.action.disabledBackground,
      theme.palette.mode === "dark" ? 0.05 : 0.018,
    ),
  },
  // Rows never shrink below a readable height; when space is short the grid
  // scrolls inside its panel instead of overlapping rows.
  // Shorter rows below lg, where the day panel stacks under the grid.
  // The weekday header track is max-content: an "auto" track was the only
  // one allowed to give way, so it collapsed and the week rows covered the
  // weekday names.
  gridTemplateRows: {
    xs: "max-content repeat(6, minmax(46px, auto))",
    sm: "max-content repeat(6, minmax(68px, auto))",
    lg: "max-content repeat(6, minmax(88px, 1fr))",
  },
  // Weekday names stay in view while the weeks scroll beneath them.
  "& > [role='row']:first-of-type": {
    position: "sticky",
    top: 0,
    zIndex: 2,
    bgcolor: "background.paper",
  },
  minHeight: 0,
  overflowY: "auto",
});

/** Shared calendar week row  styles style or helper for the related interface. */
export const calendarWeekRowSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  minHeight: 0,
};

/** Shared calendar weekday  styles style or helper for the related interface. */
export const calendarWeekdaySx: SxProps<Theme> = (theme) => ({
  py: { xs: 0.5, sm: 0.75 },
  textAlign: "center",
  fontSize: FONT.xs,
  fontWeight: 600,
  color: "text.secondary",
  borderBottom: "1px solid",
  borderColor: "divider",
  bgcolor: alpha(
    theme.palette.text.primary,
    theme.palette.mode === "dark" ? 0.025 : 0.018,
  ),
});

/** Shared calendar cell  styles style or helper for the related interface. */
export const calendarCellSx =
  ({
    inMonth,
    selected,
    compact,
    isToday,
  }: {
    inMonth: boolean;
    selected: boolean;
    compact: boolean;
    isToday: boolean;
  }): SxProps<Theme> =>
  (theme) => {
    const isDark = theme.palette.mode === "dark";
    return {
      position: "relative",
      minWidth: 0,
      minHeight: 0,
      p: 0.5,
      display: "flex",
      flexDirection: "column",
      alignItems: compact ? "center" : "stretch",
      gap: compact ? 0.25 : 0.5,
      cursor: "pointer",
      overflow: "hidden",
      borderRight: "1px solid",
      borderBottom: "1px solid",
      borderColor: alpha(theme.palette.divider, isDark ? 0.38 : 0.58),
      "&:nth-of-type(7n)": { borderRight: 0 },
      bgcolor: isToday
        ? alpha(theme.palette.primary.main, isDark ? 0.08 : 0.045)
        : selected
        ? alpha(theme.palette.primary.main, isDark ? 0.12 : 0.06)
        : inMonth
          ? "background.paper"
          : alpha(theme.palette.text.primary, isDark ? 0.025 : 0.02),
      boxShadow: selected
        ? `inset 0 0 0 2px ${alpha(theme.palette.primary.main, 0.55)}`
        : "none",
      transition: `background-color ${MOTION.fast} ${MOTION.easing}`,
      "&:hover": selected
        ? {}
        : isToday
          ? { bgcolor: alpha(theme.palette.primary.main, isDark ? 0.11 : 0.065) }
          : { bgcolor: alpha(theme.palette.text.primary, isDark ? 0.04 : 0.03) },
      "&:focus-visible": {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: -2,
      },
    };
  };

/** Day number on the left, add action on the right (phones: date only). */
export const calendarCellHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: { xs: "center", sm: "space-between" },
  gap: 0.5,
  minWidth: 0,
  width: "100%",
};

/** Shared calendar cell actions  styles style or helper for the related interface. */
export const calendarCellActionsSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 0.25,
  minWidth: 0,
};

/** Shared calendar create button  styles style or helper for the related interface. */
export const calendarCreateButtonSx: SxProps<Theme> = (theme) => ({
  width: 26,
  height: 26,
  minWidth: 0,
  minHeight: 0,
  p: '0 !important',
  flexShrink: 0,
  // Quiet until the day is hovered / selected, so a month of future dates
  // doesn't fill with primary-coloured marks.
  color: "text.secondary",
  opacity: 0.55,
  transition: `opacity ${MOTION.fast} ${MOTION.easing}, color ${MOTION.fast} ${MOTION.easing}`,
  "& .MuiSvgIcon-root": { fontSize: FONT.lg },
  "[role='gridcell']:hover &, [role='gridcell'][aria-selected='true'] &, &.Mui-focusVisible": {
    opacity: 1,
    color: "primary.main",
  },
  "&:hover": {
    color: "primary.main",
    bgcolor: alpha(theme.palette.primary.main, 0.1),
  },
});

/** Ticket number in list rows: never truncated. */
export const calendarAgendaNumberSx: SxProps<Theme> = {
  flexShrink: 0,
  fontSize: FONT.sm,
  fontWeight: 600,
  color: "text.secondary",
  ...TABULAR_NUMS,
};

/** Shared calendar day number  styles style or helper for the related interface. */
export const calendarDayNumberSx = ({
  inMonth,
  isToday,
}: {
  inMonth: boolean;
  isToday: boolean;
}): SxProps<Theme> => (theme) => ({
  alignSelf: { xs: "center", sm: "flex-start" },
  minWidth: 24,
  height: { xs: 22, sm: 24 },
  px: 0.5,
  borderRadius: RADIUS_PX.pill,
  display: "inline-grid",
  placeItems: "center",
  fontSize: FONT.sm,
  fontWeight: isToday ? 600 : 500,
  ...TABULAR_NUMS,
  color: isToday
    ? theme.palette.mode === "dark"
      ? theme.palette.primary.light
      : theme.palette.primary.dark
    : inMonth
      ? "text.primary"
      : "text.disabled",
  bgcolor: "transparent",
});

/** Phone month view: a small count instead of unreadable chips. */
export const calendarCompactCountSx: SxProps<Theme> = (theme) => ({
  minWidth: 18,
  height: 16,
  px: 0.5,
  borderRadius: RADIUS_PX.pill,
  display: "inline-grid",
  placeItems: "center",
  fontSize: FONT.xs,
  lineHeight: 1,
  fontWeight: 600,
  ...TABULAR_NUMS,
  color: "text.primary",
  bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.16 : 0.1),
});

/** One ticket inside a day cell: status dot / urgency icon, number, subject. */
export const calendarChipSx =
  (statusColor: string): SxProps<Theme> =>
  (theme) => {
    const tint = statusColor;
    return {
      width: "100%",
      minWidth: 0,
      // Number line above a one-line subject, so narrow cells still read.
      display: "grid",
      gridTemplateColumns: "auto minmax(0, 1fr)",
      gridTemplateAreas: '"mark text"',
      alignItems: "center",
      justifyContent: "stretch",
      columnGap: 0.5,
      rowGap: 0,
      px: 0.75,
      py: 0.25,
      borderRadius: `${RADIUS.xs + 2}px`,
      fontSize: FONT.xs,
      lineHeight: 1.4,
      color: "text.primary",
      textAlign: "left",
      bgcolor: alpha(tint, theme.palette.mode === "dark" ? 0.12 : 0.07),
      transition: `background-color ${MOTION.fast} ${MOTION.easing}`,
      "&:hover": {
        bgcolor: alpha(tint, theme.palette.mode === "dark" ? 0.32 : 0.2),
      },
      "&.Mui-focusVisible": {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: 1,
      },
      "& .MuiSvgIcon-root": { gridArea: "mark", fontSize: FONT.sm, flexShrink: 0 },
    };
  };

/** Shared calendar chip dot  styles style or helper for the related interface. */
export const calendarChipDotSx = (statusColor: string): SxProps<Theme> => ({
  gridArea: "mark",
  width: 6,
  height: 6,
  flexShrink: 0,
  borderRadius: "50%",
  bgcolor: statusColor,
});

/** Shared calendar chip text  styles style or helper for the related interface. */
export const calendarChipTextSx: SxProps<Theme> = {
  display: "-webkit-box",
  gridArea: "text",
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  // One line: the full subject is in the day panel and "+N more" list.
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  whiteSpace: "normal",
  overflowWrap: "anywhere",
};

/** Overflow link under the previews, aligned with the chip text. */
export const calendarMoreSx: SxProps<Theme> = (theme) => ({
  flexShrink: 0,
  alignSelf: "flex-start",
  px: 0.75,
  py: 0.125,
  borderRadius: `${RADIUS.xs + 2}px`,
  fontSize: FONT.xs,
  fontWeight: 600,
  color: "primary.main",
  "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
  "&.Mui-focusVisible": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 1,
  },
});

/** Selected-day agenda / Agenda view / "+N more" list surface. */
export const calendarPanelSx: SxProps<Theme> = (theme) => ({
  ...calendarPanelBase(theme),
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  height: "100%",
  overflowY: "auto",
});

/** Shared calendar panel header  styles style or helper for the related interface. */
export const calendarPanelHeaderSx: SxProps<Theme> = (theme) => ({
  position: "sticky",
  top: 0,
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1,
  // 8px right inset: the 8px-radius Add button sits concentric with the
  // panel's 16px corner (8 + 8); the title keeps the rows' 12px.
  pl: 1.5,
  pr: 1,
  py: 1,
  minHeight: 52,
  bgcolor: theme.palette.background.paper,
  borderBottom: "1px solid",
  borderColor: "divider",
});

/** Shared calendar panel title block  styles style or helper for the related interface. */
export const calendarPanelTitleBlockSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
};

/** Touch-sized create action for the selected day (all breakpoints). */
export const calendarPanelCreateSx: SxProps<Theme> = {
  flexShrink: 0,
  whiteSpace: "nowrap",
};

/** Shared calendar panel title  styles style or helper for the related interface. */
export const calendarPanelTitleSx: SxProps<Theme> = {
  fontSize: FONT.sm,
  p: 0,
  fontWeight: 600,
  color: "text.primary",
  ...TABULAR_NUMS,
};

/** Shared calendar group heading  styles style or helper for the related interface. */
export const calendarGroupHeadingSx: SxProps<Theme> = (theme) => ({
  position: "sticky",
  top: 0,
  zIndex: 1,
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 1,
  px: 2,
  py: 0.75,
  fontSize: FONT.sm,
  fontWeight: 600,
  color: "text.primary",
  ...TABULAR_NUMS,
  bgcolor: theme.palette.background.paper,
  backgroundImage: `linear-gradient(${alpha(theme.palette.text.primary, 0.03)}, ${alpha(theme.palette.text.primary, 0.03)})`,
  borderTop: "1px solid",
  borderBottom: "1px solid",
  borderColor: "divider",
});

/** Shared calendar agenda row  styles style or helper for the related interface. */
export const calendarAgendaRowSx: SxProps<Theme> = (theme) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: 0.5,
  px: 2,
  py: 1.25,
  textAlign: "left",
  borderBottom: "1px solid",
  borderColor: alpha(theme.palette.divider, 0.8),
  transition: `background-color ${MOTION.fast} ${MOTION.easing}`,
  "&:last-of-type": { borderBottom: 0 },
  "&:hover": {
    bgcolor: alpha(
      theme.palette.text.primary,
      theme.palette.mode === "dark" ? 0.04 : 0.03,
    ),
  },
  "&.Mui-focusVisible": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: -2,
  },
});

/** Shared calendar agenda title  styles style or helper for the related interface. */
export const calendarAgendaTitleSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 0.25,
  minWidth: 0,
  fontSize: FONT.sm,
  fontWeight: 600,
  color: "text.primary",
  "& > span:first-of-type": { fontSize: FONT.xs, color: "text.secondary" },
  "& > span:last-of-type": {
    width: "100%",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};

/** Shared calendar agenda meta  styles style or helper for the related interface. */
export const calendarAgendaMetaSx: SxProps<Theme> = {
  fontSize: FONT.sm,
  color: "text.secondary",
  ...TABULAR_NUMS,
};

/** Shared calendar selected day empty  styles style or helper for the related interface. */
export const calendarSelectedDayEmptySx: SxProps<Theme> = (theme) => ({
  flex: 1,
  minHeight: { xs: 120, lg: 180 },
  px: 2.5,
  py: { xs: 2.5, lg: 4 },
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 0.75,
  textAlign: "center",
  color: "text.secondary",
  "& .MuiSvgIcon-root": {
    mb: 0.5,
    fontSize: FONT.xl,
    color: alpha(theme.palette.primary.main, 0.72),
  },
  "& .MuiTypography-root": { fontSize: FONT.sm, color: "text.primary" },
  "& .MuiTypography-root:last-of-type": {
    fontSize: FONT.sm,
    color: "text.secondary",
  },
});

/** Shared calendar state  styles style or helper for the related interface. */
export const calendarStateSx: SxProps<Theme> = (theme) => ({
  ...calendarPanelBase(theme),
  p: 3,
  display: "flex",
  alignItems: "center",
  gap: 1,
  color: "text.secondary",
  fontSize: FONT.sm,
});

/** Table "Columns" menu: desktop only (phone cards show every field). */
/** Trigger styling for choosing which table columns are visible. */
export const columnPickerButtonSx: SxProps<Theme> = {
  display: { xs: "none", sm: "inline-flex" },
  whiteSpace: "nowrap",
  flexShrink: 0,
};

/** Shared column picker heading  styles style or helper for the related interface. */
export const columnPickerHeadingSx: SxProps<Theme> = {
  px: 2,
  pt: 0.75,
  pb: 0.5,
  fontSize: FONT.xs,
  fontWeight: 600,
  color: "text.secondary",
  listStyle: "none",
};
