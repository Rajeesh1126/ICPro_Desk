/** Shared filter-field styles. */
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";

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
