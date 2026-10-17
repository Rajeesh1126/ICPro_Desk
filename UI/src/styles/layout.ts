/**
 * Shared page-layout primitives.
 *
 * Use these for page chrome, report controls, tabs, and table panels. Keeping
 * their insets here makes headers, filters, tabs, and content surfaces align
 * without page-specific breakpoint overrides.
 */
import { type SxProps } from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
import { INSET_X, insetSx, RADIUS_PX } from "./tokens";

export const page = {
  bgcolor: "background.default",
  display: "flex",
  flexDirection: "column",
  flex: "1 1 auto",
  height: "100%",
  minHeight: 0,
  overflow: "visible",
  boxSizing: "border-box",
} satisfies SxProps<Theme>;

export const pageContent: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  height: "auto",
  minHeight: 0,
};

export const pageHeader = {
  // The page title and its supporting text sit together above page actions.
  alignItems: { xs: "stretch", sm: "center" },
  display: "flex",
  width: "100%",
  flexDirection: { xs: "column", sm: "row" },
  flexWrap: "nowrap",
  gap: { xs: 1.25, sm: 2 },
  justifyContent: "space-between",
  px: { xs: 1.25, sm: 1.5, md: 2 },
  py: { xs: 1.25, sm: 1.5 },
  mb: { xs: 1.25, sm: 1.5, md: 2 },
  // backgroundColor: "background.paper",
} satisfies SxProps<Theme>;

export const pageHeaderTopRow = {
  alignItems: "center",
  display: "flex",
  gap: 1,
  justifyContent: "space-between",
  minWidth: 0,
  width: "100%",
} satisfies SxProps<Theme>;

export const pageHeaderContent = {
  flex: 1,
  minWidth: 0,
  "& > .MuiTypography-root:not(h1)": {
    maxWidth: 880,
    fontSize: { xs: "0.8125rem", sm: "0.875rem", md: "0.9375rem" },
    lineHeight: 1.55,
  },
} satisfies SxProps<Theme>;

export const pageHeaderTitleGroup = {
  flex: 1,
  minWidth: 0,
} satisfies SxProps<Theme>;

export const pageTitle = {
  color: "text.primary",
  fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.65rem" },
  fontWeight: 700,
  lineHeight: 1.24,
} satisfies SxProps<Theme>;

export const pageSubtitle = {
  color: "text.secondary",
  fontSize: { xs: "0.8125rem", sm: "0.875rem", md: "0.9375rem" },
  fontWeight: 500,
  lineHeight: 1.55,
  mt: 0,
} satisfies SxProps<Theme>;

export const pageHeaderActions = {
  alignItems: "center",
  display: "flex",
  flexShrink: 0,
  flexWrap: "wrap",
  gap: 1,
  justifyContent: "flex-start",
  width: { xs: "100%", sm: "auto" },
  "& .MuiButton-root": {
    whiteSpace: "nowrap",
  },
} satisfies SxProps<Theme>;

export const pageHeaderControls = {
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  gap: 1,
  justifyContent: "flex-end",
  width: "auto",
} satisfies SxProps<Theme>;

export const pageHeaderFilterToggle = ((theme: Theme) => ({
  display: { xs: "inline-flex", md: "none" },
  flexShrink: 0,
  width: 40,
  height: 40,
  borderRadius: RADIUS_PX.sm,
  border: "1px solid",
  borderColor: alpha(
    theme.palette.primary.main,
    theme.palette.mode === "dark" ? 0.5 : 0.32,
  ),
  color: "primary.main",
  bgcolor: alpha(
    theme.palette.primary.main,
    theme.palette.mode === "dark" ? 0.108 : 0.09,
  ),
  boxShadow:
    theme.palette.mode === "dark"
      ? "none"
      : `0 1px 2px ${alpha(theme.palette.primary.main, 0.16)}`,
  transition: theme.transitions.create(
    ["background-color", "border-color", "box-shadow"],
    { duration: theme.transitions.duration.shortest },
  ),
  "&:hover": {
    bgcolor: alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.168 : 0.15,
    ),
    borderColor: theme.palette.primary.main,
  },
})) satisfies SxProps<Theme>;

export const pageHeaderFilterPanel = {
  display: { xs: "block", md: "none" },
  width: "100%",
  "& .MuiCollapse-wrapperInner": {
    display: "grid",
    gap: 1,
    pt: 1,
  },
} satisfies SxProps<Theme>;

export const pageHeaderControlsDesktop = {
  ...pageHeaderControls,
  display: { xs: "none", md: "flex" },
} satisfies SxProps<Theme>;

export const pageHeaderControlsMobile = {
  ...pageHeaderControls,
  display: "flex",
  "& .MuiButton-root, & .MuiToggleButtonGroup-root": {
    width: "100%",
  },
} satisfies SxProps<Theme>;

export const buttonLabelFull = {
  display: { xs: "none", sm: "inline" },
} satisfies SxProps<Theme>;

export const buttonLabelCompact = {
  display: { xs: "inline", sm: "none" },
} satisfies SxProps<Theme>;

export const tabsContainer: SxProps<Theme> = {
  mx: { xs: 1, sm: 2 },
  maxWidth: { xs: "calc(100% - 16px)", sm: "calc(100% - 32px)" },
  // Long tab labels remain reachable on compact screens instead of being
  // clipped at the page edge. The Tabs component keeps its normal desktop
  // presentation while this wrapper provides an intentional horizontal lane.
  overflowX: "auto",
  overflowY: "hidden",
  scrollbarWidth: "thin",
  WebkitOverflowScrolling: "touch",
};

export const tabs: SxProps<Theme> = {
  width: "100%",
  minHeight: 38,
  "& .MuiTabs-flexContainer": {
    minWidth: "max-content",
  },
  "& .MuiTab-root": {
    minHeight: 38,
    minWidth: { xs: "auto", sm: 100 },
    px: INSET_X,
    fontSize: { xs: 12, sm: "0.875rem" },
    whiteSpace: "nowrap",
  },
};

export const contentPanel = {
  flex: 1,
  minHeight: 0,
  px: INSET_X,
  pb: { xs: 1, sm: 1.5, md: 2 },
} satisfies SxProps<Theme>;

export const scrollableContent = {
  ...contentPanel,
  display: "flex",
  flexDirection: "column",
  gap: { xs: 1.25, md: 1.5 },
  overflow: "auto",
} satisfies SxProps<Theme>;

export const tablePageContent: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  height: "100%",
  minHeight: { xs: 420, md: 0 },
  ...insetSx,
  overflow: "hidden",
};

export const filterField = {
  minWidth: { xs: 150, sm: 210 },
} satisfies SxProps<Theme>;

export const wideFilterField = {
  minWidth: { xs: "100%", md: 280 },
} satisfies SxProps<Theme>;
