/** Timesheet footer and status legend. */
import { type SxProps } from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
import { FONT, INSET_X, INSET_Y, MOTION, RADIUS_PX, insetSx } from "@/styles/tokens";

/* -------------------------------------------------------------------------- */
/* Timesheet submission footer                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Footer under the grid: flat with a top hairline. Unsaved hours tint it
 * warning (static: state is shown, not flashed).
 */
export const timesheetFooterBarSx =
  (hasUnsavedChanges: boolean): SxProps<Theme> =>
  (theme) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: { xs: "stretch", md: "center" },
    gap: 1.25,
    flexWrap: "wrap",
    mt: 1.5,
    py: INSET_Y,
    px: INSET_X,
    borderTop: "1px solid",
    borderColor: hasUnsavedChanges ? theme.palette.warning.main : theme.palette.divider,
    // Tinted, it reads as a surface: concentric with the page canvas's
    // 28px corner across the 12px page padding (16 = 28 − 12).
    borderRadius: hasUnsavedChanges ? RADIUS_PX.lg : 0,
    backgroundColor: hasUnsavedChanges
      ? alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.12 : 0.08)
      : "transparent",
    transition: theme.transitions.create(["background-color", "border-color"], {
      duration: theme.transitions.duration.shorter,
    }),
  });

/** Shared timesheet footer status  styles style or helper for the related interface. */
export const timesheetFooterStatusSx = {
  minWidth: { xs: "100%", md: 360 },
  flex: 1,
} satisfies SxProps<Theme>;

/** Estimated vs entered line (kept hidden, as before). */
export const timesheetFooterTargetSx =
  (targetMet: boolean): SxProps<Theme> =>
  (theme) => ({
    display: "none",
    fontSize: FONT.sm,
    fontWeight: 600,
    color: targetMet ? theme.palette.success.main : theme.palette.warning.main,
  });

/** Shared timesheet footer note  styles style or helper for the related interface. */
export const timesheetFooterNoteSx = (hasUnsavedChanges: boolean): SxProps<Theme> => ({
  display: "block",
  mt: 0.25,
  lineHeight: 1.35,
  fontWeight: hasUnsavedChanges ? 600 : 400,
});

/** Shared timesheet footer actions  styles style or helper for the related interface. */
export const timesheetFooterActionsSx = {
  display: "flex",
  alignItems: "center",
  // Always at the end of the bar, including when it wraps below the note.
  justifyContent: "flex-end",
  ml: "auto",
  gap: 1,
  flexWrap: "wrap",
} satisfies SxProps<Theme>;

/** Save Draft turns warning-filled while hours are unsaved (no pulsing). */
export const timesheetSaveDraftButtonSx =
  (hasUnsavedChanges: boolean): SxProps<Theme> =>
  () =>
    hasUnsavedChanges
      ? {
          bgcolor: "warning.main",
          color: "warning.contrastText",
          "&:hover": { bgcolor: "warning.dark" },
        }
      : {};

/** Shared pill skeleton  styles style or helper for the related interface. */
export const pillSkeletonSx = { borderRadius: RADIUS_PX.pill } satisfies SxProps<Theme>;

/** Shared ellipsis chip  styles style or helper for the related interface. */
export const ellipsisChipSx = {
  "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
} satisfies SxProps<Theme>;

/* -------------------------------------------------------------------------- */
/* Timesheet status legend (components/timesheet/StatusLegend.tsx)             */
/* -------------------------------------------------------------------------- */

/** The key sits flat above the table; its chips carry the colour. */
export const statusLegendSx = {
  py: INSET_Y,
  mb: 1,
} satisfies SxProps<Theme>;

/** Shared status legend info icon  styles style or helper for the related interface. */
export const statusLegendInfoIconSx = { fontSize: FONT.md, color: "text.secondary" } satisfies SxProps<Theme>;

/** Shared status legend title  styles style or helper for the related interface. */
export const statusLegendTitleSx = {
  fontWeight: 600,
  color: "text.secondary",
} satisfies SxProps<Theme>;

/** Shared status legend list  styles style or helper for the related interface. */
export const statusLegendListSx = {
  listStyle: "none",
  m: 0,
  p: 0,
  flex: 1,
  minWidth: 0,
} satisfies SxProps<Theme>;

/** One status: a tinted pill; the selected one gains a border. */
export const statusLegendItemSx =
  ({
    tone,
    active,
    selectable,
  }: {
    tone: string;
    active: boolean;
    selectable: boolean;
  }): SxProps<Theme> =>
  (theme) => {
    const isDark = theme.palette.mode === "dark";
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 0.6,
      height: 30,
      px: 0.75,
      borderRadius: RADIUS_PX.pill,
      border: "1px solid",
      borderColor: active ? tone : "transparent",
      bgcolor: alpha(tone, active ? (isDark ? 0.22 : 0.14) : isDark ? 0.14 : 0.08),
      cursor: selectable ? "pointer" : "help",
      outline: "none",
      "&:focus-visible": { boxShadow: `0 0 0 2px ${alpha(tone, 0.6)}` },
    };
  };

/** Shared status legend icon  styles style or helper for the related interface. */
export const statusLegendIconSx = (tone: string) => ({ fontSize: FONT.md, color: tone });

/** Shared status legend label  styles style or helper for the related interface. */
export const statusLegendLabelSx = {
  fontWeight: 600,
  color: "text.primary",
  whiteSpace: "nowrap",
} satisfies SxProps<Theme>;

/** Shared status legend count  styles style or helper for the related interface. */
export const statusLegendCountSx =
  (tone: string): SxProps<Theme> =>
  (theme) => ({
    minWidth: 22,
    height: 20,
    px: 0.5,
    display: "inline-grid",
    placeItems: "center",
    borderRadius: RADIUS_PX.pill,
    fontSize: FONT.xs,
    fontWeight: 600,
    color: "text.primary",
    bgcolor: alpha(tone, theme.palette.mode === "dark" ? 0.16 : 0.09),
  });

/** Shared status legend toggle  styles style or helper for the related interface. */
export const statusLegendToggleSx = {
  flexShrink: 0,
  alignSelf: { xs: "flex-start", md: "center" },
  gap: 0.25,
  px: 0.75,
  py: 0.5,
  borderRadius: RADIUS_PX.sm,
  color: "primary.main",
  fontSize: FONT.xs,
  fontWeight: 600,
  "&:hover": { bgcolor: "action.hover" },
  "&.Mui-focusVisible": { outline: "2px solid", outlineColor: "primary.main" },
} satisfies SxProps<Theme>;

/** Shared status legend chevron  styles style or helper for the related interface. */
export const statusLegendChevronSx = (expanded: boolean) => ({
  fontSize: FONT.md,
  transition: `transform ${MOTION.base} ${MOTION.easing}`,
  transform: expanded ? "rotate(180deg)" : "none",
});

/**
 * "What do these mean?" panel: one soft inset surface holding the meanings
 * in a roomy grid (1 / 2 / 3 columns), instead of loose text on the page.
 */
export const statusLegendMeaningsSx: SxProps<Theme> = (theme) => ({
  m: 0,
  mt: 1,
  px: { xs: 1.5, sm: 2 },
  py: { xs: 1.5, sm: 1.75 },
  borderRadius: RADIUS_PX.md,
  // Light: a white surface with a hairline edge (a grey tint read as a dark
  // box on the grey page). Dark keeps its subtle tint.
  ...(theme.palette.mode === "dark"
    ? { bgcolor: alpha(theme.palette.text.primary, 0.04) }
    : { bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }),
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
    lg: "repeat(3, minmax(0, 1fr))",
  },
  columnGap: 3,
  rowGap: 1.75,
  // Each meaning: icon badge beside term + definition, centred on the badge.
  "& > .MuiStack-root": { alignItems: "flex-start", gap: 1.25 },
  "& > .MuiStack-root > :not(style) ~ :not(style)": { ml: 0 },
});

/** Status icon inside a soft circle tinted with its own colour. */
export const statusLegendMeaningIconSx = (color: string) => ({
  boxSizing: "content-box",
  width: 16,
  height: 16,
  p: 1,
  flexShrink: 0,
  borderRadius: "50%",
  color,
  bgcolor: alpha(color, 0.12),
});

/** Shared status legend term  styles style or helper for the related interface. */
export const statusLegendTermSx = {
  display: "block",
  fontSize: FONT.sm,
  fontWeight: 600,
  lineHeight: 1.35,
  color: "text.primary",
  mt: 0,
} satisfies SxProps<Theme>;

/** Shared status legend definition  styles style or helper for the related interface. */
export const statusLegendDefinitionSx = {
  display: "block",
  m: 0,
  mt: 0.25,
  fontSize: FONT.xs,
  color: "text.secondary",
  lineHeight: 1.5,
} satisfies SxProps<Theme>;

/** Footnote under the meanings, set off by a hairline (not italics). */
export const statusLegendHintSx = {
  gridColumn: "1 / -1",
  pt: 1.25,
  borderTop: "1px solid",
  borderColor: "divider",
  fontSize: FONT.xs,
  color: "text.secondary",
} satisfies SxProps<Theme>;

/* Timesheet mobile day entry and rating guide/distribution. */

/** Shared mobile day entry  styles style or helper for the related interface. */
export const mobileDayEntrySx = {
  display: "flex",
  flex: 1,
  minHeight: 0,
  flexDirection: "column",
  gap: 1,
} satisfies SxProps<Theme>;

/** Shared mobile day strip  styles style or helper for the related interface. */
export const mobileDayStripSx = (dayCount: number) => ({
  display: "grid",
  gridTemplateColumns: `repeat(${dayCount}, minmax(0, 1fr))`,
  gap: 0.5,
  flex: 1,
  minWidth: 0,
});

/**
 * Previous / next day arrows. Below 400px they are hidden: the seven day
 * buttons already move between days, and the 44px touch arrows would leave
 * each day too narrow for its hours ("11.00").
 */
export const mobileDayStepArrowSx = {
  flexShrink: 0,
  "@media (max-width: 399.95px)": { display: "none" },
} satisfies SxProps<Theme>;

/** Shared mobile day entry nav  styles style or helper for the related interface. */
export const mobileDayEntryNavSx = {
  px: 0.5,
  // Narrow phones: the day totals wrap under the date as one line each.
  flexWrap: "wrap",
  columnGap: 1,
  "& > *": { whiteSpace: "nowrap" },
} satisfies SxProps<Theme>;

/** Shared mobile day entry list  styles style or helper for the related interface. */
export const mobileDayEntryListSx = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 1,
  pb: 1,
} satisfies SxProps<Theme>;

/** Shared mobile day entry empty  styles style or helper for the related interface. */
export const mobileDayEntryEmptySx = {
  display: "grid",
  placeItems: "center",
  minHeight: 220,
} satisfies SxProps<Theme>;

/** Shared mobile day entry task name  styles style or helper for the related interface. */
export const mobileDayEntryTaskNameSx = {
  overflowWrap: "anywhere",
  mb: 1,
} satisfies SxProps<Theme>;

/**
 * Day editor hierarchy (below 1200px), mirroring the week grid: a Job row,
 * its milestone rows, then the task cards. Each row toggles its children.
 */
export const mobileDayJobSx = {
  display: "flex",
  flexDirection: "column",
  // Keep the card's natural height: the list scrolls instead of squashing
  // every job (and clipping its tasks) to fit the remaining space.
  flexShrink: 0,
  // Opened jobs scroll into view below the sticky day header.
  scrollMarginTop: 8,
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.md,
  bgcolor: "background.paper",
  overflow: "hidden",
} satisfies SxProps<Theme>;

/** Full-width toggle row: chevron, title (and code), and a trailing value. */
export const mobileDayToggleRowSx = (level: "job" | "milestone"): SxProps<Theme> => ({
  display: "flex",
  alignItems: "center",
  gap: 1,
  width: "100%",
  minHeight: 48,
  px: 1,
  py: 1,
  pl: level === "milestone" ? 3 : 1,
  textAlign: "left",
  borderTop: level === "milestone" ? "1px solid" : 0,
  borderColor: "divider",
  "& .MuiSvgIcon-root": { flexShrink: 0, transition: `transform ${MOTION.fast} ${MOTION.easing}` },
  "&[aria-expanded='true'] > .MuiSvgIcon-root": { transform: "rotate(90deg)" },
});

/** Task cards inside an open milestone: indented under it. */
export const mobileDayTaskListSx = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
  pl: 3,
  pr: 1,
  pb: 1,
} satisfies SxProps<Theme>;

/** Shared mobile day entry owner label  styles style or helper for the related interface. */
export const mobileDayEntryOwnerLabelSx = {
  mr: 0.5,
} satisfies SxProps<Theme>;

/** Shared mobile day entry owner field  styles style or helper for the related interface. */
export const mobileDayEntryOwnerFieldSx = {
  width: 140,
  flexShrink: 0,
} satisfies SxProps<Theme>;

/** Shared mobile day entry hint  styles style or helper for the related interface. */
export const mobileDayEntryHintSx = {
  mt: 0.5,
} satisfies SxProps<Theme>;

/** Shared mobile day entry select label  styles style or helper for the related interface. */
export const mobileDayEntrySelectLabelSx = {
  mr: 0,
} satisfies SxProps<Theme>;

/** Shared rating legend  styles style or helper for the related interface. */
export const ratingLegendSx = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px 8px",
  alignItems: "center",
} satisfies SxProps<Theme>;

/** Shared rating guide row  styles style or helper for the related interface. */
export const ratingGuideRowSx = {
  display: "flex",
  alignItems: "flex-start",
} satisfies SxProps<Theme>;

/** Shared rating guide score  styles style or helper for the related interface. */
export const ratingGuideScoreSx = {
  fontSize: FONT.sm,
  lineHeight: 1.5,
} satisfies SxProps<Theme>;

/** Shared rating guide description  styles style or helper for the related interface. */
export const ratingGuideDescriptionSx = {
  fontSize: FONT.sm,
  lineHeight: 1.5,
  ml: 1,
} satisfies SxProps<Theme>;

/** Shared rating distribution tile  styles style or helper for the related interface. */
export const ratingDistributionTileSx = {
  height: "100%",
  ...insetSx,
  textAlign: "center",
} satisfies SxProps<Theme>;

/** Shared rating tile header  styles style or helper for the related interface. */
export const ratingTileHeaderSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 0.5,
} satisfies SxProps<Theme>;

/** Shared rating tile star  styles style or helper for the related interface. */
export const ratingTileStarSx = {
  color: "warning.main",
  display: "flex",
} satisfies SxProps<Theme>;

/** Shared rating tile body  styles style or helper for the related interface. */
export const ratingTileBodySx = {
  mt: 1,
} satisfies SxProps<Theme>;

/** Shared rating guide card  styles style or helper for the related interface. */
export const ratingGuideCardSx = {
  ...insetSx,
  height: "100%",
} satisfies SxProps<Theme>;
