/** ICPro Calendar page. */
import { type SxProps } from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
import { FONT, RADIUS_PX, READING_MEASURE } from "@/styles/tokens";

/* -------------------------------------------------------------------------- */
/* ICPro Calendar page                                                         */
/* -------------------------------------------------------------------------- */

/** Shared calendar detail content  styles style or helper for the related interface. */
export const calendarDetailContentSx = {
  display: "grid",
  gap: 2,
} satisfies SxProps<Theme>;

/** Shared calendar detail summary  styles style or helper for the related interface. */
export const calendarDetailSummarySx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
  gap: 1.5,
} satisfies SxProps<Theme>;

/** Key entry information shown as compact, equal-height summary cards. */
export const calendarDetailWhenSx: SxProps<Theme> = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 1.25,
  minWidth: 0,
  p: 1.5,
  border: "1px solid",
  borderColor: "divider",
  // outer = inner + padding: 4px icon tile + 12px padding = 16px.
  borderRadius: RADIUS_PX.lg,
  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.09 : 0.035),
});

/** Shared calendar detail when icon  styles style or helper for the related interface. */
export const calendarDetailWhenIconSx: SxProps<Theme> = (theme) => ({
  width: 38,
  height: 38,
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  borderRadius: RADIUS_PX.sm,
  color: "primary.main",
  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.16 : 0.1),
  "& .MuiSvgIcon-root": { fontSize: FONT.lg },
});

/** Shared calendar detail label  styles style or helper for the related interface. */
export const calendarDetailLabelSx = {
  color: "text.secondary",
  fontSize: FONT.xs,
  fontWeight: 600,
  lineHeight: 1.3,
  mb: 0.25,
} satisfies SxProps<Theme>;

/** Shared calendar detail value  styles style or helper for the related interface. */
export const calendarDetailValueSx = {
  fontWeight: 700,
  lineHeight: 1.4,
  overflowWrap: "anywhere",
} satisfies SxProps<Theme>;

/** Shared calendar detail section  styles style or helper for the related interface. */
export const calendarDetailSectionSx = {
  p: 1.5,
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.md,
  bgcolor: "background.paper",
} satisfies SxProps<Theme>;

/** Shared calendar detail section heading  styles style or helper for the related interface. */
export const calendarDetailSectionHeadingSx = {
  display: "flex",
  alignItems: "center",
  gap: 0.75,
  mb: 1,
  color: "text.primary",
  "& .MuiSvgIcon-root": { color: "primary.main", fontSize: FONT.md },
} satisfies SxProps<Theme>;

/** Shared calendar file button  styles style or helper for the related interface. */
export const calendarFileButtonSx = {
  justifyContent: "flex-start",
  width: "100%",
  px: 1,
  py: 1,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "action.hover",
  overflowWrap: "anywhere",
} satisfies SxProps<Theme>;

/** Shared calendar detail actions  styles style or helper for the related interface. */
export const calendarDetailActionsSx = {
  width: "100%",
  justifyContent: "space-between",
  flexWrap: "wrap",
} satisfies SxProps<Theme>;

/** Shared calendar detail routine actions  styles style or helper for the related interface. */
export const calendarDetailRoutineActionsSx = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  ml: "auto",
} satisfies SxProps<Theme>;

/** Shared calendar file name  styles style or helper for the related interface. */
export const calendarFileNameSx = {
  flex: 1,
  minWidth: 0,
  overflowWrap: "anywhere",
} satisfies SxProps<Theme>;

/** Shared calendar entry form  styles style or helper for the related interface. */
export const calendarEntryFormSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
  alignItems: "start",
  gap: 2,
  "& > *": { minWidth: 0 },
} satisfies SxProps<Theme>;

/** Shared calendar form full row  styles style or helper for the related interface. */
export const calendarFormFullRowSx = {
  gridColumn: { sm: "1 / -1" },
} satisfies SxProps<Theme>;

/* Small text/layout helpers shared across pages. */
/** Shared align start  styles style or helper for the related interface. */
export const alignStartSx = { alignSelf: "flex-start" } satisfies SxProps<Theme>;

/** Shared wrap anywhere  styles style or helper for the related interface. */
export const wrapAnywhereSx = { overflowWrap: "anywhere" } satisfies SxProps<Theme>;

/** Shared pre wrap text  styles style or helper for the related interface. */
export const preWrapTextSx = {
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
  // Long descriptions keep a readable line length.
  maxWidth: READING_MEASURE,
} satisfies SxProps<Theme>;
