/** Foundations: shared helpers, forms, layout and navigation styles. */
import { alpha, type Theme } from "@mui/material/styles";
import {
  ELEVATION,
  FONT,
  INSET_X,
  MOTION,
  RADIUS,
  RADIUS_PX,
  STATUS_COLORS,
  STATUS_COLOR_DEFAULT,
  TABULAR_NUMS,
  insetSx,
} from "@/styles/tokens";
import { type SxProps } from "@mui/material";

export type AlphaStyleArgs = { alpha: typeof alpha };

export type AccentStyleArgs = { accent: string };

export type ResponsiveStyleWidth =
  | number
  | string
  | Partial<Record<"xs" | "sm" | "md" | "lg" | "xl", number | string>>;

export type TableStyleColumn = {
  label?: string;
  width?: ResponsiveStyleWidth;
  numeric?: boolean;
  format?: string;
  align?: "left" | "center" | "right";
};

/** Same rule as components/common/tableCell columnAlign (kept here to avoid an import cycle). */
export const resolveColumnAlign = (column: TableStyleColumn) =>
  column.align ??
  (column.numeric || column.format === "hours" ? "right" : "left");

export const justifyFor = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
} as const;

/** The row actions column stays pinned to the right edge while the table scrolls. */
export const isActionsColumn = (column: TableStyleColumn) =>
  column.label === "Actions";

export const columnWidth = (column: TableStyleColumn) => column.width ?? 100;

export const pinnedRightShadow = (theme: Theme) => `-1px 0 0 ${theme.palette.divider}`;

export type StaticStyleObject = Record<string, unknown>;

export type ThemeStyleCallback = (theme: Theme) => StaticStyleObject;

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
export const detailLabelSx = {
  color: "text.secondary",
  fontSize: FONT.xs,
  fontWeight: 600,
  lineHeight: 1.2,
  textTransform: "capitalize",
};

/** Shared detail value  styles style or helper for the related interface. */
export const detailValueSx = {
  color: "text.primary",
  fontSize: { xs: FONT.xs, sm: FONT.sm },
  fontWeight: 600,
  lineHeight: 1.35,
  overflowWrap: "anywhere",
};

/** Shared compact field  styles style or helper for the related interface. */
export const compactFieldSx = (theme: Theme) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: RADIUS_PX.sm,
    bgcolor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.text.primary, 0.025)
        : alpha(theme.palette.primary.main, 0.035),
  },
});

/** Shared confirmation message  styles style or helper for the related interface. */
export const confirmationMessageSx = {
  mb: 2,
  color: "text.secondary",
};

/** Shared attachment section  styles style or helper for the related interface. */
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

/** Shared attachment header  styles style or helper for the related interface. */
export const attachmentHeaderSx = {
  alignItems: "center",
  display: "flex",
  gap: 0.75,
  mb: 1.15,
};

/** Shared attachment list  styles style or helper for the related interface. */
export const attachmentListSx = {
  display: "grid",
  gap: 0.75,
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
};

/** Shared attachment item  styles style or helper for the related interface. */
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

/** Shared attachment icon  styles style or helper for the related interface. */
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

/** Shared attachment name  styles style or helper for the related interface. */
export const attachmentNameSx = {
  color: "text.primary",
  flex: 1,
  fontSize: FONT.sm,
  fontWeight: 600,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

/** Shared attachment open  styles style or helper for the related interface. */
export const attachmentOpenSx = {
  color: "primary.main",
  flexShrink: 0,
  fontSize: FONT.xs,
  fontWeight: 600,
};

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
    fontSize: FONT.sm,
    fontWeight: 500,
    lineHeight: 1.3,
    // Labels wrap rather than truncate: on phones two metrics share a row.
    overflowWrap: "anywhere",
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
    fontSize: { xs: FONT.lg, sm: FONT.xl },
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
  fontSize: FONT.xs,
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

/** Shared summary metric skeleton helper  styles style or helper for the related interface. */
export const summaryMetricSkeletonHelperSx = {
  width: "70%",
} satisfies SxProps<Theme>;

/** Table value coloured red when negative (e.g. hours over budget). */
export const negativeValueSx = (negative: boolean) =>
  negative ? { color: "error.main", fontWeight: 600 } : {};

/** Quiet "nothing to flag" text used where only exceptions get a chip. */
export const quietStatusTextSx = {
  color: "text.secondary",
  fontSize: FONT.sm,
} satisfies SxProps<Theme>;

/** Shared bordered surface  styles style or helper for the related interface. */
export const borderedSurfaceSx = {
  border: "1px solid",
  borderColor: "divider",
};

/** Small layout helper that pushes the following content to the far edge. */
export const pushRightSx = { ml: "auto" };

/** Shared margin top small  styles style or helper for the related interface. */
export const marginTopSmallSx = { mt: 0.35 };

/** Shared margin top medium  styles style or helper for the related interface. */
export const marginTopMediumSx = { mt: 0.5 };

/** Shared margin top section  styles style or helper for the related interface. */
export const marginTopSectionSx = { mt: 2 };

/** Shared margin bottom section  styles style or helper for the related interface. */
export const marginBottomSectionSx = { mb: 2 };

/** Shared min width zero  styles style or helper for the related interface. */
export const minWidthZeroSx = { minWidth: 0 };

/** Shared inline center gap  styles style or helper for the related interface. */
export const inlineCenterGapSx = {
  display: "flex",
  alignItems: "center",
  gap: 1,
};

/** Shared split-panel geometry for desktop side-by-side views and mobile stacks. */
export const splitPanelContent: SxProps<Theme> = {
  width: "100%",
  height: "100%",
  minHeight: 0,
  display: "flex",
  flexDirection: { xs: "column", lg: "row" },
  gap: 1.5,
  overflow: "hidden",
};

/** Shared flex fill panel style or helper for the related interface. */
export const flexFillPanel: SxProps<Theme> = {
  flex: 1,
  minHeight: 0,
  overflow: "hidden",
};

/** Shared overview grid style or helper for the related interface. */
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

/** Grid placement for the primary overview panel. */
export const overviewPrimaryGridItem: SxProps<Theme> = {
  minHeight: { xs: 260, md: 0 },
  gridColumn: { xs: "1", md: "span 7" },
  minWidth: 0,
};

/** Grid placement for the secondary overview panel. */
export const overviewSecondaryGridItem: SxProps<Theme> = {
  minHeight: { xs: 260, md: 0 },
  gridColumn: { xs: "1", md: "span 5" },
  minWidth: 0,
};

/** Full-width grid placement for the overview's lower panel. */
export const overviewFullGridItem: SxProps<Theme> = {
  minHeight: 0,
  gridColumn: { xs: "1", md: "1 / -1" },
  minWidth: 0,
  overflow: "hidden",
};

/** Shared surface panel style or helper for the related interface. */
export const surfacePanel = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.lg,
  ...insetSx,
  height: "100%",
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
} satisfies SxProps<Theme>;

/** Keeps a panel heading from shrinking when the body below it scrolls. */
export const panelTitleRow = {
  mb: 1.25,
  flexShrink: 0,
} satisfies SxProps<Theme>;

/** Shared scroll column style or helper for the related interface. */
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

/** Shared large muted icon style or helper for the related interface. */
export const largeMutedIcon: SxProps<Theme> = {
  fontSize: FONT.xxxl,
  opacity: 0.4,
};

/** Lets a child section occupy all available height in its flex parent. */
export const fillContainer: SxProps<Theme> = {
  height: "100%",
  minHeight: 0,
};

/** Section title for a numbered step ("Step 1 · Choose phase"). */
export const stepLabel = {
  color: "text.primary",
  display: "block",
  fontSize: FONT.sm,
  fontWeight: 600,
  lineHeight: 1.35,
} satisfies SxProps<Theme>;

/** Shared helper text style or helper for the related interface. */
export const helperText = {
  display: { xs: "none", sm: "block" },
  color: "text.secondary",
  fontSize: FONT.xs,
  lineHeight: 1.45,
} satisfies SxProps<Theme>;

/** A step/section that sits flat on the page; spacing separates it. */
/** Minimal vertical spacing for a flat form or content section. */
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
} satisfies SxProps<Theme>;

/** Shared table section style or helper for the related interface. */
export const tableSection = {
  flex: "1 1 auto",
  width: "100%",
  minWidth: 0,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  gap: 1,
} satisfies SxProps<Theme>;

/** Shared table panel fill style or helper for the related interface. */
export const tablePanelFill = {
  flex: "1 1 0",
  width: "100%",
  minWidth: 0,
  height: "100%",
  overflow: "hidden",
} satisfies SxProps<Theme>;

/** Page footer bar: flat, set off from the content by one hairline. */
/** Flat footer bar separated from page content by a single divider. */
export const footerSurface = {
  pt: 1.5,
  borderTop: "1px solid",
  borderColor: "divider",
} satisfies SxProps<Theme>;

/** Shared primary save button style or helper for the related interface. */
export const primarySaveButton = {
  minWidth: { xs: "100%", sm: 150 },
} satisfies SxProps<Theme>;

/** Shared count chip style or helper for the related interface. */
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
    fontSize: FONT.xs,
    fontWeight: 600,
    "&& .MuiChip-label": { px: 0.75, color: selected ? theme.palette.text.primary : theme.palette.text.secondary },
  });

/** Shared meta chip style or helper for the related interface. */
export const metaChip = {
  height: 28,
  px: 0.75,
  borderColor: "divider",
  color: "text.primary",
  bgcolor: "background.paper",
  fontSize: FONT.xs,
  fontWeight: 600,
  "& .MuiChip-icon": {
    color: "primary.main",
  },
} satisfies SxProps<Theme>;

/** Shared compact checkbox style or helper for the related interface. */
export const compactCheckbox = {
  color: "text.secondary",
  p: 0.5,
  "&.Mui-checked": {
    color: "primary.main",
  },
} satisfies SxProps<Theme>;

/** Shared dashed muted chip style or helper for the related interface. */
export const dashedMutedChip = {
  height: 22,
  borderColor: "divider",
  color: "text.secondary",
  borderStyle: "dashed",
  fontSize: FONT.xs,
  fontWeight: 600,
} satisfies SxProps<Theme>;

/** Shared strong inline text style or helper for the related interface. */
export const strongInlineText = {
  fontWeight: 600,
  color: "text.primary",
} satisfies SxProps<Theme>;

/** Shared warning outline chip style or helper for the related interface. */
export const warningOutlineChip = {
  height: 22,
  borderColor: "warning.main",
  // Amber text needs the deeper shade on light surfaces (AA).
  color: (theme: Theme) => (theme.palette.mode === "dark" ? theme.palette.warning.main : theme.palette.warning.dark),
  fontWeight: 600,
} satisfies SxProps<Theme>;

/** Shared table row status style or helper for the related interface. */
export type TableRowStatus = "error" | "warning" | "success";

/**
 * A row tint as an overlay on the cell's own background. Pinned (sticky)
 * cells keep their solid surface underneath, so scrolled content can never
 * show through them on hover, selection or a status highlight.
 */
export const tintLayer = (color: string) => ({
  backgroundImage: `linear-gradient(${color}, ${color})`,
});

/** Urgent rows: amber for an active reminder, red for an overdue date. */
export const urgentRowHighlight =
  (isAlarm: boolean): SxProps<Theme> =>
  (theme) => {
    const color = isAlarm ? theme.palette.warning.main : theme.palette.error.main;

    return {
      "&& .MuiTableCell-body, && td": {
        ...tintLayer(alpha(
          color,
          theme.palette.mode === "dark" ? 0.055 : 0.025,
        )),
      },
      "&& .MuiTableCell-body:first-of-type, && td:first-of-type": {
        boxShadow: `inset ${isAlarm ? 4 : 3}px 0 0 ${alpha(color, isAlarm ? 0.9 : 0.68)}`,
      },
      "&&:hover .MuiTableCell-body, &&:hover td": {
        ...tintLayer(alpha(
          color,
          theme.palette.mode === "dark" ? 0.095 : 0.045,
        )),
      },
    };
  };

/** Shared priority alarm row highlight style or helper for the related interface. */
export const priorityAlarmRowHighlight = () => urgentRowHighlight(true);

/** Shared priority due row highlight style or helper for the related interface. */
export const priorityDueRowHighlight = () => urgentRowHighlight(false);

/** Prevents flex and grid children from forcing horizontal overflow. */
export const minWidthZero = {
  minWidth: 0,
} satisfies SxProps<Theme>;

/** Shared page fill style or helper for the related interface. */
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

/** Shared tab panel content style or helper for the related interface. */
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

/** Shared week selector panel style or helper for the related interface. */
export const weekSelectorPanel = (
  fullRowOnMobile: boolean,
): SxProps<Theme> => ({
  display: "grid",
  // Arrow columns size to the buttons; the same 8px inset on every side
  // keeps both arrows equally spaced from the pill's edge.
  gridTemplateColumns: "auto minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 1,
  width: { xs: "100%", md: "auto" },
  minWidth: { md: 320 },
  gridColumn: { xs: fullRowOnMobile ? "1" : "1 / -1", md: "auto" },
  gridRow: { xs: 2, md: "auto" },
  p: 0.5,
  // The arrows' own left padding (calendarNavControlsSx) would put
  // 8px on the inner side of the right arrow only.
  "& > .week-nav": { pl: 0 },
  border: "1px solid",
  borderColor: "divider",
  // Fully rounded so the round previous / next buttons nest inside it.
  borderRadius: RADIUS_PX.pill,
  bgcolor: "background.paper",
});

/** Centers the week label while allowing long ranges to truncate safely. */
export const centeredTextGroup = {
  minWidth: 0,
  textAlign: "center",
} satisfies SxProps<Theme>;

/** Shared compact week chip style or helper for the related interface. */
export const compactWeekChip = {
  minWidth: 96,
  fontWeight: 600,
  px: 1,
} satisfies SxProps<Theme>;

/** Shared nowrap responsive text style or helper for the related interface. */
export const nowrapResponsiveText = {
  whiteSpace: { xs: "normal", sm: "nowrap" },
  lineHeight: 1.25,
} satisfies SxProps<Theme>;

/** Shared header action badge style or helper for the related interface. */
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

/** Shared compact header button style or helper for the related interface. */
export const compactHeaderButton = {
  minWidth: 0,
  fontWeight: 600,
  fontSize: { xs: FONT.xs, sm: FONT.sm },
  textTransform: "none",
} satisfies SxProps<Theme>;

/** Shared action tone style or helper for the related interface. */
export type ActionTone =
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "default";

/** Shared action menu item style or helper for the related interface. */
export const actionMenuItem =
  (color: ActionTone = "default") =>
  (theme: Theme) => {
    const itemColor =
      color === "default"
        ? theme.palette.text.primary
        : theme.palette[color].main;
    return {
      alignItems: "center",
      gap: 1,
      // Inset only by the list's 8px padding, so the nested radius follows
      // outer = inner + padding: 12px menu − 8px = 4px item.
      mx: 0,
      my: 0,
      borderRadius: `${RADIUS.md - 8}px`,
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
        fontSize: FONT.sm,
        fontWeight: 600,
        lineHeight: 1.25,
      },
      "& .MuiListItemText-secondary": {
        color: theme.palette.text.secondary,
        fontSize: FONT.xs,
        lineHeight: 1.25,
        mt: 0.25,
      },
      "&:hover": {
        bgcolor: theme.palette.action.hover,
        borderColor: theme.palette.divider,
      },
    };
  };

/** Shared action menu section style or helper for the related interface. */
export const actionMenuSection = {
  px: INSET_X,
  pt: 1,
  pb: 0.35,
  color: "text.secondary",
  fontSize: FONT.xs,
  fontWeight: 600,
  letterSpacing: 0,
  textTransform: "uppercase",
} satisfies SxProps<Theme>;

/** Shared action menu paper style or helper for the related interface. */
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

/** Shared compact divider style or helper for the related interface. */
export const compactDivider = {
  my: 0.5,
} satisfies SxProps<Theme>;

/** Layout for the icon-and-message body of the shared error dialog. */
export const errorDialogContent = {
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
  minHeight: 112,
} satisfies SxProps<Theme>;

/** Shared error dialog message style or helper for the related interface. */
export const errorDialogMessage = {
  alignItems: "center",
  display: "flex",
  gap: 1.5,
  textAlign: "center",
} satisfies SxProps<Theme>;

/** Shared error dialog icon style or helper for the related interface. */
export const errorDialogIcon = {
  flexShrink: 0,
  fontSize: FONT.xxl,
} satisfies SxProps<Theme>;

/** Shared pre line text style or helper for the related interface. */
export const preLineText = {
  whiteSpace: "pre-line",
} satisfies SxProps<Theme>;

/** Shared list item reset style or helper for the related interface. */
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
/** Base content area for the application's persistent navigation sidebar. */
export const sidebarContent = {
  px: 0.75,
  pt: 0.5,
  pb: 1,
} satisfies SxProps<Theme>;

/** Shared sidebar section style or helper for the related interface. */
export const sidebarSection = (height: number) => (theme: Theme) => ({
  alignItems: "flex-end",
  display: "flex",
  height,
  // The 4px gaps around it come from the list's gap; see sidebarRowSx.
  px: 1,
  color: theme.palette.text.secondary,
  fontSize: FONT.xs,
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

/**
 * One sidebar row (optional section header + item). A flex column, so the
 * 4px margins above and below each header and item add up instead of
 * collapsing into each other.
 */
export const sidebarRowSx = {
  display: "flex",
  flexDirection: "column",
  // 4px between a section header and its first item.
  gap: 0.5,
} satisfies SxProps<Theme>;

/** The sidebar list: 4px between rows (items and section headers alike). */
export const sidebarListSx = {
  display: "flex",
  flexDirection: "column",
  gap: 0.5,
} satisfies SxProps<Theme>;

/** Shared sidebar section divider style or helper for the related interface. */
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
export const sidebarSelectedColor = (theme: Theme) =>
  theme.palette.mode === "dark"
    ? theme.palette.primary.light
    : theme.palette.primary.dark;

/** Shared sidebar item style or helper for the related interface. */
export const sidebarItem =
  (selected: boolean): SxProps<Theme> =>
  (theme) => {
    const isDark = theme.palette.mode === "dark";
    return {
      position: "relative",
      alignItems: "center",
      minHeight: 36,
      // The 4px gaps between items come from the list's gap; see sidebarRowSx.
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

/**
 * Accent pill beside the selected sidebar item. It is a motion `layoutId`
 * element, so it glides between items when the selection changes. Anchored
 * to the bottom of the list item so section headers above don't offset it.
 */
export const sidebarActiveIndicatorSx = (): SxProps<Theme> => (theme) => ({
  position: "absolute",
  left: -4,
  // Half the 36px item height − half this 18px pill.
  bottom: 9,
  width: 3,
  height: 18,
  borderRadius: RADIUS_PX.pill,
  bgcolor:
    theme.palette.mode === "dark"
      ? theme.palette.primary.light
      : theme.palette.primary.main,
  zIndex: 1,
  pointerEvents: "none",
});

/** Shared sidebar icon style or helper for the related interface. */
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

/** Shared sidebar item text style or helper for the related interface. */
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
      fontSize: FONT.sm,
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
 * App chrome: header, sidebar and the page canvas share the base colour (the
 * 60% layer); content surfaces (cards, tables, dialogs) are the 30% layer.
 */
export const appShell = {
  bgcolor: "background.default",
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

/** Shared app shell body style or helper for the related interface. */
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
  // Takes focus on navigation; the page itself needs no ring.
  "&:focus, &:focus-visible": { outline: "none" },
  mx: { xs: 0.5, md: 1 },
  my: { xs: 0.5, md: 1 },
  // One inset for every page; page sections add no side padding of their own.
  p: 1.5,
  // 16px cards in this 12px padding: 16 + 12. Phones put 8px header
  // buttons in the top corners, so those are 8 + 12.
  borderRadius: { xs: `${RADIUS.xl}px ${RADIUS.xl}px ${RADIUS.page}px ${RADIUS.page}px`, md: RADIUS_PX.page },
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

/** Shared position relative  styles style or helper for the related interface. */
export const positionRelativeSx = { position: "relative" } satisfies SxProps<Theme>;

/** App bar row: same raised surface as the sidebar, no rule beneath it. */
export const headerBarSx = {
  display: "flex",
  alignItems: "center",
  minHeight: { xs: 58, sm: 64 },
  flexShrink: 0,
  px: { xs: 0.75, sm: 1 },
  gap: { xs: 0.25, sm: 0.75 },
  bgcolor: "background.default",
} satisfies SxProps<Theme>;

/** Shared header logo link  styles style or helper for the related interface. */
export const headerLogoLinkSx = {
  display: "inline-flex",
  alignItems: "center",
  "@media (pointer: coarse)": { minHeight: 40 },
  flexShrink: 0,
} satisfies SxProps<Theme>;

/** Shared header logo image  styles style or helper for the related interface. */
export const headerLogoImageSx = {
  width: { xs: 64, sm: 84, md: 96 },
  height: 32,
  objectFit: "contain",
} satisfies SxProps<Theme>;

/** Shared sidebar nav style or helper for the related interface. */
export const sidebarNav =
  (open: boolean, width: number, collapsedWidth: number): SxProps<Theme> =>
  (theme) => ({
    display: { xs: "none", md: "block" },
    // Width is animated by Motion (HomePage); this is the pre-JS value.
    width: open ? width : collapsedWidth,
    flexShrink: 0,
    position: "relative",
    transformOrigin: "left center",
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
            // The peek width itself is animated by Motion (HomePage).
            [expanded(".sidebar-panel")]: {
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

/** Shared sidebar panel style or helper for the related interface. */
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
    bgcolor: "background.default",
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
    transition: theme.transitions.create(["box-shadow"], {
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

/** Mobile navigation drawer geometry, separate from the desktop sidebar frame. */
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

/** Top of the phone drawer: logo left, close button right, pinned on scroll. */
export const mobileDrawerHeaderSx = {
  position: "sticky",
  top: 0,
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1,
  minHeight: 58,
  px: 1.5,
  bgcolor: "background.paper",
  borderBottom: "1px solid",
  borderColor: "divider",
} satisfies SxProps<Theme>;

/** Shared mobile drawer logo  styles style or helper for the related interface. */
export const mobileDrawerLogoSx = {
  display: "block",
  width: 84,
  height: 32,
  objectFit: "contain",
} satisfies SxProps<Theme>;

export const statusColors: Record<string, string> = STATUS_COLORS;

export const defaultStatusColor = STATUS_COLOR_DEFAULT;

export function normalizeStatus(status: unknown) {
  return String(status ?? "")
    .replace(/^modified-/i, "")
    .trim()
    .toLowerCase();
}

/** Shared get status color style or helper for the related interface. */
export function getStatusColor(status: unknown) {
  return statusColors[normalizeStatus(status)] ?? defaultStatusColor;
}

/** Shared format status label style or helper for the related interface. */
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
    )
    // API keys such as "InProgress" / "OnTime" read as "In progress".
    .replace(/([a-z])([A-Z])/g, (_, lower: string, upper: string) => `${lower} ${upper.toLowerCase()}`)
    // Dates inside labels ("Due by 2026-11-07") use the app's "7 Nov 2026".
    .replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, (_, year: string, month: string, day: string) =>
      new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    );

  return normalizedStatus;
}

/**
 * Opaque table-header surface: paper plus a tint one step darker than the
 * even-row zebra (see alternatingRowSx). Same values as the MuiTableCell
 * head override, for tables that style their header cells directly.
 */
export const tableHeaderTint = (theme: Theme) =>
  alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.07 : 0.05);

export const tableHeaderBackground = (theme: Theme) => ({
  backgroundColor: theme.palette.background.paper,
  backgroundImage: `linear-gradient(${tableHeaderTint(theme)}, ${tableHeaderTint(theme)})`,
});

/** Shared table header treatment used by both virtualized and regular tables. */
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

/** Shared table header cell  styles style or helper for the related interface. */
export const tableHeaderCellSx = (theme: Theme) => ({
  ...tableHeaderBackground(theme),
  borderBottom: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.secondary,
  fontSize: FONT.xs,
  fontWeight: 600,
  // Dense data cells: 8px all round (see CELL_PX).
  px: 1,
  py: 1,
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

/** Shared sticky table cell  styles style or helper for the related interface. */
export const stickyTableCellSx = (theme: Theme) => ({
  backgroundColor: theme.palette.background.paper,
});

/** Shared sticky first column cell style or helper for the related interface. */
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

/** Shared sticky first column header cell style or helper for the related interface. */
export const stickyFirstColumnHeaderCell = (theme: Theme) => ({
  ...tableHeaderCellSx(theme),
  position: "sticky",
  left: 0,
  // A fixed header corner must sit above the remaining sticky headers while
  // they move underneath it during horizontal scrolling.
  zIndex: "30 !important",
  boxShadow: `1px 0 0 ${theme.palette.divider}`,
});

/** Shared alternating row  styles style or helper for the related interface. */
export const alternatingRowSx = (theme: Theme) => ({
  "&:nth-of-type(even) td": {
    backgroundColor:
      alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.025 : 0.018),
  },
});

/** Shared scrollable table frame. Add only view-specific dimensions locally. */
export const tableContainerSx: SxProps<Theme> = {
  boxShadow: "none",
  // Clips the rows at 8px: it sits in the 16px table card's 8px inset.
  borderRadius: RADIUS_PX.sm,
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

/** Row baseline, hover, and keyboard-focus styles for data tables. */
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
    ...tintLayer(alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.036 : 0.045,
    )),
  },
  "&.Mui-selected .MuiTableCell-body, &[aria-selected='true'] .MuiTableCell-body":
    {
      ...tintLayer(alpha(
        theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.06 : 0.095,
      )),
    },
  "&.Mui-selected:hover .MuiTableCell-body, &[aria-selected='true']:hover .MuiTableCell-body":
    {
      ...tintLayer(alpha(
        theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.084 : 0.13,
      )),
    },
  "&.Mui-error .MuiTableCell-body, &[data-status='error'] .MuiTableCell-body": {
    ...tintLayer(alpha(
      theme.palette.error.main,
      theme.palette.mode === "dark" ? 0.14 : 0.075,
    )),
  },
  "&.Mui-error:hover .MuiTableCell-body, &[data-status='error']:hover .MuiTableCell-body":
    {
      ...tintLayer(alpha(
        theme.palette.error.main,
        theme.palette.mode === "dark" ? 0.19 : 0.105,
      )),
    },
  "&.Mui-warning .MuiTableCell-body, &[data-status='warning'] .MuiTableCell-body":
    {
      ...tintLayer(alpha(
        theme.palette.warning.main,
        theme.palette.mode === "dark" ? 0.15 : 0.08,
      )),
    },
  "&.Mui-warning:hover .MuiTableCell-body, &[data-status='warning']:hover .MuiTableCell-body":
    {
      ...tintLayer(alpha(
        theme.palette.warning.main,
        theme.palette.mode === "dark" ? 0.2 : 0.11,
      )),
    },
  "&.Mui-success .MuiTableCell-body, &[data-status='success'] .MuiTableCell-body":
    {
      ...tintLayer(alpha(
        theme.palette.success.main,
        theme.palette.mode === "dark" ? 0.14 : 0.075,
      )),
    },
  "&.Mui-success:hover .MuiTableCell-body, &[data-status='success']:hover .MuiTableCell-body":
    {
      ...tintLayer(alpha(
        theme.palette.success.main,
        theme.palette.mode === "dark" ? 0.19 : 0.105,
      )),
    },
});

export const tableCell = {
  // Dense data cells: 8px all round (see CELL_PX).
  py: 1,
  px: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  verticalAlign: "middle",
};
