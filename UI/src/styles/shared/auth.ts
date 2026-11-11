/** Sign-in pages. */
import { type SxProps } from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
import {
  AUTH_SHEET_EDGE,
  AUTH_VIGNETTE,
  AUTH_VIGNETTE_CLEAR,
  ELEVATION,
  FONT,
  HERO_OVERLAY,
  MOTION,
  RADIUS_PX,
} from "@/styles/tokens";

// pages/Login.dynamic.styles.ts
/* -------------------------------------------------------------------------- */
/* Sign-in pages: Login, Forgot password, Reset password                       */
/* -------------------------------------------------------------------------- */

/**
 * Photo backdrop, calmed with the brand overlay plus a soft vignette so the
 * sign-in sheet is the clear focus.
 */
export const authPageBackgroundSx = ({
  bgImage,
}: {
  bgImage: string;
}): SxProps<Theme> => ({
  minHeight: "100dvh",
  width: "100%",
  display: "grid",
  placeItems: "center",
  p: { xs: 2, sm: 3 },
  position: "relative",
  backgroundImage: `radial-gradient(120% 90% at 50% 45%, ${AUTH_VIGNETTE_CLEAR} 0%, ${AUTH_VIGNETTE} 100%), ${HERO_OVERLAY}, url(${bgImage})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
});

/**
 * Frosted sheet: a translucent surface over a blurred backdrop, a hairline
 * edge and one soft, deep shadow. Opaque fallback where blur is unsupported.
 */
export const authCardSx: SxProps<Theme> = (theme) => {
  const isDark = theme.palette.mode === "dark";
  return {
    width: "min(100%, 420px)",
    borderRadius: RADIUS_PX.xl,
    border: `1px solid ${alpha(AUTH_SHEET_EDGE[theme.palette.mode], isDark ? 0.1 : 0.08)}`,
    bgcolor: theme.palette.background.paper,
    boxShadow: isDark ? ELEVATION.dark.hero : ELEVATION.light.hero,
    // Theme toggle: the sheet eases between light and dark instead of snapping.
    transition: `background-color ${MOTION.slow} ${MOTION.easing}, border-color ${MOTION.slow} ${MOTION.easing}, box-shadow ${MOTION.slow} ${MOTION.easing}`,
    "@media (prefers-reduced-motion: reduce)": { transition: "none" },
    "@supports (backdrop-filter: blur(1px))": {
      // Light: almost solid white so the photo doesn't tint the sheet grey;
      // dark keeps more translucency for depth.
      bgcolor: alpha(theme.palette.background.paper, isDark ? 0.8 : 0.96),
      backdropFilter: "blur(24px) saturate(160%)",
      WebkitBackdropFilter: "blur(24px) saturate(160%)",
    },
  };
};

/**
 * Sheet content. Form controls are styled here (not per field) so all three
 * sign-in forms share one rhythm: 44px fields with 12px corners, a 24px
 * title, and alerts that match the field radius.
 */
export const authCardContentSx: SxProps<Theme> = (theme) => ({
  position: "relative",
  px: { xs: 3, sm: 4.5 },
  pt: { xs: 4, sm: 5 },
  pb: { xs: 3, sm: 4 },
  "&:last-child": { pb: { xs: 3, sm: 4 } },
  "& h1": {
    fontSize: { xs: FONT.lg, sm: FONT.lg },
    fontWeight: 600,
    letterSpacing: "-0.02em",
    lineHeight: 1.25,
    color: theme.palette.text.primary,
  },
  "& .MuiOutlinedInput-root": {
    minHeight: 44,
    // Same control radius as the app's fields and buttons.
    borderRadius: RADIUS_PX.sm,
    // Light: pure white fields on the white sheet; dark: a subtle inset.
    bgcolor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.background.paper, 0.4)
        : theme.palette.background.paper,
    "& .MuiOutlinedInput-input": { py: 1.25 },
    "& .MuiInputAdornment-positionStart .MuiSvgIcon-root": {
      color: theme.palette.text.secondary,
    },
  },
  "& .MuiInputLabel-root:not(.MuiInputLabel-shrink)": {
    transform: "translate(40px, 12px) scale(1)",
  },
  "& .MuiAlert-root": {
    borderRadius: RADIUS_PX.md,
    fontSize: FONT.sm,
    alignItems: "center",
  },
});

/** Theme toggle: a quiet glyph in the corner, neutral until hovered. */
export const authThemeToggleSx: SxProps<Theme> = (theme) => ({
  position: "absolute",
  top: { xs: 10, sm: 14 },
  right: { xs: 10, sm: 14 },
  color: "text.secondary",
  "&:hover": {
    color: "text.primary",
    bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.1 : 0.06),
  },
});

/** Shared auth logo  styles style or helper for the related interface. */
export const authLogoSx: SxProps<Theme> = {
  display: "block",
  width: 132,
  height: 48,
  objectFit: "contain",
  mx: "auto",
  mb: 4,
};

/** Primary action: full width, 44px, with a soft brand glow (none on hover lift). */
export const authSubmitButtonSx: SxProps<Theme> = (theme) => ({
  mt: 3,
  // Matches the 44px fields above it.
  minHeight: 44,
  borderRadius: RADIUS_PX.sm,
  fontSize: FONT.sm,
  fontWeight: 600,
  boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.28 : 0.3)}`,
  "&:hover": {
    boxShadow: `0 10px 24px ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.34 : 0.36)}`,
  },
  "&.Mui-disabled": { boxShadow: "none" },
});

/** Shared auth spinner  styles style or helper for the related interface. */
export const authSpinnerSx: SxProps<Theme> = { mr: 1 };

/** Shared auth footnote  styles style or helper for the related interface. */
export const authFootnoteSx: SxProps<Theme> = {
  mt: 1.5,
  fontSize: FONT.xs,
  lineHeight: 1.5,
};
