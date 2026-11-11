/** App bar and account menu. */
import { alpha, type Theme } from "@mui/material/styles";
import { type AlphaStyleArgs } from "@/styles/shared/base";
import { type SxProps } from "@mui/material";
import { FONT, INSET_X, INSET_Y, RADIUS_PX, THEME_TOGGLE_COLORS, insetSx } from "@/styles/tokens";

// components/appBar/header.callback.styles.ts
export const notificationMenuHeaderSx =
  ({ alpha }: AlphaStyleArgs): SxProps<Theme> =>
  (theme) => ({
    ...insetSx,
    background:
      theme.palette.mode === "dark"
        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)}, ${alpha(theme.palette.secondary.main, 0.08)})`
        : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.08)})`,
  });

/** Shared notification menu header icon  styles style or helper for the related interface. */
export const notificationMenuHeaderIconSx =
  ({ alpha }: AlphaStyleArgs): SxProps<Theme> =>
  (theme) => ({
    width: 38,
    height: 38,
    borderRadius: RADIUS_PX.md,
    display: "grid",
    placeItems: "center",
    bgcolor: alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.108 : 0.1,
    ),
    color: "primary.main",
    flexShrink: 0,
  });

/** Shared notification menu self ticket item  styles style or helper for the related interface. */
export const notificationMenuSelfTicketItemSx =
  ({ alpha }: AlphaStyleArgs): SxProps<Theme> =>
  (theme) => ({
    m: 1,
    mb: 0.5,
    px: INSET_X,
    py: INSET_Y,
    gap: 1.25,
    borderRadius: RADIUS_PX.md,
    "&:hover": {
      bgcolor: alpha(
        theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.096 : 0.08,
      ),
    },
  });

/** Shared notification menu self ticket icon  styles style or helper for the related interface. */
export const notificationMenuSelfTicketIconSx =
  ({ alpha }: AlphaStyleArgs): SxProps<Theme> =>
  (theme) => ({
    width: 34,
    height: 34,
    borderRadius: RADIUS_PX.md,
    display: "grid",
    placeItems: "center",
    bgcolor: alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.108 : 0.1,
    ),
    color: "primary.main",
    flexShrink: 0,
  });

/** Shared notification menu ticket item  styles style or helper for the related interface. */
export const notificationMenuTicketItemSx =
  ({ alpha }: AlphaStyleArgs): SxProps<Theme> =>
  (theme) => ({
    m: 1,
    mt: 0.5,
    px: INSET_X,
    py: INSET_Y,
    gap: 1.25,
    borderRadius: RADIUS_PX.md,
    "&:hover": {
      bgcolor: alpha(
        theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.096 : 0.08,
      ),
    },
  });

/** Shared notification menu ticket icon  styles style or helper for the related interface. */
export const notificationMenuTicketIconSx =
  ({ alpha }: AlphaStyleArgs): SxProps<Theme> =>
  (theme) => ({
    width: 34,
    height: 34,
    borderRadius: RADIUS_PX.md,
    display: "grid",
    placeItems: "center",
    bgcolor: alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.108 : 0.1,
    ),
    color: "primary.main",
    flexShrink: 0,
  });

/** App-bar icon actions: neutral glyphs, a neutral fill on hover. */
export const headerIconButtonSx = (theme: Theme) => ({
  color: "text.secondary",
  "&:hover": {
    color: "text.primary",
    bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.1 : 0.06),
  },
});

/** App-bar theme toggle: the sun glyph in sun gold, the moon in moon blue. */
export const headerThemeToggleSx = (theme: Theme) => {
  const color =
    theme.palette.mode === "dark" ? THEME_TOGGLE_COLORS.sun : THEME_TOGGLE_COLORS.moon;
  return {
    color,
    "&:hover": {
      color,
      bgcolor: alpha(color, theme.palette.mode === "dark" ? 0.16 : 0.12),
    },
  };
};

/** Sidebar toggle (hamburger) at the start of the app bar. */
export const headerNavButtonSx: SxProps<Theme> = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  alignSelf: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  p: 0,
  mr: 0.5,
  color: "text.secondary",
  "&:hover": {
    color: "text.primary",
    bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.1 : 0.06),
  },
});

/* Account / notification menus: surface, radius and shadow come from MuiMenu. */
/** Shared header notification menu paper  styles style or helper for the related interface. */
export const headerNotificationMenuPaperSx: SxProps<Theme> = {
  width: "min(360px, calc(100vw - 24px))",
  mt: 1.25,
  overflow: "hidden",
};

/** Shared header profile menu paper  styles style or helper for the related interface. */
export const headerProfileMenuPaperSx: SxProps<Theme> = {
  width: "min(420px, calc(100vw - 24px))",
  maxHeight: "calc(100dvh - 96px)",
  mt: 2.5,
  overflow: "hidden",
};

/** Shared header menu list  styles style or helper for the related interface. */
export const headerMenuListSx: SxProps<Theme> = { p: 0 };

/* ---- App-bar account trigger ("Account settings") ---------------------- */

/**
 * Account capsule: avatar, name / role and a chevron in one pill with a faint
 * hairline. Hover deepens the fill; while the menu is open it takes a light
 * brand tint so it reads as the active control. Phones show avatar + chevron.
 */
export const headerAccountTriggerSx =
  (open = false): SxProps<Theme> =>
  (theme) => {
    const isDark = theme.palette.mode === "dark";
    const primary = theme.palette.primary.main;
    return {
      minWidth: 0,
      minHeight: 44,
      ml: { xs: 0.5, sm: 1.25 },
      px: { xs: 0.5, md: 0.5 },
      py: 0.375,
      gap: 1.25,
      borderRadius: RADIUS_PX.pill,
      border: "1px solid",
      borderColor: open
        ? alpha(primary, isDark ? 0.5 : 0.35)
        : alpha(theme.palette.text.primary, isDark ? 0.12 : 0.1),
      bgcolor: open
        ? alpha(primary, isDark ? 0.14 : 0.08)
        : alpha(theme.palette.text.primary, isDark ? 0.04 : 0.025),
      color: "text.primary",
      textTransform: "none",
      transition: theme.transitions.create(
        ["background-color", "border-color", "box-shadow"],
        { duration: theme.transitions.duration.shortest },
      ),
      "&:hover": {
        bgcolor: open
          ? alpha(primary, isDark ? 0.18 : 0.11)
          : alpha(theme.palette.text.primary, isDark ? 0.08 : 0.05),
        borderColor: open
          ? alpha(primary, isDark ? 0.6 : 0.45)
          : alpha(theme.palette.text.primary, isDark ? 0.2 : 0.16),
      },
      "&.Mui-focusVisible": {
        boxShadow: `0 0 0 3px ${alpha(primary, 0.35)}`,
      },
      "& .MuiButton-endIcon": { ml: { xs: 0.25, md: 0.5 }, mr: 0 },
    };
  };

/** Brand-gradient avatar with a thin ring, separated from the capsule fill. */
export const headerAccountAvatarSx: SxProps<Theme> = (theme) => ({
  width: 34,
  height: 34,
  fontSize: FONT.sm,
  fontWeight: 600,
  letterSpacing: "0.02em",
  color: theme.palette.primary.contrastText,
  backgroundColor: theme.palette.primary.main,
  backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main} 55%, ${theme.palette.primary.dark})`,
});

/** Shared header account text  styles style or helper for the related interface. */
export const headerAccountTextSx: SxProps<Theme> = {
  display: { xs: "none", md: "flex" },
  flexDirection: "column",
  gap: 0.125,
  minWidth: 0,
  maxWidth: 168,
  textAlign: "left",
};

/** Shared header account name  styles style or helper for the related interface. */
export const headerAccountNameSx: SxProps<Theme> = {
  fontSize: FONT.sm,
  fontWeight: 600,
  lineHeight: 1.2,
  letterSpacing: "-0.005em",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

/** Shared header account role  styles style or helper for the related interface. */
export const headerAccountRoleSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: FONT.xs,
  fontWeight: 500,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

/** Chevron: muted at rest, brand-coloured and flipped while the menu is open. */
export const headerAccountChevronSx =
  (open: boolean): SxProps<Theme> =>
  (theme) => ({
    fontSize: FONT.md,
    color: open ? theme.palette.primary.main : theme.palette.text.secondary,
    transform: open ? "rotate(180deg)" : "rotate(0deg)",
    transition: theme.transitions.create(["transform", "color"], {
      duration: theme.transitions.duration.shortest,
    }),
  });

/** Shared header avatar  styles style or helper for the related interface. */
export const headerAvatarSx: SxProps<Theme> = {
  width: { xs: 32, sm: 34 },
  height: { xs: 32, sm: 34 },
  bgcolor: "primary.main",
  fontWeight: 600,
  fontSize: { xs: FONT.sm, sm: FONT.sm },
};

/** Shared notification empty state  styles style or helper for the related interface. */
export const notificationEmptyStateSx: SxProps<Theme> = {
  px: INSET_X,
  py: INSET_Y,
  textAlign: "center",
};

/** Shared notification item text  styles style or helper for the related interface. */
export const notificationItemTextSx: SxProps<Theme> = { flex: 1 };

/** Shared profile username  styles style or helper for the related interface. */
export const profileUsernameSx: SxProps<Theme> = {
  display: "block",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0,
};

/** Shared profile truncated text  styles style or helper for the related interface. */
export const profileTruncatedTextSx: SxProps<Theme> = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  lineHeight: 1.2,
};

/** Shared app bar header profile text  styles style or helper for the related interface. */
export const appBarHeaderProfileTextSx: SxProps<Theme> = {
  minWidth: 0,
  flex: 1,
};

/** Shared app bar header profile body  styles style or helper for the related interface. */
export const appBarHeaderProfileBodySx: SxProps<Theme> = {
  maxHeight: "min(58dvh, 520px)",
  overflowY: "auto",
  ...insetSx,
};

/** Shared app bar header profile card  styles style or helper for the related interface. */
export const appBarHeaderProfileCardSx =
  ({ alpha }: AlphaStyleArgs): SxProps<Theme> =>
  (theme) => ({
    display: "grid",
    gap: 1.5,
    borderRadius: RADIUS_PX.md,
    bgcolor: alpha(
      theme.palette.background.paper,
      theme.palette.mode === "dark" ? 0 : 0.96,
    ),
  });

/** Shared app bar header profile header  styles style or helper for the related interface. */
export const appBarHeaderProfileHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  minWidth: 0,
};

/** Shared app bar header profile detail row  styles style or helper for the related interface. */
export const appBarHeaderProfileDetailRowSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: "28px 88px minmax(0, 1fr)",
  alignItems: "center",
  columnGap: 1,
  minWidth: 0,
};

/** Shared app bar header profile info icon  styles style or helper for the related interface. */
export const appBarHeaderProfileInfoIconSx =
  ({
    color = "primary",
  }: {
    color?: "primary" | "secondary" | "info";
  }): SxProps<Theme> =>
  (theme) => {
    const paletteColor =
      color === "info"
        ? theme.palette.info.main
        : color === "secondary"
          ? theme.palette.secondary.main
          : theme.palette.primary.main;

    return {
      width: 28,
      height: 28,
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      color: paletteColor,
    };
  };

/** Shared app bar header profile value  styles style or helper for the related interface. */
export const appBarHeaderProfileValueSx: SxProps<Theme> = {
  minWidth: 0,
  flex: 1,
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 0.75,
};

/** Active-filter count inside the (contained) Filters button. */
export const filterButtonCountSx: SxProps<Theme> = (theme) => ({
  ml: 0.75,
  minWidth: 20,
  height: 20,
  px: 0.5,
  borderRadius: RADIUS_PX.pill,
  display: "inline-grid",
  placeItems: "center",
  fontSize: FONT.xs,
  fontWeight: 600,
  color: theme.palette.primary.main,
  bgcolor: theme.palette.primary.contrastText,
});

/** Header action that moves into the account menu on phones. */
export const headerDesktopActionSx = {
  display: { xs: "none", sm: "inline-flex" },
} as const;

/** Account-menu button shown only on phones (its header icon is hidden there). */
export const headerPhoneMenuButtonSx: SxProps<Theme> = {
  whiteSpace: "nowrap",
  display: { xs: "flex", sm: "none" },
};

/** Shared app bar header profile footer button  styles style or helper for the related interface. */
export const appBarHeaderProfileFooterButtonSx: SxProps<Theme> = {
  whiteSpace: "nowrap",
};
