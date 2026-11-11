import { alpha, createTheme, keyframes } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";
import {
  MotionAnchoredMenuTransition,
  MotionDialogTransition,
  MotionTabIndicator,
  MotionToastTransition,
} from "@/animations/muiTransitions";
import {
  CELL_PX,
  COLORS,
  CONTROL_HEIGHT,
  ELEVATION,
  GRID,
  gridSpacing,
  INSET_PX,
  MOTION,
  RADIUS,
  RADIUS_PX,
  READING_MEASURE,
  shadowColor,
  TYPOGRAPHY,
  FONT,
} from "@/styles/tokens";

/** Inner padding of every segmented-control track (px, on the 4px grid). */
const SEGMENT_INSET = 4;

/** Feedback (validation text, alerts) eases in instead of popping. */
const feedbackEnter = keyframes`
  from { opacity: 0; transform: translateY(-3px); }
  to { opacity: 1; transform: none; }
`;
const feedbackAnimation = {
  animation: `${feedbackEnter} ${MOTION.base} ${MOTION.easing}`,
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
};

/** Rating stars pop as they fill, left to right. */
const ratingPop = keyframes`
  0% { transform: scale(0.6); }
  60% { transform: scale(1.22); }
  100% { transform: scale(1); }
`;

/** A checkbox's tick pops in when it becomes checked. */
const checkPop = keyframes`
  0% { transform: scale(0.55); }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); }
`;

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

/** app Font Family declaration used across the frontend. */
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

/** create App Theme declaration used across the frontend. */
export function createAppTheme(mode: PaletteMode) {
  const palette = mode === "dark" ? darkPalette : lightPalette;
  const isDark = mode === "dark";
  // Floating layers (menus, select/autocomplete lists) in dark mode.
  const colors = COLORS[mode];
  const overlaySurface = colors.surfaceOverlay;
  const inputBackground = isDark
    ? alpha(palette.text.primary, 0.03)
    : palette.background.paper;

  return createTheme({
    palette: {
      mode,
      ...palette,
    },
    // Strict 4px grid: every sx/Stack/Grid spacing value snaps to 4px steps.
    spacing: gridSpacing,
    // 12 is the MUI sx borderRadius multiplier base (theme.shape.borderRadius);
    // it is a scaling unit, not a visual radius token. Visual radii use RADIUS.*.
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: appFontFamily,
      // One scale (FONT, 14px base): every variant sits on a named step.
      fontSize: FONT.sm,
      htmlFontSize: 16,
      fontWeightBold: TYPOGRAPHY.weight.semibold,
      h1: {
        fontSize: FONT.display,
        fontWeight: 600,
        letterSpacing: "-0.02em",
        lineHeight: 1.1,
      },
      h2: {
        fontSize: FONT.xxxl,
        fontWeight: 600,
        letterSpacing: "-0.02em",
        lineHeight: 1.12,
      },
      h3: {
        fontSize: FONT.xxl,
        fontWeight: 600,
        letterSpacing: "-0.015em",
        lineHeight: 1.18,
      },
      h4: {
        fontSize: FONT.xl,
        fontWeight: 600,
        letterSpacing: "-0.01em",
        lineHeight: 1.22,
      },
      h5: {
        fontSize: FONT.lg,
        fontWeight: 600,
        letterSpacing: "-0.01em",
        lineHeight: 1.25,
      },
      h6: {
        fontWeight: 600,
        fontSize: FONT.md,
        letterSpacing: "-0.01em",
        lineHeight: 1.3,
      },
      subtitle1: {
        fontWeight: 600,
        fontSize: FONT.md,
        letterSpacing: 0,
        lineHeight: 1.35,
      },
      subtitle2: {
        fontWeight: 500,
        fontSize: FONT.sm,
        letterSpacing: 0,
        lineHeight: 1.45,
      },
      body1: { fontSize: FONT.sm, letterSpacing: 0, lineHeight: 1.5 },
      body2: { fontSize: FONT.sm, letterSpacing: 0, lineHeight: 1.45 },
      caption: { fontSize: FONT.xs, letterSpacing: 0, lineHeight: 1.35 },
      overline: {
        fontSize: FONT.xs,
        letterSpacing: "0.06em",
        lineHeight: 1.35,
      },
      button: { fontSize: FONT.footnote, fontWeight: 600, letterSpacing: 0 },
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
          // The spacing and radius scales as CSS variables, for plain CSS.
          ":root": {
            ...Object.fromEntries(
              [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16].map((n) => [
                `--space-${n}`,
                `${n * GRID}px`,
              ]),
            ),
            ...Object.fromEntries(
              Object.entries(RADIUS_PX).map(([k, v]) => [`--radius-${k}`, v]),
            ),
          },
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
          // Reading measure: running text never runs past 75 characters a
          // line. Labels, table cells and headings are short and unaffected.
          "p, .MuiTypography-body1, .MuiTypography-body2, .MuiFormHelperText-root, .MuiAlert-message, .MuiDialogContentText-root":
            {
              maxWidth: READING_MEASURE,
            },
          "*:focus-visible": {
            outline: `2px solid ${colors.focusRing}`,
            outlineOffset: 2,
          },
          // Increased contrast: stronger hairlines on the same surfaces.
          "@media (prefers-contrast: more)": {
            ".MuiDivider-root, .MuiTableCell-root": {
              borderColor: `${palette.text.secondary} !important`,
            },
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: `${palette.text.primary} !important`,
            },
          },
          // Windows High Contrast: the system colours take over, so state
          // drawn with a fill needs a real outline.
          "@media (forced-colors: active)": {
            ".Mui-selected": { outline: "2px solid Highlight" },
            ".MuiButton-root, .MuiIconButton-root": { border: "1px solid ButtonText" },
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
            "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active":
              {
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
        styleOverrides: {
          root: {
            // Only the box being clicked/keyed (it has focus) pops, so rows
            // that virtualized tables remount while scrolling stay still.
            "&.Mui-checked:has(input:focus) .MuiSvgIcon-root": {
              animation: `${checkPop} ${MOTION.slow} ${MOTION.easing}`,
            },
            "@media (prefers-reduced-motion: reduce)": {
              "&.Mui-checked:has(input:focus) .MuiSvgIcon-root": {
                animation: "none",
              },
            },
          },
        },
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
            gap: 8,
            fontWeight: 600,
            lineHeight: 1.5,
            transition: `${ease("background-color", "border-color", "box-shadow", "color")}, transform ${MOTION.fast} ${MOTION.easing}`,
            // Press feedback: a brief scale-down while the pointer is held.
            "&:active:not(.Mui-disabled)": { transform: "scale(0.97)" },
            "@media (prefers-reduced-motion: reduce)": {
              "&:active:not(.Mui-disabled)": { transform: "none" },
            },
          },
          // 8px grid: 8px above and below, 16px at the sides (8px for text
          // buttons). Outlined buttons count their 1px border, so they
          // measure 8 / 16 too and match the contained height.
          sizeMedium: { padding: "8px 16px" },
          sizeSmall: {
            padding: "0 8px",
            minHeight: 32,
            "@media (pointer: coarse)": { minHeight: CONTROL_HEIGHT.touch },
          },
          outlinedSizeMedium: { padding: "7px 15px" },
          outlinedSizeSmall: { padding: "0 7px" },
          textSizeMedium: { padding: "8px 8px" },
          outlined: {
            backgroundColor: palette.background.paper,
            "&:hover": {
              borderColor: alpha(palette.text.primary, isDark ? 0.3 : 0.22),
              backgroundColor: alpha(
                palette.text.primary,
                isDark ? 0.05 : 0.03,
              ),
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
      // ButtonBase resets `outline` with a class selector, which beats the
      // global `*:focus-visible` ring; restore it for keyboard focus.
      MuiButtonBase: {
        styleOverrides: {
          root: {
            "&.Mui-focusVisible": {
              outline: `2px solid ${colors.focusRing}`,
              outlineOffset: 2,
            },
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
            fontWeight: 600,
            color: palette.text.secondary,
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
          // The app's one segmented-control style (every ToggleButtonGroup,
          // animated or not): an outlined track with a 4px inset, so the
          // selected segment floats inside it with a visible gap on every
          // side and never merges into a white surface in light mode. The
          // whole control stays the standard control height.
          root: {
            padding: SEGMENT_INSET,
            gap: SEGMENT_INSET,
            // Inset hairline, not a border, so the 4px inset is the true gap.
            boxShadow: `inset 0 0 0 1px ${palette.divider}`,
            // Track = segment (sm) + the inset around it.
            borderRadius: RADIUS.md,
            backgroundColor: alpha(palette.text.primary, isDark ? 0.06 : 0.05),
            // Full width: equal segments that shrink to fit (weekdays on phones).
            "&.MuiToggleButtonGroup-fullWidth .MuiToggleButton-root": {
              flex: "1 1 0",
              minWidth: 0,
              paddingInline: 4,
            },
          },
          grouped: {
            border: 0,
            borderRadius: `calc(${RADIUS.md}px - ${SEGMENT_INSET}px) !important`,
            margin: "0 !important",
            // Control height minus the inset on both sides.
            minHeight: CONTROL_HEIGHT.desktop - SEGMENT_INSET * 2,
            padding: "0 12px",
            gap: 8,
            fontSize: FONT.sm,
            color: palette.text.secondary,
            "& .MuiSvgIcon-root": { color: "inherit", fontSize: FONT.md },
            transition: ease("background-color", "color", "box-shadow"),
            "&:hover": {
              color: palette.text.primary,
              backgroundColor: alpha(
                palette.text.primary,
                isDark ? 0.06 : 0.05,
              ),
            },
            // Selected: the raised surface with accent text in both modes. A
            // solid accent fill would push the accent past its 10% share.
            "&.Mui-selected, &.Mui-selected:hover": {
              color: isDark ? palette.primary.light : palette.primary.main,
              backgroundColor: isDark
                ? alpha(palette.primary.main, 0.2)
                : palette.background.paper,
              // Light mode: a hairline edge so the white segment reads on white.
              boxShadow: isDark
                ? ELEVATION.dark.segment
                : `0 0 0 1px ${alpha(palette.primary.main, 0.3)}, ${ELEVATION.light.segment}`,
            },
            "&.Mui-disabled": { color: palette.text.disabled },
            "@media (pointer: coarse)": {
              minHeight: CONTROL_HEIGHT.touch - SEGMENT_INSET * 2,
            },
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
            // 8px around a 20px glyph = the 36px hit area (MUI's 5px is off-grid).
            "&.MuiIconButton-sizeSmall": { padding: 8 },
            transition: `${ease("background-color", "color")}, transform ${MOTION.fast} ${MOTION.easing}`,
            "&:active:not(.Mui-disabled)": { transform: "scale(0.92)" },
            "@media (prefers-reduced-motion: reduce)": {
              "&:active:not(.Mui-disabled)": { transform: "none" },
            },
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
          // Cards: 8px controls in an 8px toolbar inset (8 + 8).
          rounded: { borderRadius: RADIUS.lg },
        },
      },
      // Depth comes from one cue: a soft shadow in light mode, a hairline
      // border in dark mode (where shadows don't read). Never both.
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS.lg,
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
            // At least 3:1 against the field surface.
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.borderControl,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(palette.text.primary, isDark ? 0.52 : 0.66),
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
            // 12px text inset (4px grid) instead of MUI's 14px. Select keeps
            // its own right padding for the arrow.
            "& .MuiInputBase-input:not(.MuiInputBase-inputAdornedStart)": {
              paddingLeft: 12,
            },
            "& .MuiInputBase-input:not(.MuiInputBase-inputAdornedEnd):not(.MuiSelect-select)":
              {
                paddingRight: 12,
              },
            "&.MuiInputBase-adornedStart": { paddingLeft: 12 },
            "&.MuiInputBase-adornedEnd": { paddingRight: 12 },
            // Single-line small fields are 36px, the same as buttons.
            "& .MuiInputBase-inputSizeSmall:not(.MuiInputBase-inputMultiline)":
              {
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
              transform: "translate(12px, 8px) scale(1)",
            },
          },
          // Labels start at the fields' 12px text inset.
          outlined: {
            "&:not(.MuiInputLabel-shrink):not(.MuiInputLabel-sizeSmall)": {
              transform: "translate(12px, 16px) scale(1)",
            },
            "&.MuiInputLabel-shrink": {
              transform: "translate(12px, -9px) scale(0.75)",
            },
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          inputRoot: {
            // paddingLeft 4 + the input's own 8 = the fields' 12px text inset.
            "&.MuiInputBase-sizeSmall": {
              paddingTop: 4.5,
              paddingBottom: 4.5,
              paddingLeft: 4,
            },
          },
          // Same shape as menus: a 12px list, 8px padding, 4px options;
          // and the same lifted surface in dark mode.
          paper: {
            borderRadius: RADIUS.md,
            ...(isDark && { backgroundColor: overlaySurface }),
          },
          listbox: {
            padding: 8,
            "& .MuiAutocomplete-option": { borderRadius: RADIUS.md - 8 },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: RADIUS.md,
            border: `1px solid ${palette.divider}`,
            // Dark mode: one step lighter than the surface it opens over
            // (dialogs, cards), so the menu reads as a layer above it.
            ...(isDark && { backgroundColor: overlaySurface }),
            boxShadow: isDark ? ELEVATION.dark.menu : ELEVATION.light.menu,
          },
          list: { padding: 8 },
        },
      },
      // Menu / select options: a soft rounded highlight inside the menu, the
      // selected option tinted in the brand colour.
      MuiMenuItem: {
        styleOverrides: {
          root: {
            minHeight: 34,
            // Nested in the 12px menu with 8px list padding: 12 − 8 = 4.
            borderRadius: RADIUS.md - 8,
            fontSize: TYPOGRAPHY.size.body,
            transition: ease("background-color", "color"),
            // Hover and keyboard highlight: a faint brand tint (not MUI's flat
            // grey), a clear step below the selected option.
            "&:hover, &.Mui-focusVisible": {
              backgroundColor: alpha(palette.primary.main, isDark ? 0.1 : 0.06),
            },
            "&.Mui-selected": {
              backgroundColor: alpha(palette.primary.main, isDark ? 0.18 : 0.1),
              color: isDark ? palette.primary.light : palette.primary.dark,
            },
            "&.Mui-selected:hover, &.Mui-selected.Mui-focusVisible": {
              backgroundColor: alpha(
                palette.primary.main,
                isDark ? 0.24 : 0.14,
              ),
            },
            "@media (pointer: coarse)": { minHeight: 44 },
          },
        },
      },
      // Every scrim (dialogs, drawers) uses the shadow tint, not flat black.
      MuiBackdrop: {
        styleOverrides: {
          root: {
            "&:not(.MuiBackdrop-invisible)": {
              backgroundColor: shadowColor(mode, isDark ? 0.7 : 0.4),
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: { root: { borderRadius: RADIUS.pill, height: 4 } },
      },
      MuiPopover: {
        // Menus, selects and popovers grow out of their trigger.
        defaultProps: { slots: { transition: MotionAnchoredMenuTransition } },
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
        // Motion-driven scale-and-fade (src/animations/muiTransitions.tsx).
        defaultProps: { slots: { transition: MotionDialogTransition } },
        styleOverrides: {
          root: {
            borderRadius: RADIUS.xs,
            "& .MuiBackdrop-root": {
              // Scrim in the shadow tint, not flat black.
              backgroundColor: shadowColor(mode, isDark ? 0.7 : 0.4),
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(1px)",
            },
            "& .MuiDialog-paper:not(.MuiDialog-paperFullScreen)": {
              // 8px controls in the dialog's 12px side inset: 8 + 12.
              borderRadius: RADIUS.xl,
              // A hairline edge only where the shadow can't separate the sheet.
              border: isDark ? `1px solid ${palette.divider}` : 0,
              boxShadow: isDark
                ? ELEVATION.dark.dialog
                : ELEVATION.light.dialog,
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
            padding: 12,
            // One title style for every dialog: no icon, no colour, no rule.
            // 18px on phones, 20px from sm; inner headings inherit it.
            fontSize: FONT.md,
            "@media (min-width: 600px)": { fontSize: FONT.lg },
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
              minWidth: 36,
              minHeight: 36,
              padding: 8,
              "&:hover": {
                color: palette.text.primary,
                backgroundColor: alpha(
                  palette.text.primary,
                  isDark ? 0.1 : 0.06,
                ),
              },
              "@media (pointer: coarse)": { minWidth: 44, minHeight: 44 },
            },
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            // !important: MUI zeroes the top padding after a DialogTitle.
            padding: "12px !important",
            minWidth: 0,
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: 12,
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
            // 8px before the arrow, none after (MUI's 4px + 4px is off-grid).
            "& .MuiTableSortLabel-icon": {
              opacity: 0.3,
              marginLeft: 8,
              marginRight: 0,
            },
            "&:hover .MuiTableSortLabel-icon": { opacity: 0.6 },
            "&.Mui-active .MuiTableSortLabel-icon": { opacity: 1 },
          },
        },
      },
      // Tabs read as a segmented control: a quiet track with the selected
      // tab raised on the paper surface; no sliding underline.
      MuiTabs: {
        // Spring-driven indicator (src/animations/muiTransitions.tsx).
        defaultProps: { slots: { indicator: MotionTabIndicator } },
        styleOverrides: {
          root: {
            // Same track as the segmented controls: an inset hairline and a
            // 4px inset, so the selected tab floats inside it instead of
            // merging into a white page in light mode. 28px tabs + 2 × 4px
            // keep the whole control 36px.
            backgroundColor: alpha(palette.text.primary, isDark ? 0.06 : 0.05),
            boxShadow: `inset 0 0 0 1px ${palette.divider}`,
            borderRadius: RADIUS.md,
            padding: SEGMENT_INSET,
            minHeight: 0,
          },
          // The raised segment is the indicator itself, so it slides
          // between tabs instead of the highlight jumping.
          indicator: {
            top: 0,
            bottom: "auto",
            height: "100%",
            borderRadius: `calc(${RADIUS.md}px - ${SEGMENT_INSET}px) !important`,
            // Same look as the selected toggle segment (tonal, not solid).
            backgroundColor: isDark
              ? alpha(palette.primary.main, 0.2)
              : palette.background.paper,
            // Light mode: a brand hairline so the white segment reads on white.
            boxShadow: isDark
              ? ELEVATION.dark.segment
              : `inset 0 0 0 1px ${alpha(palette.primary.main, 0.3)}, ${ELEVATION.light.segment}`,
            // Motion animates position and width; no CSS transition.
            transition: "none",
          },
          flexContainer: { gap: SEGMENT_INSET },
          // The disabled scroll arrow would leave an empty gutter.
          scrollButtons: { "&.Mui-disabled": { display: "none" } },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minWidth: 96,
            // The track's inset on both sides makes up the control height.
            minHeight: CONTROL_HEIGHT.desktop - SEGMENT_INSET * 2,

            textTransform: "none",
            fontSize: TYPOGRAPHY.size.body,
            // Same weight selected or not, so labels never shift width.
            fontWeight: 500,

            color: palette.text.secondary,

            transition: ease("background-color", "color", "box-shadow"),

            "& .MuiTab-iconWrapper": { fontSize: FONT.md },

            "&:hover": {
              color: palette.text.primary,
              borderRadius: `calc(${RADIUS.md}px - ${SEGMENT_INSET}px) !important`,
              backgroundColor: alpha(
                palette.text.primary,
                isDark ? 0.05 : 0.04,
              ),
            },

            // Sits above the sliding indicator, which draws the selection.
            zIndex: 1,
            "&.Mui-selected": {
              color: isDark ? palette.primary.light : palette.primary.main,
              backgroundColor: "transparent",
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
            // Dense data cells (8px all round); containers use the wider inset.
            "--inset-y": `${CELL_PX.y}px`,
            "--inset-x": `${CELL_PX.x}px`,
            padding: "var(--inset-y) var(--inset-x)",
            borderBottomColor: palette.divider,
            color: palette.text.primary,
            fontSize: FONT.sm,
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
            letterSpacing: 0,
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
            // Row hover is a tint layered over each cell's own background, not
            // a replacement for it: pinned (sticky) cells keep their solid
            // surface, so content scrolling underneath never shows through.
            "& .MuiTableBody-root .MuiTableRow-root:hover > .MuiTableCell-root":
              {
                backgroundImage: `linear-gradient(${alpha(palette.text.primary, isDark ? 0.035 : 0.025)}, ${alpha(palette.text.primary, isDark ? 0.035 : 0.025)})`,
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
          tooltip: {
            borderRadius: RADIUS.xs + 2,
            fontSize: FONT.xs,
            fontWeight: 500,
          },
        },
      },
      MuiChip: {
        defaultProps: {
          size: "small",
        },
        styleOverrides: {
          root: { fontSize: FONT.xs, fontWeight: 600 },
          // 8px label inset (MUI's small chip uses 7px).
          labelSmall: { paddingInline: 8 },
        },
      },
      MuiRating: {
        styleOverrides: {
          root: {
            "& .MuiRating-iconFilled": {
              animation: `${ratingPop} ${MOTION.slow} ${MOTION.easing} both`,
            },
            // Stagger by position so a new rating fills in order.
            ...Object.fromEntries(
              [1, 2, 3, 4, 5].map((n) => [
                `& > :nth-of-type(${n}) .MuiRating-iconFilled`,
                { animationDelay: `${(n - 1) * 45}ms` },
              ]),
            ),
            "@media (prefers-reduced-motion: reduce)": {
              "& .MuiRating-iconFilled": { animation: "none" },
            },
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            fontSize: FONT.xs,
            lineHeight: 1.35,
            // 8px below the field; the side inset stays aligned with the
            // field's text (MUI's 4px top margin is off-grid).
            marginTop: 8,
            "&.Mui-error": feedbackAnimation,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: RADIUS.md, ...feedbackAnimation },
        },
      },
      MuiSnackbar: {
        defaultProps: { slots: { transition: MotionToastTransition } },
      },
      MuiSnackbarContent: {
        styleOverrides: { root: { borderRadius: RADIUS.md } },
      },
      MuiSwitch: {
        defaultProps: { size: "small" },
      },
      MuiRadio: {
        defaultProps: { size: "small" },
      },
      MuiSkeleton: {
        styleOverrides: { root: { borderRadius: RADIUS.xs } },
      },
    },
  });
}
