/**
 * Shared style primitives.
 *
 * Naming: name a style for what it is, not where it came from —
 * `dialogHeaderSx`, `tableToolbarSx`, `statusCellSx`, `filterPanelSx`. Never
 * use generated names like `fooBoxSx1` for new styles.
 *
 * Nesting: put a rule on the parent only when it is container-wide (table
 * baseline cells, row hover, MUI internal selectors such as
 * `& .MuiOutlinedInput-root`). If a child already gets the same colour,
 * padding or border from its parent, don't repeat it on the child. Keep child
 * rules for real exceptions.
 *
 * Colour: follow the 60/30/10 roles documented in `tokens.ts`.
 *
 * Icons: navigation and toggle icons (sidebar, view toggles, tabs) use the
 * Outlined variant when unselected and the filled variant when selected.
 * Action icons (Save, Close, Edit, Download, Delete, Warning) always use one
 * meaning-first glyph; don't swap them on selection state.
 */
import { alpha, keyframes, type Theme } from "@mui/material/styles";
import { type CSSProperties, type SxProps } from "@mui/material";
import { dialogActionsRowSx } from "@/styles/dialog";
import { scrollableContent } from "@/styles/layout";
import {
  ELEVATION,
  HERO_OVERLAY,
  RADIUS,
  RADIUS_PX,
  STATUS_COLOR_DEFAULT,
  INSET_X,
  INSET_Y,
  insetSx,
  STATUS_COLORS,
  SURFACE_TINT,
  CARD_PADDING,
  MOTION,
  TABULAR_NUMS,
  THEME_TOGGLE_COLORS,
} from "@/styles/tokens";
import type { DueTone } from "@/components/common/formatDate";

export {
  buttonLabelCompact,
  buttonLabelFull,
  contentPanel,
  filterField,
  page,
  pageContent,
  pageHeader,
  pageHeaderActions,
  pageHeaderContent,
  pageHeaderIconButton,
  pageSubtitle,
  pageTitle,
  scrollableContent,
  tablePageContent,
  tabs,
  tabsContainer,
  wideFilterField,
} from "@/styles/layout";
export { dateFieldSx } from "@/styles/filters";

type AlphaStyleArgs = { alpha: typeof alpha };
type AccentStyleArgs = { accent: string };
type ResponsiveStyleWidth =
  | number
  | string
  | Partial<Record<"xs" | "sm" | "md" | "lg" | "xl", number | string>>;
type TableStyleColumn = {
  label?: string;
  width?: ResponsiveStyleWidth;
  numeric?: boolean;
  format?: string;
  align?: "left" | "center" | "right";
};

/** Same rule as components/common/tableCell columnAlign (kept here to avoid an import cycle). */
const resolveColumnAlign = (column: TableStyleColumn) =>
  column.align ??
  (column.numeric || column.format === "hours" ? "right" : "left");

const justifyFor = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
} as const;

/** The row actions column stays pinned to the right edge while the table scrolls. */
const isActionsColumn = (column: TableStyleColumn) =>
  column.label === "Actions";

const columnWidth = (column: TableStyleColumn) => column.width ?? 100;

const pinnedRightShadow = (theme: Theme) => `-1px 0 0 ${theme.palette.divider}`;
type StaticStyleObject = Record<string, unknown>;
type ThemeStyleCallback = (theme: Theme) => StaticStyleObject;

// common/feedback.ts
export const emptyStateSx = {
  color: "text.secondary",
  display: "grid",
  flex: 1,
  minHeight: 180,
  placeItems: "center",
  textAlign: "center",
};

// common/forms.ts
/**
 * Priority pills: Low success, Medium warning, High error, each as a light
 * tint with a darker (light mode) / lighter (dark mode) label for contrast.
 */
export const getPriorityPalette = (theme: Theme, priority: unknown) => {
  const isDark = theme.palette.mode === "dark";
  const normalizedPriority = String(priority ?? "").toLowerCase();
  const tone =
    normalizedPriority === "high"
      ? theme.palette.error
      : normalizedPriority === "medium"
        ? theme.palette.warning
        : theme.palette.success;
  return {
    bg: alpha(tone.main, isDark ? 0.18 : 0.12),
    text: isDark ? tone.light : tone.dark,
  };
};

export const detailLabelSx = {
  color: "text.secondary",
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1.2,
  textTransform: "capitalize",
};

export const detailValueSx = {
  color: "text.primary",
  fontSize: { xs: 11, sm: 13 },
  fontWeight: 600,
  lineHeight: 1.35,
  overflowWrap: "anywhere",
};

export const form: SxProps<Theme> = {
  display: "grid",
  gap: 2,
};

export const compactFieldSx = (theme: Theme) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: RADIUS_PX.sm,
    bgcolor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.text.primary, 0.025)
        : alpha(theme.palette.primary.main, 0.035),
  },
});

export const confirmationMessageSx = {
  mb: 2,
  color: "text.secondary",
};
export const attachmentSectionSx = (theme: Theme) => ({
  mt: 1.5,
  ...insetSx,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: RADIUS_PX.md,
  bgcolor:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.text.primary, 0.018)
      : alpha(theme.palette.primary.main, 0.018),
});

export const attachmentHeaderSx = {
  alignItems: "center",
  display: "flex",
  gap: 0.75,
  mb: 1.15,
};

export const attachmentListSx = {
  display: "grid",
  gap: 0.75,
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
};

export const attachmentItemSx = (theme: Theme) => ({
  alignItems: "center",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: RADIUS_PX.md,
  color: "text.primary",
  display: "flex",
  gap: 1,
  minWidth: 0,
  ...insetSx,
  textDecoration: "none",
  transition: theme.transitions.create(["background-color", "border-color"], {
    duration: theme.transitions.duration.shortest,
  }),
  "&:hover": {
    bgcolor: alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.096 : 0.07,
    ),
    borderColor: theme.palette.primary.main,
  },
});

export const attachmentIconSx = (theme: Theme) => ({
  alignItems: "center",
  bgcolor: alpha(
    theme.palette.primary.main,
    theme.palette.mode === "dark" ? 0.12 : 0.1,
  ),
  borderRadius: RADIUS_PX.sm,
  color: "primary.main",
  display: "flex",
  flexShrink: 0,
  height: 30,
  justifyContent: "center",
  width: 30,
});

export const attachmentNameSx = {
  color: "text.primary",
  flex: 1,
  fontSize: "0.8125rem",
  fontWeight: 600,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const attachmentOpenSx = {
  color: "primary.main",
  flexShrink: 0,
  fontSize: "0.75rem",
  fontWeight: 600,
};

export const section = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.md,
  bgcolor: "background.paper",
} satisfies SxProps<Theme>;

/* -------------------------------------------------------------------------- */
/* Summary metrics strip (components/common/SummaryMetrics.tsx)                */
/* -------------------------------------------------------------------------- */

/**
 * One rounded surface split into equal segments by hairline dividers, rather
 * than a row of separate cards. The dividers are the container colour showing
 * through a 1px grid gap, so they line up in both directions at every width.
 * Phones: two per row; an odd last segment spans the row (no empty cell).
 */
export const summaryMetricsStripSx =
  (count: number): SxProps<Theme> =>
  (theme) => ({
    display: "grid",
    gridTemplateColumns: {
      xs: "repeat(2, minmax(0, 1fr))",
      md: `repeat(${Math.max(1, count)}, minmax(0, 1fr))`,
    },
    gap: "1px",
    mb: 1,
    overflow: "hidden",
    borderRadius: RADIUS_PX.md,
    border: `1px solid ${theme.palette.divider}`,
    bgcolor: theme.palette.divider,
    boxShadow: theme.palette.mode === "dark" ? "none" : ELEVATION.light.card,
    "& > :last-child:nth-of-type(odd)": {
      gridColumn: { xs: "1 / -1", md: "auto" },
    },
  });

/** One segment. Clickable segments get a soft hover fill and a focus ring. */
export const summaryMetricCellSx =
  (clickable: boolean): SxProps<Theme> =>
  (theme) => ({
    position: "relative",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 0.5,
    px: { xs: 1.5, sm: 2 },
    py: { xs: 1.25, sm: 1.5 },
    bgcolor: "background.paper",
    outline: "none",
    ...(clickable && {
      cursor: "pointer",
      transition: theme.transitions.create("background-color", {
        duration: theme.transitions.duration.shortest,
      }),
      "&:hover": {
        bgcolor: alpha(
          theme.palette.text.primary,
          theme.palette.mode === "dark" ? 0.05 : 0.025,
        ),
      },
      "&:active": {
        bgcolor: alpha(
          theme.palette.text.primary,
          theme.palette.mode === "dark" ? 0.08 : 0.045,
        ),
      },
      "&:focus-visible": {
        boxShadow: `inset 0 0 0 2px ${theme.palette.primary.main}`,
      },
    }),
  });

/** Label row; a toned metric shows a small status dot before its label. */
export const summaryMetricLabelSx =
  (tone?: "error" | "success"): SxProps<Theme> =>
  (theme) => ({
    display: "flex",
    alignItems: "center",
    gap: 0.75,
    minWidth: 0,
    color: "text.secondary",
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1.3,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    ...(tone && {
      "&::before": {
        content: '""',
        flexShrink: 0,
        width: 7,
        height: 7,
        borderRadius: "50%",
        bgcolor: theme.palette[tone].main,
        boxShadow: `0 0 0 3px ${alpha(theme.palette[tone].main, 0.18)}`,
      },
    }),
  });

/** The figure itself: large, tabular, coloured only when it carries meaning. */
export const summaryMetricValueSx =
  (tone?: "error" | "success"): SxProps<Theme> =>
  (theme) => ({
    color: tone ? theme.palette[tone].main : "text.primary",
    fontSize: { xs: 22, sm: 26 },
    fontWeight: 600,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    ...TABULAR_NUMS,
  });

/** Supporting line; a dotted underline marks one that has a tooltip. */
export const summaryMetricHelperSx = (hasTooltip: boolean): SxProps<Theme> => ({
  mt: "auto",
  color: "text.secondary",
  fontSize: 12,
  lineHeight: 1.4,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  ...(hasTooltip && {
    alignSelf: "flex-start",
    cursor: "help",
    textDecoration: "underline dotted",
    textUnderlineOffset: "3px",
    textDecorationColor: "currentColor",
  }),
});

/** Loading placeholders sized like the real figure and helper line. */
export const summaryMetricSkeletonValueSx = {
  width: "45%",
  height: 32,
} satisfies SxProps<Theme>;

export const summaryMetricSkeletonHelperSx = {
  width: "70%",
} satisfies SxProps<Theme>;

/** Table value coloured red when negative (e.g. hours over budget). */
export const negativeValueSx = (negative: boolean) =>
  negative ? { color: "error.main", fontWeight: 600 } : {};

/** Quiet "nothing to flag" text used where only exceptions get a chip. */
export const quietStatusTextSx = {
  color: "text.secondary",
  fontSize: 13,
} satisfies SxProps<Theme>;

export const borderedSurfaceSx = {
  border: "1px solid",
  borderColor: "divider",
};

export const pushRightSx = { ml: "auto" };

export const marginTopSmallSx = { mt: 0.35 };

export const marginTopMediumSx = { mt: 0.5 };

export const marginTopSectionSx = { mt: 2 };

export const marginBottomSectionSx = { mb: 2 };

export const minWidthZeroSx = { minWidth: 0 };

export const inlineCenterGapSx = {
  display: "flex",
  alignItems: "center",
  gap: 1,
};

export const splitPanelContent: SxProps<Theme> = {
  width: "100%",
  height: "100%",
  minHeight: 0,
  display: "flex",
  flexDirection: { xs: "column", lg: "row" },
  gap: 1.5,
  overflow: "hidden",
};

export const flexFillPanel: SxProps<Theme> = {
  flex: 1,
  minHeight: 0,
  overflow: "hidden",
};

export const overviewGrid: SxProps<Theme> = {
  flex: 1,
  minHeight: 0,
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: {
    xs: "minmax(0, 1fr)",
    md: "repeat(12, minmax(0, 1fr))",
  },
  gridTemplateRows: {
    xs: "auto auto minmax(360px, 1fr)",
    md: "minmax(235px, 260px) minmax(0, 1fr)",
  },
};

export const overviewPrimaryGridItem: SxProps<Theme> = {
  minHeight: { xs: 260, md: 0 },
  gridColumn: { xs: "1", md: "span 7" },
  minWidth: 0,
};

export const overviewSecondaryGridItem: SxProps<Theme> = {
  minHeight: { xs: 260, md: 0 },
  gridColumn: { xs: "1", md: "span 5" },
  minWidth: 0,
};

export const overviewFullGridItem: SxProps<Theme> = {
  minHeight: 0,
  gridColumn: { xs: "1", md: "1 / -1" },
  minWidth: 0,
  overflow: "hidden",
};

export const surfacePanel = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.md,
  ...insetSx,
  height: "100%",
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
} satisfies SxProps<Theme>;

export const panelTitleRow = {
  mb: 1.25,
  flexShrink: 0,
} satisfies SxProps<Theme>;

export const scrollColumn = ((theme: Theme) => ({
  flex: 1,
  overflowY: "auto",
  pr: 1,
  // Reserve gutter space so the scrollbar never overlaps content and its
  // appearance does not cause a layout shift.
  scrollbarGutter: "stable",
  scrollbarWidth: "thin",
  scrollbarColor: `${alpha(
    theme.palette.text.secondary,
    theme.palette.mode === "dark" ? 0.38 : 0.32,
  )} transparent`,
  "&::-webkit-scrollbar": {
    width: 6,
    height: 6,
  },
  "&::-webkit-scrollbar-button": {
    display: "none",
    width: 0,
    height: 0,
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: alpha(
      theme.palette.text.secondary,
      theme.palette.mode === "dark" ? 0.32 : 0.28,
    ),
    borderRadius: RADIUS_PX.pill,
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.6 : 0.5,
    ),
  },
})) satisfies SxProps<Theme>;

export const dividerListRow = (showDivider: boolean): SxProps<Theme> => ({
  py: INSET_Y,
  borderBottom: showDivider ? "1px solid" : 0,
  borderColor: "divider",
});

export const contentFill: SxProps<Theme> = {
  flex: 1,
  minWidth: 0,
};

export const compactStackGap: SxProps<Theme> = { mb: 0.8 };

export const statusDot = (color: string): SxProps<Theme> => ({
  width: 8,
  height: 8,
  borderRadius: RADIUS.full,
  bgcolor: color,
  flexShrink: 0,
});

export const inlineProgress = (color: string): SxProps<Theme> => ({
  width: "100%",
  height: 7,
  borderRadius: RADIUS_PX.pill,
  bgcolor: "action.hover",
  "& .MuiLinearProgress-bar": {
    borderRadius: RADIUS_PX.pill,
    bgcolor: color,
  },
});

export const largeMutedIcon: SxProps<Theme> = {
  fontSize: 44,
  opacity: 0.4,
};

export const fillContainer: SxProps<Theme> = {
  height: "100%",
  minHeight: 0,
};

/** Section title for a numbered step ("Step 1 · Choose phase"). */
export const stepLabel = {
  color: "text.primary",
  display: "block",
  fontSize: 15,
  fontWeight: 600,
  lineHeight: 1.35,
} satisfies SxProps<Theme>;

export const helperText = {
  display: { xs: "none", sm: "block" },
  color: "text.secondary",
  fontSize: "0.75rem",
  lineHeight: 1.45,
} satisfies SxProps<Theme>;

/** A step/section that sits flat on the page; spacing separates it. */
export const sectionInset = {
  py: 0.5,
} satisfies SxProps<Theme>;

/**
 * Phase picker: the shared segmented control from the theme (quiet track,
 * raised selected segment). Only wrapping and icon size are local.
 */
export const segmentedControl = {
  flexWrap: "wrap",
  maxWidth: "100%",
  mt: 1,
  "& .MuiToggleButton-root": {
    gap: 0.75,
    "& .MuiSvgIcon-root": { fontSize: 16 },
  },
} satisfies SxProps<Theme>;

export const tableSection = {
  flex: "1 1 auto",
  width: "100%",
  minWidth: 0,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  gap: 1,
} satisfies SxProps<Theme>;

export const tablePanelFill = {
  flex: "1 1 0",
  width: "100%",
  minWidth: 0,
  height: "100%",
  overflow: "hidden",
} satisfies SxProps<Theme>;

/** Page footer bar: flat, set off from the content by one hairline. */
export const footerSurface = {
  pt: 1.5,
  borderTop: "1px solid",
  borderColor: "divider",
} satisfies SxProps<Theme>;

export const primarySaveButton = {
  minWidth: { xs: "100%", sm: 150 },
} satisfies SxProps<Theme>;

export const countChip =
  (selected: boolean): SxProps<Theme> =>
  (theme) => ({
    height: 22,
    minWidth: 24,
    ml: 0.25,
    // A count is supporting information: neutral, a touch stronger when selected.
    bgcolor: alpha(
      theme.palette.text.primary,
      theme.palette.mode === "dark" ? (selected ? 0.16 : 0.1) : selected ? 0.1 : 0.06,
    ),
    color: selected ? theme.palette.text.primary : theme.palette.text.secondary,
    fontSize: 11,
    fontWeight: 600,
    "& .MuiChip-label": { px: 0.75 },
  });

export const metaChip = {
  height: 28,
  px: 0.75,
  borderColor: "divider",
  color: "text.primary",
  bgcolor: "background.paper",
  fontSize: 11,
  fontWeight: 600,
  "& .MuiChip-icon": {
    color: "primary.main",
  },
} satisfies SxProps<Theme>;

export const compactCheckbox = {
  color: "text.secondary",
  p: 0.5,
  "&.Mui-checked": {
    color: "primary.main",
  },
} satisfies SxProps<Theme>;

export const dashedMutedChip = {
  height: 22,
  borderColor: "divider",
  color: "text.secondary",
  borderStyle: "dashed",
  fontSize: 11,
  fontWeight: 600,
} satisfies SxProps<Theme>;

/**
 * Mapped-phase tag: neutral outline for every phase, a primary tint for the
 * phase being configured, so one colour means "this one".
 */
export const mappedTagChip =
  (_phase: string, isSelected: boolean): SxProps<Theme> =>
  (theme) => ({
    height: 24,
    borderRadius: RADIUS_PX.pill,
    bgcolor: isSelected
      ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.2 : 0.12)
      : "transparent",
    borderColor: isSelected ? "transparent" : theme.palette.divider,
    color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
    fontSize: 11,
    fontWeight: 600,
    "& .MuiChip-label": { px: 1 },
  });

export const strongInlineText = {
  fontWeight: 600,
  color: "text.primary",
} satisfies SxProps<Theme>;

export const warningOutlineChip = {
  height: 22,
  borderColor: "warning.main",
  color: "warning.main",
  fontWeight: 600,
} satisfies SxProps<Theme>;

export type TableRowStatus = "error" | "warning" | "success";

/** Urgent rows: amber for an active reminder, red for an overdue date. */
const urgentRowHighlight =
  (isAlarm: boolean): SxProps<Theme> =>
  (theme) => {
    const color = isAlarm ? theme.palette.warning.main : theme.palette.error.main;

    return {
      "&& .MuiTableCell-body, && td": {
        backgroundColor: alpha(
          color,
          theme.palette.mode === "dark" ? 0.055 : 0.025,
        ),
      },
      "&& .MuiTableCell-body:first-of-type, && td:first-of-type": {
        boxShadow: `inset ${isAlarm ? 4 : 3}px 0 0 ${alpha(color, isAlarm ? 0.9 : 0.68)}`,
      },
      "&&:hover .MuiTableCell-body, &&:hover td": {
        backgroundColor: alpha(
          color,
          theme.palette.mode === "dark" ? 0.095 : 0.045,
        ),
      },
    };
  };

export const priorityAlarmRowHighlight = () => urgentRowHighlight(true);

export const priorityDueRowHighlight = () => urgentRowHighlight(false);

export const minWidthZero = {
  minWidth: 0,
} satisfies SxProps<Theme>;

export const pageFill = {
  width: "100%",
  height: {
    xs: "calc(100dvh - 58px)",
    sm: "calc(100dvh - 64px)",
  },
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  bgcolor: "background.default",
} satisfies SxProps<Theme>;

export const tabPanelContent = {
  height: "100%",
  minHeight: 0,
  // Page content role, so the panel lines up with the header and tabs.
  pt: 1.5,
} satisfies SxProps<Theme>;

/** Week picker in the Timesheet header: full size beside Actions, full width on its phone row. */
export const timesheetHeaderWeekSx = {
  minWidth: { xs: 0, sm: 320 },
} satisfies SxProps<Theme>;

export const weekSelectorPanel = (
  fullRowOnMobile: boolean,
): SxProps<Theme> => ({
  display: "grid",
  gridTemplateColumns: "40px minmax(0, 1fr) 40px",
  alignItems: "center",
  gap: 1,
  width: { xs: "100%", md: "auto" },
  minWidth: { md: 320 },
  gridColumn: { xs: fullRowOnMobile ? "1" : "1 / -1", md: "auto" },
  gridRow: { xs: 2, md: "auto" },
  px: 0,
  py: 0.5,
  border: "1px solid",
  borderColor: "divider",
  // Fully rounded so the round previous / next buttons nest inside it.
  borderRadius: RADIUS_PX.pill,
  bgcolor: "background.paper",
});

export const centeredTextGroup = {
  minWidth: 0,
  textAlign: "center",
} satisfies SxProps<Theme>;

export const compactWeekChip = {
  minWidth: 96,
  fontWeight: 600,
  px: 1,
} satisfies SxProps<Theme>;

export const nowrapResponsiveText = {
  whiteSpace: { xs: "normal", sm: "nowrap" },
  lineHeight: 1.25,
} satisfies SxProps<Theme>;

export const headerActionBadge = {
  width: "auto",
  gridColumn: { xs: 2, md: "auto" },
  gridRow: { xs: 1, md: "auto" },
  alignSelf: { xs: "start", md: "center" },
  justifySelf: "end",
  "& .MuiBadge-badge": {
    fontWeight: 600,
    right: 6,
    top: 5,
  },
} satisfies SxProps<Theme>;

export const compactHeaderButton = {
  minWidth: 0,
  fontWeight: 600,
  fontSize: { xs: 12, sm: 13 },
  textTransform: "none",
} satisfies SxProps<Theme>;

export type ActionTone =
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "default";

export const actionMenuItem =
  (color: ActionTone = "default") =>
  (theme: Theme) => {
    const itemColor =
      color === "default"
        ? theme.palette.text.primary
        : theme.palette[color].main;
    return {
      alignItems: "center",
      gap: 1.25,
      mx: 0.75,
      my: 0.2,
      borderRadius: RADIUS_PX.sm,
      border: "1px solid",
      borderColor: "transparent",
      bgcolor: "transparent",
      "& .MuiListItemIcon-root": {
        minWidth: 0,
        width: 34,
        height: 34,
        display: "grid",
        placeItems: "center",
        borderRadius: RADIUS_PX.sm,
        color: itemColor,
        bgcolor:
          color === "default"
            ? theme.palette.action.hover
            : alpha(itemColor, theme.palette.mode === "dark" ? 0.12 : 0.1),
        flexShrink: 0,
      },
      "& .MuiListItemText-root": {
        my: 0,
        minWidth: 0,
      },
      "& .MuiListItemText-primary": {
        color: theme.palette.text.primary,
        fontSize: "0.875rem",
        fontWeight: 600,
        lineHeight: 1.25,
      },
      "& .MuiListItemText-secondary": {
        color: theme.palette.text.secondary,
        fontSize: "0.75rem",
        lineHeight: 1.25,
        mt: 0.25,
      },
      "&:hover": {
        bgcolor: theme.palette.action.hover,
        borderColor: theme.palette.divider,
      },
    };
  };

export const actionMenuSection = {
  px: INSET_X,
  pt: 1,
  pb: 0.35,
  color: "text.secondary",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 0,
  textTransform: "uppercase",
} satisfies SxProps<Theme>;

export const actionMenuPaper = (theme: Theme) =>
  ({
    mt: 0.8,
    width: "min(384px, calc(100vw - 20px))",
    maxHeight: "calc(100dvh - 120px)",
    borderRadius: RADIUS_PX.md,
    border: "1px solid",
    borderColor: "divider",
    boxShadow:
      theme.palette.mode === "dark"
        ? ELEVATION.dark.menu
        : ELEVATION.light.menu,
    overflowX: "hidden",
    overflowY: "auto",
    py: 0.5,
    "& .MuiMenuItem-root": {
      minHeight: 52,
      px: 1,
      py: 0.65,
      transition: "background-color 0.15s ease",
    },
  }) satisfies SxProps<Theme>;

export const compactDivider = {
  my: 0.5,
} satisfies SxProps<Theme>;

export const errorDialogContent = {
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
  minHeight: 112,
} satisfies SxProps<Theme>;

export const errorDialogMessage = {
  alignItems: "center",
  display: "flex",
  gap: 1.5,
  textAlign: "center",
} satisfies SxProps<Theme>;

export const errorDialogIcon = {
  flexShrink: 0,
  fontSize: 38,
} satisfies SxProps<Theme>;

export const preLineText = {
  whiteSpace: "pre-line",
} satisfies SxProps<Theme>;

export const listItemReset = {
  listStyle: "none",
} satisfies SxProps<Theme>;

/**
 * Sidebar (navigation) styles.
 *
 * Contrast first: labels use the theme's strong text colour (≈9:1 on the
 * panel in both modes) instead of a translucent tint; icons are quieter so the
 * words lead. The selected item is a tinted pill (a circle in the collapsed rail) with
 * dark-on-tint (light mode) / light-on-tint (dark mode) text. Hover never
 * moves the item, and keyboard focus is always visible.
 */
export const sidebarContent = {
  px: 0.75,
  pt: 0.5,
  pb: 1,
} satisfies SxProps<Theme>;
export const sidebarSection = (height: number) => (theme: Theme) => ({
  alignItems: "flex-end",
  display: "flex",
  height,
  mt: 0.75,
  px: 1,
  pb: 0.25,
  color: theme.palette.text.secondary,
  fontSize: "0.6875rem",
  fontWeight: 600,
  letterSpacing: 0.8,
  lineHeight: 1,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  transformOrigin: "left center",
  transition: theme.transitions.create(
    ["clip-path", "height", "opacity", "padding", "transform"],
    { duration: theme.transitions.duration.shorter },
  ),
});
export const sidebarSectionDivider = () =>
  ({
    position: "absolute",
    bottom: 4,
    left: "50%",
    transform: "translateX(-50%)",
    width: 24,
    opacity: 0,
    borderColor: "divider",
    pointerEvents: "none",
    transition: "opacity 160ms ease",
  }) satisfies SxProps<Theme>;
/** Text/icon colour of the selected item: strong primary that reads on its tint. */
const sidebarSelectedColor = (theme: Theme) =>
  theme.palette.mode === "dark"
    ? theme.palette.primary.light
    : theme.palette.primary.dark;

export const sidebarItem =
  (selected: boolean): SxProps<Theme> =>
  (theme) => {
    const isDark = theme.palette.mode === "dark";
    return {
      position: "relative",
      alignItems: "center",
      minHeight: 36,
      my: 0.25,
      p: 0,
      // Expanded: the shared control radius; the collapsed rail turns it
      // into a circle.
      borderRadius: RADIUS_PX.sm,
      overflow: "hidden",
      color: theme.palette.text.primary,
      transition: theme.transitions.create(["background-color", "color"], {
        duration: theme.transitions.duration.shortest,
      }),
      "&:hover": {
        backgroundColor: selected
          ? alpha(theme.palette.primary.main, isDark ? 0.156 : 0.16)
          : alpha(theme.palette.text.primary, isDark ? 0.07 : 0.05),
      },
      // Hover is a neutral fill only; colour is reserved for the selection.
      "&:hover .MuiListItemIcon-root": {
        color: selected
          ? sidebarSelectedColor(theme)
          : theme.palette.text.primary,
      },
      "&.Mui-focusVisible": {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: -2,
        backgroundColor: alpha(
          theme.palette.text.primary,
          isDark ? 0.07 : 0.05,
        ),
      },
      "&.Mui-selected, &.Mui-selected:hover": {
        color: sidebarSelectedColor(theme),
      },
      ...(selected && {
        backgroundColor: alpha(
          theme.palette.primary.main,
          isDark ? 0.12 : 0.12,
        ),
        "&.Mui-selected": {
          backgroundColor: alpha(
            theme.palette.primary.main,
            isDark ? 0.12 : 0.12,
          ),
        },
        "&.Mui-selected:hover": {
          backgroundColor: alpha(
            theme.palette.primary.main,
            isDark ? 0.156 : 0.16,
          ),
        },
      }),
    };
  };
export const sidebarIcon =
  (selected: boolean): SxProps<Theme> =>
  (theme) => ({
    alignItems: "center",
    justifyContent: "center",
    // 52px keeps icons centred in the 64px collapsed rail.
    minWidth: 52,
    color: selected
      ? sidebarSelectedColor(theme)
      : theme.palette.text.secondary,
    transition: theme.transitions.create("color", {
      duration: theme.transitions.duration.shortest,
    }),
    "& .MuiSvgIcon-root": {
      width: 18,
      height: 18,
    },
  });
export const sidebarItemText =
  (selected: boolean): SxProps<Theme> =>
  (theme) => ({
    my: 0,
    minWidth: 0,
    pr: 1,
    color: selected
      ? sidebarSelectedColor(theme)
      : theme.palette.mode === "dark"
        ? alpha(theme.palette.text.primary, 0.88)
        : theme.palette.text.primary,
    "& .MuiTypography-root": {
      fontSize: "0.875rem",
      // Same weight selected or not, so the label never changes width.
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  });
/**
 * App chrome: header and sidebar share the raised surface; the page sits in
 * an inset, rounded content panel on the canvas colour (see appMain).
 */
export const appShell = {
  bgcolor: "background.paper",
  display: "flex",
  flexDirection: "column",
  height: "100svh",
  minHeight: "100svh",
  overflow: "hidden",
  "@supports (height: 100dvh)": {
    height: "100dvh",
    minHeight: "100dvh",
  },
} satisfies SxProps<Theme>;

export const appShellBody = {
  display: "flex",
  flex: "1 1 auto",
  minHeight: 0,
  overflow: "hidden",
} satisfies SxProps<Theme>;

/**
 * The <Outlet /> content panel. From md it is inset from the window edges
 * with a 16px radius and a hairline edge, so pages read as one calm surface
 * set into the app chrome. Phones keep it edge to edge. Menus, popovers and
 * dialogs render in portals, so the rounded clip never cuts them off.
 */
export const appMain = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  overflowX: "hidden",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  bgcolor: "background.default",
  mx: { xs: 0.5, md: 1 },
  my: { xs: 0.5, md: 1 },
  // One inset for every page; page sections add no side padding of their own.
  p: 1.5,
  borderRadius: { xs: RADIUS_PX.lg, md: RADIUS_PX.lg },
  border: { xs: 0, md: "1px solid" },
  borderColor: { md: "divider" },
  "&:focus": { outline: "none" },
} satisfies SxProps<Theme>;

/** "Skip to main content": hidden above the viewport until focused. */
export const skipLinkSx = (theme: Theme) => ({
  position: "absolute",
  left: 8,
  top: -48,
  zIndex: theme.zIndex.tooltip + 1,
  px: 1.5,
  py: 1,
  borderRadius: RADIUS_PX.md,
  bgcolor: "primary.main",
  color: "primary.contrastText",
  fontWeight: 600,
  textDecoration: "none",
  transition: `top ${MOTION.fast} ${MOTION.easing}`,
  "&:focus": { top: 8 },
});

export const positionRelativeSx = { position: "relative" } satisfies SxProps<Theme>;

/** App bar row: same raised surface as the sidebar, no rule beneath it. */
export const headerBarSx = {
  display: "flex",
  alignItems: "center",
  minHeight: { xs: 58, sm: 64 },
  flexShrink: 0,
  px: { xs: 0.75, sm: 1 },
  gap: { xs: 0.25, sm: 0.75 },
  bgcolor: "background.paper",
} satisfies SxProps<Theme>;

export const headerLogoLinkSx = {
  display: "inline-flex",
  alignItems: "center",
  flexShrink: 0,
} satisfies SxProps<Theme>;

export const headerLogoImageSx = {
  width: { xs: 64, sm: 84, md: 96 },
  height: 32,
  objectFit: "contain",
} satisfies SxProps<Theme>;

export const sidebarNav =
  (open: boolean, width: number, collapsedWidth: number): SxProps<Theme> =>
  (theme) => ({
    display: { xs: "none", md: "block" },
    width: open ? width : collapsedWidth,
    flexShrink: 0,
    position: "relative",
    transformOrigin: "left center",
    transition: theme.transitions.create(["width"], {
      duration: theme.transitions.duration.shorter,
    }),
    ...(!open && {
      // Collapsed rail: the nav keeps its narrow width (the page never
      // reflows) and sits above page content, so the expanded panel can
      // overlap it. Below the app bar, menus and dialogs.
      zIndex: theme.zIndex.appBar - 1,
      // Hover (mouse only) or keyboard focus opens the full sidebar as an
      // overlay; touch screens are left alone so a tap never sticks it open.
      ...(() => {
        const rules = (state: string) => {
          const expanded = (child: string) => `${state} ${child}`;
          return {
            [expanded(".sidebar-panel")]: {
              width,
              boxShadow:
                theme.palette.mode === "dark"
                  ? ELEVATION.dark.sidebar
                  : ELEVATION.light.sidebar,
            },
            [expanded(".MuiListItemButton-root")]: {
              justifyContent: "flex-start",
              width: "100%",
              height: "auto",
              minHeight: 36,
              mx: 0,
              borderRadius: RADIUS_PX.pill,
            },
            [expanded(".MuiListItemIcon-root")]: {
              minWidth: 52,
            },
            [expanded(".MuiListItemText-root")]: {
              clipPath: "inset(0 0 0 0)",
              opacity: 1,
              transform: "translateX(0)",
              transitionDelay: "40ms",
            },
            [expanded(".sidebar-section-label")]: {
              alignItems: "center",
              clipPath: "inset(0 0 0 0)",
              display: "flex",
              height: 22,
              opacity: 1,
              overflow: "visible",
              px: 1,
              pb: 0.5,
              transform: "translateX(0)",
              transitionDelay: "40ms",
            },
            [expanded(".sidebar-section-divider")]: {
              opacity: 0,
            },
          };
        };
        return {
          // Keyboard focus only: a mouse click also focuses the link, and
          // :focus-within would keep the overlay open after the pointer
          // leaves. :focus-visible matches keyboard focus, not clicks.
          ...rules("&:has(:focus-visible)"),
          "@media (hover: hover) and (pointer: fine)": rules("&:hover"),
        };
      })(),
    }),
  });

export const sidebarPanel =
  (
    open: boolean,
    width: number,
    collapsedWidth: number,
    sectionHeight: number,
  ) =>
  (theme: Theme) => ({
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: open ? width : collapsedWidth,
    overflowX: "hidden",
    overflowY: "auto",
    bgcolor: "background.paper",
    transformOrigin: "left center",
    willChange: "width",
    scrollbarWidth: "thin",
    scrollbarColor: `${alpha(theme.palette.text.secondary, 0.35)} transparent`,
    "&::-webkit-scrollbar": { width: 6 },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: alpha(theme.palette.text.secondary, 0.35),
      borderRadius: 6,
    },
    "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
    transition: theme.transitions.create(["width", "box-shadow"], {
      duration: theme.transitions.duration.shorter,
    }),
    ...(!open && {
      // Collapsed rail: each item is a borderless circle around its icon.
      "& .MuiListItemButton-root": {
        justifyContent: "center",
        mx: "auto",
        px: 0,
        width: 40,
        height: 40,
        minHeight: 40,
        borderRadius: RADIUS.full,
        transition: theme.transitions.create(
          ["width", "border-radius", "background-color", "color"],
          { duration: theme.transitions.duration.shorter },
        ),
      },
      "& .MuiListItemIcon-root": {
        minWidth: 40,
        p: 0,
      },
      "& .MuiListItemText-root": {
        clipPath: "inset(0 100% 0 0)",
        opacity: 0,
        transform: "translateX(-10px)",
        transformOrigin: "left center",
        p: 0,
        whiteSpace: "nowrap",
        transition: theme.transitions.create(
          ["clip-path", "opacity", "transform"],
          {
            duration: theme.transitions.duration.shorter,
          },
        ),
        transitionDelay: "0ms",
      },
      "& .sidebar-section-label": {
        clipPath: "inset(0 100% 0 0)",
        height: sectionHeight,
        opacity: 0,
        overflow: "hidden",
        p: 0,
        transform: "translateX(-10px)",
        transformOrigin: "left center",
      },
      "& .sidebar-section-divider": {
        opacity: 1,
      },
    }),
  });

export const mobileDrawer = {
  display: { xs: "block", md: "none" },
  "& .MuiDrawer-paper": {
    boxSizing: "border-box",
    width: "min(86vw, 320px)",
    overflowX: "hidden",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "thin",
    borderRight: "1px solid",
    borderColor: "divider",
  },
} satisfies SxProps<Theme>;
const statusColors: Record<string, string> = STATUS_COLORS;

const defaultStatusColor = STATUS_COLOR_DEFAULT;

function normalizeStatus(status: unknown) {
  return String(status ?? "")
    .replace(/^modified-/i, "")
    .trim()
    .toLowerCase();
}

export function getStatusColor(status: unknown) {
  return statusColors[normalizeStatus(status)] ?? defaultStatusColor;
}

export function formatStatusLabel(status: unknown) {
  const normalizedStatus = String(status ?? "")
    .replace(/^modified-/i, "")
    .trim()
    // Status slugs use hyphens as word separators, but deadline statuses
    // contain ISO dates (for example, "Due by 2026-10-19").
    .replace(/-/g, (hyphen, index, value) =>
      /\d/.test(value[index - 1] ?? "") && /\d/.test(value[index + 1] ?? "")
        ? hyphen
        : " ",
    );

  return normalizedStatus;
}

/**
 * Opaque table-header surface: paper plus a tint one step darker than the
 * even-row zebra (see alternatingRowSx). Same values as the MuiTableCell
 * head override, for tables that style their header cells directly.
 */
const tableHeaderTint = (theme: Theme) =>
  alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.07 : 0.05);

const tableHeaderBackground = (theme: Theme) => ({
  backgroundColor: theme.palette.background.paper,
  backgroundImage: `linear-gradient(${tableHeaderTint(theme)}, ${tableHeaderTint(theme)})`,
});

export const tableHeadSx = (theme: Theme) => ({
  ...tableHeaderBackground(theme),
  isolation: "isolate",
  opacity: 1,
  position: "relative",
  zIndex: 20,
  "& .MuiTableCell-head": {
    ...tableHeaderBackground(theme),
    opacity: 1,
    position: "sticky",
    top: 0,
    zIndex: 21,
  },
});

export const tableHeaderCellSx = (theme: Theme) => ({
  ...tableHeaderBackground(theme),
  borderBottom: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.secondary,
  fontSize: 12,
  fontWeight: 600,
  px: INSET_X,
  py: INSET_Y,
  opacity: 1,
  position: "sticky",
  top: 0,
  textAlign: "left",
  zIndex: 21,
  "& .MuiTableSortLabel-root": {
    color: "inherit",
    fontWeight: 600,
    justifyContent: "flex-start",
  },
  "& .MuiTableSortLabel-root.Mui-active, & .MuiTableSortLabel-root.Mui-active .MuiTableSortLabel-icon":
    {
      color: theme.palette.text.primary,
    },
});

export const stickyTableCellSx = (theme: Theme) => ({
  backgroundColor: theme.palette.background.paper,
});
export const stickyFirstColumnCell = (theme: Theme) => ({
  ...stickyTableCellSx(theme),
  position: "sticky",
  left: 0,
  zIndex: 3,
  bgcolor: theme.palette.background.paper,
  boxShadow: `1px 0 0 ${theme.palette.divider}`,
  "& > *": {
    position: "relative",
    zIndex: 1,
  },
});

export const stickyFirstColumnHeaderCell = (theme: Theme) => ({
  ...tableHeaderCellSx(theme),
  position: "sticky",
  left: 0,
  // A fixed header corner must sit above the remaining sticky headers while
  // they move underneath it during horizontal scrolling.
  zIndex: "30 !important",
  boxShadow: `1px 0 0 ${theme.palette.divider}`,
});

export const alternatingRowSx = (theme: Theme) => ({
  "&:nth-of-type(even) td": {
    backgroundColor:
      alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.025 : 0.018),
  },
});

/** Shared scrollable table frame. Add only view-specific dimensions locally. */
export const tableContainerSx: SxProps<Theme> = {
  boxShadow: "none",
  borderRadius: RADIUS_PX.md,
  flex: "1 1 auto",
  minHeight: 0,
  height: "100%",
  width: "100%",
  maxWidth: "100%",
  overflowX: "auto",
};

/** Shared table geometry; cell and header design comes from the app theme. */
export const tableSx: SxProps<Theme> = {
  borderCollapse: "separate",
  borderSpacing: 0,
  tableLayout: "fixed",
  width: "100%",
};

export const tableRow = (clickable?: boolean) => (theme: Theme) => ({
  cursor: clickable ? "pointer" : "default",
  "&:last-child td, &:last-child th": { border: 0 },
  "& .MuiTableCell-root": {
    transition: theme.transitions.create(["background-color", "box-shadow"], {
      duration: theme.transitions.duration.shortest,
    }),
  },
  ...alternatingRowSx(theme),
  "&:hover .MuiTableCell-body": {
    backgroundColor: alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.036 : 0.045,
    ),
  },
  "&.Mui-selected .MuiTableCell-body, &[aria-selected='true'] .MuiTableCell-body":
    {
      backgroundColor: alpha(
        theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.06 : 0.095,
      ),
    },
  "&.Mui-selected:hover .MuiTableCell-body, &[aria-selected='true']:hover .MuiTableCell-body":
    {
      backgroundColor: alpha(
        theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.084 : 0.13,
      ),
    },
  "&.Mui-error .MuiTableCell-body, &[data-status='error'] .MuiTableCell-body": {
    backgroundColor: alpha(
      theme.palette.error.main,
      theme.palette.mode === "dark" ? 0.14 : 0.075,
    ),
  },
  "&.Mui-error:hover .MuiTableCell-body, &[data-status='error']:hover .MuiTableCell-body":
    {
      backgroundColor: alpha(
        theme.palette.error.main,
        theme.palette.mode === "dark" ? 0.19 : 0.105,
      ),
    },
  "&.Mui-warning .MuiTableCell-body, &[data-status='warning'] .MuiTableCell-body":
    {
      backgroundColor: alpha(
        theme.palette.warning.main,
        theme.palette.mode === "dark" ? 0.15 : 0.08,
      ),
    },
  "&.Mui-warning:hover .MuiTableCell-body, &[data-status='warning']:hover .MuiTableCell-body":
    {
      backgroundColor: alpha(
        theme.palette.warning.main,
        theme.palette.mode === "dark" ? 0.2 : 0.11,
      ),
    },
  "&.Mui-success .MuiTableCell-body, &[data-status='success'] .MuiTableCell-body":
    {
      backgroundColor: alpha(
        theme.palette.success.main,
        theme.palette.mode === "dark" ? 0.14 : 0.075,
      ),
    },
  "&.Mui-success:hover .MuiTableCell-body, &[data-status='success']:hover .MuiTableCell-body":
    {
      backgroundColor: alpha(
        theme.palette.success.main,
        theme.palette.mode === "dark" ? 0.19 : 0.105,
      ),
    },
});

const tableCell = {
  py: INSET_Y,
  px: INSET_X,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  verticalAlign: "middle",
};

// components/appBar/header.callback.styles.ts
export const notificationMenuHeaderSx =
  ({ alpha }: AlphaStyleArgs): SxProps<Theme> =>
  (theme) => ({
    ...insetSx,
    background:
      theme.palette.mode === "dark"
        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)}, ${alpha(theme.palette.secondary.main, 0.08)})`
        : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.08)})`,
  });

export const notificationMenuHeaderIconSx =
  ({ alpha }: AlphaStyleArgs): SxProps<Theme> =>
  (theme) => ({
    width: 38,
    height: 38,
    borderRadius: RADIUS_PX.md,
    display: "grid",
    placeItems: "center",
    bgcolor: alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.108 : 0.1,
    ),
    color: "primary.main",
    flexShrink: 0,
  });

export const notificationMenuSelfTicketItemSx =
  ({ alpha }: AlphaStyleArgs): SxProps<Theme> =>
  (theme) => ({
    m: 1,
    mb: 0.5,
    px: INSET_X,
    py: INSET_Y,
    gap: 1.25,
    borderRadius: RADIUS_PX.md,
    "&:hover": {
      bgcolor: alpha(
        theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.096 : 0.08,
      ),
    },
  });

export const notificationMenuSelfTicketIconSx =
  ({ alpha }: AlphaStyleArgs): SxProps<Theme> =>
  (theme) => ({
    width: 34,
    height: 34,
    borderRadius: RADIUS_PX.md,
    display: "grid",
    placeItems: "center",
    bgcolor: alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.108 : 0.1,
    ),
    color: "primary.main",
    flexShrink: 0,
  });

export const notificationMenuTicketItemSx =
  ({ alpha }: AlphaStyleArgs): SxProps<Theme> =>
  (theme) => ({
    m: 1,
    mt: 0.5,
    px: INSET_X,
    py: INSET_Y,
    gap: 1.25,
    borderRadius: RADIUS_PX.md,
    "&:hover": {
      bgcolor: alpha(
        theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.096 : 0.08,
      ),
    },
  });

export const notificationMenuTicketIconSx =
  ({ alpha }: AlphaStyleArgs): SxProps<Theme> =>
  (theme) => ({
    width: 34,
    height: 34,
    borderRadius: RADIUS_PX.md,
    display: "grid",
    placeItems: "center",
    bgcolor: alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.108 : 0.1,
    ),
    color: "primary.main",
    flexShrink: 0,
  });

/** App-bar icon actions: neutral glyphs, a neutral fill on hover. */
export const headerIconButtonSx = (theme: Theme) => ({
  color: "text.secondary",
  "&:hover": {
    color: "text.primary",
    bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.1 : 0.06),
  },
});

/** App-bar theme toggle: the sun glyph in sun gold, the moon in moon blue. */
export const headerThemeToggleSx = (theme: Theme) => {
  const color =
    theme.palette.mode === "dark" ? THEME_TOGGLE_COLORS.sun : THEME_TOGGLE_COLORS.moon;
  return {
    color,
    "&:hover": {
      color,
      bgcolor: alpha(color, theme.palette.mode === "dark" ? 0.16 : 0.12),
    },
  };
};

/** Sidebar toggle (hamburger) at the start of the app bar. */
export const headerNavButtonSx: SxProps<Theme> = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  alignSelf: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  p: 0,
  mr: 0.5,
  color: "text.secondary",
  "&:hover": {
    color: "text.primary",
    bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.1 : 0.06),
  },
});

/* Account / notification menus: surface, radius and shadow come from MuiMenu. */
export const headerNotificationMenuPaperSx: SxProps<Theme> = {
  width: "min(360px, calc(100vw - 24px))",
  mt: 1.25,
  overflow: "hidden",
};

export const headerProfileMenuPaperSx: SxProps<Theme> = {
  width: "min(420px, calc(100vw - 24px))",
  maxHeight: "calc(100dvh - 96px)",
  mt: 2.5,
  overflow: "hidden",
};

export const headerMenuListSx: SxProps<Theme> = { p: 0 };

/* ---- App-bar account trigger ("Account settings") ---------------------- */

/**
 * Account capsule: avatar, name / role and a chevron in one pill with a faint
 * hairline. Hover deepens the fill; while the menu is open it takes a light
 * brand tint so it reads as the active control. Phones show avatar + chevron.
 */
export const headerAccountTriggerSx =
  (open = false): SxProps<Theme> =>
  (theme) => {
    const isDark = theme.palette.mode === "dark";
    const primary = theme.palette.primary.main;
    return {
      minWidth: 0,
      minHeight: 44,
      ml: { xs: 0.5, sm: 1.25 },
      px: { xs: 0.5, md: 1 },
      py: 0.375,
      gap: 1.25,
      borderRadius: RADIUS_PX.pill,
      border: "1px solid",
      borderColor: open
        ? alpha(primary, isDark ? 0.5 : 0.35)
        : alpha(theme.palette.text.primary, isDark ? 0.12 : 0.1),
      bgcolor: open
        ? alpha(primary, isDark ? 0.14 : 0.08)
        : alpha(theme.palette.text.primary, isDark ? 0.04 : 0.025),
      color: "text.primary",
      textTransform: "none",
      transition: theme.transitions.create(
        ["background-color", "border-color", "box-shadow"],
        { duration: theme.transitions.duration.shortest },
      ),
      "&:hover": {
        bgcolor: open
          ? alpha(primary, isDark ? 0.18 : 0.11)
          : alpha(theme.palette.text.primary, isDark ? 0.08 : 0.05),
        borderColor: open
          ? alpha(primary, isDark ? 0.6 : 0.45)
          : alpha(theme.palette.text.primary, isDark ? 0.2 : 0.16),
      },
      "&.Mui-focusVisible": {
        boxShadow: `0 0 0 3px ${alpha(primary, 0.35)}`,
      },
      "& .MuiButton-endIcon": { ml: { xs: 0.25, md: 0.5 }, mr: 0 },
    };
  };

/** Brand-gradient avatar with a thin ring, separated from the capsule fill. */
export const headerAccountAvatarSx: SxProps<Theme> = (theme) => ({
  width: 34,
  height: 34,
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: "0.02em",
  color: theme.palette.primary.contrastText,
  backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main} 55%, ${theme.palette.primary.dark})`,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 3px ${alpha(
    theme.palette.primary.main,
    0.35,
  )}`,
});

export const headerAccountTextSx: SxProps<Theme> = {
  display: { xs: "none", md: "flex" },
  flexDirection: "column",
  gap: 0.125,
  minWidth: 0,
  maxWidth: 168,
  textAlign: "left",
};

export const headerAccountNameSx: SxProps<Theme> = {
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.2,
  letterSpacing: "-0.005em",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export const headerAccountRoleSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: 12,
  fontWeight: 500,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

/** Chevron: muted at rest, brand-coloured and flipped while the menu is open. */
export const headerAccountChevronSx =
  (open: boolean): SxProps<Theme> =>
  (theme) => ({
    fontSize: 18,
    color: open ? theme.palette.primary.main : theme.palette.text.secondary,
    transform: open ? "rotate(180deg)" : "rotate(0deg)",
    transition: theme.transitions.create(["transform", "color"], {
      duration: theme.transitions.duration.shortest,
    }),
  });

export const headerAvatarSx: SxProps<Theme> = {
  width: { xs: 32, sm: 34 },
  height: { xs: 32, sm: 34 },
  bgcolor: "primary.main",
  fontWeight: 600,
  fontSize: { xs: 14, sm: 15 },
};
export const notificationEmptyStateSx: SxProps<Theme> = {
  px: INSET_X,
  py: INSET_Y,
  textAlign: "center",
};

export const notificationItemTextSx: SxProps<Theme> = { flex: 1 };

export const profileUsernameSx: SxProps<Theme> = {
  display: "block",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0,
};

export const profileTruncatedTextSx: SxProps<Theme> = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  lineHeight: 1.2,
};

export const appBarHeaderProfileTextSx: SxProps<Theme> = {
  minWidth: 0,
  flex: 1,
};

export const appBarHeaderProfileBodySx: SxProps<Theme> = {
  maxHeight: "min(58dvh, 520px)",
  overflowY: "auto",
  ...insetSx,
};

export const appBarHeaderProfileCardSx =
  ({ alpha }: AlphaStyleArgs): SxProps<Theme> =>
  (theme) => ({
    display: "grid",
    gap: 1.5,
    borderRadius: RADIUS_PX.md,
    bgcolor: alpha(
      theme.palette.background.paper,
      theme.palette.mode === "dark" ? 0.76 : 0.96,
    ),
  });

export const appBarHeaderProfileHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  minWidth: 0,
};

export const appBarHeaderProfileMetaSx: SxProps<Theme> = { pt: 0.25 };

export const appBarHeaderProfileDetailRowSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: "28px 88px minmax(0, 1fr)",
  alignItems: "center",
  columnGap: 1,
  minWidth: 0,
};

export const appBarHeaderProfileInfoIconSx =
  ({
    color = "primary",
  }: {
    color?: "primary" | "secondary" | "info";
  }): SxProps<Theme> =>
  (theme) => {
    const paletteColor =
      color === "info"
        ? theme.palette.info.main
        : color === "secondary"
          ? theme.palette.secondary.main
          : theme.palette.primary.main;

    return {
      width: 28,
      height: 28,
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      color: paletteColor,
    };
  };

export const appBarHeaderProfileValueSx: SxProps<Theme> = {
  minWidth: 0,
  flex: 1,
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 0.75,
};

/** Active-filter count inside the (contained) Filters button. */
export const filterButtonCountSx: SxProps<Theme> = (theme) => ({
  ml: 0.75,
  minWidth: 20,
  height: 20,
  px: 0.5,
  borderRadius: RADIUS_PX.pill,
  display: "inline-grid",
  placeItems: "center",
  fontSize: 11,
  fontWeight: 600,
  color: theme.palette.primary.main,
  bgcolor: theme.palette.primary.contrastText,
});

/** Header action that moves into the account menu on phones. */
export const headerDesktopActionSx = {
  display: { xs: "none", sm: "inline-flex" },
} as const;
/** Account-menu button shown only on phones (its header icon is hidden there). */
export const headerPhoneMenuButtonSx: SxProps<Theme> = {
  whiteSpace: "nowrap",
  display: { xs: "flex", sm: "none" },
};

export const appBarHeaderProfileFooterButtonSx: SxProps<Theme> = {
  whiteSpace: "nowrap",
};

// components/common/MobileRowCard.tsx — a table row as a phone card
export const mobileRowCardSx = ({
  accent,
  clickable,
}: {
  accent: string;
  clickable: boolean;
}): SxProps<Theme> => ({
  width: "100%",
  px: 1.5,
  py: 1.25,
  textAlign: "left",
  color: "text.primary",
  bgcolor: "background.paper",
  borderRadius: RADIUS_PX.md,
  borderLeft: "3px solid",
  borderLeftColor: accent,
  cursor: clickable ? "pointer" : "default",
  display: "flex",
  flexDirection: "column",
  gap: 1,
});

export const mobileRowCardHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1,
  minWidth: 0,
  fontWeight: 600,
  fontSize: 14,
  "& > :first-of-type": { minWidth: 0, overflowWrap: "anywhere" },
};

export const mobileRowCardFieldsSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: "minmax(88px, 0.8fr) minmax(0, 1.6fr)",
  columnGap: 1.25,
  rowGap: 0.75,
  alignItems: "start",
};

/** One label/value pair; its children sit directly in the fields grid. */
export const mobileRowCardFieldPairSx: SxProps<Theme> = { display: "contents" };

export const mobileRowCardLabelSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1.4,
};

export const mobileRowCardValueSx: SxProps<Theme> = {
  minWidth: 0,
  fontSize: 13,
  lineHeight: 1.4,
  overflowWrap: "anywhere",
  "& .MuiIconButton-root": { width: 40, height: 40 },
};

export const mobileRowCardFooterSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1,
  minHeight: 32,
};

export const mobileRowCardMoreSx: SxProps<Theme> = {
  px: 0.5,
  minWidth: 0,
  fontSize: 12,
  fontWeight: 600,
  textTransform: "none",
};

// components/common/StatusPill.tsx — the one status / priority look app-wide
const pillBaseSx = {
  display: "inline-flex",
  alignItems: "center",
  alignSelf: "flex-start",
  gap: 0.75,
  maxWidth: "100%",
  px: 1,
  py: 0.25,
  borderRadius: RADIUS_PX.pill,
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1.4,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
} as const;

/** Tinted pill with a leading dot, coloured by status. */
export const statusPillSx =
  (color: string): SxProps<Theme> =>
  (theme) => ({
    ...pillBaseSx,
    // Keep status words readable in dark mode; the semantic dot and tinted
    // surface retain the status color without relying on low-contrast text.
    color: theme.palette.mode === "dark" ? theme.palette.text.primary : color,
    bgcolor: alpha(color, theme.palette.mode === "dark" ? 0.22 : 0.12),
    "&::before": {
      content: '""',
      flexShrink: 0,
      width: 6,
      height: 6,
      borderRadius: "50%",
      bgcolor: color,
    },
  });

/** Tinted pill coloured by priority (no dot, so it reads apart from status). */
export const priorityPillSx =
  (priority: unknown): SxProps<Theme> =>
  (theme) => {
    const palette = getPriorityPalette(theme, priority);
    return { ...pillBaseSx, color: palette.text, bgcolor: palette.bg };
  };

/** Timesheet grid: same footprint as the expand toggle, for rows with nothing to expand. */
export const expandToggleSpacerSx = {
  width: 40,
  flexShrink: 0,
} satisfies SxProps<Theme>;

// components/common/TicketPageParts.tsx — Tickets target-date calendar
export const calendarShellSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
  height: "100%",
  minHeight: 0,
  overflowY: { xs: "auto", lg: "hidden" },
};

/** One row at every width: [prev next  Month / count] ... [Today] [Overdue]. */
export const calendarToolbarSx: SxProps<Theme> = (theme) => ({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: { xs: 0.75, md: 2 },
  // A flat row above the grid; the grid is the only framed surface.
  py: { xs: 0.25, sm: 0.5 },
  color: theme.palette.text.primary,
});

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

export const calendarTitleBlockSx: SxProps<Theme> = {
  display: "flex",
  alignItems: { xs: "flex-start", md: "baseline" },
  flexDirection: { xs: "column", md: "row" },
  gap: { xs: 0, md: 0.75 },
  minWidth: 0,
  "& > *": { maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
};

export const calendarToolbarActionsSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: { xs: 0.5, sm: 1 },
  minWidth: 0,
  flexWrap: "nowrap",
  "& .MuiButton-root": { minWidth: 0, px: 1 },
};

/** Phones show only the count beside the icon; the label stays in aria-label. */
export const calendarOverdueButtonSx: SxProps<Theme> = {
  minWidth: 0,
  px: 1,
  ...TABULAR_NUMS,
  "& .MuiButton-startIcon": { mr: { xs: 0.5, sm: 1 } },
};

export const calendarHeadingSx: SxProps<Theme> = {
  fontSize: { xs: 16, sm: 18 },
  fontWeight: 600,
  letterSpacing: "-0.01em",
  color: "text.primary",
  whiteSpace: "nowrap",
  ...TABULAR_NUMS,
};

export const calendarCountSx: SxProps<Theme> = {
  fontSize: { xs: 12, sm: 13 },
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
};

const calendarPanelBase = (theme: Theme) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: RADIUS_PX.md,
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

export const calendarWeekRowSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  minHeight: 0,
};

export const calendarWeekdaySx: SxProps<Theme> = (theme) => ({
  py: { xs: 0.5, sm: 0.75 },
  textAlign: "center",
  fontSize: 12,
  fontWeight: 600,
  color: "text.secondary",
  borderBottom: "1px solid",
  borderColor: "divider",
  bgcolor: alpha(
    theme.palette.text.primary,
    theme.palette.mode === "dark" ? 0.025 : 0.018,
  ),
});

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

export const calendarCellActionsSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 0.25,
  minWidth: 0,
};

export const calendarCreateButtonSx: SxProps<Theme> = (theme) => ({
  width: 26,
  height: 26,
  minWidth: 0,
  minHeight: 0,
  p: 0.5,
  flexShrink: 0,
  // Quiet until the day is hovered / selected, so a month of future dates
  // doesn't fill with primary-coloured marks.
  color: "text.secondary",
  opacity: 0.55,
  transition: `opacity ${MOTION.fast} ${MOTION.easing}, color ${MOTION.fast} ${MOTION.easing}`,
  "& .MuiSvgIcon-root": { fontSize: 20 },
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
  fontSize: 13,
  fontWeight: 600,
  color: "text.secondary",
  ...TABULAR_NUMS,
};

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
  fontSize: 13,
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
  fontSize: 12,
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
      fontSize: 12,
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
      "& .MuiSvgIcon-root": { gridArea: "mark", fontSize: 13, flexShrink: 0 },
    };
  };

export const calendarChipDotSx = (statusColor: string): SxProps<Theme> => ({
  gridArea: "mark",
  width: 6,
  height: 6,
  flexShrink: 0,
  borderRadius: "50%",
  bgcolor: statusColor,
});

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
  fontSize: 12,
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

export const calendarPanelHeaderSx: SxProps<Theme> = (theme) => ({
  position: "sticky",
  top: 0,
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1,
  px: 1.5,
  py: 1,
  minHeight: 52,
  bgcolor: theme.palette.background.paper,
  borderBottom: "1px solid",
  borderColor: "divider",
});

export const calendarPanelTitleBlockSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
};

/** Touch-sized create action for the selected day (all breakpoints). */
export const calendarPanelCreateSx: SxProps<Theme> = {
  flexShrink: 0,
  minHeight: 36,
  whiteSpace: "nowrap",
};

export const calendarPanelTitleSx: SxProps<Theme> = {
  fontSize: 14,
  p: 0,
  fontWeight: 600,
  color: "text.primary",
  ...TABULAR_NUMS,
};

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
  fontSize: 13,
  fontWeight: 600,
  color: "text.primary",
  ...TABULAR_NUMS,
  bgcolor: theme.palette.background.paper,
  backgroundImage: `linear-gradient(${alpha(theme.palette.text.primary, 0.03)}, ${alpha(theme.palette.text.primary, 0.03)})`,
  borderTop: "1px solid",
  borderBottom: "1px solid",
  borderColor: "divider",
});

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

export const calendarAgendaTitleSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 0.25,
  minWidth: 0,
  fontSize: 14,
  fontWeight: 600,
  color: "text.primary",
  "& > span:first-of-type": { fontSize: 12, color: "text.secondary" },
  "& > span:last-of-type": {
    width: "100%",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};

export const calendarAgendaMetaSx: SxProps<Theme> = {
  fontSize: 13,
  color: "text.secondary",
  ...TABULAR_NUMS,
};

export const calendarEmptySx: SxProps<Theme> = {
  px: 2,
  py: 3,
  fontSize: 13,
  color: "text.secondary",
  textAlign: "center",
};

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
    fontSize: 30,
    color: alpha(theme.palette.primary.main, 0.72),
  },
  "& .MuiTypography-root": { fontSize: 14, color: "text.primary" },
  "& .MuiTypography-root:last-of-type": {
    fontSize: 13,
    color: "text.secondary",
  },
});

export const calendarStateSx: SxProps<Theme> = (theme) => ({
  ...calendarPanelBase(theme),
  p: 3,
  display: "flex",
  alignItems: "center",
  gap: 1,
  color: "text.secondary",
  fontSize: 14,
});

/** Table "Columns" menu: desktop only (phone cards show every field). */
export const columnPickerButtonSx: SxProps<Theme> = {
  display: { xs: "none", sm: "inline-flex" },
  whiteSpace: "nowrap",
  flexShrink: 0,
};

export const columnPickerHeadingSx: SxProps<Theme> = {
  px: 2,
  pt: 0.75,
  pb: 0.5,
  fontSize: 12,
  fontWeight: 600,
  color: "text.secondary",
  listStyle: "none",
};

// components/common/TicketPageParts.tsx — shared by Do List, Tickets, Work Let
/** "Task/Ticket Number" cell: view + edit buttons, the number, extras. */
export const recordNumberCellSx: SxProps<Theme> = {
  ...inlineCenterGapSx,
  flexWrap: "nowrap",
};

export const recordNumberTextSx: SxProps<Theme> = {
  fontWeight: 600,
  whiteSpace: "nowrap",
};

export const dueDateCellSx: SxProps<Theme> = {
  ...inlineCenterGapSx,
  flexWrap: "wrap",
  columnGap: 1,
  rowGap: 0.25,
};

export const overdueTagSx: SxProps<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.25,
  color: "error.main",
  fontWeight: 600,
  "& .MuiSvgIcon-root": { fontSize: 14 },
};

/** Header filter (e.g. Employee) that shares the actions row on phones. */
export const headerFilterFieldSx = {
  flex: { xs: "1 1 140px", sm: "0 0 auto" },
  minWidth: { xs: 0, sm: 210 },
} satisfies SxProps<Theme>;

// components/common/FilterPopover.tsx — applied filters under the tabs
export const activeFilterBarSx: SxProps<Theme> = {
  pt: 1,
};

export const activeFilterLabelSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: 12,
  fontWeight: 600,
  mr: 0.25,
};

// components/common/PageNotice.tsx — info notice under a page's tabs
export const pageNoticeSx: SxProps<Theme> = (theme) => ({
  display: "flex",
  alignItems: { xs: "flex-start", sm: "center" },
  gap: 1.25,
  flexShrink: 0,
  mt: 1.5,
  px: 1.5,
  py: 1,
  borderRadius: RADIUS_PX.sm,
  color: "text.primary",
  bgcolor: alpha(
    theme.palette.info.main,
    theme.palette.mode === "dark" ? 0.12 : 0.08,
  ),
  fontSize: 13,
  lineHeight: 1.5,
  "& > .MuiSvgIcon-root": { color: "info.main", fontSize: 20, flexShrink: 0 },
  "& strong": { fontWeight: 600 },
});

// components/common/CardView.tsx — board columns (Do List, Tickets, Work Let)
export const boardColumnSx =
  (expanded = false): SxProps<Theme> =>
  (theme) => ({
    minWidth: 0,
    height: "auto",
    maxHeight: { lg: "100%" },
    minHeight: 0,
    // Small screens (accordion): the expanded column is as tall as its cards,
    // capped at the remaining board height (then its list scrolls), so the
    // collapsed stages stay right below it. On lg each column is a grid cell.
    flex: { xs: expanded ? "0 1 auto" : "0 0 auto" },
    borderRadius: RADIUS_PX.md,
    // A quiet track, not another raised surface: the cards are the surfaces.
    bgcolor: alpha(
      theme.palette.text.primary,
      theme.palette.mode === "dark" ? 0.03 : 0.035,
    ),
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    scrollSnapAlign: "start",
  });

export const boardColumnHeaderSx: SxProps<Theme> = {
  px: 2,
  pt: 1.5,
  pb: { xs: 1.5, lg: 1 },
  gap: 1,
  cursor: { xs: "pointer", lg: "default" },
};

export const boardColumnTitleSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  minWidth: 0,
  fontSize: 14,
  fontWeight: 600,
  color: "text.primary",
};

export const boardColumnBulletSx = ({
  accent,
}: AccentStyleArgs): SxProps<Theme> => ({
  width: 8,
  height: 8,
  flexShrink: 0,
  borderRadius: "50%",
  bgcolor: accent,
});

export const boardColumnCountChipSx: SxProps<Theme> = (theme) => ({
  height: 20,
  minWidth: 24,
  fontSize: 12,
  fontWeight: 600,
  ...TABULAR_NUMS,
  color: "text.secondary",
  bgcolor: alpha(
    theme.palette.text.primary,
    theme.palette.mode === "dark" ? 0.08 : 0.07,
  ),
  "& .MuiChip-label": { px: 1 },
});

/**
 * "Action Required" marker in a board column header: an alert-red tint,
 * red text/icon and a faint red outline so it is noticed at a glance.
 * Static (no pulsing); the darker / lighter red step keeps AA contrast.
 */
export const boardColumnActionRequiredChipSx: SxProps<Theme> = (theme) => {
  const isDark = theme.palette.mode === "dark";
  const red = theme.palette.error;
  return {
    height: 22,
    color: isDark ? red.light : red.dark,
    bgcolor: alpha(red.main, isDark ? 0.2 : 0.1),
    border: `1px solid ${alpha(red.main, isDark ? 0.45 : 0.3)}`,
    fontSize: 11,
    fontWeight: 600,
    "& .MuiChip-label": { px: 0.75 },
    "& .MuiChip-icon": { ml: 0.5, mr: -0.25, color: "inherit", fontSize: 14 },
  };
};

export const boardColumnListSx: SxProps<Theme> = {
  px: 1,
  pt: 0.25,
  // The scroll box fills its (bounded) column and scrolls internally on every
  // screen size. On small screens the column is bounded by flex (see
  // boardColumnSx + cardViewCollapseSx); on lg by the grid row.
  pb: { xs: "calc(env(safe-area-inset-bottom, 0px) + 12px)", lg: 1.25 },
  display: "flex",
  flexDirection: "column",
  gap: 1,
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  overscrollBehavior: "contain",
  flex: "1 1 auto",
  minHeight: 0,
  height: "auto",
  scrollPaddingBottom: { xs: "8px", lg: 1.25 },
  scrollbarGutter: "stable",
};

export const cardViewHeaderButtonSx = (accent: string): SxProps<Theme> => ({
  display: "block",
  width: "100%",
  textAlign: "left",
  "&.Mui-focusVisible": {
    outline: "2px solid",
    outlineColor: accent,
    outlineOffset: -2,
  },
});

export const cardViewCollapseSx: SxProps<Theme> = {
  // Content height, shrinking when the column hits its cap so the inner
  // scroll box is bounded (flex overrides MUI's inline height:auto).
  flex: "0 1 auto",
  minHeight: 0,
  "& .MuiCollapse-wrapper": {
    display: "flex",
    minHeight: 0,
    height: "100%",
  },
  "& .MuiCollapse-wrapperInner": {
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    height: "100%",
    width: "100%",
  },
};

export const cardViewExpandIcon =
  (expanded: boolean): SxProps<Theme> =>
  (theme) => ({
    display: { xs: "inline-flex", lg: "none" },
    color: "text.secondary",
    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shorter,
    }),
  });

/** Quiet empty column: one muted line, no extra nested surface. */
export const boardColumnEmptySx: SxProps<Theme> = {
  py: 4,
  px: 2,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 0.75,
  color: "text.secondary",
  fontSize: 13,
  textAlign: "center",
  "& .MuiSvgIcon-root": { fontSize: 18, opacity: 0.6 },
};

export const boardColumnsSx: SxProps<Theme> = {
  // Small screens: flex column accordion — the expanded column fills the height
  // and scrolls internally. lg+: kanban grid with a full-height row so each
  // column is bounded and scrolls internally. Neither the board itself scrolls.
  display: { xs: "flex", lg: "grid" },
  flexDirection: { xs: "column" },
  gridTemplateColumns: { lg: "repeat(3, minmax(0, 1fr))" },
  gridTemplateRows: { lg: "minmax(0, auto)" },
  gap: { xs: 1.25, lg: 1.5 },
  height: "100%",
  minHeight: 0,
  alignContent: { lg: "start" },
  overflow: "hidden",
};

/** Do List: Open and Closed side by side at equal width from lg. */
export const boardColumnsSelfSx: SxProps<Theme> = {
  ...boardColumnsSx,
  gridTemplateColumns: { lg: "repeat(2, minmax(0, 1fr))" },
};

// components/tickets/BasicCard.tsx + components/selfTickets/BasicCard.tsx
export type CardAlertTone = "overdue" | "reminder";

/**
 * Work-item card: neutral opaque surface, fine border, gentle hover and a
 * clear focus ring. Urgency is communicated with one restrained text tag in
 * the status row instead of tinting the whole card.
 */
export const boardCardSx = (): SxProps<Theme> => (theme) => {
  const isDark = theme.palette.mode === "dark";
  return {
    flexShrink: 0,
    position: "relative",
    overflow: "hidden",
    cursor: "pointer",
    borderRadius: RADIUS_PX.md,
    // One depth cue: shadow in light mode, hairline in dark mode.
    border: isDark ? `1px solid ${theme.palette.divider}` : "1px solid transparent",
    backgroundImage: "none",
    backgroundColor: theme.palette.background.paper,
    boxShadow: isDark ? "none" : ELEVATION.light.card,
    transition: `box-shadow ${MOTION.base} ${MOTION.easing}, border-color ${MOTION.base} ${MOTION.easing}`,
    "&:hover": {
      borderColor: isDark ? alpha(theme.palette.text.primary, 0.28) : "transparent",
      boxShadow: isDark ? "none" : ELEVATION.light.cardHover,
    },
    "&:focus-visible": {
      outline: "2px solid",
      outlineColor: theme.palette.primary.main,
      outlineOffset: 2,
    },
    "@media (prefers-reduced-motion: reduce)": {
      transition: "none",
      "&:hover": { transform: "none" },
    },
  };
};

export const sharedCardContentSx: SxProps<Theme> = {
  px: CARD_PADDING,
  pt: 1.75,
  "&:last-child": { pb: 1.5 },
  display: "flex",
  flexDirection: "column",
  gap: 0.75,
};

/** Row 1: identifier on the left, creation date (and reminder) on the right. */
export const boardCardTopRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1,
  minHeight: 24,
};

export const boardCardNumberSx: SxProps<Theme> = {
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: "0.01em",
  color: "text.secondary",
  ...TABULAR_NUMS,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export const boardCardMetaSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.75,
  flexShrink: 0,
  color: "text.secondary",
};

export const boardCardCreatedSx: SxProps<Theme> = {
  fontSize: 13,
  fontWeight: 400,
  color: "text.secondary",
  ...TABULAR_NUMS,
  whiteSpace: "nowrap",
};

export const boardCardCreatorSx: SxProps<Theme> = {
  ...boardCardCreatedSx,
  fontWeight: 600,
  color: "text.primary",
  maxWidth: 120,
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const viewEnter = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
`;

/** One short fade when List / Board / Calendar switches (runs once). */
export const viewEnterSx = {
  animation: `${viewEnter} ${MOTION.base} ${MOTION.easing}`,
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
} satisfies SxProps<Theme>;

/** Row 2: the subject, medium weight, up to two lines. */
export const sharedCardTitleSx: SxProps<Theme> = {
  fontSize: 16,
  fontWeight: 600,
  lineHeight: 1.35,
  color: "text.primary",
  overflowWrap: "anywhere",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

/** Row 3: description preview, two lines, supporting colour. */
export const ticketCardDescriptionSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: 14,
  lineHeight: 1.5,
  overflowWrap: "anywhere",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

/** Row 4: status / priority / urgency indicators, clearly separated. */
export const boardCardIndicatorsSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 0.75,
  mt: 0.25,
};

/**
 * Overdue / reminder marker: neutral text with a small coloured glyph. The
 * target date is the one red element on a card, so this tag stays quiet.
 */
export const boardCardTagSx =
  (tone: CardAlertTone): SxProps<Theme> =>
  (theme) => {
    const color =
      tone === "overdue"
        ? theme.palette.error.main
        : theme.palette.warning.main;
    const isDark = theme.palette.mode === "dark";
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 0.5,
      px: 1,
      py: 0.25,
      borderRadius: RADIUS_PX.pill,
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.4,
      color: theme.palette.text.secondary,
      bgcolor: alpha(theme.palette.text.primary, isDark ? 0.08 : 0.05),
      "& .MuiSvgIcon-root": { fontSize: 14, color },
    };
  };

/** Neutral task-type label (Action, Follow-up, Info, Review). */
export const boardCardTypeTagSx: SxProps<Theme> = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  px: 1,
  py: 0.125,
  borderRadius: RADIUS_PX.xs,
  border: "1px solid",
  borderColor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.24 : 0.2),
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1.4,
  color: "text.secondary",
});

/**
 * Do List footer: a fixed two-column grid, reminder on the left and target
 * date on the right at every width; optional rows span both columns.
 */
export const doListCardFooterSx: SxProps<Theme> = {
  mt: 0.75,
  pt: 1.25,
  borderTop: "1px solid",
  borderColor: "divider",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "start",
  columnGap: 2,
  rowGap: 1,
};

export const doListReminderValueSx =
  (state: "active" | "scheduled" | "off"): SxProps<Theme> =>
  (theme) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 0.5,
    mt: 0.25,
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.3,
    color:
      state === "active"
        ? theme.palette.mode === "dark"
          ? theme.palette.warning.light
          : theme.palette.warning.dark
        : state === "scheduled"
          ? "text.primary"
          : "text.secondary",
    "& .MuiSvgIcon-root": { fontSize: 16 },
  });

const acknowledgeBorderBlink = keyframes`
  0%, 100% { border-color: var(--ack-border); box-shadow: 0 0 0 0 transparent; }
  50% { border-color: var(--ack-strong); box-shadow: 0 0 0 3px var(--ack-glow); }
`;

/** Pending reminder: the button's border blinks until it is acknowledged. */
export const doListAcknowledgeButtonSx: SxProps<Theme> = (theme) => {
  const warning = theme.palette.warning.main;
  return {
    gridColumn: "1 / -1",
    justifySelf: "start",
    "--ack-border": alpha(warning, 0.35),
    "--ack-strong": warning,
    "--ack-glow": alpha(warning, theme.palette.mode === "dark" ? 0.3 : 0.22),
    borderColor: warning,
    animation: `${acknowledgeBorderBlink} 1.4s ease-in-out infinite`,
    "&:hover, &.Mui-focusVisible": { animation: "none", borderColor: warning },
    "@media (prefers-reduced-motion: reduce)": { animation: "none" },
  };
};

/** A linked ticket reads as a reference: icon, label and the number. */
export const doListLinkedTicketSx: SxProps<Theme> = {
  gridColumn: "1 / -1",
  display: "inline-flex",
  alignItems: "center",
  gap: 0.5,
  fontSize: 13,
  color: "text.secondary",
  "& .MuiSvgIcon-root": { fontSize: 16, color: "primary.main" },
  "& > span": {
    color: "primary.main",
    fontSize: 14,
    fontWeight: 600,
    ...TABULAR_NUMS,
  },
};

/** Row 5: footer — assignee identity on the left, target date on the right. */
export const boardCardFooterSx: SxProps<Theme> = {
  mt: 0.75,
  pt: 1.25,
  borderTop: "1px solid",
  borderColor: "divider",
  // Fixed columns: assignee always left, target date always right.
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "end",
  columnGap: 1.5,
};

export const boardCardFieldSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  minWidth: 0,
};

export const boardCardFieldLabelSx: SxProps<Theme> = {
  fontSize: 12,
  fontWeight: 500,
  lineHeight: 1.2,
  color: "text.secondary",
  whiteSpace: "nowrap",
};

export const boardCardFieldValueSx: SxProps<Theme> = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: 1.3,
  color: "text.primary",
  ...TABULAR_NUMS,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

/**
 * Prominent target date, coloured only by real urgency. A finished item
 * (completed / closed) shows its date at the same 13px as an upcoming one.
 */
export const boardCardDueSx =
  (tone: DueTone, finished = false): SxProps<Theme> =>
  (theme) => {
    // Only real urgency is coloured: red overdue, amber due today.
    const color =
      tone === "overdue"
        ? theme.palette.error.main
        : tone === "today"
          ? theme.palette.warning.main
          : null;
    return {
      ...(boardCardFieldValueSx as object),
      fontSize: finished ? 13 : 15,
      ...(color && { color }),
    };
  };

/** Neutral identity mark: primary is reserved for interaction and selection. */
/**
 * Relative target label ("Tomorrow", "in 3 days", "Today") as a light tinted
 * pill, so an approaching date is hard to miss. Other tones stay plain.
 */
export const boardCardDueLabelSx =
  (tone: DueTone): SxProps<Theme> =>
  (theme) => {
    const palette =
      tone === "soon" ? theme.palette.info : tone === "today" ? theme.palette.warning : null;
    if (!palette) return {};
    const isDark = theme.palette.mode === "dark";
    return {
      display: "inline-block",
      px: 0.75,
      py: 0.125,
      borderRadius: RADIUS_PX.pill,
      fontSize: 13,
      fontWeight: 600,
      lineHeight: 1.35,
      color: isDark ? palette.light : palette.dark,
      bgcolor: alpha(palette.main, isDark ? 0.18 : 0.12),
    };
  };

export const ticketCardAssigneeAvatarSx: SxProps<Theme> = (theme) => ({
  width: 28,
  height: 28,
  fontSize: 12,
  fontWeight: 600,
  color: "text.primary",
  bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.14 : 0.08),
});

// components/dashboard/AnalysisPieChart.dynamic.styles.ts
export const pieChartPanelSx = ({
  borderedSurfaceSx,
}: {
  borderedSurfaceSx: StaticStyleObject;
}): SxProps<Theme> => ({
  ...borderedSurfaceSx,
  ...insetSx,
  height: "100%",
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
});

export const pieChartCanvasSx = ({
  height,
  visible = true,
}: {
  height: number | string;
  /** Hidden (but kept mounted for ECharts) when there is nothing to plot. */
  visible?: boolean;
}): SxProps<Theme> => ({
  height,
  width: "100%",
  minWidth: 0,
  flex: 1,
  display: visible ? "block" : "none",
});

// components/dashboard/AnalysisPieChart.styles.ts
export const pieChartHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.1,
  mb: 0.5,
};

/** A chart with a single slice shows its value as a number instead. */
export const pieChartSingleValueSx: SxProps<Theme> = {
  minHeight: 124,
  display: "grid",
  placeItems: "center",
  textAlign: "center",
};

export const pieChartEmptyStateSx: SxProps<Theme> = {
  flex: 1,
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  color: "text.secondary",
};

export const pieChartEmptyIconSx: SxProps<Theme> = {
  fontSize: 46,
  opacity: 0.35,
};

// components/selfTickets/CreateModel.dynamic.styles.ts
export const doListFormTooltipPopperSx = (): SxProps<Theme> => ({
  zIndex: (theme) => theme.zIndex.tooltip,
  pointerEvents: "none",
});

export const doListFormSectionTitleSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.3,
};

export const formSwitchLabelSx: SxProps<Theme> = {
  m: 0,
  "& .MuiFormControlLabel-label": { fontSize: 13, fontWeight: 600 },
};

export const reminderHelpPopoverSx: SxProps<Theme> = {
  mt: 0.75,
  width: { xs: 300, sm: 390 },
  ...insetSx,
  borderRadius: RADIUS_PX.md,
  bgcolor: "background.paper",
  color: "text.primary",
  border: "1px solid",
  borderColor: "divider",
  overflow: "hidden",
};

export const reminderHelpHeaderSx: SxProps<Theme> = { mb: 1 };

export const reminderHelpIconBadgeSx: SxProps<Theme> = {
  width: 26,
  height: 26,
  display: "grid",
  placeItems: "center",
  borderRadius: RADIUS_PX.sm,
  bgcolor: "action.selected",
  color: "primary.main",
};

export const reminderHelpIconSx: SxProps<Theme> = {
  fontSize: 16,
};

export const reminderHelpIntroSx: SxProps<Theme> = {
  display: "block",
  color: "text.secondary",
  lineHeight: 1.45,
  mb: 1.25,
};

export const reminderExampleTextSx: SxProps<Theme> = {
  display: "inline",
  fontSize: 10,
};

export const reminderExampleDaysSx: SxProps<Theme> = { fontWeight: 600 };

export const reminderExampleLabelSx: SxProps<Theme> = { fontWeight: 500 };

export const reminderExampleChipSx: SxProps<Theme> = {
  height: "auto",
  minHeight: 24,
  borderRadius: RADIUS_PX.sm,
  bgcolor: "action.hover",
  "& .MuiChip-label": {
    display: "block",
    whiteSpace: "normal",
    py: 0.35,
    lineHeight: 1.2,
  },
};

export const reminderHelpExampleSx: SxProps<Theme> = {
  color: "text.secondary",
  display: "block",
  lineHeight: 1.4,
};

/** Phones: the required-fields note sits on its own line above the actions. */
export const requiredNoteRowSx: SxProps<Theme> = {
  mr: "auto",
  color: "text.secondary",
  flexBasis: { xs: "100%", sm: "auto" },
};

/** Form footer that wraps the note above equal-width actions on phones. */
export const formDialogActionsSx: SxProps<Theme> = {
  ...dialogActionsRowSx,
  flexWrap: "wrap",
  rowGap: 1,
  "& > .MuiButton-root": { flex: { xs: "1 1 0", sm: "0 0 auto" } },
  "& > .MuiButton-root:first-of-type": { ml: { xs: 0, sm: 1 } },
};

export const requiredNoteIconBadgeSx: SxProps<Theme> = {
  width: 22,
  height: 22,
  display: "grid",
  placeItems: "center",
  borderRadius: RADIUS_PX.sm,
  bgcolor: "action.selected",
  color: "primary.main",
};

export const requiredNoteIconSx: SxProps<Theme> = {
  fontSize: 14,
};

export const requiredNoteTextSx: SxProps<Theme> = {
  color: "text.secondary",
  fontWeight: 600,
};

export const requiredMarkSx: SxProps<Theme> = {
  color: "error.main",
  fontWeight: 600,
};

// components/selfTickets/DetailModel.styles.ts
// components/TableView.callback.styles.ts
export const tableBodyRowSx =
  ({
    alternatingRowSx,
    onRowClick,
  }: {
    alternatingRowSx: ThemeStyleCallback;
    onRowClick?: unknown;
  }): SxProps<Theme> =>
  (theme) => ({
    ...tableRow(Boolean(onRowClick))(theme),
    ...alternatingRowSx(theme),
  });

const autoColumnMinWidth = 120;

/** How far a proportional table may shrink below its columns' total. */
const TABLE_MIN_SCALE = 0.8;

/**
 * Sum of the column widths when every column has a plain pixel width (the
 * default is 100), else undefined. Tables use it to size columns as shares
 * of the table instead of fixed pixels.
 */
export const tableColumnsTotalWidth = (
  columns: { label?: string; width?: ResponsiveStyleWidth }[],
): number | undefined => {
  let total = 0;
  for (const column of columns) {
    const width = columnWidth(column);
    if (typeof width !== "number") return undefined;
    total += width;
  }
  return total || undefined;
};

/**
 * Smallest width a proportional table keeps before it scrolls sideways:
 * 80% of its columns' total. An explicit `tableMinWidth` always wins.
 */
export const resolveTableMinWidth = (
  tableMinWidth: number | string | undefined,
  totalWidth: number | undefined,
) =>
  tableMinWidth ?? (totalWidth ? Math.round(totalWidth * TABLE_MIN_SCALE) : undefined);

const resolveTableColumnWidth = (
  columnWidth: ResponsiveStyleWidth | undefined,
  totalWidth?: number,
): {
  width: ResponsiveStyleWidth;
  minWidth: ResponsiveStyleWidth;
  maxWidth: ResponsiveStyleWidth;
} => {
  const width = columnWidth ?? 100;
  // Proportional: with a fixed table layout, percentage widths let the
  // columns share the available width (down to the table's min-width)
  // instead of forcing a horizontal scroll at 1280–1440px.
  if (totalWidth && typeof width === "number") {
    return {
      width: `${((width / totalWidth) * 100).toFixed(3)}%`,
      minWidth: 0,
      maxWidth: "none",
    };
  }
  const resolveWidthValue = (value: number | string) =>
    value === "auto" ? "auto" : value;
  const resolveMinWidthValue = (value: number | string) =>
    value === "auto" ? autoColumnMinWidth : value;
  const resolveMaxWidthValue = (value: number | string) =>
    value === "auto" ? "none" : value;

  if (width && typeof width === "object" && !Array.isArray(width)) {
    const responsiveWidth = width as Record<string, number | string>;
    const mapResponsiveWidth = (
      resolver: (value: number | string) => number | string,
    ): ResponsiveStyleWidth =>
      Object.fromEntries(
        Object.entries(responsiveWidth).map(([breakpoint, value]) => [
          breakpoint,
          resolver(value),
        ]),
      ) as ResponsiveStyleWidth;

    return {
      width: mapResponsiveWidth(resolveWidthValue),
      minWidth: mapResponsiveWidth(resolveMinWidthValue),
      maxWidth: mapResponsiveWidth(resolveMaxWidthValue),
    };
  }

  const scalarWidth = width as number | string;
  return {
    width: resolveWidthValue(scalarWidth),
    minWidth: resolveMinWidthValue(scalarWidth),
    maxWidth: resolveMaxWidthValue(scalarWidth),
  };
};

export const tableHeaderCellForColumnSx =
  ({
    column,
    index,
    tableHeaderCellSx,
    stickyFirstColumn,
    totalWidth,
  }: {
    column: TableStyleColumn;
    index: number;
    tableHeaderCellSx: ThemeStyleCallback;
    stickyFirstColumn: boolean;
    /** From tableColumnsTotalWidth: sizes the column as a share of the table. */
    totalWidth?: number;
  }): SxProps<Theme> =>
  (theme) => {
    const isStickyFirstColumn = stickyFirstColumn && index === 0;
    const actionColumn = isActionsColumn(column);
    const actionPadding = column.width === 40 ? 0.25 : 0.75;
    const columnWidthSx = resolveTableColumnWidth(
      column.width,
      actionColumn ? undefined : totalWidth,
    );

    const align = actionColumn ? "center" : resolveColumnAlign(column);
    const pinRight = actionColumn;

    return {
      ...columnWidthSx,
      ...tableHeaderCellSx(theme),
      position: "sticky",
      top: 0,
      left: isStickyFirstColumn ? 0 : "auto",
      // Keep the fixed header corner above the horizontally scrolling headers.
      zIndex: isStickyFirstColumn || pinRight ? "30 !important" : 21,
      overflow: "hidden",
      // Long labels wrap onto a second line instead of being cut off.
      whiteSpace: "normal",
      lineHeight: 1.25,
      verticalAlign: "bottom",
      textAlign: align,
      ...(actionColumn
        ? {
            paddingInline: actionPadding,
            "& .MuiButton-root": {
              px: 1,
              whiteSpace: "nowrap",
            },
            "& .MuiIconButton-root": {
              width: 36,
              height: 36,
              p: 0.75,
              flexShrink: 0,
            },
          }
        : {}),
      "& .MuiTableSortLabel-root": {
        color: "inherit",
        fontWeight: 600,
        justifyContent: justifyFor[align],
      },
      ...(pinRight
        ? {
            right: 0,
            boxShadow: pinnedRightShadow(theme),
            backgroundColor: `${theme.palette.background.paper} !important`,
          }
        : {}),
      backgroundColor: isStickyFirstColumn
        ? `${theme.palette.background.paper} !important`
        : theme.palette.background.paper,
      ...(isStickyFirstColumn
        ? {
            // Sticky edge: a single hairline, no cast shadow.
            boxShadow: `1px 0 0 ${theme.palette.divider}`,
          }
        : {}),
    };
  };

export const tableBodyCellForColumnSx =
  ({
    column,
    index,
    stickyTableCellSx,
    stickyFirstColumn,
    totalWidth,
  }: {
    column: TableStyleColumn;
    index: number;
    stickyTableCellSx: ThemeStyleCallback;
    stickyFirstColumn: boolean;
    totalWidth?: number;
  }): SxProps<Theme> =>
  (theme) => {
    const isStickyFirstColumn = stickyFirstColumn && index === 0;
    const actionColumn = isActionsColumn(column);
    const actionPadding = column.width === 40 ? 0.25 : 0.75;
    const columnWidthSx = resolveTableColumnWidth(
      column.width,
      actionColumn ? undefined : totalWidth,
    );

    return {
      ...columnWidthSx,
      position: isStickyFirstColumn ? "sticky" : "static",
      left: isStickyFirstColumn ? 0 : "auto",
      zIndex: isStickyFirstColumn ? 15 : 1,
      ...stickyTableCellSx(theme),
      ...(isStickyFirstColumn
        ? { backgroundColor: `${theme.palette.background.paper} !important` }
        : {}),
      backgroundImage: "none",
      ...tableCell,
      // Explicit, so rendered content (icons, pills) follows the column too.
      textAlign: actionColumn ? "center" : resolveColumnAlign(column),
      boxSizing: "border-box",
      ...(actionColumn
        ? {
            paddingInline: actionPadding,
            "& > .MuiStack-root, & > .MuiBox-root": {
              justifyContent: "center",
              width: "100%",
            },
            "& .MuiButton-root": {
              px: 1,
              whiteSpace: "nowrap",
            },
            "& .MuiIconButton-root": {
              width: 36,
              height: 36,
              p: 0.75,
              flexShrink: 0,
            },
          }
        : {}),
      ...(isStickyFirstColumn
        ? {
            // Sticky edge: a single hairline, no cast shadow.
            boxShadow: `1px 0 0 ${theme.palette.divider}`,
          }
        : {}),
      ...(actionColumn
        ? {
            position: "sticky",
            right: 0,
            zIndex: 15,
            boxShadow: pinnedRightShadow(theme),
            // Opaque so scrolled cells never show through the pinned column.
            backgroundColor: `${theme.palette.background.paper} !important`,
          }
        : {}),
    };
  };

// components/TableView.dynamic.styles.ts
export const tablePanelSx = ({
  height,
}: {
  height?: number | string;
}): SxProps<Theme> => ({
  height: height ?? "100%",
  flex: height === "100%" ? "1 1 auto" : "0 0 auto",
  width: "100%",
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.md,
  bgcolor: "background.paper",
});

// components/TableView.styles.ts
export const tableScrollContainerSx: SxProps<Theme> = {
  ...tableContainerSx,
};

const tableBaseSx: SxProps<Theme> = {
  ...tableSx,
};

export const tableWithMinWidthSx = (
  tableMinWidth?: ResponsiveStyleWidth,
): SxProps<Theme> => ({
  ...tableSx,
  minWidth: tableMinWidth,
});

export const tableViewTableWithMinWidth = (
  tableMinWidth?: number | string,
): SxProps<Theme> => ({
  ...tableBaseSx,
  minWidth: tableMinWidth,
});

export const tableHeaderBarSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 1.25,
  px: INSET_X,
  py: INSET_Y,
  borderBottom: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  flexWrap: { xs: "wrap", sm: "nowrap" },
  flex: "0 0 auto",
};

export const tableViewTitleGroupSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  minWidth: 0,
};

export const tableViewTitleStackSx: SxProps<Theme> = {
  minWidth: 0,
  justifyContent: "center",
};

export const tableTitleSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  lineHeight: 1.25,
  minWidth: 0,
};

/** Small text link under a table title (e.g. "How ratings work"). */
export const tableHeaderLinkSx: SxProps<Theme> = {
  p: 0,
  minWidth: 0,
  fontSize: 12,
  fontWeight: 600,
  textTransform: "none",
  "& .MuiButton-startIcon": { mr: 0.5, "& svg": { fontSize: 16 } },
  "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
};

/** Right side of a table title bar: the section action, then search. */
export const tableHeaderToolsSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  flexShrink: 0,
  ml: "auto",
  // Phones: the tools (search) take their own full-width row.
  width: { xs: "100%", sm: "auto" },
};

/** The "+ Add …" button in a table section's title bar. */
export const tableHeaderAddButtonSx: SxProps<Theme> = {
  whiteSpace: "nowrap",
  flexShrink: 0,
};

/** File name with a file icon; the full name shows on hover (title). */
export const fileNameCellSx: SxProps<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.75,
  maxWidth: "100%",
  minWidth: 0,
  "& > .MuiSvgIcon-root": {
    fontSize: 18,
    color: "text.secondary",
    flexShrink: 0,
  },
  "& > span": {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};

/** Long text in a table cell: up to two lines, full text on hover. */
export const twoLineClampSx: SxProps<Theme> = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  lineHeight: 1.4,
};

/** Row count beside a table title, e.g. "Documents  2". */
export const tableTitleCountSx: SxProps<Theme> = (theme) => ({
  minWidth: 24,
  height: 20,
  px: 0.75,
  borderRadius: RADIUS_PX.pill,
  display: "inline-grid",
  placeItems: "center",
  fontSize: 11,
  fontWeight: 600,
  color: "text.secondary",
  bgcolor: alpha(
    theme.palette.text.primary,
    theme.palette.mode === "dark" ? 0.08 : 0.07,
  ),
});

/** Search placeholders name the content being searched. */
export const tableSearchPlaceholder = (title?: string) =>
  title ? `Search ${title.toLowerCase()}` : "Search";

export const tableSubtitleSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: "0.75rem",
  lineHeight: 1.25,
  minWidth: 0,
};

/** Table search: the standard field surface (from the theme), fixed width. */
export const tableSearchFieldSx: SxProps<Theme> = {
  width: { xs: "100%", sm: 260 },
};

/**
 * Scroll area of CollapsibleTableView. No reserved scrollbar gutter: it left
 * an empty strip on the right whenever the table didn't scroll, unlike
 * VirtualizedTable.
 */
export const collapsibleTableScrollSx: SxProps<Theme> = {
  overflow: "auto",
  minHeight: 0,
  height: "100%",
  width: "100%",
};

export const tableBodyAreaSx: SxProps<Theme> = {
  minHeight: 0,
  flexGrow: 1,
  bgcolor: "background.paper",
  position: "relative",
  display: "flex",
  flexDirection: "column",
};

export const tableVirtuosoStyle: CSSProperties = {
  height: "100%",
  borderRadius: 0,
  border: 0,
};

export const tableEmptyOverlaySx: SxProps<Theme> = {
  position: "absolute",
  inset: "58px 0 0",
  display: "grid",
  placeItems: "center",
  pointerEvents: "none",
};

// components/tickets/CreateModal.styles.ts
export const attachmentDropZoneSx: SxProps<Theme> = {
  ...insetSx,
  border: "1px dashed",
  borderColor: "divider",
  borderRadius: RADIUS_PX.sm,
  display: "flex",
  alignItems: "center",
  gap: 2,
  flexWrap: "wrap",
};

export const attachmentButtonSx: SxProps<Theme> = { flexShrink: 0 };

export const ticketAttachmentListSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1,
  alignItems: "center",
  flex: 1,
};

export const attachmentChipSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  bgcolor: "grey.100",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.pill,
  px: 1,
  py: 0.25,
};

export const ticketAttachmentNameSx: SxProps<Theme> = {
  maxWidth: 160,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const attachmentRemoveButtonSx: SxProps<Theme> = {
  ml: 0.5,
  p: 0.5,
};

// components/tickets/DetailModal.callback.styles.ts
// components/tickets/DetailModal.dynamic.styles.ts
// components/tickets/DetailModal.styles.ts
export const ratingSelectedLabelSx: SxProps<Theme> = {
  fontWeight: 600,
  color: "primary.main",
};

// components/tickets/RatingInfoModel.dynamic.styles.ts
export const ratingTileSx = ({
  item,
}: {
  item: { score: number };
}): SxProps<Theme> => ({
  ...insetSx,
  height: "100%",
  textAlign: "center",
  bgcolor: item.score >= 4 ? SURFACE_TINT.positiveTile : "background.paper",
});

// components/tickets/RatingInfoModel.styles.ts
export const ratingGuideTextSx: SxProps<Theme> = { mt: 1 };

export const ratingGuidePanelSx: SxProps<Theme> = { p: 2 };

// pages/errorPages.ts
export const errorPageSx = {
  alignItems: "center",
  bgcolor: "background.default",
  display: "grid",
  flex: 1,
  minHeight: "100%",
  p: { xs: 2, sm: 3 },
};
export const errorPanelSx = {
  border: "1px solid",
  borderColor: "divider",
  maxWidth: 560,
  mx: "auto",
  p: { xs: 3, sm: 5 },
  textAlign: "center",
  width: "100%",
};

export const errorIconSx = {
  color: "primary.main",
  display: "grid",
  fontSize: 58,
  mb: 2,
  placeItems: "center",
};

export const errorCodeSx = {
  color: "text.secondary",
  fontSize: "0.75rem",
  fontWeight: 600,
  lineHeight: 1.5,
};

export const errorTitleSx = {
  color: "text.primary",
  fontSize: { xs: "1.4rem", sm: "1.5rem" },
  fontWeight: 600,
  lineHeight: 1.3,
  mt: 0.5,
};

export const errorMessageSx = {
  color: "text.secondary",
  fontSize: "0.9375rem",
  lineHeight: 1.6,
  mt: 1,
};

export const errorActionsSx = {
  justifyContent: "center",
  mt: 3,
};

// pages/Login.dynamic.styles.ts
/* -------------------------------------------------------------------------- */
/* Sign-in pages: Login, Forgot password, Reset password                       */
/* -------------------------------------------------------------------------- */

/**
 * Photo backdrop, calmed with the brand overlay plus a soft vignette so the
 * sign-in sheet is the clear focus.
 */
export const authPageBackgroundSx = ({
  bgImage,
}: {
  bgImage: string;
}): SxProps<Theme> => ({
  minHeight: "100dvh",
  width: "100%",
  display: "grid",
  placeItems: "center",
  p: { xs: 2, sm: 3 },
  position: "relative",
  backgroundImage: `radial-gradient(120% 90% at 50% 45%, rgba(4, 24, 36, 0) 0%, rgba(4, 24, 36, 0.55) 100%), ${HERO_OVERLAY}, url(${bgImage})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
});

/**
 * Frosted sheet: a translucent surface over a blurred backdrop, a hairline
 * edge and one soft, deep shadow. Opaque fallback where blur is unsupported.
 */
export const authCardSx: SxProps<Theme> = (theme) => {
  const isDark = theme.palette.mode === "dark";
  return {
    width: "min(100%, 420px)",
    borderRadius: RADIUS_PX.xl,
    border: `1px solid ${alpha(isDark ? "#FFFFFF" : "#0B1A24", isDark ? 0.1 : 0.08)}`,
    bgcolor: theme.palette.background.paper,
    boxShadow: isDark
      ? "0 30px 80px rgba(0, 0, 0, 0.55)"
      : "0 30px 80px rgba(4, 39, 58, 0.35)",
    "@supports (backdrop-filter: blur(1px))": {
      // Light: almost solid white so the photo doesn't tint the sheet grey;
      // dark keeps more translucency for depth.
      bgcolor: alpha(theme.palette.background.paper, isDark ? 0.8 : 0.96),
      backdropFilter: "blur(24px) saturate(160%)",
      WebkitBackdropFilter: "blur(24px) saturate(160%)",
    },
  };
};

/**
 * Sheet content. Form controls are styled here (not per field) so all three
 * sign-in forms share one rhythm: 44px fields with 12px corners, a 24px
 * title, and alerts that match the field radius.
 */
export const authCardContentSx: SxProps<Theme> = (theme) => ({
  position: "relative",
  px: { xs: 3, sm: 4.5 },
  pt: { xs: 4, sm: 5 },
  pb: { xs: 3, sm: 4 },
  "&:last-child": { pb: { xs: 3, sm: 4 } },
  "& h1": {
    fontSize: { xs: 22, sm: 24 },
    fontWeight: 600,
    letterSpacing: "-0.02em",
    lineHeight: 1.25,
    color: theme.palette.text.primary,
  },
  "& .MuiOutlinedInput-root": {
    minHeight: 44,
    borderRadius: RADIUS_PX.md,
    // Light: pure white fields on the white sheet; dark: a subtle inset.
    bgcolor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.background.paper, 0.4)
        : theme.palette.background.paper,
    "& .MuiOutlinedInput-input": { py: 1.25 },
    "& .MuiInputAdornment-positionStart .MuiSvgIcon-root": {
      color: theme.palette.text.secondary,
    },
  },
  "& .MuiInputLabel-root:not(.MuiInputLabel-shrink)": {
    transform: "translate(40px, 12px) scale(1)",
  },
  "& .MuiAlert-root": {
    borderRadius: RADIUS_PX.md,
    fontSize: 13,
    alignItems: "center",
  },
});

/** Theme toggle: a quiet glyph in the corner, neutral until hovered. */
export const authThemeToggleSx: SxProps<Theme> = (theme) => ({
  position: "absolute",
  top: { xs: 10, sm: 14 },
  right: { xs: 10, sm: 14 },
  color: "text.secondary",
  "&:hover": {
    color: "text.primary",
    bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.1 : 0.06),
  },
});

export const authLogoSx: SxProps<Theme> = {
  display: "block",
  width: 132,
  height: 48,
  objectFit: "contain",
  mx: "auto",
  mb: 4,
};

export const authIconBadgeSx: SxProps<Theme> = {
  width: 46,
  height: 46,
  display: "grid",
  placeItems: "center",
  borderRadius: RADIUS_PX.md,
  bgcolor: "primary.main",
  color: "primary.contrastText",
  mx: "auto",
  mb: 1.5,
};

export const authSubtitleSx: SxProps<Theme> = { mt: 0.75, mb: 3 };

/** Primary action: full width, 44px, with a soft brand glow (none on hover lift). */
export const authSubmitButtonSx: SxProps<Theme> = (theme) => ({
  mt: 3,
  borderRadius: RADIUS_PX.md,
  fontSize: 15,
  fontWeight: 600,
  boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.28 : 0.3)}`,
  "&:hover": {
    boxShadow: `0 10px 24px ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.34 : 0.36)}`,
  },
  "&.Mui-disabled": { boxShadow: "none" },
});

export const authSpinnerSx: SxProps<Theme> = { mr: 1 };

export const authFootnoteSx: SxProps<Theme> = {
  mt: 1.5,
  fontSize: 12,
  lineHeight: 1.5,
};
// common/dialogs.ts

/** Keep confirmation actions legible: one label per line on phones, one row elsewhere. */
export const confirmDialogActionsSx = {
  flexDirection: { xs: "column", sm: "row" },
  flexWrap: "nowrap",
  gap: 1,
  "& .MuiButton-root": {
    minWidth: 0,
    whiteSpace: "nowrap",
    width: { xs: "100%", sm: "auto" },
  },
} satisfies SxProps<Theme>;

export const confirmDialogRootSx = (theme: Theme) => ({
  zIndex: theme.zIndex.modal + 10,
});
/**
 * Page-header segmented control (Table / Board / Calendar). The track,
 * selected segment and motion come from the MuiToggleButtonGroup theme;
 * icons simply follow the segment's text colour.
 */
export const toggleButton = {
  "& .MuiToggleButton-root": {
    px: 1,
    fontSize: "0.8125rem",
  },
  "& .MuiToggleButton-root .MuiSvgIcon-root": {
    color: "inherit",
    fontSize: 18,
  },
};

/** Icon inside a row delete button: colour comes from rowDeleteButtonSx. */
export const deleteIconSx = {
  color: "inherit",
};

/**
 * Row "Delete" button: set apart from the safe actions by a gap and a thin
 * divider, muted at rest and red only on hover / focus, so it is never the
 * loudest thing in the row or an easy mis-click next to Edit.
 */
export const rowDeleteButtonSx: SxProps<Theme> = (theme) => ({
  position: "relative",
  color: "text.secondary",
  "&:hover, &.Mui-focusVisible": {
    color: "error.main",
    bgcolor: alpha(theme.palette.error.main, 0.1),
  },
});

export const editIconSx = {
  color: "primary.main",
};

export const approveDetailDialogPaperSx = {
  width: "95vw",
  maxWidth: "95vw",
};

/* ---- Team report dialog (components/dashboard/TeamReportModal.tsx) ---- */

export const teamReportModalPaperSx: SxProps<Theme> = {
  height: { xs: "100%", sm: "min(88vh, 860px)" },
  overflow: "hidden",
};

/** Header totals sit beside the close icon from sm; phones keep the title room. */
export const teamReportTotalsSx: SxProps<Theme> = {
  display: { xs: "none", sm: "flex" },
};

/** Header totals ("3 tickets", "2 tasks"): quiet neutral pills. */
export const teamReportTotalPillSx: SxProps<Theme> = (theme) => ({
  height: 26,
  borderRadius: RADIUS_PX.pill,
  border: 0,
  bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.08 : 0.05),
  color: "text.primary",
  fontSize: 12,
  fontWeight: 600,
  ...TABULAR_NUMS,
  "& .MuiChip-label": { px: 1 },
});

export const teamReportModalLoadingSx: SxProps<Theme> = {
  minHeight: 360,
  display: "grid",
  placeItems: "center",
  gap: 1,
  color: "text.secondary",
};

/** Tickets and Do List: flat sections split by one hairline, no frames. */
export const teamReportSectionsSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 3,
  pb: 1,
  "& > * + *": {
    pt: 3,
    borderTop: "1px solid",
    borderColor: "divider",
  },
};

/** Section title + caption on the left, status counters on the right. */
export const teamReportSectionHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: { xs: "flex-start", md: "center" },
  flexDirection: { xs: "column", md: "row" },
  justifyContent: "space-between",
  gap: 1.5,
  mb: 1.5,
};

export const teamReportSectionTitleSx: SxProps<Theme> = {
  fontSize: 15,
  fontWeight: 600,
  lineHeight: 1.3,
};

export const teamReportSectionCaptionSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: 12,
  lineHeight: 1.4,
  mt: 0.25,
};

/** Status counters: dot, status, count — one quiet row that wraps on phones. */
export const teamReportCountersSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 0.75,
};

export const teamReportCounterSx =
  (color: string): SxProps<Theme> =>
  (theme) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 0.75,
    height: 28,
    px: 1,
    borderRadius: RADIUS_PX.pill,
    bgcolor: alpha(color, theme.palette.mode === "dark" ? 0.16 : 0.08),
    color: "text.secondary",
    fontSize: 12,
    fontWeight: 500,
    whiteSpace: "nowrap",
    "&::before": {
      content: '""',
      width: 7,
      height: 7,
      borderRadius: "50%",
      bgcolor: color,
      flexShrink: 0,
    },
    "& strong": {
      color: "text.primary",
      fontWeight: 600,
      ...TABULAR_NUMS,
    },
  });

export const teamReportTableSx: SxProps<Theme> = {
  height: { xs: 300, sm: 300 },
  minWidth: 0,
};

/* -------------------------------------------------------------------------- */
/* ICPro Calendar page                                                         */
/* -------------------------------------------------------------------------- */

/** Filters + status legend: a flat row on the page, no framed bar. */
export const calendarFilterBarSx = {
  pb: 1,
  display: "flex",
  alignItems: { xs: "stretch", md: "center" },
  justifyContent: "space-between",
  gap: 1.5,
  flexWrap: "wrap",
} satisfies SxProps<Theme>;

/** Phones: the filter stack spans the row so its fields stay full width. */
export const calendarFilterFieldsSx = {
  width: { xs: "100%", sm: "auto" },
} satisfies SxProps<Theme>;

export const calendarFilterFieldSx = {
  minWidth: { xs: "100%", sm: 170 },
} satisfies SxProps<Theme>;

export const calendarLegendLabelSx = { mr: 0.25 } satisfies SxProps<Theme>;

export const calendarDetailContentSx = {
  display: "grid",
  gap: 2,
} satisfies SxProps<Theme>;

export const calendarDetailSummarySx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
  gap: 1.5,
} satisfies SxProps<Theme>;

/** Key entry information shown as compact, equal-height summary cards. */
export const calendarDetailWhenSx: SxProps<Theme> = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 1.25,
  minWidth: 0,
  p: 1.5,
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.md,
  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.09 : 0.035),
});

export const calendarDetailWhenIconSx: SxProps<Theme> = (theme) => ({
  width: 38,
  height: 38,
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  borderRadius: RADIUS_PX.sm,
  color: "primary.main",
  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.16 : 0.1),
  "& .MuiSvgIcon-root": { fontSize: 20 },
});

export const calendarDetailLabelSx = {
  color: "text.secondary",
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1.3,
  mb: 0.25,
} satisfies SxProps<Theme>;

export const calendarDetailValueSx = {
  fontWeight: 700,
  lineHeight: 1.4,
  overflowWrap: "anywhere",
} satisfies SxProps<Theme>;

export const calendarDetailSectionSx = {
  p: 1.5,
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.md,
  bgcolor: "background.paper",
} satisfies SxProps<Theme>;

export const calendarDetailSectionHeadingSx = {
  display: "flex",
  alignItems: "center",
  gap: 0.75,
  mb: 1,
  color: "text.primary",
  "& .MuiSvgIcon-root": { color: "primary.main", fontSize: 19 },
} satisfies SxProps<Theme>;

export const calendarSectionLabelSx = { mb: 0.75 } satisfies SxProps<Theme>;

export const calendarFileButtonSx = {
  justifyContent: "flex-start",
  width: "100%",
  px: 1,
  py: 1,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "action.hover",
  overflowWrap: "anywhere",
} satisfies SxProps<Theme>;

export const calendarDetailActionsSx = {
  width: "100%",
  justifyContent: "space-between",
  flexWrap: "wrap",
} satisfies SxProps<Theme>;

export const calendarDetailRoutineActionsSx = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  ml: "auto",
} satisfies SxProps<Theme>;

export const calendarFileNameSx = {
  flex: 1,
  minWidth: 0,
  overflowWrap: "anywhere",
} satisfies SxProps<Theme>;

export const calendarEntryFormSx = {
  pt: 1,
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
  alignItems: "start",
  gap: 2,
  "& > *": { minWidth: 0 },
} satisfies SxProps<Theme>;

export const calendarFormFullRowSx = {
  gridColumn: { sm: "1 / -1" },
} satisfies SxProps<Theme>;

/* Small text/layout helpers shared across pages. */
export const alignStartSx = { alignSelf: "flex-start" } satisfies SxProps<Theme>;
export const wrapAnywhereSx = { overflowWrap: "anywhere" } satisfies SxProps<Theme>;
export const preWrapTextSx = {
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
} satisfies SxProps<Theme>;

/* -------------------------------------------------------------------------- */
/* Team Analysis page                                                          */
/* -------------------------------------------------------------------------- */

export const panelTitleRowFull = { ...panelTitleRow, width: "100%" } satisfies SxProps<Theme>;

export const teamWorkloadListSx = (theme: Theme) => ({
  ...scrollColumn(theme),
  minHeight: 0,
  pr: 0.5,
  overscrollBehavior: "contain",
});

/**
 * One team row: initials badge, name over a slim comparison bar, the ticket
 * count, and a chevron that brightens on hover so the row reads as an action.
 */
export const teamWorkloadRowSx = (withDivider: boolean): SxProps<Theme> => (theme) => ({
  display: "grid",
  gridTemplateColumns: "32px minmax(0, 1fr) auto 18px",
  alignItems: "center",
  columnGap: 1.5,
  width: "100%",
  textAlign: "left",
  px: 1,
  py: 1,
  borderRadius: RADIUS_PX.md,
  position: "relative",
  transition: theme.transitions.create("background-color", {
    duration: theme.transitions.duration.shortest,
  }),
  // Hairline between rows, inset to the text so it never touches the edges.
  ...(withDivider && {
    "&::after": {
      content: '""',
      position: "absolute",
      left: 52,
      right: 8,
      bottom: 0,
      height: "1px",
      bgcolor: "divider",
    },
  }),
  "&:hover": {
    bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.06 : 0.035),
    "& .team-workload-chevron": { color: theme.palette.text.primary, transform: "translateX(2px)" },
  },
  "&.Mui-focusVisible": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: -2,
  },
});

/** "4 teams" in the card header: the same quiet pill as the report totals. */
export const teamWorkloadTotalSx: SxProps<Theme> = (theme) => ({
  ml: "auto",
  flexShrink: 0,
  height: 26,
  borderRadius: RADIUS_PX.pill,
  border: 0,
  bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.08 : 0.05),
  fontSize: 12,
  fontWeight: 600,
  "& .MuiChip-label": { px: 1 },
});

/** Initials badge derived from the team name (no new content). */
export const teamWorkloadBadgeSx: SxProps<Theme> = (theme) => ({
  width: 32,
  height: 32,
  borderRadius: RADIUS_PX.sm,
  display: "grid",
  placeItems: "center",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.02em",
  color: theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.primary.dark,
  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.18 : 0.1),
});

export const teamWorkloadNameSx: SxProps<Theme> = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: 1.3,
  mb: 0.75,
};

/** Relative comparison bar: slim, rounded, on a quiet track. */
export const teamWorkloadBarSx: SxProps<Theme> = (theme) => ({
  height: 6,
  borderRadius: RADIUS_PX.pill,
  bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.08 : 0.06),
  "& .MuiLinearProgress-bar": {
    borderRadius: RADIUS_PX.pill,
    backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
  },
});

/** Count figure with its unit beside it ("2 tickets"). */
export const teamWorkloadCountSx: SxProps<Theme> = {
  textAlign: "right",
  whiteSpace: "nowrap",
  fontSize: 12,
  color: "text.secondary",
  "& strong": {
    display: "inline-block",
    mr: 0.5,
    fontSize: 16,
    fontWeight: 600,
    color: "text.primary",
    ...TABULAR_NUMS,
  },
};

export const teamWorkloadChevronSx: SxProps<Theme> = (theme) => ({
  fontSize: 18,
  color: theme.palette.text.disabled,
  transition: theme.transitions.create(["color", "transform"], {
    duration: theme.transitions.duration.shortest,
  }),
});

export const surfacePanelLoadingSx = {
  ...surfacePanel,
  display: "grid",
  placeItems: "center",
  gap: 1.5,
} satisfies SxProps<Theme>;

/* Small layout helpers. */
export const flexFillSx = { minWidth: 0, flex: 1 } satisfies SxProps<Theme>;
export const noShrinkSx = { flexShrink: 0 } satisfies SxProps<Theme>;
export const pushRightNoShrinkSx = { ml: "auto", flexShrink: 0 } satisfies SxProps<Theme>;
export const verticalPadSx = { py: 1 } satisfies SxProps<Theme>;

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
    borderRadius: hasUnsavedChanges ? RADIUS_PX.sm : 0,
    backgroundColor: hasUnsavedChanges
      ? alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.12 : 0.08)
      : "transparent",
    transition: theme.transitions.create(["background-color", "border-color"], {
      duration: theme.transitions.duration.shorter,
    }),
  });

export const timesheetFooterStatusSx = {
  minWidth: { xs: "100%", md: 360 },
  flex: 1,
} satisfies SxProps<Theme>;

/** Estimated vs entered line (kept hidden, as before). */
export const timesheetFooterTargetSx =
  (targetMet: boolean): SxProps<Theme> =>
  (theme) => ({
    display: "none",
    fontSize: 13,
    fontWeight: 600,
    color: targetMet ? theme.palette.success.main : theme.palette.warning.main,
  });

export const timesheetFooterNoteSx = (hasUnsavedChanges: boolean): SxProps<Theme> => ({
  display: "block",
  mt: 0.25,
  lineHeight: 1.35,
  fontWeight: hasUnsavedChanges ? 600 : 400,
});

export const timesheetFooterActionsSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: { xs: "space-between", sm: "flex-end" },
  gap: 1,
  width: { xs: "100%", md: "auto" },
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

export const pillSkeletonSx = { borderRadius: RADIUS_PX.pill } satisfies SxProps<Theme>;

export const ellipsisChipSx = {
  "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
} satisfies SxProps<Theme>;

/* -------------------------------------------------------------------------- */
/* CollapsibleTableView                                                        */
/* -------------------------------------------------------------------------- */

export const collapsibleExpandCellSx = (width: number | undefined) => ({
  width,
  minWidth: width,
  maxWidth: width,
  px: 0,
  textAlign: "center" as const,
});

export const collapsibleExpandButtonSx = { width: 28, height: 28 } satisfies SxProps<Theme>;

export const collapsibleRowSx = (clickable: boolean) => ({
  cursor: clickable ? "pointer" : "default",
});

export const collapsibleBodyCellSx =
  (column: TableStyleColumn, index: number): SxProps<Theme> =>
  (theme) => ({
    ...(
      tableBodyCellForColumnSx({
        column,
        index,
        stickyTableCellSx,
        stickyFirstColumn: false,
      }) as (theme: Theme) => Record<string, unknown>
    )(theme),
    px: 1,
  });

export const collapsibleHeaderCellSx =
  (column: TableStyleColumn, index: number): SxProps<Theme> =>
  (theme) => ({
    ...(
      tableHeaderCellForColumnSx({
        column,
        index,
        tableHeaderCellSx,
        stickyFirstColumn: false,
      }) as (theme: Theme) => Record<string, unknown>
    )(theme),
    px: 1,
  });

export const collapsibleDetailRowCellSx = (open: boolean) => ({
  py: 0,
  borderBottom: open ? undefined : 0,
});

/** Expanded-row field: a plain label/value pair, no framed tile. */
export const collapsibleDetailFieldSx = {
  py: INSET_Y,
  minWidth: 0,
  height: "100%",
} satisfies SxProps<Theme>;

export const collapsibleCardListSx = {
  display: "flex",
  flex: 1,
  minHeight: 0,
  flexDirection: "column",
  gap: 1,
  overflowY: "auto",
  ...insetSx,
} satisfies SxProps<Theme>;

export const collapsibleCardsEmptySx = {
  display: "grid",
  flex: 1,
  minHeight: 220,
  placeItems: "center",
  textAlign: "center",
} satisfies SxProps<Theme>;

export const collapsibleEmptyCellSx = { p: 0, height: 220 } satisfies SxProps<Theme>;

export const collapsibleEmptyStateSx = {
  minHeight: 220,
  display: "grid",
  placeItems: "center",
  textAlign: "center",
} satisfies SxProps<Theme>;

/** Screen-reader-only content (data tables behind charts, live labels). */
export const visuallyHiddenSx = {
  position: "absolute",
  width: "1px",
  height: "1px",
  p: 0,
  m: "-1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

/* -------------------------------------------------------------------------- */
/* Timesheet status legend (components/timesheet/StatusLegend.tsx)             */
/* -------------------------------------------------------------------------- */

/** The key sits flat above the table; its chips carry the colour. */
export const statusLegendSx = {
  py: INSET_Y,
  mb: 1,
} satisfies SxProps<Theme>;

export const statusLegendInfoIconSx = { fontSize: 16, color: "text.secondary" } satisfies SxProps<Theme>;

export const statusLegendTitleSx = {
  fontWeight: 600,
  color: "text.secondary",
} satisfies SxProps<Theme>;

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

export const statusLegendIconSx = (tone: string) => ({ fontSize: 18, color: tone });

export const statusLegendLabelSx = {
  fontWeight: 600,
  color: "text.primary",
  whiteSpace: "nowrap",
} satisfies SxProps<Theme>;

export const statusLegendCountSx =
  (tone: string): SxProps<Theme> =>
  (theme) => ({
    minWidth: 22,
    height: 20,
    px: 0.5,
    display: "inline-grid",
    placeItems: "center",
    borderRadius: RADIUS_PX.pill,
    fontSize: 11,
    fontWeight: 600,
    color: "text.primary",
    bgcolor: alpha(tone, theme.palette.mode === "dark" ? 0.16 : 0.09),
  });

export const statusLegendToggleSx = {
  flexShrink: 0,
  alignSelf: { xs: "flex-start", md: "center" },
  gap: 0.25,
  px: 0.75,
  py: 0.5,
  borderRadius: RADIUS_PX.sm,
  color: "primary.main",
  fontSize: 12,
  fontWeight: 600,
  "&:hover": { bgcolor: "action.hover" },
  "&.Mui-focusVisible": { outline: "2px solid", outlineColor: "primary.main" },
} satisfies SxProps<Theme>;

export const statusLegendChevronSx = (expanded: boolean) => ({
  fontSize: 18,
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
  p: "6px",
  flexShrink: 0,
  borderRadius: "50%",
  color,
  bgcolor: alpha(color, 0.12),
});

export const statusLegendTermSx = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.35,
  color: "text.primary",
  mt: "3px",
} satisfies SxProps<Theme>;

export const statusLegendDefinitionSx = {
  display: "block",
  m: 0,
  mt: 0.25,
  fontSize: 12,
  color: "text.secondary",
  lineHeight: 1.5,
} satisfies SxProps<Theme>;

/** Footnote under the meanings, set off by a hairline (not italics). */
export const statusLegendHintSx = {
  gridColumn: "1 / -1",
  pt: 1.25,
  borderTop: "1px solid",
  borderColor: "divider",
  fontSize: 12,
  color: "text.secondary",
} satisfies SxProps<Theme>;

/* Timesheet mobile day entry and rating guide/distribution. */

export const mobileDayEntrySx = {
  display: "flex",
  flex: 1,
  minHeight: 0,
  flexDirection: "column",
  gap: 1,
} satisfies SxProps<Theme>;

export const mobileDayStripSx = (dayCount: number) => ({
  display: "grid",
  gridTemplateColumns: `repeat(${dayCount}, minmax(0, 1fr))`,
  gap: 0.5,
  flex: 1,
  minWidth: 0,
});

export const mobileDayEntryNavSx = {
  px: 0.5,
} satisfies SxProps<Theme>;

export const mobileDayEntryListSx = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 1,
  pb: 1,
} satisfies SxProps<Theme>;

export const mobileDayEntryEmptySx = {
  display: "grid",
  placeItems: "center",
  minHeight: 220,
} satisfies SxProps<Theme>;

export const mobileDayEntryTaskNameSx = {
  overflowWrap: "anywhere",
  mb: 1,
} satisfies SxProps<Theme>;

export const mobileDayEntryOwnerLabelSx = {
  mr: 0.5,
} satisfies SxProps<Theme>;

export const mobileDayEntryOwnerFieldSx = {
  width: 140,
  flexShrink: 0,
} satisfies SxProps<Theme>;

export const mobileDayEntryHintSx = {
  mt: 0.5,
} satisfies SxProps<Theme>;

export const mobileDayEntrySelectLabelSx = {
  mr: 0,
} satisfies SxProps<Theme>;

export const ratingLegendSx = {
  display: "flex",
  flexWrap: "wrap",
  gap: "4px 10px",
  alignItems: "center",
} satisfies SxProps<Theme>;

export const ratingGuideRowSx = {
  display: "flex",
  alignItems: "flex-start",
} satisfies SxProps<Theme>;

export const ratingGuideScoreSx = {
  fontSize: 14,
  lineHeight: 1.5,
} satisfies SxProps<Theme>;

export const ratingGuideDescriptionSx = {
  fontSize: 14,
  lineHeight: 1.5,
  ml: 1,
} satisfies SxProps<Theme>;

export const ratingDistributionTileSx = {
  height: "100%",
  ...insetSx,
  textAlign: "center",
} satisfies SxProps<Theme>;

export const ratingTileHeaderSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 0.5,
} satisfies SxProps<Theme>;

export const ratingTileStarSx = {
  color: "warning.main",
  display: "flex",
} satisfies SxProps<Theme>;

export const ratingTileBodySx = {
  mt: 1,
} satisfies SxProps<Theme>;

export const ratingGuideCardSx = {
  ...insetSx,
  height: "100%",
} satisfies SxProps<Theme>;

/* -------------------------------------------------------------------------- */
/* Page and component layout (moved from inline sx)                            */
/* -------------------------------------------------------------------------- */

// components/approval/ApprovalDetailedView.tsx
export const approvalLoadingSx = {
  height: "40dvh", display: "flex", alignItems: "center", justifyContent: "center",
} satisfies SxProps<Theme>;

export const approvalLoadingTextSx = {
  fontSize: 13,
} satisfies SxProps<Theme>;

export const approvalTableAreaSx = {
  flex: 1, minHeight: 0, overflow: "hidden", pb: 0.25,
} satisfies SxProps<Theme>;

export const fullHeightSx = {
  height: "100%",
} satisfies SxProps<Theme>;


// components/approval/UnlockComponent.tsx
export const unlockPanelSx = {
  ...tablePanelSx({ height: "100%" }),
  width: { xs: "100%", lg: 320 },
  minWidth: { xs: "100%", lg: 320 },
  maxWidth: { xs: "100%", lg: 320 },
  height: { xs: 280, lg: "100%" },
  flex: { xs: "0 0 auto", lg: "0 0 320px" },
} satisfies SxProps<Theme>;

export const unlockListSx = {
  ...insetSx, flex: 1, minHeight: 0, overflowY: "auto",
} satisfies SxProps<Theme>;

export const unlockAvatarSx = {
  width: 30, height: 30, bgcolor: "warning.main", fontSize: 13, fontWeight: 600,
} satisfies SxProps<Theme>;


// components/approval/detail/ApprovalDetailSections.tsx
export const iconMediumSx = {
  fontSize: 20,
} satisfies SxProps<Theme>;


// components/approval/detail/ApprovalTableCells.tsx
export const approvalCellNoteSx = {
  marginLeft: 4, fontSize: 13,
} satisfies SxProps<Theme>;

export const approvalCellRowSx = {
  display: "flex", alignItems: "center",
} satisfies SxProps<Theme>;

export const approvalExpandButtonSx = {
  p: 0, mr: 0.5,
} satisfies SxProps<Theme>;

export const approvalCellTitleSx = {
  fontSize: 13, fontWeight: 500,
} satisfies SxProps<Theme>;

export const approvalCellMetaSx = {
  fontSize: "0.75rem", color: "text.secondary",
} satisfies SxProps<Theme>;

export const approvalActionButtonSx = {
  textTransform: "none", boxShadow: "none", "& .MuiButton-startIcon": { mr: 0.5 },
} satisfies SxProps<Theme>;


// components/approval/detail/RejectReasonDialog.tsx
export const rejectTaskNameSx = {
  fontSize: 13, color: "text.secondary", mb: 0.5,
} satisfies SxProps<Theme>;

export const rejectWarningSx = {
  fontSize: 13, color: "text.secondary", mb: 1.5,
} satisfies SxProps<Theme>;


// components/approval/detail/useApprovalColumns.tsx
export const approvalStatusSelectSx = {
  width: 118, height: 32, fontSize: 12, "& .MuiSelect-select": { py: 0.5, px: 1 },
} satisfies SxProps<Theme>;


// components/common/ActionDivider.tsx
export const actionDividerSx = {
  mx: 0.5,
} satisfies SxProps<Theme>;


// components/common/CommonSnackbar.tsx
export const snackbarAlertSx = {
  width: "100%",
  minWidth: { xs: "auto", sm: 350 },
  borderRadius: RADIUS_PX.md,
  alignItems: "center",
  fontSize: "0.9375rem",
} satisfies SxProps<Theme>;


// components/common/DateRange.tsx
export const dateRangeIconSx = {
  fontSize: "1rem", color: "primary.main", flexShrink: 0,
} satisfies SxProps<Theme>;

export const dateRangeValueSx = {
  color: "text.primary",
  fontWeight: 600,
  overflow: "hidden",
  textOverflow: "ellipsis",
} satisfies SxProps<Theme>;

export const dateRangeMetaSx = {
  color: "text.secondary", fontWeight: 500,
} satisfies SxProps<Theme>;


// components/common/EmptyTableState.tsx
export const emptyTableStateSx = {
  maxWidth: 360, px: 2, textAlign: "center",
} satisfies SxProps<Theme>;

export const emptyTableIconSx = {
  color: "primary.main", fontSize: 42, opacity: 0.72,
} satisfies SxProps<Theme>;


// components/common/FileUploadField.tsx
export const fileUploadButtonSx = {
  flexShrink: 0, alignSelf: { xs: "flex-start", sm: "center" },
} satisfies SxProps<Theme>;

export const fileUploadNameSx = {
  minWidth: 0, overflowWrap: "anywhere",
} satisfies SxProps<Theme>;

export const fileUploadRulesSx = {
  mt: 0.75, mb: 0, pl: 2.5, color: "text.secondary",
} satisfies SxProps<Theme>;

export const strongTextSx = {
  fontWeight: 600,
} satisfies SxProps<Theme>;

export const fileUploadErrorSx = {
  mt: 0.5,
} satisfies SxProps<Theme>;


// components/common/FilterPopover.tsx
export const filterDialogContentSx = {
  flex: "1 1 auto", overflowY: "auto",
} satisfies SxProps<Theme>;

export const filterDialogBodySx = {
  pt: 0.5,
} satisfies SxProps<Theme>;

export const filterResetButtonSx = {
  mr: "auto",
} satisfies SxProps<Theme>;


// components/common/PageLoadingSkeleton.tsx
export const pageSkeletonSx = {
  display: "flex",
  flex: 1,
  minHeight: 0,
  flexDirection: "column",
  gap: { xs: 1.25, sm: 2 },
  ...insetSx,
} satisfies SxProps<Theme>;

export const pageSkeletonSubtitleSx = {
  display: { xs: "none", sm: "block" },
} satisfies SxProps<Theme>;

export const pageSkeletonMetricsSx = {
  display: "grid",
  gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
  gap: 1,
} satisfies SxProps<Theme>;

export const pageSkeletonTableSx = {
  display: "flex", flex: 1, minHeight: 280, flexDirection: "column", ...insetSx,
} satisfies SxProps<Theme>;


// components/common/TableLoadingState.tsx
export const tableLoadingCardSx = {
  border: 1, borderColor: "divider", borderRadius: RADIUS_PX.md, ...insetSx,
} satisfies SxProps<Theme>;


// components/common/TableView.tsx
export const tableCardListSx = {
  display: "flex",
  flex: 1,
  minHeight: 0,
  flexDirection: "column",
  gap: 1,
  overflowY: "auto",
  ...insetSx,
} satisfies SxProps<Theme>;

export const tableCardsEmptySx = {
  display: "grid",
  flex: 1,
  minHeight: 220,
  placeItems: "center",
} satisfies SxProps<Theme>;

export const tableExpandButtonSx = {
  width: 30, height: 30, flexShrink: 0,
} satisfies SxProps<Theme>;


// components/tickets/CreateModal.tsx
export const topSpacingSx = {
  mt: 1,
} satisfies SxProps<Theme>;

export const attachmentHintSx = {
  ml: { sm: 1 },
} satisfies SxProps<Theme>;


// components/tickets/detail/TicketDetailSections.tsx
export const ticketDetailNoteSx = {
  alignSelf: "flex-start", mt: 0.5,
} satisfies SxProps<Theme>;

export const ticketDetailFileRowSx = {
  display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1, mb: 0.5,
} satisfies SxProps<Theme>;

export const noWrapSx = {
  whiteSpace: "nowrap",
} satisfies SxProps<Theme>;

export const ticketDetailFileMetaSx = {
  display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.75,
} satisfies SxProps<Theme>;


// components/timesheet/AssignCostMasterTasksModal.tsx
/** Fixed height only while the project tree is shown; messages size to their content. */
export const assignTaskContentSx = (hasTree: boolean) => ({
  height: hasTree ? 560 : "auto",
  overflow: "auto",
}) satisfies SxProps<Theme>;

export const assignTaskLoadingSx = {
  py: 6,
} satisfies SxProps<Theme>;

export const assignTaskTreeSx = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.md,
} satisfies SxProps<Theme>;

export const assignTaskToolbarSx = {
  px: INSET_X, py: INSET_Y,
} satisfies SxProps<Theme>;

export const assignTaskMilestoneListSx = {
  pb: 1, pl: 4, pr: 1,
} satisfies SxProps<Theme>;

export const assignTaskTaskListSx = {
  pl: 4,
} satisfies SxProps<Theme>;

export const assignTaskNestedListSx = {
  pl: 5,
} satisfies SxProps<Theme>;


// components/timesheet/CreateUndefinedModal.tsx
export const undefinedJobsFormSx = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
} satisfies SxProps<Theme>;

export const undefinedJobsErrorSx = {
  color: "error.main",
  fontSize: "13px",
  marginTop: "-5px",
} satisfies SxProps<Theme>;

export const undefinedJobsActionsSx = {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "4px",
} satisfies SxProps<Theme>;


// components/timesheet/ERPQuotationModal.tsx
export const erpContentSx = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  overflow: "hidden",
} satisfies SxProps<Theme>;

export const erpTableAreaSx = {
  flex: 1,
  minHeight: 0,
} satisfies SxProps<Theme>;


// components/timesheet/LogDetailDialog.tsx
export const logDetailSummarySx = {
  display: "flex",
  alignItems: { xs: "flex-start", sm: "center" },
  flexDirection: { xs: "column", sm: "row" },
  justifyContent: "space-between",
  gap: 1,
  ...insetSx,
  border: 1,
  borderColor: "divider",
  borderRadius: RADIUS_PX.md,
} satisfies SxProps<Theme>;


// components/timesheet/TimeSheetPreviewModal.tsx
export const previewSectionSx = {
  mt: 2,
} satisfies SxProps<Theme>;

export const previewSectionTitleSx = {
  fontSize: 15,
  fontWeight: 600,
  color: "text.primary",
  mb: 0.5,
} satisfies SxProps<Theme>;

export const previewActionsSx = {
  display: "flex",
  justifyContent: "flex-end",
  mt: 2,
} satisfies SxProps<Theme>;


// components/timesheet/TimeSheetTicketsModal.tsx
export const ticketsDialogContentSx = {
  height: 520,
} satisfies SxProps<Theme>;

export const ticketsDialogNoteSx = {
  px: INSET_X, pb: 1.5, color: "text.secondary", fontSize: 13,
} satisfies SxProps<Theme>;


// components/timesheet/TimeSheetUnlockRequestModal.tsx
export const unlockRequestSummarySx = {
  mb: 1.5,
} satisfies SxProps<Theme>;


// pages/Landing.tsx
export const budgetSubjectButtonSx = {
  display: "block",
  width: "100%",
  minWidth: 0,
  p: 0.5,
  textAlign: "left",
  textTransform: "none",
  color: "text.primary",
  fontWeight: 400,
  lineHeight: 1.5,
  "&:hover": { color: "primary.main" },
  "&.Mui-focusVisible": {
    outline: "2px solid",
    outlineColor: "primary.main",
    outlineOffset: 2,
  },
} satisfies SxProps<Theme>;

export const quotationPreviewSx = {
  display: "grid", gap: 2.5,
} satisfies SxProps<Theme>;

export const quotationPreviewTitleSx = {
  mt: 0.5, overflowWrap: "anywhere",
} satisfies SxProps<Theme>;

export const quotationFactsSx = {
  m: 0,
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
  gap: 2,
  "& dt": { color: "text.secondary", typography: "body2" },
  "& dd": {
    m: 0,
    mt: 0.5,
    overflowWrap: "anywhere",
    fontVariantNumeric: "tabular-nums",
  },
} satisfies SxProps<Theme>;


// pages/Login.tsx
/** Secondary link under the primary action ("Forgot password?"). */
export const authLinkSx = {
  mt: 2.5,
  fontSize: 14,
  fontWeight: 500,
  textDecoration: "none",
  "&:hover": { textDecoration: "underline", textUnderlineOffset: "3px" },
} satisfies SxProps<Theme>;


// pages/PhaseConfiguration.tsx
export const fullWidthSx = {
  width: "100%",
} satisfies SxProps<Theme>;

export const smUpFlexSx = {
  display: { xs: "none", sm: "flex" },
} satisfies SxProps<Theme>;


// pages/ProjectConfiguration.tsx
export const projectContentSx = {
  ...scrollableContent, pt: 0.75,
} satisfies SxProps<Theme>;

export const projectFieldHintSx = {
  mt: 0.5, ml: 1.75,
} satisfies SxProps<Theme>;


// pages/general/Documents.tsx
export const documentNameCellSx = {
  ...fileNameCellSx,
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  maxWidth: 280,
} satisfies SxProps<Theme>;


// pages/tickets/InternalTickets.tsx
export const workLetEmptySx = {
  height: "100%", minHeight: 240, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 1, px: 3,
} satisfies SxProps<Theme>;

export const workLetEmptyIconSx = {
  fontSize: 40, color: "text.secondary", opacity: 0.65,
} satisfies SxProps<Theme>;

export const workLetEmptyTextSx = {
  maxWidth: 440,
} satisfies SxProps<Theme>;


// pages/timesheet/Approval.tsx
export const approvalPanelSx = {
  ...flexFillPanel, display: "flex", flexDirection: "column",
} satisfies SxProps<Theme>;


// pages/timesheet/Submission.tsx
export const submissionLayoutSx = {
  width: "100%",
  height: "100%",
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
} satisfies SxProps<Theme>;

export const submissionLoadingSx = {
  flex: 1, p: 1,
} satisfies SxProps<Theme>;


// pages/timesheet/TimeSheet.tsx
export const flexFillHeightSx = {
  flex: 1, minHeight: 0,
} satisfies SxProps<Theme>;


// pages/timesheet/TimesheetAnalysis.tsx
export const analysisChartAreaSx = {
  flex: 1, minHeight: { xs: 240, sm: 0 }, height: "100%", width: "100%",
} satisfies SxProps<Theme>;

export const analysisChartPanelSx = {
  ...surfacePanel,
  height: "100%",
  minHeight: { xs: 270, sm: 320, md: 350 },
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  ...insetSx,
} satisfies SxProps<Theme>;

export const analysisChartSkeletonSx = {
  height: "100%", minHeight: { xs: 240, sm: 340 },
} satisfies SxProps<Theme>;

export const analysisLegendRowSx = {
  mb: 1.25, flexShrink: 0,
} satisfies SxProps<Theme>;

export const analysisChartEmptySx = {
  display: "grid",
  placeItems: "center",
  height: "100%",
  minHeight: { xs: 220, sm: 340 },
} satisfies SxProps<Theme>;


// pages/timesheet/TimesheetLogs.tsx
export const logsHintSx = {
  display: "block", mb: 1,
} satisfies SxProps<Theme>;


// pages/timesheet/logs/LogStatusIcons.tsx
export const logStatusIconSx = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
} satisfies SxProps<Theme>;


// pages/timesheet/submission/SubmissionGrid.tsx
export const timesheetCellTextSx = {
  fontSize: "0.875rem",
} satisfies SxProps<Theme>;


// pages/users/ForgotPassword.tsx
/** Intro line under the page title. */
export const authIntroSx = {
  mt: 1,
  mb: 3.5,
  fontSize: 14,
  lineHeight: 1.5,
} satisfies SxProps<Theme>;

export const authBackLinkSx = {
  mt: 2.5,
  fontSize: 14,
  fontWeight: 500,
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 0.75,
  "&:hover": { textDecoration: "underline", textUnderlineOffset: "3px" },
} satisfies SxProps<Theme>;


// pages/users/Roles.tsx
export const flexColumnSx = {
  display: "flex", flexDirection: "column",
} satisfies SxProps<Theme>;

export const smUpBlockSx = {
  display: { xs: "none", sm: "block" },
} satisfies SxProps<Theme>;

/** Permission filters: a flat row above the table, no framed card. */
export const rolesFilterBarSx = {
  py: 1,
  mb: 1,
} satisfies SxProps<Theme>;

export const rolesFilterLabelSx = {
  minWidth: { md: 230 }, flex: 1,
} satisfies SxProps<Theme>;

export const rolesSearchFieldSx = {
  width: { xs: "100%", md: 310 }, flexShrink: 0,
} satisfies SxProps<Theme>;

export const rolesSelectFieldSx = {
  width: { xs: "100%", md: 220 }, flexShrink: 0,
} satisfies SxProps<Theme>;

export const rolesMobileActionBarSx = {
  display: { xs: "flex", sm: "none" },
  position: "sticky",
  bottom: 0,
  zIndex: 2,
  justifyContent: "flex-end",
  gap: 1,
  ...insetSx,
  bgcolor: "background.paper",
  borderTop: 1,
  borderColor: "divider",
} satisfies SxProps<Theme>;

