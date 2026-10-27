/**
 * Shared page-layout primitives.
 *
 * Use these for page chrome, report controls, tabs, and table panels. Keeping
 * their insets here makes headers, filters, tabs, and content surfaces align
 * without page-specific breakpoint overrides.
 */
import { type SxProps } from "@mui/material";
import { type Theme } from "@mui/material/styles";
import { RADIUS_PX } from "@/styles/tokens";

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
  // appMain's padding is the page edge: no extra space above the title,
  // and the same 8px step between the header and the content below it.
  pb: 1,
} satisfies SxProps<Theme>;

const pageHeaderSupportText = {
  maxWidth: 880,
  fontSize: { xs: "0.8125rem", sm: "0.875rem", md: "0.9375rem" },
  lineHeight: 1.55,
} satisfies SxProps<Theme>;

export const pageHeaderContent = {
  flex: 1,
  minWidth: 0,
  "& > .MuiTypography-root:not(h1)": pageHeaderSupportText,
} satisfies SxProps<Theme>;

/*
 * PageHeader below desktop (<= 1200px). Instead of stacking the action
 * group under the title, the high-priority actions share the title's row
 * and the subtitle runs the full width underneath; anything that does not
 * fit goes into the "more" menu, and a control that needs real width (a
 * week picker, a select) gets its own full-width row on phones.
 */
export const pageHeaderCompact = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  columnGap: { xs: 1, sm: 1.5 },
  width: "100%",
  flexShrink: 0,
  pb: 1,
} satisfies SxProps<Theme>;

export const pageHeaderCompactTitle = {
  gridColumn: 1,
  gridRow: 1,
  minWidth: 0,
  overflowWrap: "anywhere",
} satisfies SxProps<Theme>;

export const pageHeaderCompactActions = {
  gridColumn: 2,
  gridRow: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 1,
  minWidth: 0,
  "& .MuiButton-root": {
    whiteSpace: "nowrap",
  },
} satisfies SxProps<Theme>;

export const pageHeaderCompactSubtitle = {
  ...pageHeaderSupportText,
  gridColumn: "1 / -1",
  "@media (max-width:600px)": {
    // Phones keep the description to two lines so the content stays in view.
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    overflow: "hidden",
  },
} satisfies SxProps<Theme>;

export const pageHeaderCompactRow = {
  gridColumn: "1 / -1",
  display: "flex",
  alignItems: "center",
  gap: 1,
  pt: 1,
  minWidth: 0,
  // Doubled so a control's own flex basis (e.g. a fixed-width select) yields.
  "&& > *": { flex: "1 1 auto", minWidth: 0 },
} satisfies SxProps<Theme>;

export const pageHeaderCompactExtra = {
  gridColumn: "1 / -1",
  minWidth: 0,
} satisfies SxProps<Theme>;

/**
 * The horizontal "more" button that opens the header's overflow menu: an
 * icon-only outlined Button, so it takes the same size as the actions beside it.
 */
export const pageHeaderMoreButton = {
  flexShrink: 0,
  minWidth: 0,
  px: 0.75,
  color: "text.primary",
} satisfies SxProps<Theme>;

export const pageHeaderMenuPaper = {
  mt: 0.75,
  minWidth: 200,
  maxWidth: "calc(100vw - 32px)",
  borderRadius: RADIUS_PX.md,
  border: "1px solid",
  borderColor: "divider",
} satisfies SxProps<Theme>;

export const pageHeaderMenuSection = {
  bgcolor: "transparent",
  color: "text.secondary",
  fontSize: 11,
  fontWeight: 600,
  lineHeight: "28px",
  textTransform: "uppercase",
} satisfies SxProps<Theme>;

export const pageHeaderMenuCheck = {
  ml: 2,
  color: "primary.main",
  fontSize: 18,
} satisfies SxProps<Theme>;

/** Phone-size icon-only header button (Filters). */
export const pageHeaderIconButton = {
  minWidth: 0,
  px: 1,
  "& .MuiButton-startIcon": { m: 0 },
} satisfies SxProps<Theme>;

export const pageTitle = {
  color: "text.primary",
  fontSize: { xs: "1.375rem", sm: "1.625rem", md: "1.75rem" },
  fontWeight: 600,
  letterSpacing: "-0.015em",
  lineHeight: 1.2,
} satisfies SxProps<Theme>;

export const pageSubtitle = {
  color: "text.secondary",
  fontSize: { xs: "0.8125rem", sm: "0.875rem" },
  fontWeight: 400,
  lineHeight: 1.5,
  mt: 0.5,
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

export const buttonLabelFull = {
  display: { xs: "none", sm: "inline" },
} satisfies SxProps<Theme>;

export const buttonLabelCompact = {
  display: { xs: "inline", sm: "none" },
} satisfies SxProps<Theme>;

export const tabsContainer: SxProps<Theme> = {
  // Never squeezed by tall page content (overflow hidden would let it reach 0).
  flexShrink: 0,
  maxWidth: "100%",
  // Shrink to the segmented tabs instead of a full-width bar.
  alignSelf: "flex-start",
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
  minHeight: 36,
  "& .MuiTabs-flexContainer": {
    minWidth: "max-content",
  },
  "& .MuiTab-root": {
    minHeight: 32,
    minWidth: { xs: "auto", sm: 96 },
    px: { xs: 1, sm: 1.5 },
    fontSize: { xs: 13, sm: 14 },
    whiteSpace: "nowrap",
    fontVariantNumeric: "tabular-nums",
  },
};

/** Page body. No outer padding: appMain's inset is the page edge. */
export const contentPanel = {
  flex: 1,
  minHeight: 0,
} satisfies SxProps<Theme>;

export const scrollableContent = {
  ...contentPanel,
  display: "flex",
  flexDirection: "column",
  gap: { xs: 1.25, md: 1.5 },
  overflow: "auto",
} satisfies SxProps<Theme>;

export const tablePageContent = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  height: "100%",
  minHeight: { xs: 420, md: 0 },
  pt: 1.5,
  overflow: "hidden",
} satisfies SxProps<Theme>;

export const filterField = {
  minWidth: { xs: 150, sm: 210 },
} satisfies SxProps<Theme>;

export const wideFilterField = {
  minWidth: { xs: "100%", md: 280 },
} satisfies SxProps<Theme>;
