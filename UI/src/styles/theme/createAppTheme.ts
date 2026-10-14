import { alpha, createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";
import { COLORS, ELEVATION, INSET_PX, RADIUS, TYPOGRAPHY } from "../tokens";

/** The app-wide content inset as CSS, switching at the `sm` breakpoint. */
/**
 * The app-wide content inset, switching at the `sm` breakpoint.
 *
 * The breakpoint only changes CSS variables; `padding` itself is declared
 * once, outside any media query. That way a component's own `p`/`px`/`py`
 * (e.g. `p: 0` on a cell that wraps a nested table) always wins. A media
 * query that set `padding` directly would come later in the stylesheet and
 * silently override it from tablet width up.
 */
const insetPadding = (important = false) => ({
  "--inset-y": `${INSET_PX.xs.y}px`,
  "--inset-x": `${INSET_PX.xs.x}px`,
  "@media (min-width: 600px)": {
    "--inset-y": `${INSET_PX.sm.y}px`,
    "--inset-x": `${INSET_PX.sm.x}px`,
  },
  padding: `var(--inset-y) var(--inset-x)${important ? " !important" : ""}`,
});

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
            borderBottom: 0,
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
      MuiSelect: {
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
            borderRadius: RADIUS.md,
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
        styleOverrides: {
          root: {
            minWidth: 36,
            minHeight: 36,
            "@media (pointer: coarse)": {
              minWidth: 44,
              minHeight: 44,
            },
          },
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
            ...insetPadding(),
            borderBottom: `1px solid ${palette.divider}`,
            "& .MuiIconButton-root": {
              backgroundColor: alpha(palette.text.primary, isDark ? 0.1 : 0.07),
              color: palette.text.secondary,
              "&:hover": {
                backgroundColor: alpha(
                  palette.text.primary,
                  isDark ? 0.16 : 0.12,
                ),
              },
            },
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: insetPadding(true),
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            ...insetPadding(),
            borderTop: `1px solid ${palette.divider}`,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            backgroundColor: isDark
              ? alpha(palette.text.primary, 0.035)
              : alpha(palette.primary.main, 0.08),
            borderRadius: RADIUS.sm,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minWidth: 100,
            padding: "4px 12px",

            textTransform: "none",
            fontSize: "0.875rem",
            fontWeight: 400,

            color: palette.text.secondary,

            transition: "all 0.2s ease",

            "&:hover": {
              color: palette.primary.main,
            },

            "&.Mui-selected": {
              color: palette.primary.main,
              borderColor: palette.primary.main,
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
            ...insetPadding(),
            borderBottomColor: palette.divider,
            color: palette.text.primary,
            fontSize: "0.8125rem",
            lineHeight: 1.45,
          },
          head: {
            backgroundColor: palette.background.paper,
            color: palette.text.primary,
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: 0,
            position: "sticky",
            top: 0,
            textTransform: "uppercase",
            zIndex: 2,
          },
        },
      },
      // Keep dense, scrollable tables visually consistent. Individual tables
      // should only supply layout or behaviour that is unique to that view.
      MuiTableContainer: {
        styleOverrides: {
          root: {
            overflow: "auto",
            border: `1px solid ${palette.divider}`,
            borderRadius: RADIUS.md,
            backgroundColor: palette.background.paper,
            boxShadow: "none",
          },
        },
      },
      MuiTable: {
        defaultProps: {
          size: "small",
          stickyHeader: true,
        },
        styleOverrides: {
          root: {
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            "& .MuiTableCell-root": {
              boxSizing: "border-box",
            },
            "& .MuiTableCell-head": {
              backgroundColor: palette.background.paper,
              backgroundImage: `linear-gradient(${alpha(
                isDark ? palette.text.primary : palette.primary.main,
                isDark ? 0.045 : 0.12,
              )}, ${alpha(
                isDark ? palette.text.primary : palette.primary.main,
                isDark ? 0.045 : 0.12,
              )})`,
            },
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            ...insetPadding(),
            "&:last-child": { paddingBottom: "var(--inset-y)" },
          },
        },
      },
      MuiTooltip: {
        defaultProps: { arrow: true },
      },
      MuiChip: {
        defaultProps: {
          size: "small",
        },
        styleOverrides: { root: { fontSize: 12, fontWeight: 700 } },
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
