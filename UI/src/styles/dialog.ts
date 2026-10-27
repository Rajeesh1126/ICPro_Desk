import type { SxProps, Theme } from "@mui/material";

/** Shared dialog structure. Section padding and surfaces come from the theme. */
export const dialogTitleRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
  minWidth: 0,
};

export const dialogTitleContentSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  minWidth: 0,
};

export const dialogTitleTextSx: SxProps<Theme> = {
  overflowWrap: "anywhere",
};

export const dialogSubtitleSx: SxProps<Theme> = {
  mt: 0.25,
};

export const dialogTitleActionsSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  flexShrink: 0,
};

/** Shared footer layout; action spacing and section padding come from theme. */
export const dialogActionsRowSx = {
  flexWrap: "wrap",
  alignItems: "center",
} satisfies SxProps<Theme>;

/** "Fields marked with * are required." — sits at the start of the footer. */
export const requiredFieldsNoteSx = {
  mr: "auto",
  color: "text.secondary",
} satisfies SxProps<Theme>;

export const requiredMarkSx = { fontWeight: 600 } satisfies SxProps<Theme>;
