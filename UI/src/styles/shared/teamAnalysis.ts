/** Team Analysis and Work Let Analysis pages. */
import { type SxProps } from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
import { FONT, RADIUS_PX, TABULAR_NUMS } from "@/styles/tokens";
import { panelTitleRow, scrollColumn } from "@/styles/shared/base";

/* -------------------------------------------------------------------------- */
/* Team Analysis page                                                          */
/* -------------------------------------------------------------------------- */

/** Shared panel title row full style or helper for the related interface. */
export const panelTitleRowFull = { ...panelTitleRow, width: "100%" } satisfies SxProps<Theme>;

/** Panel header count ("4 employees", "2 teams"): a quiet neutral pill. */
export const teamWorkloadTotalSx: SxProps<Theme> = (theme) => ({
  ml: "auto",
  flexShrink: 0,
  height: 26,
  borderRadius: RADIUS_PX.pill,
  border: 0,
  bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.08 : 0.05),
  fontSize: FONT.xs,
  fontWeight: 600,
  "& .MuiChip-label": { px: 1 },
});

/* Small layout helpers. */
/** Shared flex fill  styles style or helper for the related interface. */
export const flexFillSx = { minWidth: 0, flex: 1 } satisfies SxProps<Theme>;

/** Shared no shrink  styles style or helper for the related interface. */
export const noShrinkSx = { flexShrink: 0 } satisfies SxProps<Theme>;

/* ---- Team Analysis page (pages/tickets/teamAnalysis.tsx) ---- */

/** Status strip across the top, then employees beside the due-work table. */
export const teamAnalysisGridSx: SxProps<Theme> = {
  // Stacked layouts grow with the page, so employees never scroll inside it.
  flex: { xs: "0 0 auto", lg: 1 },
  minHeight: 0,
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 5fr) minmax(0, 7fr)" },
  gridTemplateRows: {
    xs: "auto auto 480px",
    lg: "auto minmax(380px, 1fr)",
  },
};

/** Work status spans both columns. */
export const teamAnalysisStatusSx: SxProps<Theme> = { gridColumn: "1 / -1", minWidth: 0 };

/** Grid cell that lets its panel scroll instead of growing. */
export const teamAnalysisPanelSx: SxProps<Theme> = { minHeight: 0, minWidth: 0 };

/** Employee cards scroll inside the panel when the team is long. */
export const teamMemberListSx = (theme: Theme) => ({
  ...scrollColumn(theme),
  minHeight: 0,
  overscrollBehavior: "contain",
});

/**
 * One employee: avatar, name and summary, completion ring, then both work
 * types. Selected adds a tint and a leading bar, so colour is not the only cue.
 */
export const teamMemberRowSx = (selected: boolean): SxProps<Theme> => (theme) => {
  const tint = (light: number, dark: number) =>
    alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? dark : light);
  return {
    display: "grid",
    gridTemplateColumns: "36px minmax(0, 1fr) 46px",
    alignItems: "center",
    columnGap: 1.25,
    rowGap: 1,
    flexShrink: 0,
    width: "100%",
    px: 1.25,
    py: 1,
    position: "relative",
    overflow: "hidden",
    textAlign: "left",
    border: "1px solid",
    borderColor: selected ? tint(0.4, 0.5) : "divider",
    borderRadius: RADIUS_PX.md,
    bgcolor: selected ? tint(0.07, 0.14) : "transparent",
    transition: theme.transitions.create(["background-color", "border-color"], {
      duration: theme.transitions.duration.shortest,
    }),
    ...(selected && {
      "&::before": {
        content: '""',
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        bgcolor: "primary.main",
      },
    }),
    "&:hover": {
      bgcolor: selected
        ? tint(0.11, 0.2)
        : alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.05 : 0.03),
    },
    "&.Mui-focusVisible": {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: -2,
    },
  };
};

/** Round initials badge. */
export const teamMemberAvatarSx: SxProps<Theme> = (theme) => ({
  width: 36,
  height: 36,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  fontSize: FONT.xs,
  fontWeight: 600,
  color: theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.primary.dark,
  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.18 : 0.1),
});

/** Employee name, the row's lead text. */
export const teamMemberNameSx: SxProps<Theme> = {
  fontSize: FONT.sm,
  fontWeight: 600,
  lineHeight: 1.3,
};

/** Overall completion ring with its percentage centred. */
export const teamMemberRingSx: SxProps<Theme> = {
  position: "relative",
  display: "grid",
  width: 46,
  height: 46,
  "& > *": { gridArea: "1 / 1" },
};

/** Full circle behind the ring's value. */
export const teamMemberRingTrackSx: SxProps<Theme> = (theme) => ({
  color: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.1 : 0.08),
});

/** Percentage inside the ring. */
export const teamMemberRingTextSx: SxProps<Theme> = {
  display: "grid",
  placeItems: "center",
  fontSize: FONT.xs,
  fontWeight: 600,
  color: "text.primary",
  ...TABULAR_NUMS,
};

/** Both work types across the card, stacked on phones. */
export const teamMemberBarsSx: SxProps<Theme> = {
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" },
  gap: { xs: 0.75, sm: 2 },
};

/** Bar caption: work type on the left, figures on the right. */
export const teamMemberBarLabelSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  gap: 1,
  mb: 0.5,
  whiteSpace: "nowrap",
  ...TABULAR_NUMS,
};

/** Slim work type bar; green once everything due is done. */
export const teamMemberBarSx = (complete: boolean): SxProps<Theme> => (theme) => ({
  height: 5,
  borderRadius: RADIUS_PX.pill,
  bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.1 : 0.07),
  "& .MuiLinearProgress-bar": {
    borderRadius: RADIUS_PX.pill,
    bgcolor: complete ? theme.palette.success.main : theme.palette.primary.main,
  },
});

/** One rounded surface; the cells inside share hairlines. */
export const teamStatusStripSx: SxProps<Theme> = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.lg,
  overflow: "hidden",
};

/**
 * Cells wrap to fit. Each draws its left and top hairline and the grid sits
 * 1px outside the strip, so wrapped rows never show a stray or double line.
 */
export const teamStatusGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "repeat(2, minmax(0, 1fr))",
    sm: "repeat(auto-fit, minmax(160px, 1fr))",
  },
  m: "-1px 0 0 -1px",
  p: 0,
  listStyle: "none",
};

/** One status: name and share, count, then a bar of its share. */
export const teamStatusCellSx: SxProps<Theme> = {
  minWidth: 0,
  px: 1.5,
  py: 1,
  borderLeft: "1px solid",
  borderTop: "1px solid",
  borderColor: "divider",
};

/** Panel title and team total; takes a full row on phones. */
export const teamStatusSummaryCellSx: SxProps<Theme> = (theme) => ({
  ...(teamStatusCellSx as object),
  gridColumn: { xs: "1 / -1", sm: "auto" },
  bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.04 : 0.025),
});

/** "Work status" title, level with the status names. */
export const teamStatusHeadingSx: SxProps<Theme> = {
  fontSize: FONT.xs,
  fontWeight: 600,
  lineHeight: 1.5,
  color: "text.primary",
};

/** Dot, status name and share in one line. */
export const teamStatusLabelRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.75,
  ...TABULAR_NUMS,
};

/** Status name, taking the room the share leaves. */
export const teamStatusLabelSx: SxProps<Theme> = {
  flex: 1,
  minWidth: 0,
  fontSize: FONT.xs,
  lineHeight: 1.5,
  color: "text.secondary",
};

/** Dot in the status colour; the name beside it carries the meaning. */
export const teamStatusDotSx = (color: string): SxProps<Theme> => ({
  width: 8,
  height: 8,
  flexShrink: 0,
  borderRadius: "50%",
  bgcolor: color,
});

/** Count or total, the figure the eye lands on. */
export const teamStatusValueSx: SxProps<Theme> = {
  fontSize: FONT.lg,
  fontWeight: 600,
  lineHeight: 1.25,
  letterSpacing: "-0.01em",
  color: "text.primary",
  ...TABULAR_NUMS,
};

/** Track of a status share bar. */
export const teamStatusShareSx: SxProps<Theme> = (theme) => ({
  height: 4,
  mt: 0.5,
  borderRadius: RADIUS_PX.pill,
  overflow: "hidden",
  bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.1 : 0.07),
});

/** Status share in the status colour. */
export const teamStatusShareFillSx = (color: string, share: number): SxProps<Theme> => ({
  width: `${share}%`,
  height: "100%",
  borderRadius: RADIUS_PX.pill,
  bgcolor: color,
});

/** Assigned by and target date side by side in a work item summary dialog. */
export const workItemSummaryGridSx: SxProps<Theme> = {
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" },
};

