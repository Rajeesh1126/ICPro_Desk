import { createContext, useContext } from "react";
import type { PaletteMode } from "@mui/material";

// Stable storage key shared by the provider and any future theme preference UI.
export const themeStorageKey = "themeMode";

/** theme Mode Context Value declaration used across the frontend. */
export type themeModeContextValue = {
  mode: PaletteMode;
  toggleMode: () => void;
};

// Supplies the current palette mode and the action used to switch it.
export const themeModeContext = createContext<themeModeContextValue>({
  mode: "light",
  toggleMode: () => undefined,
});

// Reads theme controls from the nearest AppThemeProvider.
export function useThemeMode() {
  return useContext(themeModeContext);
}
