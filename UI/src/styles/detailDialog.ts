/**
 * Shared styles for the read-only "detail" dialogs (Do List task, Ticket and
 * Work Let). The dialog chrome itself (title bar, content padding, actions
 * bar) comes from the MuiDialog* overrides in theme/createAppTheme.ts; these
 * styles only cover what sits inside it. Used through
 * components/common/DetailDialogParts.tsx.
 */
import { alpha, type Theme } from "@mui/material/styles";
import type { SxProps } from "@mui/material";
import { RADIUS_PX, SURFACE_TINT } from "@/styles/tokens";

const surface = (theme: Theme) =>
  theme.palette.mode === "dark"
    ? alpha(theme.palette.text.primary, 0.025)
    : theme.palette.background.paper;

/** Small supporting label above a value (sentence case, no tracking). */
const labelSx = {
  color: "text.secondary",
  fontSize: 12,
  fontWeight: 500,
  lineHeight: 1.3,
} as const;

/* ---- Header ---------------------------------------------------------- */

export const detailEyebrowSx: SxProps<Theme> = labelSx;

/** The record number is the dialog title: size comes from MuiDialogTitle. */
export const detailNumberSx: SxProps<Theme> = {
  fontSize: "inherit",
  fontWeight: 600,
  lineHeight: 1.3,
  letterSpacing: "-0.01em",
  fontVariantNumeric: "tabular-nums",
};

export const detailPriorityChipSx = (pStyle: {
  bg: string;
  text: string;
}): SxProps<Theme> => ({
  bgcolor: pStyle.bg,
  color: pStyle.text,
  fontWeight: 600,
  fontSize: 12,
  height: 22,
  borderRadius: RADIUS_PX.pill,
  "& .MuiChip-label": { px: 1 },
});

/**
 * Header grid. Phones: title + close on the first row, the person pill on its
 * own full-width row below. From `sm`: one row — title, person pill, close.
 */
export const detailHeaderGridSx: SxProps<Theme> = {
  display: "grid",
  alignItems: "center",
  columnGap: { xs: 1, sm: 1.5 },
  rowGap: 1.25,
  gridTemplateColumns: { xs: "minmax(0, 1fr) auto", sm: "minmax(0, 1fr) auto auto" },
  gridTemplateAreas: {
    xs: '"main close" "person person"',
    sm: '"main person close"',
  },
};

export const detailHeaderMainSx: SxProps<Theme> = {
  gridArea: "main",
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  minWidth: 0,
};

export const detailHeaderCloseSx: SxProps<Theme> = { gridArea: "close" };

export const detailPersonPillSx: SxProps<Theme> = (theme) => ({
  gridArea: "person",
  display: "flex",
  justifySelf: { xs: "stretch", sm: "end" },
  minWidth: 0,
  alignItems: "center",
  gap: 1,
  pl: 0.5,
  pr: 1.5,
  py: 0.5,
  borderRadius: RADIUS_PX.pill,
  // Light mode needs a visible neutral tint: the white "surface" matched the
  // white dialog and the pill vanished. Dark mode keeps its existing tint.
  bgcolor:
    theme.palette.mode === "dark"
      ? surface(theme)
      : alpha(theme.palette.text.primary, 0.05),
});

export const detailPersonAvatarSx: SxProps<Theme> = (theme) => ({
  width: 30,
  height: 30,
  fontSize: 13,
  fontWeight: 600,
  color: "text.primary",
  bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.14 : 0.08),
});

export const detailPersonLabelSx: SxProps<Theme> = labelSx;

export const detailPersonNameSx: SxProps<Theme> = {
  color: "text.primary",
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.3,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

/* ---- Body ------------------------------------------------------------ */

export const detailMainColumnSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2.5,
  height: "100%",
  minWidth: 0,
};

/**
 * Key facts (hours, dates, type, status…) as one rounded strip split into
 * equal cells by hairlines — the same treatment as the summary metrics.
 * The hairlines are the container colour through a 1px grid gap; an odd last
 * cell spans the row on phones so there is never an empty slot.
 */
export const detailFactsSx: SxProps<Theme> = (theme) => ({
  display: "grid",
  gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
  gap: "1px",
  overflow: "hidden",
  borderRadius: RADIUS_PX.md,
  border: `1px solid ${theme.palette.divider}`,
  bgcolor: theme.palette.divider,
  "& > :last-child:nth-of-type(odd)": {
    gridColumn: { xs: "1 / -1", md: "auto" },
  },
});

/** One fact cell inside detailFactsSx. */
export const detailFieldSx: SxProps<Theme> = {
  height: "100%",
  display: "flex",
  alignItems: "flex-start",
  px: 1.5,
  py: 1.25,
  bgcolor: "background.paper",
  minWidth: 0,
};

/**
 * Subject reads as the record's title; the description sits in a soft inset
 * panel (`grow`) so long text is comfortable to read.
 */
export const detailTextFieldSx = (grow = false): SxProps<Theme> => (theme) => ({
  display: "flex",
  alignItems: "flex-start",
  minWidth: 0,
  ...(grow && {
    flex: "1 1 auto",
    px: 1.5,
    py: 1.5,
    borderRadius: RADIUS_PX.md,
    bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.04 : 0.03),
  }),
});

export const detailFieldBodySx: SxProps<Theme> = {
  flex: 1,
  minWidth: 0,
  alignSelf: "stretch",
  display: "flex",
  flexDirection: "column",
};

export const detailFieldLabelSx: SxProps<Theme> = {
  ...labelSx,
  mb: 0.5,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export const detailFieldValueSx = (capitalize = false): SxProps<Theme> => ({
  color: "text.primary",
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.4,
  overflowWrap: "anywhere",
  textTransform: capitalize ? "capitalize" : "none",
});

export const detailSubjectTextSx: SxProps<Theme> = {
  color: "text.primary",
  fontSize: { xs: 16, sm: 18 },
  fontWeight: 600,
  letterSpacing: "-0.01em",
  lineHeight: 1.35,
  overflowWrap: "anywhere",
};

export const detailDescriptionTextSx: SxProps<Theme> = {
  flex: "0 1 auto",
  maxHeight: { xs: 200, md: 240 },
  overflowY: "auto",
  pr: 0.5,
  color: "text.primary",
  fontSize: 14,
  fontWeight: 400,
  lineHeight: 1.6,
  whiteSpace: "pre-line",
  overflowWrap: "anywhere",
};

/* ---- Chat panel ------------------------------------------------------ */

/** The activity column: set off by a single hairline, not a framed box. */
export const detailPanelSx: SxProps<Theme> = {
  height: "100%",
  minHeight: { xs: 320, md: 0 },
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  borderTop: { xs: "1px solid", md: 0 },
  borderLeft: { xs: 0, md: "1px solid" },
  borderColor: { xs: "divider", md: "divider" },
  pl: { xs: 0, md: 2 },
  pt: { xs: 1.5, md: 0 },
};

export const detailPanelHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  pb: 1,
  "& > .MuiSvgIcon-root": { color: "text.secondary", fontSize: 18 },
};

export const detailPanelTitleSx: SxProps<Theme> = {
  flex: 1,
  fontSize: 14,
  fontWeight: 600,
  lineHeight: 1.3,
};

export const detailPanelBadgeSx: SxProps<Theme> = (theme) => ({
  minWidth: 22,
  height: 22,
  px: 0.75,
  borderRadius: RADIUS_PX.pill,
  display: "grid",
  placeItems: "center",
  fontSize: 12,
  fontWeight: 600,
  color: "text.secondary",
  bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.1 : 0.06),
});

export const detailChatListSx: SxProps<Theme> = {
  flex: "1 1 auto",
  minHeight: 0,
  height: { xs: 320, md: 0 },
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 2,
  py: 1,
  pr: 0.5,
};

export const detailChatRowSx = (mine: boolean): SxProps<Theme> => ({
  alignSelf: mine ? "flex-end" : "flex-start",
  display: "flex",
  flexDirection: mine ? "row-reverse" : "row",
  alignItems: "flex-end",
  gap: 1,
  maxWidth: "92%",
});

export const detailChatAvatarSx = (mine: boolean): SxProps<Theme> => (
  theme,
) => ({
  width: 28,
  height: 28,
  flexShrink: 0,
  fontSize: 12,
  fontWeight: 600,
  color: mine ? "primary.contrastText" : "text.primary",
  bgcolor: mine
    ? "primary.main"
    : alpha(
        theme.palette.text.primary,
        theme.palette.mode === "dark" ? 0.14 : 0.1,
      ),
});

export const detailChatBodySx = (mine: boolean): SxProps<Theme> => ({
  display: "flex",
  flexDirection: "column",
  alignItems: mine ? "flex-end" : "flex-start",
  minWidth: 0,
});

export const detailChatMetaSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "baseline",
  gap: 0.75,
  mb: 0.5,
  px: 0.5,
  lineHeight: 1.2,
};

export const detailChatNameSx: SxProps<Theme> = {
  color: "text.primary",
  fontSize: 12,
  fontWeight: 600,
};

export const detailChatTimeSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: 12,
};

export const detailChatBubbleSx = (mine: boolean): SxProps<Theme> => (
  theme,
) => {
  const isDark = theme.palette.mode === "dark";
  return {
    display: "flex",
    flexDirection: "column",
    gap: 0.75,
    px: 1.5,
    py: 1,
    borderRadius: "16px",
    [mine ? "borderBottomRightRadius" : "borderBottomLeftRadius"]:
      RADIUS_PX.xs,
    bgcolor: mine
      ? isDark
        ? alpha(theme.palette.primary.main, 0.24)
        : SURFACE_TINT.ownMessage
      : alpha(theme.palette.text.primary, isDark ? 0.07 : 0.05),
    color: "text.primary",
    fontSize: 13,
    lineHeight: 1.55,
    whiteSpace: "pre-line",
    overflowWrap: "anywhere",
  };
};

/**
 * One activity-timeline entry: a dot on a vertical hairline. The current
 * user's own entries get the brand-coloured dot.
 */
export const detailTimelineItemSx =
  (mine: boolean): SxProps<Theme> =>
  (theme) => ({
    position: "relative",
    pl: 2,
    pb: 1.75,
    borderLeft: `1px solid ${theme.palette.divider}`,
    "&::before": {
      content: '""',
      position: "absolute",
      left: -5,
      top: 2,
      width: 9,
      height: 9,
      borderRadius: "50%",
      bgcolor: mine ? theme.palette.primary.main : theme.palette.text.disabled,
      boxShadow: `0 0 0 3px ${theme.palette.background.paper}`,
    },
    "&:last-of-type": { borderLeftColor: "transparent", pb: 0 },
  });

/* ---- Footer ---------------------------------------------------------- */

/**
 * Footer row: information text on the left, every action button grouped on
 * the right. Phones stack the note above full-width buttons.
 */
export const detailFooterSx: SxProps<Theme> = {
  width: "100%",
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
  alignItems: { xs: "stretch", md: "center" },
  justifyContent: "space-between",
  gap: { xs: 1.25, md: 2 },
};

/** Footer note: quiet supporting text with an info glyph, never a callout. */
export const detailNoteSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "flex-start",
  gap: 1,
  flex: "1 1 auto",
  minWidth: 0,
  maxWidth: { md: 520 },
  color: "text.secondary",
  "& .MuiSvgIcon-root": { flexShrink: 0, fontSize: 16, mt: "1px", color: "text.secondary" },
  "& .MuiTypography-root": { fontSize: 12, lineHeight: 1.5 },
};

/** Action buttons: right-aligned; equal widths on phones, natural from md. */
export const detailActionButtonsSx: SxProps<Theme> = (theme) => ({
  display: "flex",
  flexWrap: { xs: "wrap", md: "nowrap" },
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 1,
  ml: "auto",
  width: { xs: "100%", md: "auto" },
  "& .MuiButton-root": {
    minWidth: 0,
    flex: { xs: "1 1 0", md: "0 0 auto" },
    whiteSpace: "nowrap",
  },
  // Amber outlined text needs the darker step on light surfaces for contrast.
  "& .MuiButton-outlinedWarning": {
    color: theme.palette.mode === "dark" ? theme.palette.warning.main : theme.palette.warning.dark,
  },
});

/** Ticket footer: same layout as detailFooterSx. */
export const detailActionBarSx: SxProps<Theme> = detailFooterSx;

/** A workflow group of buttons inside detailActionButtonsSx. */
export const detailActionGroupSx: SxProps<Theme> = {
  flex: { xs: "1 1 100%", md: "0 0 auto" },
  justifyContent: "flex-end",
};
