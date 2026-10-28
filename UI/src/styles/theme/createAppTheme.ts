import { alpha, createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";
import { COLORS, CONTROL_HEIGHT, DIALOG_SECTION_PADDING, ELEVATION, INSET_PX, MOTION, RADIUS, TYPOGRAPHY } from "@/styles/tokens";

/** Short, purposeful transition for interactive surfaces. */
const ease = (...props: string[]) =>
  props.map((prop) => `${prop} ${MOTION.fast} ${MOTION.easing}`).join(", ");

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

/**
 * Padding for the dialog sections (title, content, actions): compact on
 * phones, roomier from `sm`. Same CSS-variable approach as `insetPadding`.
 */
const dialogPadding = (
  xs: [number, number],
  sm: [number, number],
  important = false,
) => ({
  "--dialog-py": `${xs[0]}px`,
  "--dialog-px": `${xs[1]}px`,
  "@media (min-width: 600px)": {
    "--dialog-py": `${sm[0]}px`,
    "--dialog-px": `${sm[1]}px`,
  },
  padding: `var(--dialog-py) var(--dialog-px)${important ? " !important" : ""}`,
});

export const appFontFamily = TYPOGRAPHY.fontFamily;

const buildPalette = (mode: PaletteMode) => {
  const c = COLORS[mode];

  return {
    primary: {
      main: c.accent,
      dark: c.accentDark,
      light: c.accentLight,
      contrastText: c.accentContrast,
    },
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
  const inputBackground = isDark
    ? alpha(palette.text.primary, 0.03)
    : palette.background.paper;

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
      // One ramp (TYPOGRAPHY.size): page titles 28, dialog/section titles 17,
      // body 14–15, supporting text 12–13. Weights stop at 600.
      fontWeightBold: TYPOGRAPHY.weight.semibold,
      h4: { fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.22 },
      h5: { fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.25 },
      h6: {
        fontWeight: 600,
        fontSize: TYPOGRAPHY.size.title3,
        letterSpacing: "-0.01em",
        lineHeight: 1.3,
      },
      subtitle1: { fontWeight: 600, fontSize: TYPOGRAPHY.size.callout, letterSpacing: 0, lineHeight: 1.35 },
      subtitle2: { fontWeight: 500, fontSize: TYPOGRAPHY.size.footnote, letterSpacing: 0, lineHeight: 1.45 },
      body1: { fontSize: TYPOGRAPHY.size.callout, letterSpacing: 0, lineHeight: 1.55 },
      body2: { fontSize: TYPOGRAPHY.size.body, letterSpacing: 0, lineHeight: 1.5 },
      caption: { fontSize: TYPOGRAPHY.size.caption, letterSpacing: 0, lineHeight: 1.4 },
      button: { fontWeight: 600, letterSpacing: 0 },
    },
    // Short, purposeful motion: dialogs, menus and accordions included.
    transitions: {
      duration: {
        shortest: 140,
        shorter: 180,
        short: 220,
        standard: 220,
        complex: 260,
        enteringScreen: 200,
        leavingScreen: 160,
      },
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
            backgroundColor: palette.text.secondary,
          },
          "::selection": {
            backgroundColor: alpha(palette.primary.main, 0.24),
          },
          "b, strong": { fontWeight: 600 },
          "*:focus-visible": {
            outline: `2px solid ${alpha(palette.primary.main, 0.7)}`,
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
            "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active": {
              WebkitBoxShadow: `0 0 0 1000px ${inputBackground} inset !important`,
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
            textTransform: "none",
            // Height and padding come from the size prop (small by default).
            gap: 6,
            fontWeight: 600,
            lineHeight: 1.5,
            transition: ease("background-color", "border-color", "box-shadow", "color"),
          },
          outlined: {
            backgroundColor: palette.background.paper,
            "&:hover": {
              borderColor: alpha(palette.text.primary, isDark ? 0.3 : 0.22),
              backgroundColor: alpha(palette.text.primary, isDark ? 0.05 : 0.03),
            },
          },
          // Secondary actions stay quiet: a neutral border, brand-coloured text.
          outlinedPrimary: {
            borderColor: alpha(palette.text.primary, isDark ? 0.22 : 0.16),
          },
          startIcon: { marginRight: 0 },
          endIcon: { marginLeft: 0 },
        },
      },
      MuiToggleButton: {
        defaultProps: {
          size: "small",
        },
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
          },
        },
      },
      // Compact macOS-style segmented control: a quiet track with the
      // selected segment raised on the paper surface in the brand colour.
      MuiToggleButtonGroup: {
        defaultProps: {
          size: "small",
        },
        styleOverrides: {
          root: {
            padding: 4,
            gap: 2,
            borderRadius: RADIUS.sm,
            backgroundColor: alpha(palette.text.primary, isDark ? 0.08 : 0.06),
          },
          grouped: {
            border: 0,
            borderRadius: `${RADIUS.sm - 2}px !important`,
            margin: "0 !important",
            minHeight: CONTROL_HEIGHT.desktop - 4,
            padding: "4px 8px",
            gap: 6,
            color: palette.text.secondary,
            transition: ease("background-color", "color", "box-shadow"),
            "&:hover": {
              color: palette.text.primary,
              backgroundColor: alpha(palette.text.primary, isDark ? 0.06 : 0.05),
            },
            "&.Mui-selected, &.Mui-selected:hover": {
              color: palette.primary.main,
              backgroundColor: isDark
                ? alpha(palette.text.primary, 0.18)
                : palette.background.paper,
              boxShadow: isDark
                ? `inset 0 0 0 1px ${alpha(palette.text.primary, 0.06)}`
                : "0 1px 2px rgba(16, 24, 40, 0.1)",
            },
            "&.Mui-disabled": { color: palette.text.disabled },
            "@media (pointer: coarse)": { minHeight: CONTROL_HEIGHT.touch - 4 },
          },
        },
      },
      MuiIconButton: {
        defaultProps: {
          size: "small",
        },
        styleOverrides: {
          // One shape for every icon button: a borderless glyph on a 36px
          // rounded-square hit area; the fill appears on hover only.
          root: {
            minWidth: 36,
            minHeight: 36,
            borderRadius: RADIUS.sm,
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
      // Depth comes from one cue: a soft shadow in light mode, a hairline
      // border in dark mode (where shadows don't read). Never both.
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS.md,
            border: isDark ? `1px solid ${palette.divider}` : 0,
            boxShadow: isDark ? "none" : ELEVATION.light.card,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS.sm,
            backgroundColor: inputBackground,
            // Field boundaries read against the surface without shouting.
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(palette.text.primary, isDark ? 0.2 : 0.24),
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(palette.text.primary, isDark ? 0.34 : 0.4),
            },
            "&.Mui-disabled": {
              backgroundColor: palette.action.disabledBackground,
            },
            "&.Mui-disabled .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(palette.text.primary, 0.14),
            },
            "& .MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: palette.text.secondary,
            },
            // Single-line small fields are 36px, the same as buttons.
            "& .MuiInputBase-inputSizeSmall:not(.MuiInputBase-inputMultiline)": {
              paddingTop: 7.25,
              paddingBottom: 7.25,
            },
            // Focus is shown by MUI's own primary-coloured outline only; an
            // extra ring would sit over the floating label and hide it.
          },
        },
      },
      // Keep the resting label centred in the 36px field.
      MuiInputLabel: {
        styleOverrides: {
          sizeSmall: {
            "&:not(.MuiInputLabel-shrink)": {
              transform: "translate(14px, 8px) scale(1)",
            },
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          inputRoot: {
            "&.MuiInputBase-sizeSmall": { paddingTop: 4.5, paddingBottom: 4.5 },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: RADIUS.md,
            border: `1px solid ${palette.divider}`,
            boxShadow: isDark ? ELEVATION.dark.menu : ELEVATION.light.menu,
          },
          list: { padding: 4 },
        },
      },
      // Menu / select options: a soft rounded highlight inside the menu, the
      // selected option tinted in the brand colour.
      MuiMenuItem: {
        styleOverrides: {
          root: {
            minHeight: 34,
            borderRadius: RADIUS.sm - 4,
            fontSize: TYPOGRAPHY.size.body,
            transition: ease("background-color", "color"),
            "&.Mui-selected": {
              backgroundColor: alpha(palette.primary.main, isDark ? 0.18 : 0.1),
              color: isDark ? palette.primary.light : palette.primary.dark,
            },
            "&.Mui-selected:hover, &.Mui-selected.Mui-focusVisible": {
              backgroundColor: alpha(palette.primary.main, isDark ? 0.24 : 0.14),
            },
            "@media (pointer: coarse)": { minHeight: 44 },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: { root: { borderRadius: RADIUS.pill, height: 4 } },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            borderRadius: RADIUS.md,
            border: `1px solid ${palette.divider}`,
            boxShadow: isDark ? ELEVATION.dark.menu : ELEVATION.light.menu,
          },
        },
      },
      /*
       * Dialog chrome — the single source for every dialog in the app.
       * Dialog / DialogTitle / DialogContent / DialogActions take their
       * padding, borders, backgrounds and phone margins from here only.
       * Components should not override these; per-dialog sx is limited to
       * content layout (fixed heights, flex/gap inside the body, sizes).
       */
      MuiDialog: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS.xs,
            "& .MuiBackdrop-root": {
              backgroundColor: alpha("#000", isDark ? 0.55 : 0.35),
              backdropFilter: "blur(1px)",
              WebkitBackdropFilter: "blur(1px)",
            },
            "& .MuiDialog-paper:not(.MuiDialog-paperFullScreen)": {
              borderRadius: RADIUS.lg,
              // A hairline edge only where the shadow can't separate the sheet.
              border: isDark ? `1px solid ${palette.divider}` : 0,
              boxShadow: isDark ? ELEVATION.dark.dialog : ELEVATION.light.dialog,
              // Phones: an 8px gutter instead of MUI's 32px.
              "@media (max-width: 599.95px)": {
                margin: 8,
                maxHeight: "calc(100% - 16px)",
                "&.MuiDialog-paperFullWidth": { width: "calc(100% - 16px)" },
              },
            },
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            ...dialogPadding(
              [DIALOG_SECTION_PADDING.title.xs.y, DIALOG_SECTION_PADDING.title.xs.x],
              [DIALOG_SECTION_PADDING.title.sm.y, DIALOG_SECTION_PADDING.title.sm.x],
            ),
            // One title style for every dialog: no icon, no colour, no rule.
            // 18px on phones, 20px from sm; inner headings inherit it.
            fontSize: 18,
            "@media (min-width: 600px)": { fontSize: 20 },
            fontWeight: 600,
            letterSpacing: "-0.015em",
            lineHeight: 1.3,
            color: palette.text.primary,
            "& h2, & .MuiTypography-h6": {
              fontSize: "inherit",
              fontWeight: 600,
              letterSpacing: "inherit",
              lineHeight: "inherit",
            },
            backgroundColor: palette.background.paper,
            "& .MuiIconButton-root": {
              color: palette.text.secondary,
              minWidth: 32,
              minHeight: 32,
              padding: 4,
              "&:hover": {
                color: palette.text.primary,
                backgroundColor: alpha(palette.text.primary, isDark ? 0.1 : 0.06),
              },
              "@media (pointer: coarse)": { minWidth: 44, minHeight: 44 },
            },
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            ...dialogPadding(
              [DIALOG_SECTION_PADDING.content.xs.y, DIALOG_SECTION_PADDING.content.xs.x],
              [DIALOG_SECTION_PADDING.content.sm.y, DIALOG_SECTION_PADDING.content.sm.x],
              true,
            ),
            minWidth: 0,
            // Without a title rule the body follows the title closely.
            ".MuiDialogTitle-root + &": { paddingTop: "4px !important" },
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            ...dialogPadding(
              [DIALOG_SECTION_PADDING.actions.xs.y, DIALOG_SECTION_PADDING.actions.xs.x],
              [DIALOG_SECTION_PADDING.actions.sm.y, DIALOG_SECTION_PADDING.actions.sm.x],
            ),
            borderTop: `1px solid ${palette.divider}`,
            columnGap: 8,
            rowGap: 8,
            alignItems: "center",
            "&:empty": { display: "none" },
            // A footer left with no buttons (e.g. a ticket with no available
            // actions) is hidden; dismissing is the header close icon.
            "&:not(:has(button))": { display: "none" },
            "&.MuiDialogActions-spacing > :not(style) ~ :not(style)": {
              marginLeft: 0,
            },
            // Cancel / Close: neutral, so only the primary action carries colour.
            "& .MuiButton-outlinedPrimary, & .MuiButton-textPrimary": {
              color: palette.text.primary,
            },
          },
        },
      },
      // Sortable columns always show a faint arrow, so users can tell
      // which headers sort before hovering them.
      MuiTableSortLabel: {
        styleOverrides: {
          root: {
            "& .MuiTableSortLabel-icon": { opacity: 0.3 },
            "&:hover .MuiTableSortLabel-icon": { opacity: 0.6 },
            "&.Mui-active .MuiTableSortLabel-icon": { opacity: 1 },
          },
        },
      },
      // Tabs read as a segmented control: a quiet track with the selected
      // tab raised on the paper surface; no sliding underline.
      MuiTabs: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(palette.text.primary, isDark ? 0.06 : 0.05),
            borderRadius: RADIUS.sm,
            // 2px track + 32px tabs = 36px, the shared control height.
            padding: 4,
            minHeight: 0,
          },
          indicator: { display: "none" },
          flexContainer: { gap: 2 },
          // The disabled scroll arrow would leave an empty gutter.
          scrollButtons: { "&.Mui-disabled": { display: "none" } },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minWidth: 96,
            minHeight: CONTROL_HEIGHT.desktop - 4,
            padding: "4px 12px",
            borderRadius: RADIUS.sm - 4,

            textTransform: "none",
            fontSize: TYPOGRAPHY.size.body,
            // Same weight selected or not, so labels never shift width.
            fontWeight: 500,

            color: palette.text.secondary,

            transition: ease("background-color", "color", "box-shadow"),

            "& .MuiTab-iconWrapper": { fontSize: 16 },

            "&:hover": {
              color: palette.text.primary,
              backgroundColor: alpha(palette.text.primary, isDark ? 0.05 : 0.04),
            },

            "&.Mui-selected": {
              color: palette.primary.main,
              backgroundColor: isDark
                ? alpha(palette.text.primary, 0.18)
                : palette.background.paper,
              boxShadow: isDark
                ? `inset 0 0 0 1px ${alpha(palette.text.primary, 0.06)}`
                : "0 1px 2px rgba(16, 24, 40, 0.1)",
            },

            // Unavailable, not broken: full opacity, disabled text colour.
            "&.Mui-disabled": {
              color: palette.text.disabled,
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
            fontVariantNumeric: "tabular-nums",
          },
          // The one table-header rule for the app: quiet label, one hairline.
          // Header band: an opaque tint a step darker than the even-row
          // zebra (1.8–2.5%), so it stays solid while sticky.
          head: {
            backgroundColor: palette.background.paper,
            backgroundImage: `linear-gradient(${alpha(
              palette.text.primary,
              isDark ? 0.07 : 0.05,
            )}, ${alpha(palette.text.primary, isDark ? 0.07 : 0.05)})`,
            color: palette.text.secondary,
            fontSize: TYPOGRAPHY.size.caption,
            fontWeight: 600,
            letterSpacing: "0.01em",
            position: "sticky",
            top: 0,
            textTransform: "none",
            zIndex: 2,
            borderBottom: `1px solid ${palette.divider}`,
          },
        },
      },
      // Keep dense, scrollable tables visually consistent. Individual tables
      // should only supply layout or behaviour that is unique to that view.
      MuiTableContainer: {
        styleOverrides: {
          root: {
            overflow: "auto",
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
            "& .MuiTableBody-root .MuiTableRow-root:hover > .MuiTableCell-root": {
              backgroundColor: alpha(palette.text.primary, isDark ? 0.035 : 0.025),
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
        styleOverrides: {
          tooltip: { borderRadius: RADIUS.xs + 2, fontSize: 12, fontWeight: 500 },
        },
      },
      MuiChip: {
        defaultProps: {
          size: "small",
        },
        styleOverrides: { root: { fontSize: 12, fontWeight: 600 } },
      },
      MuiFormHelperText: {
        styleOverrides: { root: { fontSize: 12, lineHeight: 1.45 } },
      },
      MuiAlert: {
        styleOverrides: { root: { borderRadius: RADIUS.md } },
      },
      MuiSnackbarContent: {
        styleOverrides: { root: { borderRadius: RADIUS.md } },
      },
      MuiSkeleton: {
        styleOverrides: { root: { borderRadius: RADIUS.xs } },
      },
    },
  });
}
