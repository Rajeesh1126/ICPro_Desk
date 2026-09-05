import { createContext, useContext } from "react";
import type { PaletteMode } from "@mui/material";

export type themeModeContextValue = {
  mode: PaletteMode;
  toggleMode: () => void;
};

export const themeModeContext = createContext<themeModeContextValue>({
  mode: "light",
  toggleMode: () => undefined,
});

export function useThemeMode() {
  return useContext(themeModeContext);
}
