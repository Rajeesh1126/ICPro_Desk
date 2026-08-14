import { alpha, type Theme } from "@mui/material/styles";
import { type CSSProperties, type SxProps } from "@mui/material";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DynamicStyleValues = Record<string, any>;

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
    panel: alpha(theme.palette.primary.main, isDark ? 0.08 : 0.045),
    headerPanel: alpha(theme.palette.primary.main, isDark ? 0.1 : 0.04),
    chipPanel: isDark
      ? alpha(theme.palette.common.white, 0.04)
      : theme.palette.common.white,
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

export const modalFormPaperSx = (theme: Theme) => ({
  m: { xs: 1, sm: 2 },
  width: { xs: "calc(100% - 16px)", sm: "calc(100% - 32px)" },
  maxWidth: 940,
  maxHeight: { xs: "calc(100dvh - 16px)", sm: "calc(100dvh - 32px)" },
  borderRadius: 2,
  bgcolor: "background.paper",
  backgroundImage: "none",
  border: `1px solid ${theme.palette.divider}`,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 18px 54px rgba(0, 0, 0, 0.42)"
      : "0 18px 54px rgba(15, 23, 42, 0.12)",
  overflow: "hidden",
});

export const modalFormHeaderSx = (theme: Theme) => ({
  px: { xs: 1.75, sm: 2.25 },
  py: { xs: 1.4, sm: 1.5 },
  bgcolor:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.primary.main, 0.08)
      : alpha(theme.palette.primary.main, 0.045),
  borderBottom: `1px solid ${theme.palette.divider}`,
});

export const modalFormIconSx = (theme: Theme) => ({
  width: 36,
  height: 36,
  borderRadius: 1.75,
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  bgcolor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
});

export const modalFormContentSx = (theme: Theme) => ({
  mt: 1.5,
  p: { xs: 1.5, sm: 1.5 },
  bgcolor:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.common.white, 0.015)
      : alpha(theme.palette.primary.main, 0.018),
});

export const detailLabelSx = {
  color: "text.secondary",
  fontSize: 11,
  fontWeight: 600,
  lineHeight: 1.2,
  letterSpacing: 0,
  textTransform: "capitalize",
};

export const detailValueSx = {
  color: "text.primary",
  fontSize: 13,
  fontWeight: 700,
  lineHeight: 1.35,
  overflowWrap: "anywhere",
};

export const modalFormActionsSx = (theme: Theme) => ({
  px: { xs: 1.75, sm: 3 },
  py: 1.5,
  borderTop: `1px solid ${theme.palette.divider}`,
  bgcolor:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.common.white, 0.012)
      : alpha(theme.palette.primary.main, 0.012),
});

export const formSectionSx = (theme: Theme) => ({
  height: "100%",
  p: { xs: 1.4, sm: 1.55 },
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 2,
  bgcolor:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.common.white, 0.018)
      : theme.palette.background.paper,
});

export const formSectionTitleSx = {
  mb: 1.25,
  color: "text.primary",
  fontSize: 13,
  fontWeight: 900,
  letterSpacing: 0,
  textTransform: "uppercase",
};

export const compactFieldSx = (theme: Theme) => ({
  // "& .MuiInputLabel-root": {
  //   fontSize: 12,
  //   fontWeight: 700,
  // },
  "& .MuiOutlinedInput-root": {
    // minHeight: 42,
    borderRadius: 1,
    bgcolor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.common.white, 0.025)
        : alpha(theme.palette.primary.main, 0.035),
  },
  // "& .MuiOutlinedInput-input": {
  //   fontWeight: 700,
  // },
});

export const dashedPanelSx = (theme: Theme) => ({
  p: { xs: 1.25, sm: 1.35 },
  border: "1px dashed",
  borderColor:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.primary.light, 0.42)
      : alpha(theme.palette.primary.main, 0.42),
  borderRadius: 2,
  bgcolor: alpha(
    theme.palette.primary.main,
    theme.palette.mode === "dark" ? 0.05 : 0.035,
  ),
});

export const helperNoteSx = (theme: Theme) => ({
  p: 1.25,
  borderRadius: 1.5,
  bgcolor: alpha(
    theme.palette.secondary.main,
    theme.palette.mode === "dark" ? 0.13 : 0.1,
  ),
  color: theme.palette.secondary.main,
  fontSize: 11,
  fontWeight: 700,
  lineHeight: 1.45,
});

export const modalActionButtonSx = {
  boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
  fontWeight: 700,
  textTransform: "capitalize",
};

export const modalPrimaryActionButtonSx = {
  ...modalActionButtonSx,
  boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
};

export const confirmationDialogActionsSx = { p: 3 };

export const confirmationMessageSx = {
  mb: 2,
  color: "text.secondary",
};

export const errorDialogTitleSx = {
  fontWeight: 700,
  color: "error.main",
};

export const warningDialogTitleSx = {
  fontWeight: 700,
  color: "warning.main",
};

export const confirmationDialogTitleSx = { fontWeight: 700 };

export const attachmentSectionSx = (theme: Theme) => ({
  mt: 1.5,
  p: { xs: 1.25, sm: 1.5 },
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 2,
  bgcolor:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.common.white, 0.018)
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
  borderRadius: 1.5,
  color: "text.primary",
  display: "flex",
  gap: 1,
  minWidth: 0,
  p: 1,
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
  borderRadius: 1,
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

// common/layout.ts
export const appPageSx = {
  bgcolor: "background.default",
  height: {
    xs: "calc(100vh - 58px)",
    sm: "calc(100vh - 64px)",
  },
  overflow: "auto",
};

export const pageHeaderSx = {
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  gap: 2,
  justifyContent: "space-between",
  px: { xs: 2, sm: 3 },
  py: { xs: 2, md: 2.5 },
};

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

export const flexColumnFillSx = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  height: 0,
};

export const responsiveRightActionsSx = {
  width: { xs: "100%", sm: "auto" },
  justifyContent: "flex-end",
};

// common/navigation.ts
export const navButtonSx = (selected: boolean) => (theme: Theme) => ({
  borderRadius: 2,
  color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
  fontWeight: selected ? 800 : 700,
  px: { lg: 2.25, xl: 2.75 },
  position: "relative",
  transition: theme.transitions.create(
    ["background-color", "color", "box-shadow"],
    {
      duration: theme.transitions.duration.shorter,
    },
  ),
  whiteSpace: "nowrap",
  ...(selected && {
    backgroundColor: alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.18 : 0.1,
    ),
    boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.18)}`,
  }),
  "&:hover": {
    backgroundColor: alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.14 : 0.08,
    ),
  },
});

export const navListItemSx = (selected: boolean) => (theme: Theme) => ({
  borderRadius: 1,
  mb: 0.5,
  py: 1.1,
  transition: theme.transitions.create(
    ["background-color", "color", "box-shadow"],
    {
      duration: theme.transitions.duration.shorter,
    },
  ),
  ...(selected && {
    backgroundColor: alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.18 : 0.1,
    ),
    boxShadow: `inset 4px 0 0 ${theme.palette.primary.main}`,
  }),
  "&:hover": {
    backgroundColor: alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.14 : 0.08,
    ),
  },
});

// common/tables.ts
export const STATUS_COLORS: Record<string, string> = {
  open: "#D97706",
  modified: "#7C3AED",
  reopened: "#0F766E",
  accepted: "#146C94",
  assigned: "#19A7CE",
  completed: "#16865B",
  closed: "#64748B",
  rejected: "#DC3B4B",
  "not-satisfied": "#C2410C",
  "recall requested": "#A16207",
  "recall successful": "#4F46E5",
};

const DEFAULT_STATUS_COLOR = "#64748B";

function normalizeStatus(status: unknown) {
  return String(status ?? "")
    .replace(/^modified-/i, "")
    .trim()
    .toLowerCase();
}

export function getStatusColor(status: unknown) {
  return STATUS_COLORS[normalizeStatus(status)] ?? DEFAULT_STATUS_COLOR;
}

export function formatStatusLabel(status: unknown) {
  const normalizedStatus = String(status ?? "")
    .replace(/^modified-/i, "")
    .trim()
    .replace(/-/g, " ");

  return normalizedStatus;
}

const getOpaqueTableHeaderColor = (theme: Theme) =>
  theme.palette.mode === "dark" ? "#243447" : "#EAF2F8";

export const tableHeadSx = (theme: Theme) => ({
  backgroundColor: getOpaqueTableHeaderColor(theme),
  isolation: "isolate",
  opacity: 1,
  zIndex: 5,
  "& .MuiTableCell-head": {
    backgroundColor: getOpaqueTableHeaderColor(theme),
    backgroundImage: "none",
    opacity: 1,
  },
});

export const tableHeaderCellSx = (theme: Theme) => ({
  backgroundColor: getOpaqueTableHeaderColor(theme),
  backgroundImage: "none",
  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.28)}`,
  color: theme.palette.text.primary,
  fontWeight: 800,
  opacity: 1,
  "& .MuiTableSortLabel-root": {
    color: theme.palette.text.primary,
    fontWeight: 800,
  },
  "& .MuiTableSortLabel-root.Mui-active, & .MuiTableSortLabel-root.Mui-active .MuiTableSortLabel-icon":
  {
    color: theme.palette.primary.main,
  },
});

export const stickyTableCellSx = (theme: Theme) => ({
  backgroundColor: theme.palette.background.paper,
});

export const alternatingRowSx = (theme: Theme) => ({
  "&:nth-of-type(even) td": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.common.white, 0.025)
        : "#FAFCFE",
  },
});

// components/AppBar/header.callback.styles.ts
export const appBarHeaderCallbackCallbackSx1 =
  ({ alpha }: DynamicStyleValues): SxProps<Theme> =>
    (theme) => ({
      p: 2,
      background:
        theme.palette.mode === "dark"
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)}, ${alpha(theme.palette.secondary.main, 0.08)})`
          : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.08)})`,
    });

export const appBarHeaderCallbackCallbackSx2 =
  ({ alpha }: DynamicStyleValues): SxProps<Theme> =>
    (theme) => ({
      width: 38,
      height: 38,
      borderRadius: 2,
      display: "grid",
      placeItems: "center",
      bgcolor: alpha(
        theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.18 : 0.1,
      ),
      color: "primary.main",
      flexShrink: 0,
    });

export const appBarHeaderCallbackCallbackSx3 =
  ({ alpha }: DynamicStyleValues): SxProps<Theme> =>
    (theme) => ({
      m: 1,
      mb: 0.5,
      px: 1.25,
      py: 1.1,
      gap: 1.25,
      borderRadius: 2,
      "&:hover": {
        bgcolor: alpha(
          theme.palette.primary.main,
          theme.palette.mode === "dark" ? 0.16 : 0.08,
        ),
      },
    });

export const appBarHeaderCallbackCallbackSx4 =
  ({ alpha }: DynamicStyleValues): SxProps<Theme> =>
    (theme) => ({
      width: 34,
      height: 34,
      borderRadius: 1.75,
      display: "grid",
      placeItems: "center",
      bgcolor: alpha(
        theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.18 : 0.1,
      ),
      color: "primary.main",
      flexShrink: 0,
    });

export const appBarHeaderCallbackCallbackSx5 =
  ({ alpha }: DynamicStyleValues): SxProps<Theme> =>
    (theme) => ({
      m: 1,
      mt: 0.5,
      px: 1.25,
      py: 1.1,
      gap: 1.25,
      borderRadius: 2,
      "&:hover": {
        bgcolor: alpha(
          theme.palette.primary.main,
          theme.palette.mode === "dark" ? 0.16 : 0.08,
        ),
      },
    });

export const appBarHeaderCallbackCallbackSx6 =
  ({ alpha }: DynamicStyleValues): SxProps<Theme> =>
    (theme) => ({
      width: 34,
      height: 34,
      borderRadius: 1.75,
      display: "grid",
      placeItems: "center",
      bgcolor: alpha(
        theme.palette.secondary.main,
        theme.palette.mode === "dark" ? 0.18 : 0.1,
      ),
      color: "secondary.main",
      flexShrink: 0,
    });

export const appBarHeaderCallbackCallbackSx8 =
  ({ alpha }: DynamicStyleValues): SxProps<Theme> =>
    (theme) => ({
      m: 1,
      px: 1.25,
      py: 1.1,
      gap: 1.25,
      borderRadius: 2,
      color: "error.main",
      fontWeight: 800,
      "&:hover": {
        bgcolor: alpha(
          theme.palette.error.main,
          theme.palette.mode === "dark" ? 0.16 : 0.08,
        ),
      },
    });

export const appBarHeaderCallbackCallbackSx9 =
  ({ alpha }: DynamicStyleValues): SxProps<Theme> =>
    (theme) => ({
      width: 30,
      height: 30,
      borderRadius: 1.5,
      display: "grid",
      placeItems: "center",
      bgcolor: alpha(
        theme.palette.error.main,
        theme.palette.mode === "dark" ? 0.18 : 0.1,
      ),
      color: "error.main",
      flexShrink: 0,
    });

// components/AppBar/header.dynamic.styles.ts
export const appBarHeaderDynamicDynamicListItemIconSx1 = ({
  selected,
}: DynamicStyleValues): SxProps<Theme> => ({
  minWidth: 40,
  color: selected ? "primary.main" : "text.secondary",
});

export const appBarHeaderDynamicDynamicAppBarSx1: SxProps<Theme> = {
  top: 0,
  zIndex: (theme) => theme.zIndex.drawer + 1,
  bgcolor: (theme) =>
    theme.palette.mode === "dark"
      ? "rgba(24, 34, 49, 0.94)"
      : "rgba(255, 255, 255, 0.96)",
};

export const appBarHeaderDynamicDynamicAvatarSx1 = ({
  alpha,
}: DynamicStyleValues): SxProps<Theme> => ({
  width: 46,
  height: 46,
  bgcolor: "primary.main",
  color: "primary.contrastText",
  fontWeight: 900,
  boxShadow: (theme) =>
    `0 0 0 4px ${alpha(theme.palette.background.paper, 0.72)}`,
});

// components/AppBar/header.styles.ts
export const appBarHeaderContainerSx1: SxProps<Theme> = {
  px: { xs: 1, sm: 2, lg: 3 },
};

export const appBarHeaderToolbarSx1: SxProps<Theme> = {
  minHeight: { xs: 58, sm: 64 },
};

export const appBarHeaderBoxSx1: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  flexShrink: 0,
  mr: { lg: 2.5 },
};

export const appBarHeaderBoxSx2: SxProps<Theme> = {
  width: { xs: 90, sm: 108 },
  height: 40,
  objectFit: "contain",
};

export const appBarHeaderIconButtonSx1: SxProps<Theme> = {
  display: "inline-flex",
  mr: 0.5,
};

export const appBarHeaderStackSx1: SxProps<Theme> = {
  display: { xs: "none", lg: "flex" },
  flex: 1,
  minWidth: 0,
};

export const appBarHeaderIconButtonSx2: SxProps<Theme> = { p: 0.5 };

export const appBarHeaderAvatarSx1: SxProps<Theme> = {
  width: { xs: 34, sm: 38 },
  height: { xs: 34, sm: 38 },
  bgcolor: "primary.main",
  fontWeight: 800,
};

export const appBarHeaderDrawerSx1: SxProps<Theme> = {
  display: { lg: "none" },
  "& .MuiDrawer-paper": { width: "min(86vw, 320px)", p: 2 },
};

export const appBarHeaderStackSx3: SxProps<Theme> = { mb: 2, mt: 7 };

export const appBarHeaderBoxSx3: SxProps<Theme> = {
  px: 2,
  py: 2.5,
  textAlign: "center",
};

export const appBarHeaderBoxSx4: SxProps<Theme> = { flex: 1 };

export const appBarHeaderTypographySx3: SxProps<Theme> = {
  display: "block",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 0,
};

export const appBarHeaderTypographySx4: SxProps<Theme> = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  lineHeight: 1.2,
};

// components/CardView.dynamic.styles.ts
export const cardViewDynamicDynamicBoxSx1 = ({
  alpha,
}: DynamicStyleValues): SxProps<Theme> => ({
  minWidth: 0,
  height: "100%",
  minHeight: { xs: 520, md: 0 },
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
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

export const cardViewDynamicDynamicStackSx1 = ({
  accent,
}: DynamicStyleValues): SxProps<Theme> => ({
  px: 2,
  py: 1.5,
  bgcolor: "background.paper",
  borderTop: "4px solid",
  borderColor: accent,
});

export const cardViewDynamicDynamicChipSx1 = ({
  accent,
  alpha,
}: DynamicStyleValues): SxProps<Theme> => ({
  bgcolor: alpha(accent, 0.12),
  color: accent,
  minWidth: 34,
});

// components/CardView.styles.ts
export const cardViewBoxSx1: SxProps<Theme> = {
  p: 1.5,
  overflowY: "auto",
  flex: 1,
};

export const cardViewTypographySx1: SxProps<Theme> = { mt: 6 };

export const cardViewBoxSx2: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "minmax(0, 1fr)",
    md: "repeat(3, minmax(0, 1fr))",
  },
  gap: 2,
  height: "100%",
};

export const cardViewBoxSx3: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "minmax(0, 1fr)",
    md: "repeat(2, minmax(0, 1fr))",
  },
  gap: 2,
  height: "100%",
};

// components/Dashboard/AnalysisPieChart.dynamic.styles.ts
export const dashboardAnalysisPieChartDynamicDynamicPaperSx1 = ({
  borderedSurfaceSx,
}: DynamicStyleValues): SxProps<Theme> => ({
  ...borderedSurfaceSx,
  p: { xs: 1.5, sm: 2 },
  height: "100%",
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
});

export const dashboardAnalysisPieChartDynamicDynamicBoxSx1 = ({
  height,
}: DynamicStyleValues): SxProps<Theme> => ({
  height,
  width: "100%",
  minWidth: 0,
  flex: 1,
});

// components/Dashboard/AnalysisPieChart.styles.ts
export const dashboardAnalysisPieChartBoxSx1: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.1,
  mb: 0.5,
};

export const dashboardAnalysisPieChartBoxSx2: SxProps<Theme> = {
  width: 34,
  height: 34,
  display: "grid",
  placeItems: "center",
  borderRadius: 1.5,
  bgcolor: "secondary.main",
  color: "secondary.contrastText",
};

export const dashboardAnalysisPieChartBoxSx3: SxProps<Theme> = {
  flex: 1,
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  color: "text.secondary",
};

export const dashboardAnalysisPieChartDonutLargeRoundedIconSx1: SxProps<Theme> =
  { fontSize: 46, opacity: 0.35 };

// components/SelfTickets/BasicCard.dynamic.styles.ts
export const selfTicketsBasicCardDynamicDynamicCardSx1 = ({
  styles,
}: DynamicStyleValues): SxProps<Theme> => ({
  mb: 1.5,
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  borderLeft: `6px solid ${styles.color}`,
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  position: "relative",
  "&:hover": {
    boxShadow: (theme) =>
      theme.palette.mode === "dark"
        ? "0 10px 28px rgba(0,0,0,0.32)"
        : "0 8px 24px rgba(15,23,42,0.1)",
    transform: "translateY(-3px)",
    borderColor: styles.color,
  },
});

export const selfTicketsBasicCardDynamicDynamicTypographySx1 = ({
  styles,
}: DynamicStyleValues): SxProps<Theme> => ({
  fontSize: 12,
  fontWeight: 900,
  color: styles.color,
  letterSpacing: 0.5,
  mr: 2,
});

export const selfTicketsBasicCardDynamicDynamicChipSx1 = ({
  alpha,
  styles,
}: DynamicStyleValues): SxProps<Theme> => ({
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

// components/SelfTickets/BasicCard.styles.ts
export const selfTicketsBasicCardCardContentSx1: SxProps<Theme> = {
  p: 1.5,
  "&:last-child": { pb: 1 },
};

export const selfTicketsBasicCardTypographySx1: SxProps<Theme> = {
  fontSize: 12,
  color: "text.secondary",
};

export const selfTicketsBasicCardTypographySx3: SxProps<Theme> = {
  fontSize: 11,
  fontWeight: 700,
  color: "text.disabled",
};

export const selfTicketsBasicCardTypographySx4: SxProps<Theme> = {
  fontSize: 12,
  color: "text.primary",
};

export const selfTicketsBasicCardDividerSx1: SxProps<Theme> = {
  my: 1,
  opacity: 0.6,
};

export const selfTicketsBasicCardBoxSx1: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1.5,
  justifyContent: "space-between",
  alignItems: "center",
};

// components/SelfTickets/CreateModel.dynamic.styles.ts
export const selfTicketsCreateModelDynamicDynamicPopperSx1 = (
  _values: DynamicStyleValues,
): SxProps<Theme> => ({
  zIndex: (theme) => theme.zIndex.tooltip,
  pointerEvents: "none",
});

// components/SelfTickets/CreateModel.styles.ts
export const selfTicketsCreateModelTypographySx1: SxProps<Theme> = {
  fontSize: 18,
  fontWeight: 900,
  lineHeight: 1.1,
};

export const selfTicketsCreateModelIconButtonSx1: SxProps<Theme> = {
  color: "text.primary",
};

export const selfTicketsCreateModelTypographySx3: SxProps<Theme> = {
  fontSize: 14,
  fontWeight: 900,
};

export const selfTicketsCreateModelFormControlLabelSx1: SxProps<Theme> = {
  m: 0,
  "& .MuiFormControlLabel-label": { fontSize: 13, fontWeight: 700 },
};

export const selfTicketsCreateModelPaperSx1: SxProps<Theme> = {
  mt: 0.75,
  width: { xs: 300, sm: 390 },
  p: 1.5,
  borderRadius: 2,
  bgcolor: "background.paper",
  color: "text.primary",
  border: "1px solid",
  borderColor: "divider",
  overflow: "hidden",
};

export const selfTicketsCreateModelStackSx1: SxProps<Theme> = { mb: 1 };

export const selfTicketsCreateModelBoxSx1: SxProps<Theme> = {
  width: 26,
  height: 26,
  display: "grid",
  placeItems: "center",
  borderRadius: 1,
  bgcolor: "action.selected",
  color: "primary.main",
};

export const selfTicketsCreateModelInfoOutlinedSx1: SxProps<Theme> = {
  fontSize: 16,
};

export const selfTicketsCreateModelTypographySx6: SxProps<Theme> = {
  display: "block",
  color: "text.secondary",
  lineHeight: 1.45,
  mb: 1.25,
};

export const selfTicketsCreateModelBoxSx2: SxProps<Theme> = {
  display: "inline",
  fontSize: 10,
};

export const selfTicketsCreateModelBoxSx3: SxProps<Theme> = { fontWeight: 900 };

export const selfTicketsCreateModelBoxSx4: SxProps<Theme> = { fontWeight: 500 };

export const selfTicketsCreateModelChipSx1: SxProps<Theme> = {
  height: "auto",
  minHeight: 24,
  borderRadius: 1,
  bgcolor: "action.hover",
  "& .MuiChip-label": {
    display: "block",
    whiteSpace: "normal",
    py: 0.35,
    lineHeight: 1.2,
  },
};

export const selfTicketsCreateModelTypographySx7: SxProps<Theme> = {
  color: "text.secondary",
  display: "block",
  lineHeight: 1.4,
};

export const selfTicketsCreateModelStackSx3: SxProps<Theme> = {
  mr: "auto",
  color: "text.secondary",
};

export const selfTicketsCreateModelBoxSx5: SxProps<Theme> = {
  width: 22,
  height: 22,
  display: "grid",
  placeItems: "center",
  borderRadius: 1,
  bgcolor: "action.selected",
  color: "primary.main",
};

export const selfTicketsCreateModelInfoOutlinedSx2: SxProps<Theme> = {
  fontSize: 14,
};

export const selfTicketsCreateModelTypographySx8: SxProps<Theme> = {
  color: "text.secondary",
  fontWeight: 700,
};

export const selfTicketsCreateModelBoxSx6: SxProps<Theme> = {
  color: "error.main",
  fontWeight: 900,
};

// components/SelfTickets/DetailModel.dynamic.styles.ts
export const selfTicketsDetailModelDynamicDynamicChipSx1 = ({
  pStyle,
}: DynamicStyleValues): SxProps<Theme> => ({
  mt: 0.6,
  bgcolor: pStyle.bg,
  color: pStyle.text,
  fontWeight: 900,
  fontSize: 10,
  height: 20,
  borderRadius: 1,
});

export const selfTicketsDetailModelDynamicDynamicStackSx1 = ({
  alpha,
  isDark,
  theme,
}: DynamicStyleValues): SxProps<Theme> => ({
  ml: "auto",
  mr: 2,
  px: 1.15,
  py: 0.8,
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 2,
  bgcolor: alpha(theme.palette.primary.main, isDark ? 0.1 : 0.04),
});

export const selfTicketsDetailModelDynamicDynamicTypographySx1 = ({
  alpha,
  detailLabelSx,
  theme,
}: DynamicStyleValues): SxProps<Theme> => ({
  ...detailLabelSx,
  color: alpha(theme.palette.common.white, 0.8),
  textTransform: "capitalize",
});

export const selfTicketsDetailModelDynamicDynamicTypographySx2 = ({
  detailLabelSx,
}: DynamicStyleValues): SxProps<Theme> => ({ ...detailLabelSx, ml: 1.5 });

export const selfTicketsDetailModelDynamicDynamicBoxSx1 = ({
  alpha,
  isDark,
  theme,
}: DynamicStyleValues): SxProps<Theme> => ({
  px: 1.5,
  py: 1,
  mt: 0.75,
  mb: 1.8,
  minHeight: 150,
  maxHeight: 250,
  overflowY: "auto",
  borderRadius: 1.5,
  bgcolor: alpha(theme.palette.primary.main, isDark ? 0.08 : 0.045),
});

export const selfTicketsDetailModelDynamicDynamiccommentBoxSx = ({
  alpha,
  isDark,
  theme,
}: DynamicStyleValues): SxProps<Theme> => ({
  flex: 1,
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
  p: 1,
  height: 360,
  bgcolor: alpha(theme.palette.primary.main, isDark ? 0.08 : 0.045),
});

export const selfTicketsDetailModelNoteBoxSx = ({
  alpha,
  isDark,
  theme,
}: DynamicStyleValues): SxProps<Theme> => ({
  flex: 1,
  display: "flex",
  alignItems: "center",
  gap: 1,
  borderRadius: 2,
  bgcolor: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.05),
  border: "1px solid",
  borderColor: alpha(theme.palette.primary.main, isDark ? 0.3 : 0.2),
  borderLeft: `4px solid ${theme.palette.primary.main}`,
});

export const selfTicketsDetailModelDynamicDynamicTypographySx3 = ({
  detailValueSx,
}: DynamicStyleValues): SxProps<Theme> => ({
  ...detailValueSx,
  lineHeight: 1.5,
  whiteSpace: "pre-line",
});

export const selfTicketsDetailModelDynamicDynamicBoxSx2 = ({
  alpha,
  isDark,
  theme,
}: DynamicStyleValues): SxProps<Theme> => ({
  px: 1.5,
  py: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1.5,
  bgcolor: alpha(theme.palette.background.paper, isDark ? 0.32 : 0.72),
});

export const selfTicketsDetailModelDynamicDynamicTypographySx4 = ({
  detailLabelSx,
}: DynamicStyleValues): SxProps<Theme> => ({ ...detailLabelSx, mb: 0.45 });

export const selfTicketsDetailModelDynamicDynamicTypographySx5 = ({
  capitalize,
  detailValueSx,
}: DynamicStyleValues): SxProps<Theme> => ({
  ...detailValueSx,
  textTransform: capitalize ? "capitalize" : "none",
});

export const selfTicketsDetailModelDynamicDynamicTypographySx7 = ({
  detailValueSx,
}: DynamicStyleValues): SxProps<Theme> => ({
  ...detailValueSx,
  textTransform: "capitalize",
});

export const selfTicketsDetailModelDynamicDynamicDialogActionsSx1 = ({
  modalFormActionsSx,
}: DynamicStyleValues): SxProps<Theme> => ({
  ...modalFormActionsSx,
  display: "flex",
  flexWrap: "wrap",
  gap: 1.5,
  px: 2,
  justifyContent: "flex-end",
  // alignItems: "center",
  "& .MuiStack-root": { flexWrap: "wrap", rowGap: 1 },
});

export const selfTicketsDetailModelDynamicDynamicBoxSx4 = ({
  modalFormIconSx,
}: DynamicStyleValues): SxProps<Theme> => ({
  ...modalFormIconSx,
  width: 32,
  height: 32,
  // bgcolor: "success.main",
});

export const selfTicketsDetailModelDynamicDynamicBoxSx5 = ({
  modalFormIconSx,
}: DynamicStyleValues): SxProps<Theme> => ({
  ...modalFormIconSx,
  color: "error.main",
});

export const selfTicketsDetailModelDynamicDynamicBoxSx6 = ({
  modalFormIconSx,
}: DynamicStyleValues): SxProps<Theme> => ({
  ...modalFormIconSx,
  color: "warning.main",
});

export const selfTicketsDetailModelCommentWrapperSx = ({
  isCurrentUser,
}: DynamicStyleValues): SxProps<Theme> => ({
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
}: DynamicStyleValues): SxProps<Theme> => ({
  p: 1,
  borderRadius: 1,
  border: "1px solid",
  borderColor: theme.palette.divider,
  bgcolor: isCurrentUser
    ? isDark
      ? alpha(theme.palette.primary.main, 0.2)
      : "#D7E8FB"
    : isDark
      ? theme.palette.background.paper
      : "#FFFFFF",
});

// components/SelfTickets/DetailModel.styles.ts
export const selfTicketsDetailModelTypographySx1: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: 11,
  fontWeight: 900,
  textTransform: "capitalize",
};

export const selfTicketsDetailModelTypographySx2: SxProps<Theme> = {
  lineHeight: 1.15,
};

export const selfTicketsDetailModelBoxSx1: SxProps<Theme> = {
  display: "flex",
  flexDirection: "row",
};

export const selfTicketsDetailModelAvatarSx1: SxProps<Theme> = {
  bgcolor: "primary.main",
};

export const selfTicketsDetailModelTypographySx3: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: 11,
  fontWeight: 900,
  textTransform: "uppercase",
};

export const selfTicketsDetailModelIconButtonSx1: SxProps<Theme> = {
  height: 36,
  width: 36,
  color: "text.secondary",
};

export const selfTicketsDetailModelBoxSx2: SxProps<Theme> = {
  px: 1.5,
  py: 1,
  mb: 1.8,
  borderRadius: 1.5,
  color: "primary.contrastText",
  bgcolor: "primary.main",
};

export const selfTicketsDetailModelTypographySx4: SxProps<Theme> = {
  mt: 0.45,
  wordBreak: "break-word",
};

export const selfTicketsDetailModelButtonSx1: SxProps<Theme> = {
  borderRadius: 1.5,
  fontWeight: 800,
  textTransform: "none",
};

export const selfTicketsDetailModelTypographySx5: SxProps<Theme> = {
  mb: 2,
  color: "text.secondary",
};

export const selfTicketsDetailModelTypographySx6: SxProps<Theme> = {
  color: "text.secondary",

};

// components/TableView.callback.styles.ts
export const tableViewCallbackCallbackSx1 =
  ({ alternatingRowSx, onRowClick }: DynamicStyleValues): SxProps<Theme> =>
    (theme) => ({
      cursor: onRowClick ? "pointer" : "default",
      "&:last-child td, &:last-child th": { border: 0 },
      ...alternatingRowSx(theme),
    });

export const tableViewCallbackCallbackSx2 =
  ({
    column,
    columns,
    index,
    tableHeaderCellSx,
  }: DynamicStyleValues): SxProps<Theme> =>
    (theme) => ({
      width: column.width ?? 100,
      ...tableHeaderCellSx(theme),
      position: {
        xs: index === 0 ? "sticky" : "static",
        sm: index < 2 ? "sticky" : "static",
      },
      left: {
        xs: index === 0 ? 0 : "auto",
        sm: index === 0 ? 0 : index === 1 ? (columns[0].width ?? 100) : "auto",
      },
      zIndex: index < 2 ? 6 : 5,
    });

export const tableViewCallbackCallbackSx3 =
  ({
    column,
    columns,
    index,
    stickyTableCellSx,
  }: DynamicStyleValues): SxProps<Theme> =>
    (theme) => ({
      width: column.width ?? 100,
      position: {
        xs: index === 0 ? "sticky" : "static",
        sm: index < 2 ? "sticky" : "static",
      },
      left: {
        xs: index === 0 ? 0 : "auto",
        sm: index === 0 ? 0 : index === 1 ? (columns[0].width ?? 100) : "auto",
      },
      ...stickyTableCellSx(theme),
      textTransform: "capitalize",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      boxSizing: "border-box",
    });

// components/TableView.dynamic.styles.ts
export const tableViewDynamicDynamicBadgeSx1 = ({
  column,
  getStatusColor,
  row,
}: DynamicStyleValues): SxProps<Theme> => ({
  "& .MuiBadge-badge": {
    backgroundColor: getStatusColor(row[column.dataKey]),
  },
});

export const tableViewDynamicDynamicPaperSx1 = ({
  height,
}: DynamicStyleValues): SxProps<Theme> => ({
  height: height ?? "100%",
  flex: height === "100%" ? "1 1 auto" : "0 0 auto",
  width: "100%",
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  border: "1px solid",
  borderColor: "divider",
});

// components/TableView.styles.ts
export const tableViewTableContainerSx1: SxProps<Theme> = {
  boxShadow: "none",
  borderRadius: 0,
  flex: "1 1 auto",
  minHeight: 0,
  height: "100%",
};

export const tableViewTableSx1: SxProps<Theme> = {
  borderCollapse: "separate",
  tableLayout: "fixed",
  width: "100%",
};

export const tableViewBoxSx1: SxProps<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: 1,
  maxWidth: "100%",
};

export const tableViewTypographySx1: SxProps<Theme> = {
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export const tableViewBoxSx2: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 1,
  p: { xs: 1, sm: 1.25 },
  flexWrap: { xs: "wrap", sm: "nowrap" },
  flex: "0 0 auto",
};

export const tableViewTypographySx2: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

export const tableViewTableChartIconSx1: SxProps<Theme> = {
  pr: 1,
  height: 24,
  width: 24,
};

export const tableViewTextFieldSx1: SxProps<Theme> = {
  width: { xs: "100%", sm: 250 },
};

export const tableViewBoxSx3: SxProps<Theme> = {
  minHeight: 0,
  flexGrow: 1,
  bgcolor: "background.paper",
  position: "relative",
  display: "flex",
  flexDirection: "column",
};

export const tableViewTableVirtuosoStyle1: CSSProperties = { height: "100%" };

export const tableViewBoxSx4: SxProps<Theme> = {
  position: "absolute",
  inset: "58px 0 0",
  display: "grid",
  placeItems: "center",
  pointerEvents: "none",
};

export const tableViewBoxSx5: SxProps<Theme> = {
  textAlign: "center",
  color: "text.secondary",
};

export const tableViewTableChartIconSx2: SxProps<Theme> = {
  fontSize: 38,
  opacity: 0.35,
  mb: 1,
};

// components/Tickets/BasicCard.dynamic.styles.ts
export const ticketsBasicCardDynamicDynamicCardSx1 = ({
  styles,
}: DynamicStyleValues): SxProps<Theme> => ({
  mb: 2,
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  borderLeft: `6px solid ${styles.color}`,
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  position: "relative",
  "&:hover": {
    boxShadow: (theme) =>
      theme.palette.mode === "dark"
        ? "0 10px 28px rgba(0,0,0,0.32)"
        : "0 8px 24px rgba(15,23,42,0.1)",
    transform: "translateY(-3px)",
    borderColor: styles.color,
  },
});

export const ticketsBasicCardDynamicDynamicTypographySx1 = ({
  styles,
}: DynamicStyleValues): SxProps<Theme> => ({
  fontSize: 11,
  fontWeight: 900,
  color: styles.color,
  letterSpacing: 0.5,
});

export const ticketsBasicCardDynamicDynamicChipSx1 = ({
  alpha,
  styles,
}: DynamicStyleValues): SxProps<Theme> => ({
  height: 20,
  fontWeight: 800,
  fontSize: 9,
  bgcolor: (theme) =>
    theme.palette.mode === "dark" ? alpha(styles.color, 0.16) : styles.bg,
  color: styles.color,
  border: `1px solid ${styles.border}`,
  textTransform: "uppercase",
});

// components/Tickets/BasicCard.styles.ts
export const ticketsBasicCardCardContentSx1: SxProps<Theme> = {
  p: 2,
  "&:last-child": { pb: 2 },
};

export const ticketsBasicCardTypographySx1: SxProps<Theme> = { fontSize: 11 };

export const ticketsBasicCardTypographySx2: SxProps<Theme> = {
  fontSize: "1rem",
  fontWeight: 700,
  lineHeight: 1.3,
  mb: 1,
  color: "text.primary",
};

export const ticketsBasicCardTypographySx3: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: 13,
  mb: 2,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  minHeight: "3em",
};

export const ticketsBasicCardDividerSx1: SxProps<Theme> = {
  mb: 2,
  opacity: 0.6,
};

export const ticketsBasicCardBoxSx1: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1.5,
  justifyContent: "space-between",
  alignItems: "center",
};

export const ticketsBasicCardAvatarSx1: SxProps<Theme> = {
  width: 24,
  height: 24,
  fontSize: 10,
  bgcolor: "primary.main",
  fontWeight: "bold",
};

export const ticketsBasicCardBoxSx2: SxProps<Theme> = {
  textAlign: "right",
  mr: 1,
};

// components/Tickets/CreateModal.styles.ts
export const ticketsCreateModalBoxSx1: SxProps<Theme> = {
  p: 2,
  border: "1px dashed",
  borderColor: "divider",
  borderRadius: 1,
  display: "flex",
  alignItems: "center",
  gap: 2,
  flexWrap: "wrap",
};

export const ticketsCreateModalButtonSx1: SxProps<Theme> = { flexShrink: 0 };

export const ticketsCreateModalBoxSx2: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1,
  alignItems: "center",
  flex: 1,
};

export const ticketsCreateModalBoxSx3: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  bgcolor: "grey.100",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 5,
  px: 1,
  py: 0.25,
};

export const ticketsCreateModalTypographySx1: SxProps<Theme> = {
  maxWidth: 160,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const ticketsCreateModalIconButtonSx1: SxProps<Theme> = {
  ml: 0.5,
  p: 0.25,
};

// components/Tickets/DetailModal.callback.styles.ts
export const ticketsDetailModalCallbackCallbackSx1 =
  ({ modalFormHeaderSx }: DynamicStyleValues): SxProps<Theme> =>
    (currentTheme) => ({
      ...modalFormHeaderSx(currentTheme),
      display: "flex",
      flexWrap: "wrap",
      gap: 2,
      justifyContent: "space-between",
      alignItems: "center",
    });

export const ticketsDetailModalCallbackCallbackSx2 =
  ({ modalFormContentSx }: DynamicStyleValues): SxProps<Theme> =>
    (currentTheme) => ({
      ...modalFormContentSx(currentTheme),
      mt: 0,
      p: { xs: 1.5, sm: 2 },
    });

export const ticketsDetailModalCallbackCallbackSx3 =
  ({ formSectionSx }: DynamicStyleValues): SxProps<Theme> =>
    (currentTheme) => ({
      ...formSectionSx(currentTheme),
      minHeight: 360,
      p: { xs: 1.5, sm: 1.75 },
      boxShadow: "none",
    });

export const ticketsDetailModalCallbackCallbackSx4 =
  ({ formSectionSx }: DynamicStyleValues): SxProps<Theme> =>
    (currentTheme) => ({
      ...formSectionSx(currentTheme),
      minHeight: 360,
      p: 0,
      overflow: "hidden",
    });

export const ticketsDetailModalCallbackCallbackSx5 =
  ({ modalFormActionsSx }: DynamicStyleValues): SxProps<Theme> =>
    (currentTheme) => ({
      ...modalFormActionsSx(currentTheme),
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 1.5,
    });

// components/Tickets/DetailModal.dynamic.styles.ts
export const ticketsDetailModalDynamicDynamicChipSx1 = ({
  pStyle,
}: DynamicStyleValues): SxProps<Theme> => ({
  bgcolor: pStyle.bg,
  color: pStyle.text,
  fontSize: 10,
  height: 18,
  mt: 0.5,
  borderRadius: 1,
  "& .MuiChip-label": { px: 1 },
});

export const ticketsDetailModalDynamicDynamicStackSx1 = ({
  modalPalette,
}: DynamicStyleValues): SxProps<Theme> => ({
  minWidth: { xs: 220, sm: 356 },
  px: 1.4,
  py: 1,
  border: `1px solid ${modalPalette.border}`,
  borderRadius: "14px",
  bgcolor: modalPalette.headerPanel,
});

export const ticketsDetailModalDynamicDynamicTypographySx1 = ({
  detailValueSx,
}: DynamicStyleValues): SxProps<Theme> => ({ ...detailValueSx, mt: 0.25 });

export const ticketsDetailModalDynamicDynamicBoxSx1 = ({
  theme,
}: DynamicStyleValues): SxProps<Theme> => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
  color: "primary.contrastText",
  borderRadius: "12px",
  px: 2,
  py: 2.1,
  mb: 1.8,
  minHeight: 74,
});

export const ticketsDetailModalDynamicDynamicTypographySx2 = ({
  alpha,
  detailLabelSx,
  theme,
}: DynamicStyleValues): SxProps<Theme> => ({
  ...detailLabelSx,
  color: alpha(theme.palette.common.white, 0.86),
});

export const ticketsDetailModalDynamicDynamicBoxSx2 = ({
  modalPalette,
}: DynamicStyleValues): SxProps<Theme> => ({
  mt: 0.8,
  mb: 1.8,
  p: 1.7,
  height: 200,
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarGutter: "stable",
  bgcolor: modalPalette.panel,
  borderRadius: "12px",
});

export const ticketsDetailModalDynamicDynamicBoxSx3 = ({
  modalPalette,
}: DynamicStyleValues): SxProps<Theme> => ({
  p: 1.4,
  border: `1px solid ${modalPalette.border}`,
  borderRadius: "11px",
  minHeight: 52,
});

export const ticketsDetailModalDynamicDynamicTypographySx3 = ({
  detailValueSx,
}: DynamicStyleValues): SxProps<Theme> => ({ ...detailValueSx, mt: 0.45 });

export const ticketsDetailModalDynamicDynamicBoxSx6 = ({
  modalPalette,
}: DynamicStyleValues): SxProps<Theme> => ({
  px: 1.75,
  py: 1.2,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: `1px solid ${modalPalette.border}`,
});

export const ticketsDetailModalDynamicDynamicBoxSx7 = ({
  modalPalette,
}: DynamicStyleValues): SxProps<Theme> => ({
  position: "absolute",
  left: 7,
  top: 0,
  bottom: 0,
  width: "2px",
  bgcolor: modalPalette.logDivider,
});

export const ticketsDetailModalDynamicDynamicBoxSx8 = ({
  getStatusColor,
  log,
}: DynamicStyleValues): SxProps<Theme> => ({
  position: "absolute",
  left: -5,
  top: 6,
  width: 12,
  height: 12,
  borderRadius: "50%",
  bgcolor: getStatusColor(log.status),
  border: "3px solid",
  borderColor: "background.paper",
  zIndex: 2,
});

export const ticketsDetailModalDynamicDynamicBoxSx9 = ({
  index,
  modalPalette,
}: DynamicStyleValues): SxProps<Theme> => ({
  p: 1.25,
  bgcolor: index === 0 ? modalPalette.panel : "background.paper",
  borderRadius: 1.5,
  border: `1px solid ${modalPalette.border}`,
});

export const ticketsDetailModalDynamicDynamicChipSx2 = ({
  alpha,
  getStatusColor,
  isDark,
  log,
}: DynamicStyleValues): SxProps<Theme> => ({
  height: 19,
  borderRadius: 1,
  bgcolor: alpha(getStatusColor(log.status), isDark ? 0.18 : 0.1),
  color: getStatusColor(log.status),
  fontSize: 10,
  fontWeight: 800,
});

// components/Tickets/DetailModal.styles.ts
export const ticketsDetailModalAvatarSx1: SxProps<Theme> = {
  width: 34,
  height: 34,
  bgcolor: "primary.main",
  color: "primary.contrastText",
  fontSize: 22,
  fontWeight: 900,
};

export const ticketsDetailModalTypographySx1: SxProps<Theme> = {
  color: "text.primary",
  fontSize: 18,
  fontWeight: 900,
  lineHeight: 1.05,
  mt: 0.25,
};

export const ticketsDetailModalAvatarSx2: SxProps<Theme> = {
  width: 34,
  height: 34,
  bgcolor: "primary.dark",
  color: "primary.contrastText",
  fontSize: 14,
  fontWeight: 900,
};

export const ticketsDetailModalIconButtonSx1: SxProps<Theme> = {
  color: "text.secondary",
  width: 28,
  height: 28,
};

export const ticketsDetailModalTypographySx2: SxProps<Theme> = {
  fontSize: 14,
  mt: 1,
  lineHeight: 1.2,
  wordBreak: "break-word",
};

export const ticketsDetailModalTypographySx3: SxProps<Theme> = {
  color: "text.primary",
  fontSize: 14,
  lineHeight: 1.2,
  whiteSpace: "pre-line",
  overflowWrap: "anywhere",
};

export const ticketsDetailModalPaperSx1: SxProps<Theme> = {
  p: 0,
  borderRadius: 0,
  bgcolor: "transparent",
  border: 0,
};

export const ticketsDetailModalTypographySx4: SxProps<Theme> = {
  fontSize: 13,
  fontWeight: 900,
};

export const ticketsDetailModalChipSx1: SxProps<Theme> = {
  height: 20,
  fontSize: 10,
  fontWeight: 800,
  borderRadius: 1,
  bgcolor: "action.hover",
};

export const ticketsDetailModalBoxSx1: SxProps<Theme> = {
  position: "relative",
  pl: 1.5,
  pr: 1.5,
  py: 1.25,
  height: 350,
  overflowY: "auto",
};

export const ticketsDetailModalBoxSx2: SxProps<Theme> = {
  position: "relative",
  pl: 3,
};

export const ticketsDetailModalTypographySx5: SxProps<Theme> = {
  fontWeight: 400,
  my: 0.5,
};

export const ticketsDetailModalStackSx2: SxProps<Theme> = {
  flexShrink: 0,
  alignItems: "center",
  flexWrap: "wrap",
  rowGap: 1,
  "& .MuiButton-root": {
    borderRadius: 1.25,
    fontSize: 12,
    // textTransform: "uppercase",
    boxShadow: "none",
  },
};

export const ticketsDetailModalDialogTitleSx1: SxProps<Theme> = {
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
};

export const ticketsDetailModalTypographySx6: SxProps<Theme> = {
  fontWeight: 600,
  color: "primary.main",
};

// components/Tickets/RatingInfoModel.dynamic.styles.ts
export const ticketsRatingInfoModelDynamicDynamicPaperSx1 = ({
  item,
}: DynamicStyleValues): SxProps<Theme> => ({
  p: 2,
  height: "100%",
  textAlign: "center",
  bgcolor: item.score >= 4 ? "#F0F9F5" : "background.paper",
});

// components/Tickets/RatingInfoModel.styles.ts
export const ticketsRatingInfoModelTypographySx2: SxProps<Theme> = { mt: 1 };

export const ticketsRatingInfoModelPaperSx1: SxProps<Theme> = { p: 2 };

export const ticketsRatingInfoModelRatingDialogPaperSx: SxProps<Theme> = {
  m: { xs: 1, sm: 2 },
  maxHeight: { xs: "calc(100dvh - 16px)", sm: "calc(100dvh - 32px)" },
};

// pages/Dashboard.dynamic.styles.ts
export const dashboardDynamicPageDynamicPaperSx1 = ({
  borderedSurfaceSx,
}: DynamicStyleValues): SxProps<Theme> => ({
  ...borderedSurfaceSx,
  p: { xs: 1.5, sm: 2 },
  height: { xs: 340, lg: 360 },
  display: "flex",
  flexDirection: "column",
});

export const dashboardDynamicPageDynamicBoxSx1 = ({
  index,
  summary,
}: DynamicStyleValues): SxProps<Theme> => ({
  py: 1.15,
  borderBottom: index < summary.deptData.length - 1 ? "1px solid" : 0,
  borderColor: "divider",
});

export const dashboardDynamicPageDynamicBoxSx2 = ({
  color,
}: DynamicStyleValues): SxProps<Theme> => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  bgcolor: color,
  flexShrink: 0,
});

export const dashboardDynamicPageDynamicLinearProgressSx1 = ({
  color,
}: DynamicStyleValues): SxProps<Theme> => ({
  width: "100%",
  height: 7,
  borderRadius: 999,
  bgcolor: "action.hover",
  "& .MuiLinearProgress-bar": {
    borderRadius: 999,
    bgcolor: color,
  },
});

export const dashboardDynamicPageDynamicPaperSx2 = ({
  borderedSurfaceSx,
}: DynamicStyleValues): SxProps<Theme> => ({
  ...borderedSurfaceSx,
  height: { xs: 450, sm: 470, lg: 430 },
  overflow: "hidden",
});

// pages/Dashboard.styles.ts
export const dashboardPageBoxSx1: SxProps<Theme> = {
  p: { xs: 1.5, sm: 2.25, lg: 2.5 },
  mx: "auto",
};

export const dashboardPageBoxSx2: SxProps<Theme> = { mb: 1.5 };

export const dashboardPageStackSx1: SxProps<Theme> = { mb: 2.25 };

export const dashboardPageBoxSx3: SxProps<Theme> = {
  display: "grid",
  placeItems: "center",
  width: 36,
  height: 36,
  borderRadius: 2,
  bgcolor: "primary.main",
  color: "primary.contrastText",
};

export const dashboardPageStackSx2: SxProps<Theme> = {
  flex: 1,
  overflowY: "auto",
  pr: 0.5,
};

export const dashboardPageBoxSx4: SxProps<Theme> = {
  p: 1,
  bgcolor: "background.paper",
  borderRadius: 1,
  flex: 1,
  minWidth: 0,
};

export const dashboardPageStackSx3: SxProps<Theme> = { mb: 0.8 };

export const dashboardPageBoxSx5: SxProps<Theme> = {
  textAlign: "right",
  flexShrink: 0,
  minWidth: 45,
};

export const dashboardPageEventAvailableRoundedIconSx1: SxProps<Theme> = {
  fontSize: 44,
  opacity: 0.4,
};

export const dashboardPageBoxSx6: SxProps<Theme> = {
  height: { xs: 340, lg: 360 },
};

export const dashboardPageStackSx4: SxProps<Theme> = {
  px: 1.75,
  pt: 1.35,
  pb: 0.75,
};

export const dashboardPageBoxSx7: SxProps<Theme> = {
  width: 32,
  height: 32,
  display: "grid",
  placeItems: "center",
  borderRadius: 1.5,
  bgcolor: "info.main",
  color: "info.contrastText",
};

// pages/errorPages.ts
export const errorPageSx = {
  alignItems: "center",
  bgcolor: "background.default",
  display: "grid",
  minHeight: "100dvh",
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
  fontWeight: 800,
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
export const loginDynamicPageDynamicBoxSx1 = ({
  bgImage,
}: DynamicStyleValues): SxProps<Theme> => ({
  minHeight: "100dvh",
  width: "100%",
  display: "grid",
  placeItems: "center",
  p: { xs: 2, sm: 3 },
  position: "relative",
  backgroundImage: `linear-gradient(120deg, rgba(4, 39, 58, .78), rgba(20, 108, 148, .4)), url(${bgImage})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
});

// pages/Login.styles.ts
export const loginPageCardSx1: SxProps<Theme> = {
  width: "min(100%, 440px)",
  boxShadow: "0 24px 80px rgba(4, 39, 58, .28)",
  backdropFilter: "blur(12px)",
};

export const loginPageCardContentSx1: SxProps<Theme> = {
  p: { xs: 2.5, sm: 4 },
  "&:last-child": { pb: { xs: 2.5, sm: 4 } },
};

export const loginPageBoxSx1: SxProps<Theme> = {
  display: "block",
  width: 130,
  height: 52,
  objectFit: "contain",
  mx: "auto",
  mb: 2,
};

export const loginPageBoxSx2: SxProps<Theme> = {
  width: 46,
  height: 46,
  display: "grid",
  placeItems: "center",
  borderRadius: 2,
  bgcolor: "primary.main",
  color: "white",
  mx: "auto",
  mb: 1.5,
};

export const loginPageTypographySx1: SxProps<Theme> = { mt: 0.75, mb: 3 };

export const loginPageButtonSx1: SxProps<Theme> = { mt: 3 };

export const loginPageCircularProgressSx1: SxProps<Theme> = { mr: 1 };

export const loginPageTypographySx2: SxProps<Theme> = { mt: 0.75 };

// pages/Reports.styles.ts
export const reportsPageBoxSx2: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  height: {
    xs: "calc(100vh - 58px)",
    sm: "calc(100vh - 64px)",
  },
  overflow: "auto",
  bgcolor: "background.default",
};

export const reportsPageButtonSx1: SxProps<Theme> = { display: { md: "none" } };

export const reportsPagePaperSx1: SxProps<Theme> = {
  display: { xs: "none", md: "block" },
  mx: 3,
  mb: 2,
  p: 2,
  border: "1px solid",
  borderColor: "divider",
};

export const reportsPageBoxSx4: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  height: { xs: 620, lg: "100%" },
  minHeight: 0,
  px: { xs: 1, sm: 2, md: 3 },
  pb: { xs: 1, sm: 2, md: 3 },
  overflow: "hidden",
};

export const reportsPageBoxSx5: SxProps<Theme> = { p: 2, overflowY: "auto" };

export const reportsPageFilterDrawerPaperSx: SxProps<Theme> = {
  marginTop: { xs: "25dvh", lg: "15dvh" },
  maxHeight: "60dvh",
  borderRadius: "20px 20px 20px 20px  ",
};

// pages/SelfTickets.styles.ts
export const appPageBox: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  height: {
    xs: "calc(100vh - 58px)",
    sm: "calc(100vh - 64px)",
  },
  overflow: "auto",
  bgcolor: "background.default",
};

export const selfTicketsPageStackSx1: SxProps<Theme> = {
  width: { xs: "100%", sm: "auto" },
  alignItems: "stretch",
};

export const selfTicketsPageFormControlSx1: SxProps<Theme> = {
  minWidth: { sm: 210 },
};

export const selfTicketsPagePaperSx1: SxProps<Theme> = {
  borderBlock: "1px solid",
  borderColor: "divider",
  px: { xs: 0.5, sm: 2 },
};

export const selfTicketsPageBoxSx4: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  height: { xs: 620, md: "100%" },
  minHeight: 0,
  p: { xs: 1, sm: 2, md: 2.5 },
  overflow: "hidden",
};

// pages/Tickets.styles.ts
export const ticketsPageBoxSx1: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  height: {
    xs: "calc(100vh - 58px)",
    sm: "calc(100vh - 64px)",
  },
  overflow: "auto",
  bgcolor: "background.default",
};

export const ticketsPagePaperSx1: SxProps<Theme> = {
  borderBlock: "1px solid",
  borderColor: "divider",
  px: { xs: 0.5, sm: 2 },
};

export const ticketsPageBoxSx3: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  height: { xs: 620, md: "100%" },
  minHeight: 0,
  p: { xs: 1, sm: 2, md: 2.5 },
  overflow: "hidden",
};



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

export const confirmDialogPaperSx = (theme: Theme) => ({
  ...modalFormPaperSx(theme),
  maxWidth: 380,
});

export const confirmDialogHeaderSx = (tone: ConfirmDialogTone) =>
  (theme: Theme) => ({
    ...modalFormHeaderSx(theme),
    color: getConfirmDialogToneColor(theme, tone),
  });

export const confirmDialogContentSx = (theme: Theme) => ({
  ...modalFormContentSx(theme),
  mt: 0,
  p: { xs: 1.75, sm: 2.25 },
});

export const confirmDialogActionsSx = (theme: Theme) => ({
  ...modalFormActionsSx(theme),
  justifyContent: "flex-end",
});

export const confirmDialogRootSx = (theme: Theme) => ({
  zIndex: theme.zIndex.modal + 10,
});

export const DRAWER_WIDTH = {
  xs: "100%",
  sm: 280,
  md: 240,
};
export const TOGGLE_BUTTON = {
  "& .MuiToggleButton-root": {
    px: 1.2,
    borderColor: "divider",
  },
  "& .MuiToggleButton-root .MuiSvgIcon-root": {
    color: "text.secondary",
    transition: "0.2s",
  },
  "& .MuiToggleButton-root.Mui-selected": {
    bgcolor: "primary.main",
    color: "primary.contrastText",
  },
  "& .MuiToggleButton-root.Mui-selected .MuiSvgIcon-root": {
    color: "primary.contrastText",
  },
  "& .MuiToggleButton-root:hover": {
    bgcolor: "primary.50",
  },

}
