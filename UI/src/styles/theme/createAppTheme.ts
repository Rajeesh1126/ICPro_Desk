import { alpha, createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";
import { COLORS, ELEVATION, RADIUS, TYPOGRAPHY } from "../tokens";

export const appFontFamily = TYPOGRAPHY.fontFamily;

const buildPalette = (mode: PaletteMode) => {
  const c = COLORS[mode];

  return {
    primary: { main: c.accent, dark: c.accentDark, light: c.accentLight },
    secondary: {
      main: c.secondary,
      light: c.secondaryLight,
      dark: c.secondaryDark,
      contrastText: c.secondaryContrast,
    },
    background: { default: c.surface, paper: c.surfaceRaised },
    text: {
      primary: c.textPrimary,
      secondary: c.textSecondary,
      disabled: c.textDisabled,
    },
    divider: c.border,
    success: {
      main: c.success,
      light: c.successLight,
      dark: c.successDark,
      contrastText: c.successContrast,
    },
    warning: {
      main: c.warning,
      light: c.warningLight,
      dark: c.warningDark,
      contrastText: c.warningContrast,
    },
    error: {
      main: c.danger,
      light: c.dangerLight,
      dark: c.dangerDark,
      contrastText: c.dangerContrast,
    },
    info: {
      main: c.info,
      light: c.infoLight,
      dark: c.infoDark,
      contrastText: c.infoContrast,
    },
    action: {
      hover: c.actionHover,
      selected: c.actionSelected,
      disabled: c.actionDisabled,
      disabledBackground: c.actionDisabledBackground,
    },
  };
};

const lightPalette = buildPalette("light");

const darkPalette = buildPalette("dark");

export function createAppTheme(mode: PaletteMode) {
  const palette = mode === "dark" ? darkPalette : lightPalette;
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      ...palette,
    },
    // 12 is the MUI sx borderRadius multiplier base (theme.shape.borderRadius);
    // it is a scaling unit, not a visual radius token. Visual radii use RADIUS.*.
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: appFontFamily,
      h4: { fontWeight: 700, letterSpacing: 0, lineHeight: 1.22 },
      h5: { fontWeight: 700, letterSpacing: 0, lineHeight: 1.25 },
      h6: { fontWeight: 650, letterSpacing: 0, lineHeight: 1.3 },
      subtitle1: { fontWeight: 650, letterSpacing: 0, lineHeight: 1.35 },
      subtitle2: { fontWeight: 500, letterSpacing: 0, lineHeight: 1.45 },
      body1: { letterSpacing: 0, lineHeight: 1.55 },
      body2: { letterSpacing: 0, lineHeight: 1.5 },
      button: { fontWeight: 650, letterSpacing: 0 },
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
            borderRadius: RADIUS.sm,
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
      MuiInputBase: {
        styleOverrides: {
          root: {
            "& input:-webkit-autofill": {
              WebkitBoxShadow: `0 0 0 1000px ${palette.background.paper} inset !important`,
              WebkitTextFillColor: `${palette.text.primary} !important`,
              caretColor: palette.text.primary,
              transition: "background-color 9999s ease-out 0s",
            },
          },
        },
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
            borderRadius: RADIUS.sm,
            height: 36,
            textTransform: "none",
            padding: "4px 12px",
            gap: 6,
          },
        },
      },
      MuiToggleButton: {
        defaultProps: {
          size: "small",
        },
        styleOverrides: {
          root: {
            height: 36,
            textTransform: "none",
            fontWeight: 700,
          },
        },
      },
      MuiToggleButtonGroup: {
        defaultProps: {
          size: "small",
        },
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
      MuiIconButton: {
        defaultProps: {
          size: "small",
        },
      },
      MuiSvgIcon: {
        defaultProps: {
          fontSize: "small",
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
          rounded: { borderRadius: RADIUS.md },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${palette.divider}`,
            boxShadow: isDark ? ELEVATION.dark.card : ELEVATION.light.card,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS.sm,
            backgroundColor: isDark
              ? alpha(palette.text.primary, 0.03)
              : palette.background.paper,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          root: { borderRadius: RADIUS.xs },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            padding: "12px 12px",
            borderBottom: `1px solid ${palette.divider}`,
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: { padding: "12px 12px !important" },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: "12px 12px",
            borderTop: `1px solid ${palette.divider}`,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: 44,
            backgroundColor: alpha(palette.primary.main, isDark ? 0.16 : 0.08),
            borderRadius: RADIUS.sm,
            padding: 5,
            // width: "fit-content",
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 36,
            minWidth: 100,
            padding: "6px 16px",
            margin: "0px 4px",

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
              borderColor: isDark
                ? palette.primary.light
                : palette.primary.dark,
              // borderBottom: `3px solid ${
              //   isDark ? palette.primary.light : palette.primary.dark
              // }`,
              fontWeight: 700,
            },

            "&.Mui-disabled": {
              opacity: 0.4,
            },
          },
        },
      },
      MuiTableCell: {
        defaultProps: { size: "small" },
        styleOverrides: {
          root: {
            borderBottomColor: palette.divider,
            color: palette.text.primary,
            fontSize: "0.8125rem",
            lineHeight: 1.45,
          },
          head: {
            color: palette.text.primary,
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: 0,
            textTransform: "uppercase",
          },
        },
      },
      MuiTooltip: {
        defaultProps: { arrow: true },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 700 } },
      },
      MuiAlert: {
        styleOverrides: { root: { borderRadius: RADIUS.sm } },
      },
      MuiSkeleton: {
        styleOverrides: { root: { borderRadius: RADIUS.xs } },
      },
    },
  });
}
