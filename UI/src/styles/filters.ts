/** Shared filter-panel layout and summary surfaces. */
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { INSET_X, INSET_Y, RADIUS_PX } from "./tokens";

export const filterSummaryPanel: SxProps<Theme> = {
  alignItems: "center",
  bgcolor: "action.hover",
  borderRadius: RADIUS_PX.md,
  color: "text.primary",
  display: "flex",
  gap: 1.25,
  px: INSET_X,
  py: INSET_Y,
};

export const dateFieldSx: SxProps<Theme> = (theme) => ({
  "& input[type='date']::-webkit-calendar-picker-indicator": {
    cursor: "pointer",
    filter:
      theme.palette.mode === "dark" ? "invert(1) brightness(1.35)" : "none",
    opacity: theme.palette.mode === "dark" ? 0.86 : 0.72,
  },
  "& input[type='date']::-webkit-calendar-picker-indicator:hover": {
    opacity: 1,
  },
});
