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
 * Radius roles. Nested corners are concentric: outer = inner + the padding
 * between them, so each step is the one inside it plus its inset.
 *   xs   4  marks and items inside menus (12 menu − 8 list padding)
 *   sm   8  controls: inputs, buttons, icon buttons, segments, tab indicator
 *   md  12  menus, popovers, segmented tracks (8 + 4 inset), sub-panels
 *   lg  16  cards and page panels (8 control + 8 toolbar inset)
 *   xl  20  dialogs and the auth card (8 control + 12 dialog inset)
 *   page 24 the page canvas
 */
export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  page: 24,
  pill: 999,
  full: "50%",
} as const;

/* -------------------------------------------------------------------------- */
/* Spacing — one content inset for the whole app                               */
/* -------------------------------------------------------------------------- */

/**
 * Spacing is a strict 4px grid: every padding, margin and gap is a multiple
 * of 4px (the theme's `spacing` rounds each factor to the nearest half step).
 *
 * Standard content padding (theme spacing units: 1 = 8px, 0.5 = 4px).
 * Horizontal 8px on phones / 16px from `sm`; vertical 8px.
 * Use it for every container surface: page headers, panels, table toolbars
 * and cells, cards, dialog header/body/footer, menus. Compact controls
 * (chips, buttons, icon buttons, checkboxes) keep their own sizing.
 */
export const INSET_X = { xs: 1, sm: 1 } as const;
/** INSET_Y declaration used across the frontend. */
export const INSET_Y = { xs: 1, sm: 1 } as const;
/** inset Sx declaration used across the frontend. */
export const insetSx = { px: INSET_X, py: INSET_Y } as const;

/*
 * Spacing roles (theme units, 1 = 8px). Keep them separate: the dense INSET
 * above is for table cells and compact toolbars only; pages, cards and
 * controls have their own roles so nothing grows indiscriminately.
 */

/** Card body padding: 16px. */
export const CARD_PADDING = { xs: 2, sm: 2 } as const;
/** Table row height by density. Standard is the app's default table. */
export const ROW_HEIGHT = { compact: 40, standard: 52 } as const;
/** How tightly a table packs its rows. */
export type TableDensity = keyof typeof ROW_HEIGHT;
/** Control height in px (buttons, inputs, segmented controls). */
export const CONTROL_HEIGHT = { desktop: 36, touch: 40 } as const;
/** Widths for the pinned table action column: icons only / includes a text action. */

/** The spacing grid step (px). One theme unit is two steps (8px). */
export const GRID = 4;

/**
 * Theme spacing: any factor snaps to the nearest 4px step (0.25 → 4px,
 * 0.5 → 4px, 0.75 → 8px, 1.5 → 12px). Rounds away from zero both ways so
 * negative margins mirror positive ones.
 */
export const gridSpacing = (factor: number) =>
  Math.sign(factor) * Math.round(Math.abs(factor) * 2) * GRID;

/** Interaction timing: short and purposeful (honours reduced motion globally). */
export const MOTION_MS = { instant: 100, fast: 140, base: 200, slow: 260 } as const;

/** The app's one easing curve, as bezier points (for Motion). */
export const MOTION_EASE = [0.2, 0, 0, 1] as const;

/** The same scale as CSS values. `animations/presets.ts` reads MOTION_MS. */
export const MOTION = {
  instant: `${MOTION_MS.instant}ms`,
  fast: `${MOTION_MS.fast}ms`,
  base: `${MOTION_MS.base}ms`,
  slow: `${MOTION_MS.slow}ms`,
  easing: `cubic-bezier(${MOTION_EASE.join(", ")})`,
} as const;

/** Longest comfortable line for running text (characters). */
export const READING_MEASURE = "75ch";

/** Tabular figures for dates, hours, counts and metrics. */
export const TABULAR_NUMS = { fontVariantNumeric: "tabular-nums" } as const;

/**
 * Table cell padding (CSS px): denser than the container inset so data
 * columns keep their room — 8px on every side, on the 4px grid.
 */
export const CELL_PX = { x: 8, y: 8 } as const;

/** Same inset in CSS pixels, for theme style overrides. */
export const INSET_PX = {
  xs: { x: 8, y: 8 },
  sm: { x: 16, y: 8 },
} as const;

/** Radius as a CSS length string (e.g. `RADIUS_PX.md` -> "12px"). */
export const RADIUS_PX = {
  none: "0px",
  xs: `${RADIUS.xs}px`,
  sm: `${RADIUS.sm}px`,
  md: `${RADIUS.md}px`,
  lg: `${RADIUS.lg}px`,
  xl: `${RADIUS.xl}px`,
  page: `${RADIUS.page}px`,
  pill: `${RADIUS.pill}px`,
  full: RADIUS.full,
} as const;

/* -------------------------------------------------------------------------- */
/* Typography ramp                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Type scale in CSS px. Every font size in the app is one of these steps.
 * Dense desktop data sits at 14px; 12px is the floor for readable text.
 */
/** FONT declaration used across the frontend. */
export const FONT = {
  /** 12px: captions, pills, table headers, helper text. */
  xs: 12,
  /** 13px: buttons and compact table cells. */
  footnote: 13,
  /** 14px: body text, table cells, fields. */
  sm: 14,
  /** 16px: card and section titles. */
  headline: 16,
  /** 18px: section and dialog titles on phones. */
  md: 18,
  /** 22px: dialog titles, metric values. */
  lg: 22,
  /** 28px: page titles. */
  xl: 28,
  /** 34px: hero numbers. */
  xxl: 34,
  /** 42px: display figures and large empty-state glyphs. */
  xxxl: 42,
  /** 54px: the largest display glyphs. */
  display: 54,
} as const;

/** TYPOGRAPHY declaration used across the frontend. */
export const TYPOGRAPHY = {
  /**
   * Inter: built for screens, clear at small table sizes, with tabular
   * figures for hours and totals. Self-hosted (see main.tsx) so Chrome and
   * Edge render the same font everywhere; system fonts are the fallback.
   */
  fontFamily:
    '"Inter Variable", Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  /** Three weights only: hierarchy comes from size and colour, not boldness. */
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
  },
  /** Named roles on the type scale (FONT). */
  size: {
    caption2: FONT.xs,
    caption: FONT.xs,
    footnote: FONT.footnote,
    body: FONT.sm,
    callout: FONT.sm,
    headline: FONT.headline,
    title3: FONT.md,
    title2: FONT.lg,
    title1: FONT.xl,
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
/* Elevation — every shadow is tinted with the brand's deep blue, never black  */
/* -------------------------------------------------------------------------- */

/**
 * Shadow tint (RGB channels): a deep navy from the accent's hue family, so
 * shadows read as coloured depth on both the base and the surface layers.
 * Dark mode uses a near-black of the same hue (still tinted, not #000).
 */
export const SHADOW_TINT = {
  light: "11, 63, 92",
  dark: "2, 16, 26",
} as const;

/** `rgba()` of the shadow tint for a mode at the given opacity. */
export const shadowColor = (mode: PaletteMode, opacity: number) =>
  `rgba(${SHADOW_TINT[mode]}, ${opacity})`;

const elevation = (mode: PaletteMode, strength: number) => {
  const c = (opacity: number) => shadowColor(mode, opacity * strength);
  return {
    card: `0 1px 2px ${c(0.06)}, 0 1px 3px ${c(0.07)}`,
    cardHover: `0 2px 4px ${c(0.07)}, 0 8px 16px ${c(0.1)}`,
    menu: `0 4px 12px ${c(0.1)}, 0 16px 40px ${c(0.14)}`,
    /** One soft layer: dialogs float, they don't sit in a heavy frame. */
    dialog: `0 24px 56px ${c(0.22)}`,
    sidebar: `16px 0 32px ${c(0.18)}`,
    hero: `0 24px 80px ${c(0.32)}`,
    /** Selected segment in a toggle group or tab track. */
    segment: `0 1px 2px ${c(0.14)}`,
    /** Edge of a right-pinned column with content scrolling under it. */
    stickyEdge: `-8px 0 8px -8px ${c(0.3)}`,
    /** Edge of a left-pinned column with content scrolling under it. */
    stickyEdgeStart: `8px 0 8px -8px ${c(0.3)}`,
  };
};

/** ELEVATION declaration used across the frontend. */
export const ELEVATION = {
  light: elevation("light", 1),
  // Dark surfaces need a stronger shadow to read at all.
  dark: elevation("dark", 2.6),
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
 * Colour roles (60 : 30 : 10) — by area on screen.
 *
 * 60% Base      `surface` (palette.background.default): the app canvas —
 *               header, sidebar and the page area behind content.
 * 30% Surface   `surfaceRaised` (palette.background.paper): everything that
 *               holds content — cards, tables, panels, dialogs, menus, fields.
 * 10% Pop       `accent` (palette.primary) plus the status hues: the primary
 *               action, links, focus rings, selection marks and state pills.
 *               Selection uses a tonal tint of the accent, never a solid
 *               fill, so the pop stays a small share of the screen.
 */

interface ColorSet {
  /** App background. */
  surface: string;
  /** Raised surface: cards, dialogs, sidebar, inputs (paper). */
  surfaceRaised: string;
  /** Floating layers: menus, selects and popovers. */
  surfaceOverlay: string;
  /** Recessed bands: table headers and wells. */
  surfaceSunken: string;
  border: string;
  /** Field outlines: at least 3:1 against the field's surface. */
  borderControl: string;
  /** Keyboard focus ring: solid, at least 3:1 on every surface. */
  focusRing: string;
  textPrimary: string;
  textSecondary: string;
  /** Hints and captions: quieter than secondary, still AA on every surface. */
  textTertiary: string;
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

/** COLORS declaration used across the frontend. */
export const COLORS: Record<PaletteMode, ColorSet> = {
  light: {
    // Base: a cool grey canvas, one clear step below the white surface so
    // the two layers read apart.
    surface: "#ECEFF3",
    surfaceRaised: "#FFFFFF",
    surfaceOverlay: "#FFFFFF",
    surfaceSunken: "#F4F5F7",
    border: "#E2E4E9",
    borderControl: "#7E8591",
    focusRing: "#0B4F6C",
    textPrimary: "#1F2329",
    // Readable on the grey canvas and on tinted chips/rows too (≈6.6:1 on white).
    textSecondary: "#555C68",
    // AA on the grey canvas as well as on white.
    textTertiary: "#5F6773",
    // AA on white (≈4.5:1) so placeholder dashes and hints stay readable,
    // still a clear step lighter than secondary text.
    textDisabled: "#717782",
    accent: "#146C94",
    accentDark: "#0B4F6C",
    accentLight: "#4D9FC2",
    accentContrast: "#FFFFFF",
    secondary: "#5A5FC0",
    secondaryDark: "#4247A6",
    secondaryLight: "#8A8FDE",
    secondaryContrast: "#FFFFFF",
    // Status mains are AA as text on the canvas and white, except warning:
    // use STATUS_TONES for warning text.
    success: "#0E7C48",
    successDark: "#0A6B3D",
    successLight: "#43B984",
    successContrast: "#FFFFFF",
    warning: "#D97706",
    warningDark: "#A85800",
    warningLight: "#F0A93C",
    warningContrast: "#3D2600",
    danger: "#C63544",
    dangerDark: "#B02533",
    dangerLight: "#F16E7B",
    dangerContrast: "#FFFFFF",
    info: "#0B7590",
    infoDark: "#0A6C86",
    infoLight: "#4DBBD6",
    infoContrast: "#FFFFFF",
    actionHover: "rgba(20, 108, 148, 0.055)",
    actionSelected: "rgba(20, 108, 148, 0.11)",
    // Disabled controls: muted but still legible (≈3:1 on white).
    actionDisabled: "#8D95A0",
    actionDisabledBackground: "rgba(100, 116, 139, 0.14)",
  },
  dark: {
    // Base: the darkest layer (canvas and chrome); content surfaces sit one
    // clear step lighter so the two layers read apart.
    surface: "#0F1115",
    surfaceRaised: "#1B1E24",
    surfaceOverlay: "#26292F",
    surfaceSunken: "#23262C",
    border: "rgba(196, 200, 206, 0.18)",
    borderControl: "rgba(236, 238, 241, 0.36)",
    focusRing: "#A5D6EE",
    textPrimary: "#ECEEF1",
    textSecondary: "#A9AFB7",
    textTertiary: "#91979E",
    // Legible on raised and tinted dark surfaces (≥4.5:1).
    textDisabled: "#91979E",
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
    // Disabled controls: muted but still legible (≈3:1 on surfaces).
    actionDisabled: "#64696F",
    actionDisabledBackground: "rgba(190, 195, 202, 0.12)",
  },
};

/** The seven status tones: every workflow status maps to exactly one. */
export type StatusTone =
  | "info"
  | "progress"
  | "review"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

/** A tone's text, fill and dot. Each text/fill pair is at least 5.2:1. */
export interface StatusToneColors {
  text: string;
  fill: string;
  dot: string;
}

/** Status pill colours by theme: fixed pairs, never derived, so contrast is known. */
export const STATUS_TONES: Record<PaletteMode, Record<StatusTone, StatusToneColors>> = {
  light: {
    info: { text: "#1D5FBF", fill: "#E6F0FD", dot: "#3B82F6" },
    progress: { text: "#0B6E6E", fill: "#DFF4F2", dot: "#0D9488" },
    review: { text: "#5B36B8", fill: "#EEE9FB", dot: "#7C3AED" },
    success: { text: "#0A6B3D", fill: "#DFF3E8", dot: "#16A34A" },
    warning: { text: "#8A4B00", fill: "#FCEFD9", dot: "#D97706" },
    danger: { text: "#B02533", fill: "#FBE7E9", dot: "#DC2626" },
    neutral: { text: "#475467", fill: "#EEF0F3", dot: "#64748B" },
  },
  dark: {
    info: { text: "#9CC4F7", fill: "#1E2F47", dot: "#6FA8F5" },
    progress: { text: "#7FDCD2", fill: "#16373A", dot: "#3CC4B4" },
    review: { text: "#C4B5F7", fill: "#2E2850", dot: "#A48BF0" },
    success: { text: "#71D4A7", fill: "#17382B", dot: "#43C489" },
    warning: { text: "#F7CC78", fill: "#3D2F14", dot: "#F2B84B" },
    danger: { text: "#F58F99", fill: "#43222A", dot: "#F06A78" },
    neutral: { text: "#C3C9D1", fill: "#2A2E35", dot: "#8E96A3" },
  },
};

/**
 * One accent per tone, readable as a mark on both themes. Used where a single
 * colour is needed (charts, column bullets, calendar chips).
 */
export const STATUS_TONE_ACCENT: Record<StatusTone, string> = {
  info: "#3B82F6",
  progress: "#0D9488",
  review: "#7C3AED",
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
  neutral: "#64748B",
};

/** Which tone each workflow status belongs to. */
export const STATUS_TONE_OF: Record<string, StatusTone> = {
  // Initial / Informational
  open: "info",
  scheduled: "info",
  reopened: "info",

  // Workflow / Progress
  accepted: "progress",
  assigned: "progress",
  "in progress": "progress",
  unlocked: "progress",

  // Waiting on review, or changed after review
  submitted: "review",
  shared: "review",
  revised: "review",
  "recall successful": "review",

  // Successful / Positive
  completed: "success",
  ontime: "success",
  confirmed: "success",
  active: "success",

  // Attention / Warning
  pending: "warning",
  requested: "warning",
  "recall requested": "warning",
  "date revision": "warning",

  // Negative / Critical
  rejected: "danger",
  delayed: "danger",
  "not submitted": "danger",
  "not-satisfied": "danger",

  // Neutral / Inactive
  closed: "neutral",
  cancelled: "neutral",
  draft: "neutral",
  inactive: "neutral",
};

/** Status colours as single accents, from the status's tone. */
export const STATUS_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_TONE_OF).map(([status, tone]) => [status, STATUS_TONE_ACCENT[tone]]),
);

/** STATUS_COLOR_DEFAULT declaration used across the frontend. */
export const STATUS_COLOR_DEFAULT = STATUS_TONE_ACCENT.neutral;

/** The tone behind a status accent, or undefined for any other colour. */
export const toneOfColor = (color: string) =>
  (Object.keys(STATUS_TONE_ACCENT) as StatusTone[]).find(
    (tone) => STATUS_TONE_ACCENT[tone] === color,
  );

/** Categorical chart series: separate from status hues, so a bar never reads as a status. */
export const CHART_COLORS: Record<PaletteMode, readonly string[]> = {
  light: ["#2F7FC1", "#D9822B", "#2E9B74", "#C2508F", "#6F5BC4", "#A8901E", "#2B9BB0", "#CC5A45"],
  dark: ["#5AA9E6", "#F0A35E", "#5CC49B", "#E27FB4", "#A08EE6", "#D8C35A", "#62C6D6", "#EE8A77"],
};

/** ICPro Calendar entry accents (kept apart from workflow statuses). */
export const CALENDAR_ENTRY_COLORS = {
  event: "#2563EB",
  celebration: "#9333EA",
  holiday: "#16A34A",
  others: "#64748B",
} as const;

/** Misc existing surface tints kept verbatim (light-mode only usages). */
export const SURFACE_TINT = {
  /** Current-user comment bubble (light mode). */
  ownMessage: "#D7E8FB",
} as const;

/** Auth backdrop vignette and sheet edge (over a photo, in both themes). */
export const AUTH_VIGNETTE = "rgba(4, 24, 36, 0.55)";
export const AUTH_VIGNETTE_CLEAR = "rgba(4, 24, 36, 0)";
export const AUTH_SHEET_EDGE = { light: "#0B1A24", dark: "#FFFFFF" } as const;
