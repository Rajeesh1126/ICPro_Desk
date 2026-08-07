import { useMemo, useState } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import type { PaletteMode } from "@mui/material";
import { createAppTheme } from "./createAppTheme";
import { ThemeModeContext } from "./themeModeContext";

const THEME_STORAGE_KEY = "themeMode";

function getInitialMode(): PaletteMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
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
          localStorage.setItem(THEME_STORAGE_KEY, next);
          return next;
        });
      },
    }),
    [mode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
