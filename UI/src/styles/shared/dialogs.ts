/** Shared dialog styles. */
import { type SxProps } from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";

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

/** Shared confirm dialog root  styles style or helper for the related interface. */
export const confirmDialogRootSx = (theme: Theme) => ({
  zIndex: theme.zIndex.modal + 10,
});

/**
 * Compact segments for page-header toggles (Calendar / Board / List, date
 * presets). Everything visual comes from the MuiToggleButtonGroup theme.
 */
export const toggleButton = {
  "& .MuiToggleButton-root": { px: 1 },
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

/** Shared edit icon  styles style or helper for the related interface. */
export const editIconSx = {
  color: "primary.main",
};

/** Shared approve detail dialog paper  styles style or helper for the related interface. */
export const approveDetailDialogPaperSx = {
  width: "95vw",
  maxWidth: "95vw",
};
