/** Phone row cards and the status pill. */
import { type SxProps } from "@mui/material";
import { alpha, darken, keyframes, lighten, type Theme } from "@mui/material/styles";
import {
  FONT,
  MOTION,
  RADIUS_PX,
  STATUS_TONES,
  toneOfColor,
  type StatusTone,
} from "@/styles/tokens";

// components/common/MobileRowCard.tsx — a table row as a phone card
export const mobileRowCardSx = ({
  accent,
  clickable,
}: {
  accent: string;
  clickable: boolean;
}): SxProps<Theme> => ({
  width: "100%",
  // Long phone lists: off-screen cards skip layout and paint.
  contentVisibility: "auto",
  containIntrinsicBlockSize: "auto 160px",
  px: 1.5,
  py: 1.25,
  textAlign: "left",
  color: "text.primary",
  bgcolor: "background.paper",
  borderRadius: RADIUS_PX.sm,
  borderLeft: "3px solid",
  borderLeftColor: accent,
  cursor: clickable ? "pointer" : "default",
  display: "flex",
  flexDirection: "column",
  gap: 1,
});

/** Shared mobile row card header  styles style or helper for the related interface. */
export const mobileRowCardHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1,
  minWidth: 0,
  fontWeight: 600,
  fontSize: FONT.sm,
  "& > :first-of-type": { minWidth: 0, overflowWrap: "anywhere" },
};

/** Shared mobile row card fields  styles style or helper for the related interface. */
export const mobileRowCardFieldsSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: "minmax(88px, 0.8fr) minmax(0, 1.6fr)",
  columnGap: 1.25,
  rowGap: 0.75,
  alignItems: "start",
};

/** One label/value pair; its children sit directly in the fields grid. */
export const mobileRowCardFieldPairSx: SxProps<Theme> = { display: "contents" };

/** Shared mobile row card label  styles style or helper for the related interface. */
export const mobileRowCardLabelSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: FONT.xs,
  fontWeight: 600,
  lineHeight: 1.4,
};

/** Shared mobile row card value  styles style or helper for the related interface. */
export const mobileRowCardValueSx: SxProps<Theme> = {
  minWidth: 0,
  fontSize: FONT.sm,
  lineHeight: 1.4,
  overflowWrap: "anywhere",
  "& .MuiIconButton-root": { width: 40, height: 40 },
};

/** Shared mobile row card footer  styles style or helper for the related interface. */
export const mobileRowCardFooterSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1,
  minHeight: 32,
};

/** Shared mobile row card more  styles style or helper for the related interface. */
export const mobileRowCardMoreSx: SxProps<Theme> = {
  // Phones: a 44px tap target (it was 32px).
  "@media (pointer: coarse)": { minHeight: 44 },
  px: 0.5,
  minWidth: 0,
  fontSize: FONT.xs,
  fontWeight: 600,
  textTransform: "none",
};

// components/common/Pill.tsx — the one pill look app-wide (status, priority, tags)
export const checkRipple = keyframes`
  0% { transform: scale(0.55); }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); }
`;

/**
 * Roles "grant all": each permission tick pops in turn, `delayMs` after the
 * first, so the change reads as sweeping across the row.
 */
export const checkRippleSx = (delayMs: number): SxProps<Theme> => ({
  "&.Mui-checked .MuiSvgIcon-root": {
    animation: `${checkRipple} ${MOTION.slow} ${MOTION.easing} both`,
    animationDelay: `${delayMs}ms`,
  },
  "@media (prefers-reduced-motion: reduce)": {
    "&.Mui-checked .MuiSvgIcon-root": { animation: "none" },
  },
});

/** Palette keys a pill colour may name instead of a CSS colour. */
export const PILL_PALETTE_KEYS = ["primary", "secondary", "success", "warning", "error", "info"] as const;

export type PillPaletteKey = (typeof PILL_PALETTE_KEYS)[number];

/** Semantic palette keys that share a status tone. */
export const PILL_KEY_TONES: Partial<Record<PillPaletteKey, StatusTone>> = {
  success: "success",
  warning: "warning",
  error: "danger",
  info: "info",
};

/**
 * The one pill look (components/common/Pill): a fixed 26px capsule with a
 * tinted fill. `color` is a palette key or any CSS colour; `dot` adds the
 * leading status dot.
 */
export const pillSx =
  (color: string, dot = false): SxProps<Theme> =>
  (theme) => {
    const isDark = theme.palette.mode === "dark";
    const key = PILL_PALETTE_KEYS.find((name) => name === color) as PillPaletteKey | undefined;
    // Status colours and semantic palette keys use the fixed tone pairs.
    const statusTone = key ? PILL_KEY_TONES[key] : toneOfColor(color);
    const pair = statusTone ? STATUS_TONES[theme.palette.mode][statusTone] : null;
    const tone = pair?.dot ?? (key ? theme.palette[key].main : color);
    // Anything else keeps its hue: darkened in light mode, lightened in dark,
    // far enough to hold AA on its own 12% tint.
    const text =
      pair?.text ??
      (key
        ? isDark
          ? theme.palette[key].light
          : theme.palette[key].dark
        : isDark
          ? lighten(tone, 0.6)
          : darken(tone, 0.4));
    return {
      display: "inline-flex",
      alignItems: "center",
      alignSelf: "center",
      gap: 1,
      maxWidth: "100%",
      px: 1.25,
      py: 0.5,
      boxSizing: "border-box",
      borderRadius: RADIUS_PX.pill,
      fontSize: FONT.xs,
      fontWeight: 600,
      lineHeight: 1.35,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      verticalAlign: "middle",
      color: text,
      bgcolor: pair?.fill ?? alpha(tone, isDark ? 0.22 : 0.12),
      // A value change cross-fades to the new colour (Pill also pulses).
      transition: "background-color 300ms ease, color 300ms ease",
      "& .MuiSvgIcon-root": { fontSize: FONT.sm, flexShrink: 0 },
      ...(dot && {
        "&::before": {
          content: '""',
          flexShrink: 0,
          width: 6,
          height: 6,
          borderRadius: "50%",
          bgcolor: tone,
          transition: "background-color 300ms ease",
        },
      }),
    };
  };

/** Timesheet grid: same footprint as the expand toggle, for rows with nothing to expand. */
export const expandToggleSpacerSx = {
  width: 40,
  flexShrink: 0,
} satisfies SxProps<Theme>;
