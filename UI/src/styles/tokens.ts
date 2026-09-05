/**
 * Design tokens — the single source of truth for the app's styling primitives.
 *
 * Every other file in `src/styles/` imports from here; no raw colour or radius
 * literals should live elsewhere. Colours are the existing palette values,
 * extracted verbatim and organised semantically as light/dark pairs.
 */

import type { PaletteMode } from "@mui/material";

/* -------------------------------------------------------------------------- */
/* Radius                                                                      */
/* -------------------------------------------------------------------------- */

export const RADIUS = {
  none: 0,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
  full: "50%",
} as const;

/** Radius as a CSS length string (e.g. `RADIUS_PX.md` -> "14px"). */
export const RADIUS_PX = {
  none: "0px",
  xs: `${RADIUS.xs}px`,
  sm: `${RADIUS.sm}px`,
  md: `${RADIUS.md}px`,
  lg: `${RADIUS.lg}px`,
  xl: `${RADIUS.xl}px`,
  pill: `${RADIUS.pill}px`,
  full: RADIUS.full,
} as const;

/* -------------------------------------------------------------------------- */
/* Spacing (4px base scale)                                                    */
/* -------------------------------------------------------------------------- */

export const SPACING = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/* -------------------------------------------------------------------------- */
/* Border (hairline widths + translucent border tints)                         */
/* -------------------------------------------------------------------------- */

export const BORDER = {
  hairline: 1,
  thin: 1,
  medium: 2,
} as const;

/* -------------------------------------------------------------------------- */
/* Blur (backdrop-filter strengths)                                            */
/* -------------------------------------------------------------------------- */

export const BLUR = {
  sm: 8,
  md: 14,
  lg: 24,
} as const;

/* -------------------------------------------------------------------------- */
/* Transition (durations + easing)                                             */
/* -------------------------------------------------------------------------- */

export const TRANSITION = {
  duration: {
    shortest: 120,
    shorter: 150,
    short: 200,
    standard: 250,
  },
  easing: {
    standard: "cubic-bezier(0.4, 0, 0.2, 1)",
    emphasized: "cubic-bezier(0.2, 0, 0, 1)",
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Z-index (mirrors MUI defaults; kept here so styles never hardcode numbers)  */
/* -------------------------------------------------------------------------- */

export const Z_INDEX = {
  drawer: 1200,
  appBar: 1201,
  modal: 1300,
  tooltip: 1500,
} as const;

/* -------------------------------------------------------------------------- */
/* Typography ramp                                                             */
/* -------------------------------------------------------------------------- */

export const TYPOGRAPHY = {
  fontFamily:
    'Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  weight: {
    regular: 400,
    medium: 500,
    semibold: 650,
    bold: 700,
    heavy: 800,
    black: 900,
  },
  size: {
    xxs: 11,
    xs: 12,
    sm: "0.8125rem",
    md: "0.875rem",
    lg: "0.95rem",
    xl: "1.25rem",
  },
  lineHeight: {
    tight: 1.2,
    snug: 1.3,
    normal: 1.45,
    relaxed: 1.55,
  },
  letterSpacing: {
    normal: 0,
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Elevation (layered soft shadows; existing values, light + dark variants)    */
/* -------------------------------------------------------------------------- */

export const ELEVATION = {
  light: {
    card: "0 10px 30px rgba(15, 23, 42, 0.06)",
    cardHover: "0 8px 24px rgba(15, 23, 42, 0.1)",
    menu: "0 18px 48px rgba(15, 23, 42, 0.14)",
    sidebar: "14px 0 34px rgba(15, 23, 42, 0.16)",
    hero: "0 24px 80px rgba(4, 39, 58, 0.28)",
  },
  dark: {
    card: "0 18px 48px rgba(0, 0, 0, 0.28)",
    cardHover: "0 10px 28px rgba(0, 0, 0, 0.32)",
    menu: "0 18px 48px rgba(0, 0, 0, 0.28)",
    sidebar: "14px 0 34px rgba(0, 0, 0, 0.34)",
    hero: "0 24px 80px rgba(4, 39, 58, 0.28)",
  },
} as const;

/** Translucent app-bar background (frosted header), light + dark. */
export const APPBAR_BG: Record<PaletteMode, string> = {
  light: "rgba(255, 255, 255, 0.96)",
  dark: "rgba(24, 34, 49, 0.94)",
};

/** Login hero overlay gradient (layered over the background image). */
export const HERO_OVERLAY =
  "linear-gradient(120deg, rgba(4, 39, 58, 0.78), rgba(20, 108, 148, 0.4))";

/* -------------------------------------------------------------------------- */
/* Colours — existing palette values, extracted verbatim                       */
/* -------------------------------------------------------------------------- */

interface ColorSet {
  /** App background. */
  surface: string;
  /** Raised surface: cards, dialogs, sidebar, inputs (paper). */
  surfaceRaised: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  accent: string;
  accentDark: string;
  accentLight: string;
  accentContrast: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  secondaryContrast: string;
  success: string;
  successDark: string;
  successLight: string;
  successContrast: string;
  warning: string;
  warningDark: string;
  warningLight: string;
  warningContrast: string;
  danger: string;
  dangerDark: string;
  dangerLight: string;
  dangerContrast: string;
  info: string;
  infoDark: string;
  infoLight: string;
  infoContrast: string;
  actionHover: string;
  actionSelected: string;
  actionDisabled: string;
  actionDisabledBackground: string;
}

export const COLORS: Record<PaletteMode, ColorSet> = {
  light: {
    surface: "#EDF1F8",
    surfaceRaised: "#F7FAFD",
    border: "#E2E8F0",
    textPrimary: "#3F4652",
    textSecondary: "#64748B",
    textDisabled: "#9AA6B6",
    accent: "#146C94",
    accentDark: "#0B4F6C",
    accentLight: "#4D9FC2",
    accentContrast: "#FFFFFF",
    secondary: "#5A5FC0",
    secondaryDark: "#4247A6",
    secondaryLight: "#8A8FDE",
    secondaryContrast: "#FFFFFF",
    success: "#0F8A50",
    successDark: "#0A6B3D",
    successLight: "#43B984",
    successContrast: "#FFFFFF",
    warning: "#D97706",
    warningDark: "#A85800",
    warningLight: "#F0A93C",
    warningContrast: "#3D2600",
    danger: "#DC3B4B",
    dangerDark: "#B02533",
    dangerLight: "#F16E7B",
    dangerContrast: "#FFFFFF",
    info: "#0E8FB0",
    infoDark: "#0A6C86",
    infoLight: "#4DBBD6",
    infoContrast: "#FFFFFF",
    actionHover: "rgba(20, 108, 148, 0.055)",
    actionSelected: "rgba(20, 108, 148, 0.11)",
    actionDisabled: "#AEB8C6",
    actionDisabledBackground: "rgba(100, 116, 139, 0.14)",
  },
  dark: {
    surface: "#101722",
    surfaceRaised: "#182231",
    border: "rgba(174, 190, 208, 0.22)",
    textPrimary: "#EEF5FB",
    textSecondary: "#AAB8C8",
    textDisabled: "#63707F",
    accent: "#41A8B9",
    accentDark: "#2D8DB8",
    accentLight: "#A5DFF4",
    accentContrast: "#FFFFFF",
    secondary: "#8E92E4",
    secondaryDark: "#6A6ECB",
    secondaryLight: "#B0B3EE",
    secondaryContrast: "#0B1020",
    success: "#43C489",
    successDark: "#2E9E6A",
    successLight: "#71D4A7",
    successContrast: "#07160E",
    warning: "#F2B84B",
    warningDark: "#C9922E",
    warningLight: "#F7CC78",
    warningContrast: "#241800",
    danger: "#F06A78",
    dangerDark: "#D24A58",
    dangerLight: "#F58F99",
    dangerContrast: "#1A0508",
    info: "#3BB6D6",
    infoDark: "#2492B2",
    infoLight: "#6FCEE6",
    infoContrast: "#04141B",
    actionHover: "rgba(65, 168, 185, 0.12)",
    actionSelected: "rgba(65, 168, 185, 0.2)",
    actionDisabled: "#4E5A69",
    actionDisabledBackground: "rgba(170, 184, 200, 0.14)",
  },
};

/**
 * Status colours for chips / dots / status text. Theme-independent single
 * values chosen to read on both light and dark surfaces; extracted verbatim
 * from the previous inline map and aligned to the semantic palette.
 */
export const STATUS_COLORS: Record<string, string> = {
  open: "#D97706",
  modified: "#7C3AED",
  reopened: "#0F766E",
  accepted: "#146C94",
  assigned: "#1499C0",
  completed: "#0F8A50",
  closed: "#64748B",
  rejected: "#DC3B4B",
  "not-satisfied": "#C2410C",
  "recall requested": "#A16207",
  "recall successful": "#4F46E5",
  submitted: "#146C94",
  ontime: "#0F8A50",
  delayed: "#DC3B4B",
  "not submitted": "#DC3B4B",
  requested: "#D97706",
  unlocked: "#0F766E",
};

export const STATUS_COLOR_DEFAULT = "#64748B";

/** Misc existing surface tints kept verbatim (light-mode only usages). */
export const SURFACE_TINT = {
  /** Current-user comment bubble (light mode). */
  ownMessage: "#D7E8FB",
  /** High-rating tile background (light mode). */
  positiveTile: "#F0F9F5",
} as const;
