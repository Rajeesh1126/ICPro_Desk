/**
 * Shared styles for the read-only "detail" dialogs (Do List task, Ticket and
 * Work Let). The dialog chrome itself (title bar, content padding, actions
 * bar) comes from the MuiDialog* overrides in theme/createAppTheme.ts; these
 * styles only cover what sits inside it. Used through
 * components/common/DetailDialogParts.tsx.
 */
import { alpha, type Theme } from "@mui/material/styles";
import type { SxProps } from "@mui/material";
import { RADIUS_PX, SURFACE_TINT, FONT } from "@/styles/tokens";

const surface = (theme: Theme) =>
  theme.palette.mode === "dark"
    ? alpha(theme.palette.text.primary, 0.025)
    : theme.palette.background.paper;

/** Small supporting label above a value (sentence case, no tracking). */
const labelSx = {
  color: "text.secondary",
  fontSize: FONT.xs,
  fontWeight: 500,
  lineHeight: 1.3,
} as const;

/* ---- Header ---------------------------------------------------------- */

/** detail Eyebrow Sx declaration used across the frontend. */
export const detailEyebrowSx: SxProps<Theme> = labelSx;

/** The record number is the dialog title: size comes from MuiDialogTitle. */
export const detailNumberSx: SxProps<Theme> = {
  fontSize: "inherit",
  fontWeight: 600,
  lineHeight: 1.3,
  letterSpacing: "-0.01em",
  fontVariantNumeric: "tabular-nums",
};

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

/** detail Header Main Sx declaration used across the frontend. */
export const detailHeaderMainSx: SxProps<Theme> = {
  gridArea: "main",
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  minWidth: 0,
};

/** detail Header Close Sx declaration used across the frontend. */
export const detailHeaderCloseSx: SxProps<Theme> = { gridArea: "close" };

/** detail Person Pill Sx declaration used across the frontend. */
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

/** detail Person Avatar Sx declaration used across the frontend. */
export const detailPersonAvatarSx: SxProps<Theme> = (theme) => ({
  width: 30,
  height: 30,
  fontSize: FONT.sm,
  fontWeight: 600,
  color: "text.primary",
  bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.14 : 0.08),
});

/** detail Person Label Sx declaration used across the frontend. */
export const detailPersonLabelSx: SxProps<Theme> = labelSx;

/** detail Person Name Sx declaration used across the frontend. */
export const detailPersonNameSx: SxProps<Theme> = {
  color: "text.primary",
  fontSize: FONT.sm,
  fontWeight: 600,
  lineHeight: 1.3,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

/* ---- Body ------------------------------------------------------------ */

/** detail Main Column Sx declaration used across the frontend. */
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

/** detail Field Body Sx declaration used across the frontend. */
export const detailFieldBodySx: SxProps<Theme> = {
  flex: 1,
  minWidth: 0,
  alignSelf: "stretch",
  display: "flex",
  flexDirection: "column",
};

/** detail Field Label Sx declaration used across the frontend. */
export const detailFieldLabelSx: SxProps<Theme> = {
  ...labelSx,
  mb: 0.5,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

/** detail Field Value Sx declaration used across the frontend. */
export const detailFieldValueSx = (capitalize = false): SxProps<Theme> => ({
  color: "text.primary",
  fontSize: FONT.sm,
  fontWeight: 500,
  lineHeight: 1.4,
  overflowWrap: "anywhere",
  textTransform: capitalize ? "capitalize" : "none",
});

/** detail Subject Text Sx declaration used across the frontend. */
export const detailSubjectTextSx: SxProps<Theme> = {
  color: "text.primary",
  fontSize: { xs: FONT.md, sm: FONT.md },
  fontWeight: 600,
  letterSpacing: "-0.01em",
  lineHeight: 1.35,
  overflowWrap: "anywhere",
};

/** detail Description Text Sx declaration used across the frontend. */
export const detailDescriptionTextSx: SxProps<Theme> = {
  flex: "0 1 auto",
  maxHeight: { xs: 200, md: 240 },
  overflowY: "auto",
  pr: 0.5,
  color: "text.primary",
  fontSize: FONT.sm,
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

/** detail Panel Header Sx declaration used across the frontend. */
export const detailPanelHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  pb: 1,
  "& > .MuiSvgIcon-root": { color: "text.secondary", fontSize: FONT.md },
};

/**
 * Title row for a column with no count badge (e.g. "Task details"): the same
 * row as detailPanelHeaderSx, held at the badge row's height so every
 * column's title sits on one line.
 */
export const detailColumnHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  minHeight: 30,
  pb: 1,
  mb: -1,
  "& > .MuiSvgIcon-root": { color: "text.secondary", fontSize: FONT.md },
};

/** detail Panel Title Sx declaration used across the frontend. */
export const detailPanelTitleSx: SxProps<Theme> = {
  flex: 1,
  fontSize: FONT.sm,
  fontWeight: 600,
  lineHeight: 1.3,
};

/** detail Panel Badge Sx declaration used across the frontend. */
export const detailPanelBadgeSx: SxProps<Theme> = (theme) => ({
  minWidth: 22,
  height: 22,
  px: 0.75,
  borderRadius: RADIUS_PX.pill,
  display: "grid",
  placeItems: "center",
  fontSize: FONT.xs,
  fontWeight: 600,
  color: "text.secondary",
  bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.1 : 0.06),
});

/** detail Chat List Sx declaration used across the frontend. */
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

/** detail Chat Row Sx declaration used across the frontend. */
export const detailChatRowSx = (mine: boolean): SxProps<Theme> => ({
  alignSelf: mine ? "flex-end" : "flex-start",
  display: "flex",
  flexDirection: mine ? "row-reverse" : "row",
  alignItems: "flex-end",
  gap: 1,
  maxWidth: "92%",
});

/** detail Chat Avatar Sx declaration used across the frontend. */
export const detailChatAvatarSx = (mine: boolean): SxProps<Theme> => (
  theme,
) => ({
  width: 28,
  height: 28,
  flexShrink: 0,
  fontSize: FONT.xs,
  fontWeight: 600,
  color: mine ? "primary.contrastText" : "text.primary",
  bgcolor: mine
    ? "primary.main"
    : alpha(
        theme.palette.text.primary,
        theme.palette.mode === "dark" ? 0.14 : 0.1,
      ),
});

/** detail Chat Body Sx declaration used across the frontend. */
export const detailChatBodySx = (mine: boolean): SxProps<Theme> => ({
  display: "flex",
  flexDirection: "column",
  alignItems: mine ? "flex-end" : "flex-start",
  minWidth: 0,
});

/** detail Chat Meta Sx declaration used across the frontend. */
export const detailChatMetaSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "baseline",
  gap: 0.75,
  mb: 0.5,
  px: 0.5,
  lineHeight: 1.2,
};

/** detail Chat Name Sx declaration used across the frontend. */
export const detailChatNameSx: SxProps<Theme> = {
  color: "text.primary",
  fontSize: FONT.xs,
  fontWeight: 600,
};

/** detail Chat Time Sx declaration used across the frontend. */
export const detailChatTimeSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: FONT.xs,
};

/** detail Chat Bubble Sx declaration used across the frontend. */
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
    fontSize: FONT.sm,
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


/* ---- Generic side panel (DetailPanel) -------------------------------- */

/** Fixed content between a panel's header and its scrolling body. */
export const detailPanelIntroSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
  pb: 1,
};

/**
 * A panel's scrolling body; fills the column height like the chat list, but
 * keeps room for about five rows when the details column beside it is short.
 */
export const detailPanelBodySx: SxProps<Theme> = {
  flex: "1 1 auto",
  minHeight: { xs: 0, md: 300 },
  height: { xs: 320, md: 0 },
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 0.5,
  py: 0.5,
  pr: 0.5,
};

/** Fixed note under a panel's body. */
export const detailPanelFooterSx: SxProps<Theme> = {
  pt: 1,
  borderTop: "1px solid",
  borderColor: "divider",
};


/* ---- Recurring occurrences ------------------------------------------- */

export type OccurrenceTone = "next" | "overdue" | "open" | "done";

/** Summary card: progress ring, schedule line, then Done / Open counts. */
export const occurrenceSummaryCardSx: SxProps<Theme> = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  px: 1.5,
  py: 1.25,
  borderRadius: RADIUS_PX.md,
  border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.35 : 0.25)}`,
  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.08 : 0.04),
});

/** Progress ring: a faint full track under the value, percentage centred. */
export const occurrenceProgressSx: SxProps<Theme> = (theme) => ({
  position: "relative",
  display: "inline-flex",
  flexShrink: 0,
  "& .MuiCircularProgress-root": { position: "absolute", inset: 0 },
  "& .MuiCircularProgress-root:first-of-type": {
    position: "relative",
    color: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.1 : 0.08),
  },
  "& .MuiCircularProgress-root:nth-of-type(2)": { color: theme.palette.success.main },
  "& > .MuiTypography-root": {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    fontSize: FONT.xs,
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
  },
});

/** One Done / Open count: big number over a small label. */
export const occurrenceSummaryCountSx =
  (tone: "success" | "default"): SxProps<Theme> =>
  (theme) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: 40,
    "& > :first-of-type": {
      fontSize: FONT.lg,
      fontWeight: 700,
      lineHeight: 1.2,
      fontVariantNumeric: "tabular-nums",
      color: tone === "success" ? theme.palette.success.main : theme.palette.text.primary,
    },
    "& > :last-of-type": { fontSize: FONT.xs, color: theme.palette.text.secondary },
  });

/** "NOVEMBER 2026" with a hairline running to the edge. */
export const occurrenceMonthHeadingSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  my: 1,
  color: "text.secondary",
  fontSize: FONT.xs,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  "&::after": { content: "\"\"", flex: 1, height: "1px", bgcolor: "divider" },
};

/** Two tiles per row in the panel; one on narrow phones. */
export const occurrenceGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" },
  gap: 1,
};

/** One occurrence tile: date block, weekday + status, and due actions. */
export const occurrenceTileSx =
  (tone: OccurrenceTone): SxProps<Theme> =>
  (theme) => {
    const accent = tone === "next" ? theme.palette.primary.main : tone === "overdue" ? theme.palette.error.main : null;
    return {
      display: "grid",
      gridTemplateColumns: "auto minmax(0, 1fr) auto",
      alignItems: "center",
      columnGap: 1.25,
      p: 1,
      borderRadius: RADIUS_PX.md,
      border: "1px solid",
      borderColor: accent ? alpha(accent, 0.55) : theme.palette.divider,
      bgcolor: accent ? alpha(accent, theme.palette.mode === "dark" ? 0.1 : 0.05) : surface(theme),
      boxShadow: accent ? `0 0 0 1px ${alpha(accent, 0.25)}` : "none",
    };
  };

/** Calendar-style date block: month over day number, tinted by state. */
export const occurrenceDateTileSx =
  (tone: OccurrenceTone): SxProps<Theme> =>
  (theme) => {
    const isDark = theme.palette.mode === "dark";
    const accent =
      tone === "next" ? theme.palette.primary.main : tone === "overdue" ? theme.palette.error.main : theme.palette.text.primary;
    const tinted = tone === "next" || tone === "overdue";
    return {
      width: 44,
      py: 0.5,
      borderRadius: RADIUS_PX.sm,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      lineHeight: 1,
      bgcolor: alpha(accent, tinted ? (isDark ? 0.18 : 0.1) : isDark ? 0.07 : 0.05),
      color: tinted ? accent : "text.primary",
      "& > :first-of-type": {
        fontSize: FONT.xs,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        opacity: 0.85,
      },
      "& > :last-of-type": {
        mt: 0.25,
        fontSize: FONT.lg,
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
      },
    };
  };

/** Weekday line next to the date block. */
export const occurrenceDayNameSx: SxProps<Theme> = {
  color: "text.primary",
  fontSize: FONT.sm,
  fontWeight: 600,
  lineHeight: 1.35,
};

/** "Completed" / "Next up" / "Scheduled" with its glyph or dot, under the weekday. */
export const occurrenceStatusLineSx =
  (tone: "success" | "primary" | "error" | "warning" | "muted"): SxProps<Theme> =>
  (theme) => {
    const color =
      tone === "muted"
        ? theme.palette.text.secondary
        : tone === "warning"
          ? theme.palette.mode === "dark"
            ? theme.palette.warning.light
            : theme.palette.warning.dark
          : theme.palette[tone].main;
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 0.5,
      mt: 0.25,
      fontSize: FONT.xs,
      fontWeight: tone === "muted" ? 500 : 600,
      lineHeight: 1.3,
      color,
      "& .MuiSvgIcon-root": { fontSize: FONT.sm },
      "& .dot": { width: 6, height: 6, borderRadius: "50%", bgcolor: "currentColor", flexShrink: 0 },
    };
  };

/** Complete / skip icon buttons on a due tile. */
export const occurrenceActionsSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
};

/** Skip: muted at rest, red on hover (never the loudest thing on a tile). */
export const occurrenceSkipButtonSx: SxProps<Theme> = (theme) => ({
  color: "text.secondary",
  "&:hover, &.Mui-focusVisible": {
    color: "error.main",
    bgcolor: alpha(theme.palette.error.main, 0.1),
  },
});

/** Empty occurrences message. */
export const occurrenceEmptySx: SxProps<Theme> = {
  ...labelSx,
  fontSize: FONT.sm,
  py: 3,
  textAlign: "center",
};

/** "9 Nov 2026 is the next open occurrence." under the tiles. */
export const occurrenceFooterNoteSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.75,
  color: "text.secondary",
  "& > .MuiSvgIcon-root": { fontSize: FONT.md, color: "info.main" },
  "& strong": { color: "text.primary", fontWeight: 600 },
};

/* ---- Do List activity timeline --------------------------------------- */

export type ActivityTone = "success" | "warning" | "error" | "muted";

/** One-line description under the "Status & comments" heading. */
export const activitySubtitleSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: FONT.sm,
  lineHeight: 1.5,
};

/**
 * One entry in the conversation: the signed-in user's on the right, everyone
 * else's on the left, like a chat app.
 */
export const activityItemSx =
  (mine: boolean): SxProps<Theme> => ({
    display: "flex",
    flexDirection: "column",
    alignItems: mine ? "flex-end" : "flex-start",
    pb: 1.75,
    "&:last-of-type": { pb: 0 },
  });

/** Author avatar, name and time above the card; mirrored for own entries. */
export const activityHeadSx =
  (mine: boolean): SxProps<Theme> => ({
    display: "flex",
    flexDirection: mine ? "row-reverse" : "row",
    alignItems: "center",
    gap: 1,
    mb: 0.75,
    maxWidth: "100%",
    textAlign: mine ? "right" : "left",
  });

/** Rounded-square author initial (brand tint for the current user). */
export const activityAvatarSx =
  (mine: boolean): SxProps<Theme> =>
  (theme) => ({
    width: 28,
    height: 28,
    borderRadius: RADIUS_PX.sm,
    fontSize: FONT.xs,
    fontWeight: 700,
    color: mine ? theme.palette.primary.contrastText : theme.palette.text.primary,
    bgcolor: mine ? theme.palette.primary.main : alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.14 : 0.1),
  });

/**
 * The event card: what happened, then the note set off by a quote bar. Own
 * cards take a light brand tint; the corner nearest the author is squared
 * off like a chat bubble's tail.
 */
export const activityCardSx =
  (mine: boolean): SxProps<Theme> =>
  (theme) => {
    const isDark = theme.palette.mode === "dark";
    return {
      display: "flex",
      flexDirection: "column",
      gap: 0.75,
      maxWidth: "88%",
      minWidth: 160,
      px: 1.5,
      py: 1.25,
      borderRadius: RADIUS_PX.md,
      [mine ? "borderTopRightRadius" : "borderTopLeftRadius"]: RADIUS_PX.xs,
      border: `1px solid ${mine ? alpha(theme.palette.primary.main, isDark ? 0.35 : 0.25) : theme.palette.divider}`,
      bgcolor: mine ? alpha(theme.palette.primary.main, isDark ? 0.12 : 0.06) : surface(theme),
    };
  };

/** "Occurrence marked closed" heading (with its glyph) inside an event card. */
export const activityEventSx =
  (tone: ActivityTone): SxProps<Theme> =>
  (theme) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 0.75,
    color: "text.primary",
    fontSize: FONT.xs,
    fontWeight: 600,
    "& .MuiSvgIcon-root": {
      fontSize: FONT.sm,
      color:
        tone === "muted"
          ? theme.palette.text.secondary
          : tone === "warning"
            ? theme.palette.warning.main
            : theme.palette[tone].main,
    },
  });

/** The log's note, set off by a brand-tinted bar like a quotation. */
export const activityQuoteSx: SxProps<Theme> = (theme) => ({
  pl: 1.25,
  borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.6)}`,
  color: "text.primary",
  fontSize: FONT.sm,
  lineHeight: 1.5,
  whiteSpace: "pre-line",
  overflowWrap: "anywhere",
});

/* ---- Schedule card (recurring / period) ------------------------------ */

/** Rounded card: rule heading, weekday chips (weekly), then the date range. */
export const scheduleCardSx: SxProps<Theme> = (theme) => ({
  display: "flex",
  flexDirection: "column",
  gap: 1.25,
  px: 1.5,
  py: 1.5,
  borderRadius: RADIUS_PX.md,
  border: `1px solid ${theme.palette.divider}`,
  bgcolor: surface(theme),
});

/** Icon tile, title + rule sentence, and an optional "Paused" tag. */
export const scheduleCardHeadSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.25,
};

/** Brand-tinted square behind the schedule icon. */
export const scheduleCardIconSx: SxProps<Theme> = (theme) => ({
  width: 36,
  height: 36,
  flexShrink: 0,
  display: "grid",
  placeItems: "center",
  borderRadius: RADIUS_PX.sm,
  color: theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.primary.main,
  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.18 : 0.1),
  "& .MuiSvgIcon-root": { fontSize: FONT.lg },
});

/** "Paused" tag for a schedule that is switched off. */
export const scheduleCardPausedSx: SxProps<Theme> = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 0.5,
  flexShrink: 0,
  px: 1,
  py: 0.25,
  borderRadius: RADIUS_PX.pill,
  fontSize: FONT.xs,
  fontWeight: 600,
  color: theme.palette.mode === "dark" ? theme.palette.warning.light : theme.palette.warning.dark,
  bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.16 : 0.12),
  "& .MuiSvgIcon-root": { fontSize: FONT.sm },
});

/** Mon–Sun chips in one row (they wrap on very narrow screens). */
export const scheduleCardDaysSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 0.75,
};

/** One weekday chip: brand outline and tint when the task repeats that day. */
export const scheduleCardDayChipSx =
  (on: boolean): SxProps<Theme> =>
  (theme) => ({
    minWidth: 38,
    px: 0.75,
    py: 0.375,
    textAlign: "center",
    borderRadius: RADIUS_PX.sm,
    border: "1px solid",
    borderColor: on ? alpha(theme.palette.primary.main, 0.6) : theme.palette.divider,
    bgcolor: on ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.18 : 0.1) : "transparent",
    color: on
      ? theme.palette.mode === "dark"
        ? theme.palette.primary.light
        : theme.palette.primary.main
      : theme.palette.text.secondary,
    fontSize: FONT.xs,
    fontWeight: on ? 700 : 500,
  });

/** "2 Nov 2026 → 30 Nov 2026" under a hairline. */
export const scheduleCardRangeSx: SxProps<Theme> = (theme) => ({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 1,
  pt: 1.25,
  borderTop: `1px solid ${theme.palette.divider}`,
  color: "text.primary",
  fontSize: FONT.sm,
  fontVariantNumeric: "tabular-nums",
  "& .MuiSvgIcon-root": { fontSize: FONT.md, color: theme.palette.text.secondary },
});
