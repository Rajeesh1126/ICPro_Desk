import { useMemo, useState } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import type { PaletteMode } from "@mui/material";
import { createAppTheme } from "./createAppTheme";
import { themeModeContext } from "./themeModeContext";

const themeStorageKey = "themeMode";

function getInitialMode(): PaletteMode {
  const stored = localStorage.getItem(themeStorageKey);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(getInitialMode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

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
