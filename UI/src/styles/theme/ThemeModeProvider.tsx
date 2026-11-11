import { useMemo, useState } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import type { PaletteMode } from "@mui/material";
import { createAppTheme } from "@/styles/theme/createAppTheme";
import { themeModeContext, themeStorageKey } from "@/styles/theme/themeModeContext";

// Restores an explicit choice first, then follows the browser's system preference.
function getInitialMode(): PaletteMode {
  const stored = localStorage.getItem(themeStorageKey);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Owns theme mode state, persists user preference, and supplies the generated MUI theme.
export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(getInitialMode);
  // Rebuilds the theme only when the selected palette mode changes.
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  // Memoizes the context value so consumers update only when mode changes.
  const value = useMemo(
    () => ({
      mode,
      toggleMode: () => {
        setMode((current) => {
          const next = current === "light" ? "dark" : "light";
          localStorage.setItem(themeStorageKey, next);
          return next;
        });
      },
    }),
    [mode],
  );

  return (
    <themeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </themeModeContext.Provider>
  );
}
