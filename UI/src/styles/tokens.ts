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

/**
 * Radius roles: xs small marks, sm inputs/buttons/segments (10px),
 * md cards/menus/panels (12px), lg dialogs (16px). xl is kept for the
 * login hero only.
 */
export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 10,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
  full: "50%",
} as const;

/* -------------------------------------------------------------------------- */
/* Spacing — one content inset for the whole app                               */
/* -------------------------------------------------------------------------- */

/**
 * Standard content padding (theme spacing units: 1 = 8px).
 * Horizontal 8px on phones / 12px from `sm`; vertical 4px / 8px.
 * Use it for every container surface: page headers, panels, table toolbars
 * and cells, cards, dialog header/body/footer, menus. Compact controls
 * (chips, buttons, icon buttons, checkboxes) keep their own sizing.
 */
export const INSET_X = { xs: 1, sm: 1.5 } as const;
export const INSET_Y = { xs: 0.5, sm: 1 } as const;
export const insetSx = { px: INSET_X, py: INSET_Y } as const;

/*
 * Spacing roles (theme units, 1 = 8px). Keep them separate: the dense INSET
 * above is for table cells and compact toolbars only; pages, cards and
 * controls have their own roles so nothing grows indiscriminately.
 */

/** Card body padding: 16px. */
export const CARD_PADDING = { xs: 2, sm: 2 } as const;
/** Control height in px (buttons, inputs, segmented controls). */
export const CONTROL_HEIGHT = { desktop: 36, touch: 40 } as const;
/** Widths for the pinned table action column: icons only / includes a text action. */

/** Shared padding scale for dialog title, body and footer sections (CSS px). */
export const DIALOG_SECTION_PADDING = {
  title: { xs: { y: 12, x: 16 }, sm: { y: 16, x: 24 } },
  content: { xs: { y: 16, x: 16 }, sm: { y: 20, x: 24 } },
  actions: { xs: { y: 12, x: 16 }, sm: { y: 12, x: 24 } },
} as const;

/** Interaction timing: short and purposeful (honours reduced motion globally). */
export const MOTION = {
  fast: "140ms",
  base: "180ms",
  slow: "220ms",
  easing: "cubic-bezier(0.2, 0, 0, 1)",
} as const;

/** Tabular figures for dates, hours, counts and metrics. */
export const TABULAR_NUMS = { fontVariantNumeric: "tabular-nums" } as const;

/** Same inset in CSS pixels, for theme style overrides. */
export const INSET_PX = {
  xs: { x: 8, y: 4 },
  sm: { x: 12, y: 8 },
} as const;

/** Radius as a CSS length string (e.g. `RADIUS_PX.md` -> "12px"). */
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
/* Typography ramp                                                             */
/* -------------------------------------------------------------------------- */

export const TYPOGRAPHY = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, "Helvetica Neue", Arial, sans-serif',
  /** Three weights only: hierarchy comes from size and colour, not boldness. */
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
  },
  /** The type ramp (px). Every text size in the app is one of these. */
  size: {
    caption2: 11,
    caption: 12,
    footnote: 13,
    body: 14,
    callout: 15,
    title3: 17,
    title2: 22,
    title1: 28,
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
    card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.05)",
    cardHover: "0 2px 4px rgba(16, 24, 40, 0.05), 0 6px 16px rgba(16, 24, 40, 0.08)",
    menu: "0 4px 12px rgba(16, 24, 40, 0.08), 0 16px 36px rgba(16, 24, 40, 0.12)",
    /** One soft layer: dialogs float, they don't sit in a heavy frame. */
    dialog: "0 24px 56px rgba(16, 24, 40, 0.18)",
    sidebar: "14px 0 34px rgba(15, 23, 42, 0.16)",
    hero: "0 24px 80px rgba(4, 39, 58, 0.28)",
  },
  dark: {
    card: "0 1px 2px rgba(0, 0, 0, 0.3)",
    cardHover: "0 2px 4px rgba(0, 0, 0, 0.3), 0 8px 20px rgba(0, 0, 0, 0.32)",
    menu: "0 6px 16px rgba(0, 0, 0, 0.32), 0 18px 40px rgba(0, 0, 0, 0.36)",
    dialog: "0 24px 56px rgba(0, 0, 0, 0.5)",
    sidebar: "14px 0 34px rgba(0, 0, 0, 0.34)",
    hero: "0 24px 80px rgba(4, 39, 58, 0.28)",
  },
} as const;

/**
 * App-bar theme toggle glyphs: a warm sun (shown in dark mode) and a soft
 * moon blue (shown in light mode; the lightest blue that keeps 3:1 contrast
 * on white).
 */
export const THEME_TOGGLE_COLORS = {
  sun: "#F5B83D",
  moon: "#7B93C8",
} as const;

/** Login hero overlay gradient (layered over the background image). */
export const HERO_OVERLAY =
  "linear-gradient(120deg, rgba(4, 39, 58, 0.78), rgba(20, 108, 148, 0.4))";

/* -------------------------------------------------------------------------- */
/* Colours — existing palette values, extracted verbatim                       */
/* -------------------------------------------------------------------------- */

/**
 * Colour roles (60 : 30 : 10). The app is primary-led; pick colours by role,
 * not by component.
 *
 * 60% Neutral   surface, surfaceRaised, border, textPrimary/Secondary.
 *               Page and card backgrounds, body text, table cells, dividers,
 *               and row-level actions (view/edit/download use the default
 *               icon colour so they stay quieter than the record identifier).
 * 30% Primary   accent* (palette.primary). Primary buttons, links, focus
 *               rings, selected navigation/tabs/toggles, page-level icons.
 * 10% Signal    One layer at a time: status (success/warning/danger/info and
 *               STATUS_COLORS) for state, or secondary for rare emphasis
 *               such as chart series and badges. Never use secondary for
 *               selection, and always pair a status colour with text or an icon.
 */

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
    // Neutral, macOS-like surfaces: a soft grey canvas with white, opaque
    // raised surfaces for cards, tables, forms and dialogs.
    surface: "#f7f7fa",
    surfaceRaised: "#FFFFFF",
    border: "#E2E4E9",
    textPrimary: "#1F2329",
    textSecondary: "#5F6673",
    // Legible on white (≈3.9:1) so disabled values and hints stay readable.
    textDisabled: "#7D8490",
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
    surface: "#131518",
    // A neutral raised surface keeps cards, the sidebar, and the app bar
    // distinct without making the dark UI read as an accent-colour wash.
    surfaceRaised: "#1C1E22",
    border: "rgba(196, 200, 206, 0.18)",
    textPrimary: "#ECEEF1",
    textSecondary: "#A9AFB7",
    // Legible on raised dark surfaces (≈4.9:1).
    textDisabled: "#8A9098",
    // A lighter step of the light-mode ocean blue (same hue family), with
    // dark text on filled surfaces for AA contrast.
    accent: "#4BA6D1",
    accentDark: "#3B95C0",
    accentLight: "#A5D6EE",
    accentContrast: "#071A24",
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
    // Keep interaction feedback evident without washing dark surfaces in the
    // accent colour.
    actionHover: "rgba(236, 238, 241, 0.05)",
    actionSelected: "rgba(75, 166, 209, 0.1)",
    actionDisabled: "#51565D",
    actionDisabledBackground: "rgba(190, 195, 202, 0.12)",
  },
};

/**
 * Status colour families. Every status maps to one of six semantic hues so
 * the same meaning always looks the same. Values are mid-tones that read on
 * both light and dark surfaces; pills derive their per-mode tint with alpha.
 */
const STATUS_FAMILY = {
  /** Waiting to start / not yet picked up. */
  info: "#3B6FD8",
  /** Moving through the workflow (brand hue). */
  progress: "#1F86B3",
  success: "#0F8A50",
  warning: "#B45309",
  danger: "#DC3B4B",
  /** Rare, revision-type states that must stand apart from the rest. */
  special: "#6D5BD0",
  neutral: "#64748B",
} as const;

export const STATUS_COLORS: Record<string, string> = {
  // Blue, so "open" never reads as an amber reminder / warning.
  open: STATUS_FAMILY.info,
  scheduled: STATUS_FAMILY.info,
  reopened: STATUS_FAMILY.info,
  accepted: STATUS_FAMILY.progress,
  assigned: STATUS_FAMILY.progress,
  "in progress": STATUS_FAMILY.progress,
  submitted: STATUS_FAMILY.progress,
  shared: STATUS_FAMILY.progress,
  unlocked: STATUS_FAMILY.progress,
  completed: STATUS_FAMILY.success,
  ontime: STATUS_FAMILY.success,
  confirmed: STATUS_FAMILY.success,
  active: STATUS_FAMILY.success,
  pending: STATUS_FAMILY.warning,
  requested: STATUS_FAMILY.warning,
  "recall requested": STATUS_FAMILY.warning,
  "date revision": STATUS_FAMILY.warning,
  rejected: STATUS_FAMILY.danger,
  delayed: STATUS_FAMILY.danger,
  "not submitted": STATUS_FAMILY.danger,
  "not-satisfied": STATUS_FAMILY.danger,
  revised: STATUS_FAMILY.special,
  "recall successful": STATUS_FAMILY.special,
  closed: STATUS_FAMILY.neutral,
  cancelled: STATUS_FAMILY.neutral,
  draft: STATUS_FAMILY.neutral,
  inactive: STATUS_FAMILY.neutral,
};

export const STATUS_COLOR_DEFAULT = STATUS_FAMILY.neutral;

/** Misc existing surface tints kept verbatim (light-mode only usages). */
export const SURFACE_TINT = {
  /** Current-user comment bubble (light mode). */
  ownMessage: "#D7E8FB",
  /** High-rating tile background (light mode). */
  positiveTile: "#F0F9F5",
} as const;
