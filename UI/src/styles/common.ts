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
} from "./tokens";
import { pageHeader, pageHeaderActions, pageHeaderContent } from "./layout";

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
  pageHeaderControls,
  pageHeaderControlsDesktop,
  pageHeaderControlsMobile,
  pageHeaderFilterPanel,
  pageHeaderFilterToggle,
  pageHeaderTitleGroup,
  pageHeaderTopRow,
  pageSubtitle,
  pageTitle,
  scrollableContent,
  tablePageContent,
  tabs,
  tabsContainer,
  wideFilterField,
} from "./layout";
export { dateFieldSx } from "./filters";

type AlphaStyleArgs = { alpha: typeof alpha };
type AccentStyleArgs = { accent: string };
type PriorityVisual = { color: string; bg: string; border: string };
type PriorityPalette = { bg: string; text: string };
type ModalPalette = {
  border: string;
  panel: string;
  headerPanel: string;
  chipPanel: string;
  logDivider: string;
};
type ResponsiveStyleWidth =
  | number
  | string
  | Partial<Record<"xs" | "sm" | "md" | "lg" | "xl", number | string>>;
type TableStyleColumn = {
  width?: ResponsiveStyleWidth;
  numeric?: boolean;
};
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
export const getModalPalette = (theme: Theme) => {
  const isDark = theme.palette.mode === "dark";

  return {
    border: theme.palette.divider,
    panel: alpha(theme.palette.primary.main, isDark ? 0.04 : 0.045),
    headerPanel: alpha(theme.palette.primary.main, isDark ? 0.055 : 0.04),
    chipPanel: isDark
      ? alpha(theme.palette.text.primary, 0.04)
      : theme.palette.background.paper,
    logDivider: alpha(theme.palette.divider, isDark ? 0.75 : 0.8),
  };
};

export const getPriorityPalette = (theme: Theme, priority: unknown) => {
  const isDark = theme.palette.mode === "dark";
  const normalizedPriority = String(priority ?? "").toLowerCase();

  if (normalizedPriority === "high") {
    return {
      bg: alpha(theme.palette.error.main, isDark ? 0.2 : 0.12),
      text: theme.palette.error.main,
    };
  }
  if (normalizedPriority === "medium") {
    return {
      bg: alpha(theme.palette.warning.main, isDark ? 0.2 : 0.12),
      text: theme.palette.warning.main,
    };
  }
  return {
    bg: alpha(theme.palette.success.main, isDark ? 0.2 : 0.12),
    text: theme.palette.success.main,
  };
};

export const modalFormIconSx = (theme: Theme) => ({
  width: 36,
  height: 36,
  borderRadius: RADIUS_PX.lg,
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  bgcolor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
});

export const detailLabelSx = {
  color: "text.secondary",
  fontSize: 11,
  fontWeight: 600,
  lineHeight: 1.2,
  textTransform: "capitalize",
};

export const detailValueSx = {
  color: "text.primary",
  fontSize: { xs: 11, sm: 13 },
  fontWeight: 700,
  lineHeight: 1.35,
  overflowWrap: "anywhere",
};

export const formSectionSx = (theme: Theme) => ({
  height: "100%",
  ...insetSx,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: RADIUS_PX.lg,
  bgcolor:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.text.primary, 0.018)
      : theme.palette.background.paper,
});
export const form: SxProps<Theme> = {
  display: "grid",
  gap: 2,
};

export const compactFieldSx = (theme: Theme) => ({
  // "& .MuiInputLabel-root": {
  //   fontSize: 12,
  //   fontWeight: 700,
  // },
  "& .MuiOutlinedInput-root": {
    // minHeight: 42,
    borderRadius: RADIUS_PX.sm,
    bgcolor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.text.primary, 0.025)
        : alpha(theme.palette.primary.main, 0.035),
  },
  // "& .MuiOutlinedInput-input": {
  //   fontWeight: 700,
  // },
});

export const confirmationMessageSx = {
  mb: 2,
  color: "text.secondary",
};
export const confirmationDialogTitleSx = { fontWeight: 700 };

export const attachmentSectionSx = (theme: Theme) => ({
  mt: 1.5,
  ...insetSx,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: RADIUS_PX.lg,
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
  borderRadius: RADIUS_PX.lg,
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
      theme.palette.mode === "dark" ? 0.16 : 0.07,
    ),
    borderColor: theme.palette.primary.main,
  },
});

export const attachmentIconSx = (theme: Theme) => ({
  alignItems: "center",
  bgcolor: alpha(
    theme.palette.primary.main,
    theme.palette.mode === "dark" ? 0.2 : 0.1,
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
  fontWeight: 700,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const attachmentOpenSx = {
  color: "primary.main",
  flexShrink: 0,
  fontSize: "0.75rem",
  fontWeight: 700,
};

export const projectConfigurationPageHeaderSx: SxProps<Theme> = [
  pageHeader,
  {
    flexDirection: { xs: "column", lg: "row" },
    alignItems: { xs: "stretch", lg: "flex-start" },
    gap: { xs: 1.25, lg: 1.5 },
  },
];

export const projectConfigurationPageHeaderContentSx: SxProps<Theme> = {
  ...pageHeaderContent,
  maxWidth: { lg: 520 },
};

export const projectConfigurationPageHeaderActionsSx: SxProps<Theme> = {
  ...pageHeaderActions,
  width: { xs: "100%", lg: "auto" },
  flexWrap: "nowrap",
  justifyContent: { xs: "flex-start", sm: "flex-end", lg: "flex-start" },
  "& .MuiButton-root": {
    ...pageHeaderActions["& .MuiButton-root"],
    flex: { xs: "1 1 150px", sm: "0 1 auto" },
  },
};

export const section = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.lg,
  bgcolor: "background.paper",
} satisfies SxProps<Theme>;

export const summaryMetricGrid = {
  display: "grid",
  gridTemplateColumns: {
    xs: "repeat(2, minmax(0, 1fr))",
    md: "repeat(4, minmax(0, 1fr))",
  },
  gap: 1,
  px: INSET_X,
  pb: 1,
} satisfies SxProps<Theme>;

export const summaryMetricCard = {
  ...insetSx,
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.lg,
  bgcolor: "background.paper",
} satisfies SxProps<Theme>;

export const summaryMetricLabel = {
  color: "text.secondary",
  fontSize: "0.75rem",
  lineHeight: 1.35,
} satisfies SxProps<Theme>;

export const summaryMetricValue = {
  color: "text.primary",
  fontSize: { xs: "1.25rem", sm: "1.45rem" },
  fontWeight: 700,
  lineHeight: 1.2,
  mt: 0.25,
} satisfies SxProps<Theme>;

export const summaryMetricHelper = {
  color: "text.secondary",
  fontSize: "0.75rem",
  lineHeight: 1.35,
  mt: 0.25,
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

export const compactTextSx = { fontSize: 12 };

export const secondaryTextSx = { color: "text.secondary" };

export const minWidthZeroSx = { minWidth: 0 };

export const inlineCenterGapSx = {
  display: "flex",
  alignItems: "center",
  gap: 1,
};

export const responsiveRightActions = {
  width: { xs: "100%", sm: "auto" },
  justifyContent: "flex-end",
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
  px: INSET_X,
  pb: { xs: 1.25, sm: 1.5 },
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
  borderRadius: RADIUS_PX.lg,
  ...insetSx,
  height: "100%",
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
} satisfies SxProps<Theme>;

export const panelTitleRow: SxProps<Theme> = {
  mb: 1.25,
  flexShrink: 0,
};

export const panelIconBadge: SxProps<Theme> = {
  display: "grid",
  placeItems: "center",
  width: 30,
  height: 30,
  borderRadius: RADIUS_PX.md,
  bgcolor: "info.light",
  color: "info.contrastText",
  flexShrink: 0,
};

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

export const rightMetric: SxProps<Theme> = {
  textAlign: "right",
  flexShrink: 0,
  minWidth: 45,
};

export const largeMutedIcon: SxProps<Theme> = {
  fontSize: 44,
  opacity: 0.4,
};

export const fillContainer: SxProps<Theme> = {
  height: "100%",
  minHeight: 0,
};

export const stepLabel = {
  color: "primary.main",
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0,
  lineHeight: 1.3,
  textTransform: "uppercase",
} satisfies SxProps<Theme>;

export const helperText = {
  display: { xs: "none", sm: "block" },
  color: "text.secondary",
  fontSize: "0.75rem",
  lineHeight: 1.45,
} satisfies SxProps<Theme>;

export const sectionInset = {
  ...section,
  ...insetSx,
} satisfies SxProps<Theme>;

export const segmentedControl = (theme: Theme) => ({
  flexWrap: "wrap",
  gap: 0.9,
  // Separate pill buttons: drop the group's outer border (from the theme) so
  // each item keeps its own outline, and space the group from the helper text.
  border: 0,
  mt: 1,
  // MUI joins grouped buttons by hiding the left border of the middle/last
  // items; these are separate pills, so every item keeps a full outline.
  "& .MuiToggleButtonGroup-grouped, & .MuiToggleButtonGroup-grouped.MuiToggleButtonGroup-middleButton, & .MuiToggleButtonGroup-grouped.MuiToggleButtonGroup-lastButton":
    {
      border: "1px solid",
      borderColor: "divider",
      borderRadius: `${RADIUS_PX.sm} !important`,
      margin: 0,
    },
  "& .MuiToggleButtonGroup-grouped.Mui-selected, & .MuiToggleButtonGroup-grouped:hover":
    {
      borderColor: "primary.main",
    },
  "& .MuiToggleButton-root": {
    minHeight: 38,
    gap: 0.75,
    px: 1.35,
    color: "text.primary",
    bgcolor: "background.paper",
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "none",
    transition: theme.transitions.create(
      ["background-color", "border-color", "color"],
      { duration: theme.transitions.duration.shortest },
    ),
    "& .MuiSvgIcon-root": {
      color: "primary.main",
    },
    "&:hover": {
      bgcolor: alpha(
        theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.18 : 0.08,
      ),
      borderColor: "primary.main",
    },
    "&.Mui-selected": {
      color: "primary.main",
      bgcolor: alpha(
        theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.22 : 0.12,
      ),
      borderColor: "primary.main",
      "&:hover": {
        bgcolor: alpha(
          theme.palette.primary.main,
          theme.palette.mode === "dark" ? 0.28 : 0.16,
        ),
      },
      "& .MuiSvgIcon-root": {
        color: "primary.main",
      },
    },
  },
});

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
  // minHeight: { xs: 240, sm: 320 },
  height: "100%",
  overflow: "hidden",
} satisfies SxProps<Theme>;

export const footerSurface = {
  ...insetSx,
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.lg,
} satisfies SxProps<Theme>;

export const primarySaveButton = (theme: Theme) => ({
  minWidth: { xs: "100%", sm: 150 },
  minHeight: 38,
  borderRadius: RADIUS_PX.sm,
  fontSize: "0.8125rem",
  fontWeight: 700,
  textTransform: "none",
  boxShadow:
    theme.palette.mode === "dark"
      ? `0 12px 28px ${alpha(theme.palette.primary.main, 0.2)}`
      : `0 12px 28px ${alpha(theme.palette.primary.main, 0.16)}`,
  "&:hover": {
    boxShadow:
      theme.palette.mode === "dark"
        ? `0 14px 30px ${alpha(theme.palette.primary.main, 0.26)}`
        : `0 14px 30px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
});

export const countChip =
  (selected: boolean): SxProps<Theme> =>
  (theme) => ({
    height: 22,
    minWidth: 24,
    ml: 0.25,
    bgcolor: selected
      ? theme.palette.primary.main
      : alpha(
          theme.palette.text.secondary,
          theme.palette.mode === "dark" ? 0.22 : 0.12,
        ),
    color: selected
      ? theme.palette.primary.contrastText
      : theme.palette.text.secondary,
    fontSize: 11,
    fontWeight: 700,
    "& .MuiChip-label": { px: 0.75 },
  });

export const metaChip = {
  height: 28,
  px: 0.75,
  borderColor: "divider",
  color: "text.primary",
  bgcolor: "background.paper",
  fontSize: 11,
  fontWeight: 700,
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
  fontWeight: 700,
} satisfies SxProps<Theme>;

export const mappedTagChip =
  (isSelected: boolean): SxProps<Theme> =>
  (theme) => ({
    height: 24,
    borderRadius: RADIUS_PX.pill,
    bgcolor: isSelected ? "primary.main" : "transparent",
    borderColor: isSelected ? "primary.main" : "warning.main",
    color: isSelected
      ? theme.palette.primary.contrastText
      : theme.palette.warning.main,
    fontSize: 11,
    fontWeight: 700,
    "& .MuiChip-label": { px: 1 },
  });

export const strongInlineText = {
  fontWeight: 700,
  color: "text.primary",
} satisfies SxProps<Theme>;

export const warningOutlineChip = {
  height: 22,
  borderColor: "warning.main",
  color: "warning.main",
  fontWeight: 700,
} satisfies SxProps<Theme>;

export type TableRowStatus = "error" | "warning" | "success";

const priorityRowHighlight =
  (priority: unknown, isAlarm: boolean): SxProps<Theme> =>
  (theme) => {
    const color = getPriorityPalette(theme, priority).text;

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

export const priorityAlarmRowHighlight = (priority: unknown) =>
  priorityRowHighlight(priority, true);

export const priorityDueRowHighlight = (priority: unknown) =>
  priorityRowHighlight(priority, false);

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
  ...insetSx,
} satisfies SxProps<Theme>;

export const timesheetPageHeader = (
  hasSingleColumnOnMobile: boolean,
): SxProps<Theme> => [
  pageHeader,
  {
    display: "grid",
    gridTemplateColumns: {
      xs: hasSingleColumnOnMobile ? "1fr" : "minmax(0, 1fr) auto",
      md: "minmax(0, 1fr) auto",
    },
    alignItems: { xs: "start", md: "center" },
    gap: { xs: 1, md: 2 },
    pb: { xs: 1.25, md: 1.5 },
  },
];

export const timesheetHeaderActions = {
  ...pageHeaderActions,
  display: { xs: "contents", md: "flex" },
  width: { xs: "100%", lg: "auto" },
  alignItems: "center",
  justifyContent: "flex-end",
  gridColumn: { md: 2 },
  gridRow: { md: 1 },
} satisfies SxProps<Theme>;

export const weekSelectorPanel = (
  fullRowOnMobile: boolean,
): SxProps<Theme> => ({
  display: "grid",
  gridTemplateColumns: "40px minmax(0, 1fr) 40px",
  alignItems: "center",
  gap: 1,
  width: { xs: "100%", md: "auto" },
  minWidth: { md: 360 },
  gridColumn: { xs: fullRowOnMobile ? "1" : "1 / -1", md: "auto" },
  gridRow: { xs: 2, md: "auto" },
  p: 0.5,
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.lg,
  bgcolor: "background.paper",
});

export const squareIconButton = {
  width: 36,
  height: 36,
  borderRadius: RADIUS_PX.sm,
  color: "primary.main",
} satisfies SxProps<Theme>;

export const centeredTextGroup = {
  minWidth: 0,
  textAlign: "center",
} satisfies SxProps<Theme>;

export const compactWeekChip = {
  minWidth: 96,
  fontWeight: 700,
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
    fontWeight: 700,
    right: 6,
    top: 5,
  },
} satisfies SxProps<Theme>;

export const compactHeaderButton = {
  minWidth: 0,
  fontWeight: 700,
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
        fontWeight: 700,
        lineHeight: 1.25,
      },
      "& .MuiListItemText-secondary": {
        color: theme.palette.text.secondary,
        fontSize: "0.735rem",
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
  fontWeight: 700,
  letterSpacing: 0,
  textTransform: "uppercase",
} satisfies SxProps<Theme>;

export const actionMenuPaper = (theme: Theme) =>
  ({
    mt: 0.8,
    width: "min(384px, calc(100vw - 20px))",
    maxHeight: "calc(100dvh - 120px)",
    borderRadius: RADIUS_PX.lg,
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

export const dialogContentTop = {
  pt: 1,
} satisfies SxProps<Theme>;

export const errorDialogTitle = {
  alignItems: "center",
  display: "flex",
  gap: 1,
  bgcolor: "error.main",
  color: "error.contrastText",
  py: INSET_Y,
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

export const centeredDialogActions = {
  justifyContent: "center",
} satisfies SxProps<Theme>;

export const listItemReset = {
  listStyle: "none",
} satisfies SxProps<Theme>;

/**
 * Sidebar (navigation) styles.
 *
 * Contrast first: labels use the theme's strong text colour (≈9:1 on the
 * panel in both modes) instead of a translucent tint; icons are quieter so the
 * words lead. The selected item is a tinted pill with an accent bar and
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
  fontWeight: 700,
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
      mb: 0,
      px: 0,
      py: 0,
      borderRadius: RADIUS_PX.md,
      overflow: "hidden",
      color: theme.palette.text.primary,
      transition: theme.transitions.create(["background-color", "color"], {
        duration: theme.transitions.duration.shortest,
      }),
      // Accent bar for the current page (drawn inside, so nothing shifts).
      "&::before": {
        content: '""',
        position: "absolute",
        left: 0,
        top: 6,
        bottom: 6,
        width: 3,
        borderRadius: 3,
        bgcolor: selected ? sidebarSelectedColor(theme) : "transparent",
        transition: theme.transitions.create("background-color", {
          duration: theme.transitions.duration.shortest,
        }),
      },
      "&:hover": {
        backgroundColor: selected
          ? alpha(theme.palette.primary.main, isDark ? 0.26 : 0.16)
          : alpha(theme.palette.text.primary, isDark ? 0.07 : 0.05),
      },
      "&:hover .MuiListItemIcon-root": {
        color: selected
          ? sidebarSelectedColor(theme)
          : theme.palette.primary.main,
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
        backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.12),
        "&.Mui-selected": {
          backgroundColor: alpha(
            theme.palette.primary.main,
            isDark ? 0.2 : 0.12,
          ),
        },
        "&.Mui-selected:hover": {
          backgroundColor: alpha(
            theme.palette.primary.main,
            isDark ? 0.26 : 0.16,
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
      fontWeight: selected ? 700 : 500,
      lineHeight: 1.3,
      letterSpacing: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  });
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

export const appShellBody = {
  display: "flex",
  flex: "1 1 auto",
  minHeight: 0,
  overflow: "hidden",
} satisfies SxProps<Theme>;

export const appMain = {
  // Match the app's standard button corner radius around routed page content.
  borderRadius: RADIUS_PX.md,
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  overflowX: "hidden",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
} satisfies SxProps<Theme>;

export const sidebarNav =
  (open: boolean, width: number, collapsedWidth: number): SxProps<Theme> =>
  (theme) => ({
    display: { xs: "none", md: "block" },
    width: open ? width : collapsedWidth,
    flexShrink: 0,
    overflow: "visible",
    position: "relative",
    transformOrigin: "left center",
    transition: theme.transitions.create(["width"], {
      duration: theme.transitions.duration.shorter,
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
    width: open ? width : collapsedWidth,
    height: "100%",
    overflowX: "hidden",
    overflowY: "auto",
    borderRight: `1px solid ${theme.palette.divider}`,
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
      position: "absolute",
      inset: 0,
      right: "auto",
      zIndex: theme.zIndex.drawer,
      "& .MuiListItemButton-root": {
        justifyContent: "center",
        mx: 0,
        px: 0,
        width: "100%",
      },
      "& .MuiListItemIcon-root": {
        minWidth: 52,
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
      "&:hover": {
        width,
        boxShadow:
          theme.palette.mode === "dark"
            ? ELEVATION.dark.sidebar
            : ELEVATION.light.sidebar,
      },
      "&:hover .MuiListItemButton-root": {
        justifyContent: "flex-start",
      },
      "&:hover .MuiListItemText-root": {
        clipPath: "inset(0 0 0 0)",
        opacity: 1,
        transform: "translateX(0)",
        transitionDelay: "40ms",
      },
      "&:hover .sidebar-section-label": {
        alignItems: "center",
        clipPath: "inset(0 0 0 0)",
        display: "flex",
        height: sectionHeight,
        opacity: 1,
        overflow: "visible",
        px: 1.25,
        pb: 0.5,
        transform: "translateX(0)",
        transitionDelay: "40ms",
      },
      "&:hover .sidebar-section-divider": {
        opacity: 0,
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

const getTableHeaderTint = (theme: Theme) =>
  alpha(
    theme.palette.mode === "dark"
      ? theme.palette.text.primary
      : theme.palette.primary.main,
    theme.palette.mode === "dark" ? 0.045 : 0.12,
  );

/**
 * Solid, theme-aware table-header background: the subtle primary tint
 * composited over the opaque paper surface. Because the base is opaque,
 * sticky headers never let scrolled body content bleed through, in both
 * light and dark themes.
 */
const tableHeaderBackground = (theme: Theme) => {
  const tint = getTableHeaderTint(theme);
  return {
    backgroundColor: theme.palette.background.paper,
    backgroundImage: `linear-gradient(${tint}, ${tint})`,
  };
};

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
  borderBottom: `1px solid ${
    theme.palette.mode === "dark"
      ? theme.palette.divider
      : alpha(theme.palette.primary.main, 0.28)
  }`,
  boxShadow: `0 1px 0 ${
    theme.palette.mode === "dark"
      ? alpha(theme.palette.text.primary, 0.035)
      : alpha(theme.palette.primary.main, 0.18)
  }`,
  color: theme.palette.text.primary,
  fontWeight: 700,
  px: INSET_X,
  py: INSET_Y,
  opacity: 1,
  position: "sticky",
  top: 0,
  textAlign: "left",
  zIndex: 21,
  "& .MuiTableSortLabel-root": {
    color: theme.palette.text.primary,
    fontWeight: 700,
    justifyContent: "flex-start",
  },
  "& .MuiTableSortLabel-root.Mui-active, & .MuiTableSortLabel-root.Mui-active .MuiTableSortLabel-icon":
    {
      color: theme.palette.primary.main,
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
      theme.palette.mode === "dark"
        ? alpha(theme.palette.text.primary, 0.025)
        : alpha(theme.palette.primary.main, 0.025),
  },
});

/** Shared scrollable table frame. Add only view-specific dimensions locally. */
export const tableContainerSx: SxProps<Theme> = {
  boxShadow: "none",
  borderRadius: RADIUS_PX.lg,
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
      theme.palette.mode === "dark" ? 0.06 : 0.045,
    ),
  },
  "&.Mui-selected .MuiTableCell-body, &[aria-selected='true'] .MuiTableCell-body":
    {
      backgroundColor: alpha(
        theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.1 : 0.095,
      ),
    },
  "&.Mui-selected:hover .MuiTableCell-body, &[aria-selected='true']:hover .MuiTableCell-body":
    {
      backgroundColor: alpha(
        theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.14 : 0.13,
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
    borderRadius: RADIUS_PX.lg,
    display: "grid",
    placeItems: "center",
    bgcolor: alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.18 : 0.1,
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
    borderRadius: RADIUS_PX.lg,
    "&:hover": {
      bgcolor: alpha(
        theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.16 : 0.08,
      ),
    },
  });

export const notificationMenuSelfTicketIconSx =
  ({ alpha }: AlphaStyleArgs): SxProps<Theme> =>
  (theme) => ({
    width: 34,
    height: 34,
    borderRadius: RADIUS_PX.lg,
    display: "grid",
    placeItems: "center",
    bgcolor: alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.18 : 0.1,
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
    borderRadius: RADIUS_PX.lg,
    "&:hover": {
      bgcolor: alpha(
        theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.16 : 0.08,
      ),
    },
  });

export const notificationMenuTicketIconSx =
  ({ alpha }: AlphaStyleArgs): SxProps<Theme> =>
  (theme) => ({
    width: 34,
    height: 34,
    borderRadius: RADIUS_PX.lg,
    display: "grid",
    placeItems: "center",
    bgcolor: alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.18 : 0.1,
    ),
    color: "primary.main",
    flexShrink: 0,
  });
export const appBarSx: SxProps<Theme> = {
  top: 0,
  flexShrink: 0,
  zIndex: (theme) => theme.zIndex.drawer + 1,
  // Match the sidebar exactly in both modes; page content remains on
  // background.default while shell chrome uses background.paper.
  bgcolor: "background.paper",
};

// components/appBar/header.styles.ts
export const headerContainerSx: SxProps<Theme> = {
  // 320px phones must fit logo, menu and four 44px icon buttons.
  px: { xs: 0.75, sm: 2, lg: 3 },
};

export const headerToolbarSx: SxProps<Theme> = {
  minHeight: { xs: 58, sm: 64 },
};

export const headerLogoLinkSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  flexShrink: 0,
  mr: { lg: 2.5 },
};

export const headerLogoImageSx: SxProps<Theme> = {
  width: { xs: 64, sm: 108 },
  height: 40,
  objectFit: "contain",
};

export const headerMenuButtonSx: SxProps<Theme> = {
  display: "inline-flex",
  mr: 0.5,
};
export const headerProfileButtonSx =
  (open = false): SxProps<Theme> =>
  (theme) => ({
    minWidth: 0,
    ml: { xs: 0.5, sm: 1.25 },
    px: 0.25,
    py: 0.25,
    borderRadius: 99,
    color: "text.primary",
    textTransform: "none",
    border: "1px solid",
    borderColor: open ? "primary.main" : "transparent",
    bgcolor: open
      ? alpha(
          theme.palette.primary.main,
          theme.palette.mode === "dark" ? 0.2 : 0.1,
        )
      : "transparent",
    transition: theme.transitions.create(["background-color", "border-color"], {
      duration: theme.transitions.duration.shortest,
    }),
    "&:hover": {
      bgcolor: alpha(
        theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.28 : 0.14,
      ),
    },
  });

export const headerProfileTriggerTextSx: SxProps<Theme> = {
  display: { xs: "none", md: "flex" },
  minWidth: 0,
  maxWidth: 144,
  textAlign: "left",
  lineHeight: 1.15,
};

export const headerProfileTriggerNameSx: SxProps<Theme> = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontWeight: 700,
  maxWidth: "100%",
};

export const headerProfileChevronSx =
  (open: boolean): SxProps<Theme> =>
  (theme) => ({
    fontSize: 20,
    transform: open ? "rotate(180deg)" : "rotate(0deg)",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  });

export const headerAvatarSx: SxProps<Theme> = {
  width: { xs: 34, sm: 38 },
  height: { xs: 34, sm: 38 },
  bgcolor: "primary.main",
  fontWeight: 700,
  fontSize: { xs: 16, sm: 18 },
};
export const notificationEmptyStateSx: SxProps<Theme> = {
  px: INSET_X,
  py: INSET_Y,
  textAlign: "center",
};

export const notificationItemTextSx: SxProps<Theme> = { flex: 1 };

export const profileUsernameSx: SxProps<Theme> = {
  display: "block",
  fontWeight: 700,
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
    // p: { xs: 1.25, sm: 1.5 },
    borderRadius: RADIUS_PX.lg,
    // border: "1px solid",
    // borderColor: "divider",
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

export const appBarHeaderProfileFooterButtonSx: SxProps<Theme> = {
  minHeight: 38,
  whiteSpace: "nowrap",
};

// components/CardView.dynamic.styles.ts
export const boardColumnSx = (
  { alpha }: AlphaStyleArgs,
  expanded = false,
): SxProps<Theme> => ({
  minWidth: 0,
  height: { xs: "auto", lg: "100%" },
  minHeight: 0,
  // Small screens (accordion): the expanded column fills the remaining board
  // height so its inner list scrolls; collapsed columns shrink to their header.
  // On lg each column is a grid cell, so flex is ignored there.
  flex: { xs: expanded ? "1 1 auto" : "0 0 auto" },
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.sm,
  bgcolor: (theme) =>
    alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.08 : 0.06,
    ),
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  scrollSnapAlign: "start",
});

export const boardColumnHeaderSx = ({
  accent,
}: AccentStyleArgs): SxProps<Theme> => ({
  px: INSET_X,
  py: INSET_Y,
  bgcolor: "background.paper",
  borderTop: "4px solid",
  borderColor: accent,
  cursor: { xs: "pointer", lg: "default" },
  // height: { xs: 'auto', sm: '100%' },
});

export const boardColumnCountChipSx = ({
  accent,
  alpha,
}: AccentStyleArgs & AlphaStyleArgs): SxProps<Theme> => ({
  bgcolor: alpha(accent, 0.12),
  color: accent,
  minWidth: 34,
});

export const boardColumnActionRequiredChipSx = ({
  accent,
  alpha,
}: AccentStyleArgs & AlphaStyleArgs): SxProps<Theme> => ({
  height: 24,
  bgcolor: alpha(accent, 0.12),
  color: accent,
  border: "1px solid",
  borderColor: alpha(accent, 0.55),
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: 0,
  textTransform: "uppercase",
  boxShadow: `0 0 0 1px ${alpha(accent, 0.2)}, 0 0 12px ${alpha(accent, 0.45)}`,
  "& .MuiChip-label": {
    px: 0.8,
  },
});

// components/CardView.styles.ts
export const boardColumnListSx = (
  cardType: "Ticket" | "Self",
): SxProps<Theme> => ({
  px: INSET_X,
  pt: 1.5,
  // The scroll box fills its (bounded) column and scrolls internally on every
  // screen size. On small screens the column is bounded by flex (see
  // boardColumnSx + cardViewCollapseSx); on lg by the grid row.
  // No fixed heights, so there is never a gap or cut-off last card.
  pb: {
    xs:
      cardType === "Ticket"
        ? "calc(env(safe-area-inset-bottom, 0px) + 8px)"
        : "calc(env(safe-area-inset-bottom, 0px) + 8px)",
    lg: 1.5,
  },
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  overscrollBehavior: "contain",
  flex: "1 1 auto",
  minHeight: 0,
  height: "auto",
  scrollPaddingBottom: { xs: "8px", lg: 1.5 },
  scrollbarGutter: "stable",
});

export const cardViewCollapseSx: SxProps<Theme> = {
  // Fill the remaining height of the expanded column so the inner scroll box is
  // bounded (flex overrides MUI's inline height:auto). In a collapsed column
  // there is no free space, so this stays at the header height.
  flex: "1 1 auto",
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

export const boardColumnEmptyTextSx: SxProps<Theme> = { mt: 6 };

export const boardColumnsSx: SxProps<Theme> = {
  // Small screens: flex column accordion — the expanded column fills the height
  // and scrolls internally. lg+: kanban grid with a full-height row so each
  // column is bounded and scrolls internally. Neither the board itself scrolls.
  display: { xs: "flex", lg: "grid" },
  flexDirection: { xs: "column" },
  gridTemplateColumns: { lg: "repeat(3, minmax(0, 1fr))" },
  gridTemplateRows: { lg: "minmax(0, 1fr)" },
  gap: 2,
  height: "100%",
  minHeight: 0,
  alignContent: { lg: "stretch" },
  overflow: "hidden",
};

export const boardColumnsSelfSx: SxProps<Theme> = {
  // Small screens: flex column accordion — the expanded column fills the height
  // and scrolls internally. lg+: kanban grid with a full-height row so each
  // column is bounded and scrolls internally. Neither the board itself scrolls.
  display: { xs: "flex", lg: "grid" },
  flexDirection: { xs: "column" },
  gridTemplateColumns: { lg: "repeat(2, minmax(0, 1fr))" },
  gridTemplateRows: { lg: "minmax(0, 1fr)" },
  gap: 2,
  height: "100%",
  minHeight: 0,
  alignContent: { lg: "stretch" },
  overflow: "hidden",
};

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
}: {
  height: number | string;
}): SxProps<Theme> => ({
  height,
  width: "100%",
  minWidth: 0,
  flex: 1,
});

// components/dashboard/AnalysisPieChart.styles.ts
export const pieChartHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.1,
  mb: 0.5,
};

export const pieChartHeaderIconSx: SxProps<Theme> = {
  width: 30,
  height: 30,
  display: "grid",
  placeItems: "center",
  borderRadius: RADIUS_PX.md,
  bgcolor: "info.light",
  color: "info.contrastText",
  flexShrink: 0,
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

const alarmBellBlink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
`;

export const alarmBellSx: SxProps<Theme> = {
  animation: `${alarmBellBlink} 1.4s ease-in-out infinite`,
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
};

const alarmBorderBlink = (color: string) => keyframes`
  0%, 100% {
    border-color: ${color};
    box-shadow: 0 0 0 1px ${alpha(color, 0.5)}, 0 0 16px ${alpha(color, 0.5)};
  }
  50% {
    border-color: ${alpha(color, 0.25)};
    box-shadow: 0 0 0 1px ${alpha(color, 0.08)}, 0 0 3px ${alpha(color, 0.1)};
  }
`;

// components/selfTickets/BasicCard.dynamic.styles.ts
export const doListCardSx = ({
  highlighted,
  styles,
}: {
  highlighted: boolean;
  styles: PriorityVisual;
}): SxProps<Theme> => ({
  animation: highlighted
    ? `${alarmBorderBlink(styles.color)} 1.4s ease-in-out infinite`
    : "none",
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
  mb: 1.5,
  // borderRadius: RADIUS_PX.sm,
  border: "1px solid",
  borderColor: highlighted ? styles.color : "divider",
  borderLeft: highlighted ? "6px solid" : `6px solid ${styles.color}`,
  borderLeftColor: highlighted ? styles.color : undefined,
  bgcolor: highlighted
    ? (theme) =>
        alpha(styles.color, theme.palette.mode === "dark" ? 0.16 : 0.08)
    : "background.paper",
  boxShadow: highlighted
    ? (theme) =>
        `0 0 0 1px ${alpha(styles.color, 0.5)}, 0 0 12px ${alpha(styles.color, theme.palette.mode === "dark" ? 0.55 : 0.35)}`
    : "none",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  position: "relative",
  "&:hover": {
    boxShadow: (theme) =>
      highlighted
        ? `0 0 0 1px ${alpha(styles.color, 0.65)}, 0 0 18px ${alpha(styles.color, theme.palette.mode === "dark" ? 0.65 : 0.45)}`
        : theme.palette.mode === "dark"
          ? ELEVATION.dark.cardHover
          : ELEVATION.light.cardHover,
    transform: "translateY(-3px)",
    borderColor: styles.color,
  },
});

export const doListCardNumberSx = ({
  styles,
}: {
  styles: PriorityVisual;
}): SxProps<Theme> => ({
  fontSize: 11,
  fontWeight: 900,
  color: styles.color,
  letterSpacing: 0.5,
  mr: 2,
});

export const doListCardPriorityChipSx = ({
  alpha,
  styles,
}: AlphaStyleArgs & { styles: PriorityVisual }): SxProps<Theme> => ({
  fontSize: 11,
  bgcolor: (theme) =>
    theme.palette.mode === "dark" ? alpha(styles.color, 0.16) : styles.bg,
  color: styles.color,
  borderWidth: `1px`,
  borderStyle: `solid`,
  borderColor: (theme) =>
    theme.palette.mode === "dark" ? alpha(styles.color, 0.5) : styles.bg,
  textTransform: "Capitalize",
});

// components/selfTickets/BasicCard.styles.ts
export const sharedCardContentSx: SxProps<Theme> = {
  ...insetSx,
  "&:last-child": { pb: 2 },
};
export const doListCardDateSx: SxProps<Theme> = {
  fontSize: 11,
  fontWeight: 700,
  color: "text.disabled",
};

export const sharedCardTitleSx: SxProps<Theme> = {
  fontSize: "1rem",
  fontWeight: 700,
  lineHeight: 1.3,
  mb: 1,
  color: "text.primary",
};

export const sharedCardDividerSx: SxProps<Theme> = {
  mb: 2,
  opacity: 0.6,
};

export const getPriorityCardStyles = (theme: Theme, priority: unknown) => {
  const palette = getPriorityPalette(theme, priority);
  return {
    color: palette.text,
    bg: palette.bg,
    border: alpha(palette.text, theme.palette.mode === "dark" ? 0.5 : 0.3),
  };
};
export const sharedCardMetaRowSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1.5,
  justifyContent: "space-between",
  alignItems: "center",
};

// components/selfTickets/CreateModel.dynamic.styles.ts
export const doListFormTooltipPopperSx = (): SxProps<Theme> => ({
  zIndex: (theme) => theme.zIndex.tooltip,
  pointerEvents: "none",
});

// components/selfTickets/CreateModel.styles.ts
export const doListFormTitleSx: SxProps<Theme> = {
  fontSize: 18,
  fontWeight: 900,
  lineHeight: 1.1,
};

export const doListFormCloseButtonSx: SxProps<Theme> = {
  color: "text.primary",
};

export const doListFormSectionTitleSx: SxProps<Theme> = {
  fontSize: 14,
  fontWeight: 900,
};

export const formSwitchLabelSx: SxProps<Theme> = {
  m: 0,
  "& .MuiFormControlLabel-label": { fontSize: 13, fontWeight: 700 },
};

export const reminderHelpPopoverSx: SxProps<Theme> = {
  mt: 0.75,
  width: { xs: 300, sm: 390 },
  ...insetSx,
  borderRadius: RADIUS_PX.lg,
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

export const reminderExampleDaysSx: SxProps<Theme> = { fontWeight: 900 };

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

export const requiredNoteRowSx: SxProps<Theme> = {
  mr: "auto",
  color: "text.secondary",
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
  fontWeight: 700,
};

export const requiredMarkSx: SxProps<Theme> = {
  color: "error.main",
  fontWeight: 900,
};

// components/selfTickets/DetailModel.dynamic.styles.ts
export const doListDetailPriorityChipSx = ({
  pStyle,
}: {
  pStyle: PriorityPalette;
}): SxProps<Theme> => ({
  mt: 0.6,
  bgcolor: pStyle.bg,
  color: pStyle.text,
  fontWeight: 900,
  fontSize: 10,
  height: 20,
  borderRadius: RADIUS_PX.sm,
});

export const doListDetailStatusPanelSx = ({
  alpha,
  isDark,
  theme,
}: AlphaStyleArgs & { isDark: boolean; theme: Theme }): SxProps<Theme> => ({
  ml: "auto",
  mr: 2,
  px: INSET_X,
  py: INSET_Y,
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.lg,
  bgcolor: alpha(theme.palette.primary.main, isDark ? 0.1 : 0.04),
});
export const doListDetailCommentListSx = ({
  alpha,
  isDark,
  theme,
}: AlphaStyleArgs & { isDark: boolean; theme: Theme }): SxProps<Theme> => ({
  flex: 1,
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
  ...insetSx,
  height: 360,
  bgcolor: alpha(theme.palette.primary.main, isDark ? 0.08 : 0.045),
});

export const selfTicketsDetailModelNoteBoxSx = ({
  alpha,
  isDark,
  theme,
}: AlphaStyleArgs & { isDark: boolean; theme: Theme }): SxProps<Theme> => ({
  display: "flex",
  alignItems: "flex-start",
  gap: { xs: 0.75, sm: 1 },
  borderRadius: RADIUS_PX.xs,
  px: { xs: 0.75, sm: 0.5 },
  py: { xs: 0.55, sm: 0 },
  bgcolor: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.05),
  border: "1px solid",
  borderColor: alpha(theme.palette.primary.main, isDark ? 0.3 : 0.2),
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  flex: { xs: "0 0 auto", sm: 1 },
  minWidth: 0,
  "& .MuiSvgIcon-root": {
    flexShrink: 0,
    mt: { xs: 0.15, sm: 0 },
  },
  "& .MuiTypography-root": {
    lineHeight: 1.3,
  },
});
export const doListDetailFieldSx = ({
  alpha,
  isDark,
  theme,
}: AlphaStyleArgs & { isDark: boolean; theme: Theme }): SxProps<Theme> => ({
  px: INSET_X,
  py: INSET_Y,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.sm,
  bgcolor: alpha(theme.palette.background.paper, isDark ? 0.32 : 0.72),
});

export const doListDetailFieldLabelSx = ({
  detailLabelSx,
}: {
  detailLabelSx: StaticStyleObject;
}): SxProps<Theme> => ({ ...detailLabelSx, mb: 0.45 });

export const doListDetailFieldValueSx = ({
  capitalize,
  detailValueSx,
}: {
  capitalize?: boolean;
  detailValueSx: StaticStyleObject;
}): SxProps<Theme> => ({
  ...detailValueSx,
  textTransform: capitalize ? "capitalize" : "none",
});
export const selfTicketsDetailModelCommentWrapperSx = ({
  isCurrentUser,
}: {
  isCurrentUser: boolean;
}): SxProps<Theme> => ({
  alignSelf: isCurrentUser ? "flex-end" : "flex-start",
  maxWidth: "90%",
});

export const selfTicketsDetailModelCommentTitleSx: SxProps<Theme> = {
  textAlign: "center",
};

export const selfTicketsDetailModelCommentPaperSx = ({
  alpha,
  isDark,
  theme,
  isCurrentUser,
}: AlphaStyleArgs & {
  isDark: boolean;
  theme: Theme;
  isCurrentUser: boolean;
}): SxProps<Theme> => ({
  ...insetSx,
  borderRadius: RADIUS_PX.sm,
  border: "1px solid",
  borderColor: theme.palette.divider,
  bgcolor: isCurrentUser
    ? isDark
      ? alpha(theme.palette.primary.main, 0.2)
      : SURFACE_TINT.ownMessage
    : isDark
      ? theme.palette.background.paper
      : theme.palette.background.paper,
});

// components/selfTickets/DetailModel.styles.ts
export const doListDetailEyebrowSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: 11,
  fontWeight: 900,
  textTransform: "capitalize",
};

export const doListDetailNumberSx: SxProps<Theme> = {
  lineHeight: 1.15,
};

export const doListDetailOwnerRowSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "row",
};

export const doListDetailOwnerAvatarSx: SxProps<Theme> = {
  bgcolor: "primary.main",
};

export const doListDetailOwnerLabelSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: 11,
  fontWeight: 900,
  textTransform: "uppercase",
};

export const doListDetailCloseButtonSx: SxProps<Theme> = {
  height: 36,
  width: 36,
  color: "text.secondary",
};
export const selfTicketsDetailModelDialogPaperSx: SxProps<Theme> = {
  m: { xs: 1, sm: 2 },
  width: { xs: "calc(100% - 16px)", sm: "100%" },
  maxHeight: { xs: "calc(100dvh - 16px)", sm: "calc(100dvh - 32px)" },
  display: "flex",
  flexDirection: "column",
};

export const selfTicketsDetailModelDialogContentSx: SxProps<Theme> = {
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
};

export const selfTicketsDetailModelDialogActionsSx: SxProps<Theme> = {
  alignItems: "stretch",
  flexShrink: 0,
  justifyContent: "stretch",
  ...insetSx,
};

export const selfTicketsDetailModelFooterStackSx: SxProps<Theme> = {
  width: "100%",
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  alignItems: { xs: "stretch", sm: "center" },
  gap: { xs: 0.75, sm: 1.5 },
};

export const selfTicketsDetailModelFooterButtonsSx: SxProps<Theme> = {
  justifyContent: "space-between",
  alignItems: "center",
  width: { xs: "100%", sm: "auto" },
  "& .MuiButton-root": {
    minWidth: 0,
    flex: { xs: "1 1 0", sm: "0 0 auto" },
    px: { xs: 0.65, sm: 1.5 },
    fontSize: { xs: 11, sm: 13 },
    whiteSpace: "nowrap",
  },
  "& .MuiButton-startIcon": {
    mr: { xs: 0.4, sm: 0.5 },
  },
};
export const doListDetailTabButtonSx: SxProps<Theme> = {
  fontWeight: 700,
  textTransform: "none",
};
export const doListCommentAuthorSx: SxProps<Theme> = {
  color: "text.secondary",
};

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

const resolveTableColumnWidth = (
  columnWidth: ResponsiveStyleWidth | undefined,
): {
  width: ResponsiveStyleWidth;
  minWidth: ResponsiveStyleWidth;
  maxWidth: ResponsiveStyleWidth;
} => {
  const width = columnWidth ?? 100;
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
  }: {
    column: TableStyleColumn;
    index: number;
    tableHeaderCellSx: ThemeStyleCallback;
    stickyFirstColumn: boolean;
  }): SxProps<Theme> =>
  (theme) => {
    const isStickyFirstColumn = stickyFirstColumn && index === 0;
    const columnWidthSx = resolveTableColumnWidth(column.width);

    return {
      ...columnWidthSx,
      ...tableHeaderCellSx(theme),
      position: "sticky",
      top: 0,
      left: isStickyFirstColumn ? 0 : "auto",
      // Keep the fixed header corner above the horizontally scrolling headers.
      zIndex: isStickyFirstColumn ? "30 !important" : 21,
      overflow: "hidden",
      backgroundColor: isStickyFirstColumn
        ? `${theme.palette.background.paper} !important`
        : theme.palette.background.paper,
      backgroundImage: `linear-gradient(${getTableHeaderTint(
        theme,
      )}, ${getTableHeaderTint(theme)})`,
      ...(isStickyFirstColumn
        ? {
            boxShadow: `1px 0 0 ${theme.palette.divider}, 10px 0 12px -14px ${alpha(
              theme.palette.text.primary,
              0.7,
            )}`,
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
  }: {
    column: TableStyleColumn;
    index: number;
    stickyTableCellSx: ThemeStyleCallback;
    stickyFirstColumn: boolean;
  }): SxProps<Theme> =>
  (theme) => {
    const isStickyFirstColumn = stickyFirstColumn && index === 0;
    const columnWidthSx = resolveTableColumnWidth(column.width);

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
      textTransform: "capitalize",
      boxSizing: "border-box",
      ...(isStickyFirstColumn
        ? {
            boxShadow: `1px 0 0 ${theme.palette.divider}, 10px 0 12px -14px ${alpha(
              theme.palette.text.primary,
              0.65,
            )}`,
          }
        : {}),
    };
  };

// components/TableView.dynamic.styles.ts
export const tableStatusDotSx = <T extends object>({
  column,
  getStatusColor,
  row,
}: {
  column: { dataKey?: keyof T };
  getStatusColor: (status: unknown) => string;
  row: T;
}): SxProps<Theme> => ({
  "& .MuiBadge-badge": {
    backgroundColor: getStatusColor(
      column.dataKey === undefined ? undefined : row[column.dataKey],
    ),
  },
});

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
  borderRadius: RADIUS_PX.lg,
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

export const tableStatusCellSx: SxProps<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: 1,
  maxWidth: "100%",
};

export const tableStatusTextSx: SxProps<Theme> = {
  overflow: "hidden",
  textOverflow: "ellipsis",
};

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
  lineHeight: 1.25,
  minWidth: 0,
};

export const tableTitleIconSx: SxProps<Theme> = {
  flexShrink: 0,
  height: 22,
  width: 22,
};

export const tableSubtitleSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: "0.72rem",
  lineHeight: 1.25,
  minWidth: 0,
};

export const tableSearchFieldSx: SxProps<Theme> = {
  width: { xs: "100%", sm: 260 },
  "& .MuiOutlinedInput-root": {
    bgcolor: "background.default",
  },
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

// components/tickets/BasicCard.dynamic.styles.ts
export const ticketCardSx = ({
  highlighted,
  styles,
}: {
  highlighted: boolean;
  styles: PriorityVisual;
}): SxProps<Theme> => ({
  animation: highlighted
    ? `${alarmBorderBlink(styles.color)} 1.4s ease-in-out infinite`
    : "none",
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
  mb: 1.5,
  borderRadius: RADIUS_PX.sm,
  border: "1px solid",
  borderColor: highlighted ? styles.color : "divider",
  borderLeft: highlighted ? "6px solid" : `6px solid ${styles.color}`,
  borderLeftColor: highlighted ? styles.color : undefined,
  bgcolor: highlighted
    ? (theme) =>
        alpha(styles.color, theme.palette.mode === "dark" ? 0.16 : 0.08)
    : "background.paper",
  boxShadow: highlighted
    ? (theme) =>
        `0 0 0 1px ${alpha(styles.color, 0.5)}, 0 0 12px ${alpha(styles.color, theme.palette.mode === "dark" ? 0.55 : 0.35)}`
    : "none",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  position: "relative",
  "&:hover": {
    boxShadow: (theme) =>
      highlighted
        ? `0 0 0 1px ${alpha(styles.color, 0.65)}, 0 0 18px ${alpha(styles.color, theme.palette.mode === "dark" ? 0.65 : 0.45)}`
        : theme.palette.mode === "dark"
          ? ELEVATION.dark.cardHover
          : ELEVATION.light.cardHover,
    transform: "translateY(-3px)",
    borderColor: styles.color,
  },
});

export const ticketCardNumberSx = ({
  styles,
}: {
  styles: PriorityVisual;
}): SxProps<Theme> => ({
  fontSize: 11,
  fontWeight: 900,
  color: styles.color,
  letterSpacing: 0.5,
});

export const ticketCardPriorityChipSx = ({
  alpha,
  styles,
}: AlphaStyleArgs & { styles: PriorityVisual }): SxProps<Theme> => ({
  height: 20,
  fontWeight: 700,
  fontSize: 9,
  bgcolor: (theme) =>
    theme.palette.mode === "dark" ? alpha(styles.color, 0.16) : styles.bg,
  color: styles.color,
  border: `1px solid ${styles.border}`,
  textTransform: "uppercase",
});

// components/tickets/BasicCard.styles.ts
export const ticketCardDateSx: SxProps<Theme> = { fontSize: 11 };

export const ticketCardDescriptionSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: 13,
  mb: 2,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  minHeight: "3em",
};

export const ticketCardAssigneeAvatarSx: SxProps<Theme> = {
  width: 24,
  height: 24,
  fontSize: 10,
  bgcolor: "primary.main",
  fontWeight: "bold",
};

export const ticketCardTargetDateSx: SxProps<Theme> = {
  textAlign: "right",
  mr: 1,
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
  p: 0.25,
};

// components/tickets/DetailModal.callback.styles.ts
export const ticketDetailHeaderRowSx = {
  width: "100%",
  display: "flex",
  // flexWrap: "wrap",
  gap: 2,
  justifyContent: "space-between",
  alignItems: "center",
};
export const ticketDetailFormSectionSx =
  ({ formSectionSx }: { formSectionSx: ThemeStyleCallback }): SxProps<Theme> =>
  (currentTheme) => ({
    ...formSectionSx(currentTheme),
    // minHeight: 360,
    minHeight: { xs: "auto", sm: 360 },
    ...insetSx,
    boxShadow: "none",
  });

export const ticketDetailActivitySectionSx =
  ({ formSectionSx }: { formSectionSx: ThemeStyleCallback }): SxProps<Theme> =>
  (currentTheme) => ({
    ...formSectionSx(currentTheme),
    minHeight: 360,
    p: 0,
    overflow: "hidden",
  });
// components/tickets/DetailModal.dynamic.styles.ts
export const ticketDetailPriorityChipSx = ({
  pStyle,
}: {
  pStyle: PriorityPalette;
}): SxProps<Theme> => ({
  bgcolor: pStyle.bg,
  color: pStyle.text,
  fontSize: 10,
  height: 18,
  mt: 0.5,
  borderRadius: RADIUS_PX.sm,
  "& .MuiChip-label": { px: 1 },
});

export const ticketDetailStatusPanelSx = ({
  modalPalette,
}: {
  modalPalette: ModalPalette;
}): SxProps<Theme> => ({
  // minWidth: { xs: 220, sm: 356 },
  px: INSET_X,
  py: INSET_Y,
  border: `1px solid ${modalPalette.border}`,
  borderRadius: RADIUS_PX.md,
  bgcolor: modalPalette.headerPanel,
});

export const ticketDetailStatusValueSx = ({
  detailValueSx,
}: {
  detailValueSx: StaticStyleObject;
}): SxProps<Theme> => ({ ...detailValueSx, mt: 0.25 });

export const ticketDetailSummaryBannerSx = ({
  theme,
}: {
  theme: Theme;
}): SxProps<Theme> => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
  color: "primary.contrastText",
  borderRadius: RADIUS_PX.sm,
  px: INSET_X,
  py: INSET_Y,
  mb: 1.8,
  // minHeight: 74,
  minHeight: { xs: "auto", sm: 74 },
});

export const ticketDetailSummaryLabelSx = ({
  alpha,
  detailLabelSx,
  theme,
}: AlphaStyleArgs & {
  detailLabelSx: StaticStyleObject;
  theme: Theme;
}): SxProps<Theme> => ({
  ...detailLabelSx,
  color: alpha(theme.palette.primary.contrastText, 0.86),
});

export const ticketDetailDescriptionSx = ({
  modalPalette,
}: {
  modalPalette: ModalPalette;
}): SxProps<Theme> => ({
  mt: 0.8,
  mb: 1.8,
  ...insetSx,
  height: { xs: "auto", sm: 200 },
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarGutter: "stable",
  bgcolor: modalPalette.panel,
  borderRadius: RADIUS_PX.sm,
});

export const ticketDetailFieldSx = ({
  modalPalette,
}: {
  modalPalette: ModalPalette;
}): SxProps<Theme> => ({
  ...insetSx,
  border: `1px solid ${modalPalette.border}`,
  borderRadius: RADIUS_PX.sm,
  minHeight: 52,
});

export const ticketDetailFieldValueSx = ({
  detailValueSx,
}: {
  detailValueSx: StaticStyleObject;
}): SxProps<Theme> => ({ ...detailValueSx, mt: 0.45 });

export const ticketDetailPanelHeaderSx = ({
  modalPalette,
}: {
  modalPalette: ModalPalette;
}): SxProps<Theme> => ({
  px: INSET_X,
  py: INSET_Y,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: `1px solid ${modalPalette.border}`,
});

export const ticketTimelineRailSx = ({
  modalPalette,
}: {
  modalPalette: ModalPalette;
}): SxProps<Theme> => ({
  position: "absolute",
  left: 7,
  top: 0,
  bottom: 0,
  width: "2px",
  bgcolor: modalPalette.logDivider,
});

export const ticketTimelineDotSx = ({
  getStatusColor,
  log,
}: {
  getStatusColor: (status: unknown) => string;
  log: { status?: unknown };
}): SxProps<Theme> => ({
  position: "absolute",
  left: -5,
  top: 6,
  width: 12,
  height: 12,
  borderRadius: RADIUS.full,
  bgcolor: getStatusColor(log.status),
  border: "3px solid",
  borderColor: "background.paper",
  zIndex: 2,
});

export const ticketTimelineEntrySx = ({
  index,
  modalPalette,
}: {
  index: number;
  modalPalette: ModalPalette;
}): SxProps<Theme> => ({
  ...insetSx,
  bgcolor: index === 0 ? modalPalette.panel : "background.paper",
  borderRadius: RADIUS_PX.lg,
  border: `1px solid ${modalPalette.border}`,
});

export const ticketTimelineStatusChipSx = ({
  alpha,
  getStatusColor,
  isDark,
  log,
}: AlphaStyleArgs & {
  getStatusColor: (status: unknown) => string;
  isDark: boolean;
  log: { status?: unknown };
}): SxProps<Theme> => ({
  height: 19,
  borderRadius: RADIUS_PX.sm,
  bgcolor: alpha(getStatusColor(log.status), isDark ? 0.18 : 0.1),
  color: getStatusColor(log.status),
  fontSize: 10,
  fontWeight: 700,
});

// components/tickets/DetailModal.styles.ts
export const ticketDetailIconAvatarSx: SxProps<Theme> = {
  width: 34,
  height: 34,
  bgcolor: "primary.main",
  color: "primary.contrastText",
  fontSize: 22,
  fontWeight: 900,
};

export const ticketDetailNumberSx: SxProps<Theme> = {
  color: "text.primary",
  fontSize: 18,
  fontWeight: 900,
  lineHeight: 1.05,
  mt: 0.25,
};

export const ticketDetailAssigneeAvatarSx: SxProps<Theme> = {
  display: { xs: "none", sm: "flex" },
  width: 34,
  height: 34,
  bgcolor: "primary.dark",
  color: "primary.contrastText",
  fontSize: 14,
  fontWeight: 900,
};

export const ticketDetailCloseButtonSx: SxProps<Theme> = {
  ml: "0 !important",
  color: "text.secondary",
  width: 36,
  height: 36,
};

export const detailSubjectSx: SxProps<Theme> = {
  fontSize: 14,
  mt: 1,
  lineHeight: 1.2,
  wordBreak: "break-word",
};

export const detailDescriptionTextSx: SxProps<Theme> = {
  color: "text.primary",
  fontSize: 14,
  lineHeight: 1.2,
  whiteSpace: "pre-line",
  overflowWrap: "anywhere",
};

export const ticketDetailActivityPaperSx: SxProps<Theme> = {
  p: 0,
  borderRadius: RADIUS.none,
  bgcolor: "transparent",
  border: 0,
};

export const ticketActivityTitleSx: SxProps<Theme> = {
  fontSize: 13,
  fontWeight: 900,
};

export const ticketActivityCountChipSx: SxProps<Theme> = {
  height: 20,
  fontSize: 10,
  fontWeight: 700,
  borderRadius: RADIUS_PX.sm,
  bgcolor: "action.hover",
};

export const ticketTimelineScrollSx: SxProps<Theme> = {
  position: "relative",
  pl: 1.5,
  pr: 1.5,
  py: INSET_Y,
  height: 350,
  overflowY: "auto",
};

export const ticketTimelineItemSx: SxProps<Theme> = {
  position: "relative",
  pl: 3,
};

export const ticketTimelineRemarksSx: SxProps<Theme> = {
  fontWeight: 400,
  my: 0.5,
};

export const ticketDetailActionsSx: SxProps<Theme> = {
  flexShrink: 0,
  alignItems: "center",
  flexWrap: "wrap",
  rowGap: 1,
  "& .MuiButton-root": {
    fontSize: 12,
    // textTransform: "uppercase",
  },
};
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

export const ticketsRatingInfoModelRatingDialogPaperSx: SxProps<Theme> = {
  m: { xs: 1, sm: 2 },
  maxHeight: { xs: "calc(100dvh - 16px)", sm: "calc(100dvh - 32px)" },
};

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
  fontWeight: 700,
  lineHeight: 1.5,
};

export const errorTitleSx = {
  color: "text.primary",
  fontSize: { xs: "1.4rem", sm: "1.5rem" },
  fontWeight: 700,
  lineHeight: 1.3,
  mt: 0.5,
};

export const errorMessageSx = {
  color: "text.secondary",
  fontSize: "0.95rem",
  lineHeight: 1.6,
  mt: 1,
};

export const errorActionsSx = {
  justifyContent: "center",
  mt: 3,
};

// pages/Login.dynamic.styles.ts
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
  backgroundImage: `${HERO_OVERLAY}, url(${bgImage})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
});

// pages/Login.styles.ts
export const authCardSx: SxProps<Theme> = {
  width: "min(100%, 440px)",
  boxShadow: ELEVATION.light.hero,
  backdropFilter: "blur(12px)",
};

export const authCardContentSx: SxProps<Theme> = {
  position: "relative",
  p: { xs: 2.5, sm: 4 },
  "&:last-child": { pb: { xs: 2.5, sm: 4 } },
};

/** Login-form counterpart to the app-bar theme mode control. */
export const authThemeToggleSx =
  (isDark: boolean): SxProps<Theme> =>
  (theme) => {
    const color = isDark
      ? theme.palette.warning.main
      : theme.palette.primary.main;

    return {
      position: "absolute",
      top: { xs: 8, sm: 12 },
      right: { xs: 8, sm: 12 },
      color,
      bgcolor: alpha(color, theme.palette.mode === "dark" ? 0.16 : 0.1),
      "&:hover": {
        bgcolor: alpha(color, theme.palette.mode === "dark" ? 0.24 : 0.16),
      },
    };
  };

export const authLogoSx: SxProps<Theme> = {
  display: "block",
  width: 130,
  height: 52,
  objectFit: "contain",
  mx: "auto",
  mb: 2,
};

export const authIconBadgeSx: SxProps<Theme> = {
  width: 46,
  height: 46,
  display: "grid",
  placeItems: "center",
  borderRadius: RADIUS_PX.lg,
  bgcolor: "primary.main",
  color: "primary.contrastText",
  mx: "auto",
  mb: 1.5,
};

export const authSubtitleSx: SxProps<Theme> = { mt: 0.75, mb: 3 };

export const authSubmitButtonSx: SxProps<Theme> = { mt: 3 };

export const authSpinnerSx: SxProps<Theme> = { mr: 1 };

export const authFootnoteSx: SxProps<Theme> = { mt: 0.75 };
// common/dialogs.ts

export type ConfirmDialogTone =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "secondary"
  | "info";

const getConfirmDialogToneColor = (theme: Theme, tone: ConfirmDialogTone) => {
  if (tone === "success") return theme.palette.success.main;
  if (tone === "error") return theme.palette.error.main;
  if (tone === "warning") return theme.palette.warning.main;
  if (tone === "secondary") return theme.palette.secondary.main;
  if (tone === "info") return theme.palette.info.main;
  return theme.palette.text.primary;
};

export const confirmDialogTitleRowSx = {
  alignItems: "center",
  display: "flex",
  gap: 1,
  justifyContent: "space-between",
};

export const confirmDialogTitleContentSx = {
  alignItems: "center",
  display: "flex",
  gap: 1,
  minWidth: 0,
};

export const confirmDialogTitleIconSx = {
  alignItems: "center",
  display: "flex",
  flexShrink: 0,
  "& .MuiSvgIcon-root": {
    fontSize: 22,
  },
};

export const confirmDialogPaperSx = {
  maxWidth: 460,
};

/** Keep confirmation actions legible: one label per line on phones, one row elsewhere. */
export const confirmDialogActionsSx: SxProps<Theme> = {
  flexDirection: { xs: "column", sm: "row" },
  flexWrap: "nowrap",
  gap: 1,
  "& .MuiButton-root": {
    minWidth: 0,
    whiteSpace: "nowrap",
    width: { xs: "100%", sm: "auto" },
  },
};

export const confirmDialogHeaderSx =
  (tone: ConfirmDialogTone) => (theme: Theme) => ({
    color: getConfirmDialogToneColor(theme, tone),
  });

export const confirmDialogContentSx = {
  mt: 0,
  ...insetSx,
};
export const confirmDialogRootSx = (theme: Theme) => ({
  zIndex: theme.zIndex.modal + 10,
});
export const toggleButton = {
  "& .MuiToggleButton-root": {
    px: 1.2,
    borderColor: "divider",
  },
  "& .MuiToggleButton-root .MuiSvgIcon-root": {
    color: "text.secondary",
    transition: "0.2s",
  },
  "&& .MuiToggleButton-root.Mui-selected": {
    bgcolor: "primary.main",
    color: "primary.contrastText",
  },
  "&& .MuiToggleButton-root.Mui-selected .MuiSvgIcon-root": {
    color: "primary.contrastText",
  },
  "& .MuiToggleButton-root:hover": {
    bgcolor: "primary.50",
  },
};

export const deleteIconSx = {
  color: "error.main",
};

export const editIconSx = {
  color: "primary.main",
};

export const approveDetailDialogPaperSx = {
  width: "95vw",
  maxWidth: "95vw",
};

export const teamReportModalPaperSx: SxProps<Theme> = {
  height: { xs: "100%", sm: "min(88vh, 860px)" },
  borderRadius: { xs: 0, sm: RADIUS_PX.lg },
  bgcolor: "background.default",
  overflow: "hidden",
};

export const teamReportModalTitleRowSx: SxProps<Theme> = {
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
};

export const teamReportModalTitleContentSx: SxProps<Theme> = {
  alignItems: "center",
  minWidth: 0,
  flex: 1,
};

export const teamReportModalTitleIconSx: SxProps<Theme> = (theme) => ({
  width: 38,
  height: 38,
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  borderRadius: RADIUS_PX.md,
  bgcolor: alpha(
    theme.palette.primary.main,
    theme.palette.mode === "dark" ? 0.2 : 0.12,
  ),
  color: "primary.main",
});

export const teamReportModalTitleSx: SxProps<Theme> = {
  fontSize: { xs: "1rem", sm: "1.125rem" },
  fontWeight: 900,
  lineHeight: 1.2,
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export const teamReportModalSubtitleSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: "0.8125rem",
  fontWeight: 600,
  lineHeight: 1.4,
};

export const teamReportModalTitleMetaSx: SxProps<Theme> = {
  alignItems: "center",
  flexWrap: "wrap",
  gap: 0.75,
  mt: 0.4,
  "& .MuiChip-root": {
    height: 22,
    borderRadius: RADIUS_PX.xs,
    fontSize: 11,
    fontWeight: 700,
  },
};

export const teamReportModalLoadingSx: SxProps<Theme> = {
  minHeight: 360,
  display: "grid",
  placeItems: "center",
  gap: 1,
  color: "text.secondary",
};

export const teamReportModalSectionStackSx: SxProps<Theme> = {
  gap: 1.5,
  pb: 2,
};

export const teamReportModalSectionHeaderSx: SxProps<Theme> = {
  alignItems: "center",
  mb: 1.25,
};

export const teamReportModalSectionPanelSx: SxProps<Theme> = (theme) => ({
  ...insetSx,
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.lg,
  bgcolor:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.text.primary, 0.025)
      : theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  minWidth: 0,
});

export const teamReportModalSectionIconSx =
  (color: "primary" | "secondary"): SxProps<Theme> =>
  (theme) => {
    const paletteColor =
      color === "secondary"
        ? theme.palette.secondary.main
        : theme.palette.primary.main;

    return {
      width: 30,
      height: 30,
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      borderRadius: RADIUS_PX.sm,
      bgcolor: alpha(paletteColor, theme.palette.mode === "dark" ? 0.18 : 0.1),
      color: paletteColor,
    };
  };

export const teamReportModalSummaryStackSx: SxProps<Theme> = {
  flexWrap: "wrap",
  gap: 0.75,
};

export const teamReportModalSummaryChipSx =
  (color: string): SxProps<Theme> =>
  (theme) => ({
    height: 24,
    borderRadius: RADIUS_PX.xs,
    bgcolor: alpha(color, theme.palette.mode === "dark" ? 0.18 : 0.08),
    borderColor: alpha(color, 0.42),
    color,
    fontSize: 11,
    fontWeight: 700,
    "& .MuiChip-label": {
      px: 1,
    },
  });

export const teamReportModalTableWrapSx: SxProps<Theme> = {
  mt: 1.25,
  height: { xs: 300, sm: 300 },
  minWidth: 0,
};
