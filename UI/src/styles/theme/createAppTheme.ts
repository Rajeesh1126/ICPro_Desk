import { alpha, createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";

export const appFontFamily =
  'Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const lightPalette = {
  primary: { main: "#146C94", dark: "#0B4F6C", light: "#4D9FC2" },
  secondary: { main: "#19A7CE" },
  background: { default: "#F4F7FB", paper: "#FFFFFF" },
  text: { primary: "#172033", secondary: "#64748B" },
  divider: "#E2E8F0",
  success: { main: "#16865B" },
  warning: { main: "#D97706" },
  error: { main: "#DC3B4B" },
};

const darkPalette = {
  primary: { main: "#41A8B9", dark: "#2D8DB8", light: "#A5DFF4" },
  secondary: { main: "#5ED4F0" },
  background: { default: "#101722", paper: "#182231" },
  text: { primary: "#EEF5FB", secondary: "#AAB8C8" },
  divider: "rgba(174, 190, 208, 0.22)",
  success: { main: "#4DBD8E" },
  warning: { main: "#F2B84B" },
  error: { main: "#F06A78" },
};

export function createAppTheme(mode: PaletteMode) {
  const palette = mode === "dark" ? darkPalette : lightPalette;
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      ...palette,
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: appFontFamily,
      h4: { fontWeight: 800 },
      h5: { fontWeight: 800 },
      h6: { fontWeight: 750 },
      button: { fontWeight: 700 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          "html, body, #root": { fontFamily: appFontFamily },
          body: { backgroundColor: palette.background.default },
          "button, input, textarea, select": { fontFamily: "inherit" },
          "*": {
            scrollbarColor: `${alpha(palette.text.secondary, isDark ? 0.7 : 0.58)} ${alpha(
              palette.background.paper,
              isDark ? 0.72 : 0.7,
            )}`,
            scrollbarWidth: "thin",
          },
          "::-webkit-scrollbar": {
            width: 10,
            height: 10,
          },
          "::-webkit-scrollbar-track": {
            backgroundColor: alpha(
              palette.background.paper,
              isDark ? 0.72 : 0.7,
            ),
          },
          "::-webkit-scrollbar-thumb": {
            backgroundColor: alpha(palette.text.secondary, isDark ? 0.7 : 0.58),
            border: `2px solid ${alpha(palette.background.paper, isDark ? 0.72 : 0.7)}`,
            borderRadius: 10,
          },
          "::-webkit-scrollbar-thumb:hover": {
            backgroundColor: palette.primary.main,
          },
          "::selection": {
            backgroundColor: alpha(palette.secondary.main, 0.28),
          },
          "*:focus-visible": {
            outline: `3px solid ${alpha(palette.primary.main, 0.35)}`,
            outlineOffset: 2,
          },
          "@media (prefers-reduced-motion: reduce)": {
            "*, *::before, *::after": {
              animationDuration: "0.01ms !important",
              animationIterationCount: "1 !important",
              scrollBehavior: "auto !important",
              transitionDuration: "0.01ms !important",
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            borderBottom: `1px solid ${palette.divider}`,
            backdropFilter: "blur(14px)",
          },
        },
      },
      MuiTextField: {
        defaultProps: { size: "small" },
      },
      MuiFormControl: {
        defaultProps: { size: "small" },
      },
      MuiCheckbox: {
        defaultProps: { size: "small" },
      },
      MuiButton: {
        defaultProps: {
          size: "small",
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            // minHeight: 40,
            textTransform: "none",
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            minHeight: 40,
            textTransform: "none",
            fontWeight: 700,
          },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            border: "1px solid palette.primary.main",
          },
          grouped: {
            color: isDark ? palette.primary.dark : palette.primary.light,

            "&:hover": {
              color: isDark ? palette.primary.light : palette.primary.dark,
              backgroundColor: alpha(
                isDark ? palette.primary.light : palette.primary.dark,
                isDark ? 0.14 : 0.08,
              ),
            },

            "&.Mui-selected": {
              color: isDark ? palette.primary.light : palette.primary.dark,
              backgroundColor: alpha(
                isDark ? palette.primary.light : palette.primary.dark,
                isDark ? 0.18 : 0.12,
              ),
            },

            "&.Mui-selected:hover": {
              color: isDark ? palette.primary.dark : palette.primary.light,
              backgroundColor: alpha(
                isDark ? palette.primary.dark : palette.primary.light,
                isDark ? 0.24 : 0.16,
              ),
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
          rounded: { borderRadius: 14 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${palette.divider}`,
            boxShadow: isDark
              ? "0 18px 48px rgba(0, 0, 0, 0.28)"
              : "0 10px 30px rgba(15, 23, 42, 0.06)",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: isDark ? alpha("#FFFFFF", 0.03) : "#FFFFFF",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 1 },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: 44,
            backgroundColor: alpha(palette.primary.main, isDark ? 0.16 : 0.08),
            borderRadius: 10,
            padding: 5,
            width: "fit-content",
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 36,
            minWidth: 100,
            padding: "6px 16px",
            margin: "0px 5px",

            textTransform: "none",
            fontSize: "0.875rem",
            fontWeight: 400,

            color: isDark ? palette.primary.dark : palette.primary.light,

            transition: "all 0.2s ease",

            "&:hover": {
              color: isDark ? palette.primary.light : palette.primary.dark,
            },

            "&.Mui-selected": {
              color: isDark ? palette.primary.light : palette.primary.dark,
              borderBottom: `3px solid ${
                isDark ? palette.primary.light : palette.primary.dark
              }`,
              fontWeight: 700,
            },

            "&.Mui-disabled": {
              opacity: 0.4,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderBottomColor: palette.divider },
          head: { fontWeight: 800 },
        },
      },
      MuiTooltip: {
        defaultProps: { arrow: true },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 700 } },
      },
      MuiAlert: {
        styleOverrides: { root: { borderRadius: 12 } },
      },
      MuiSkeleton: {
        styleOverrides: { root: { borderRadius: 8 } },
      },
    },
  });
}
