/** Do List create and schedule forms. */
import { type SxProps } from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
import { FONT, RADIUS_PX, insetSx } from "@/styles/tokens";
import { dialogActionsRowSx } from "@/styles/dialog";

// components/selfTickets/CreateModel.dynamic.styles.ts
export const doListFormTooltipPopperSx = (): SxProps<Theme> => ({
  zIndex: (theme) => theme.zIndex.tooltip,
  pointerEvents: "none",
});

/** Shared do list form section title  styles style or helper for the related interface. */
export const doListFormSectionTitleSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: FONT.sm,
  fontWeight: 600,
  lineHeight: 1.3,
  // Clears the floating label of the first field below (it rises ~9px).
  mb: 1.25,
};

/** Shared form switch label  styles style or helper for the related interface. */
export const formSwitchLabelSx: SxProps<Theme> = {
  m: 0,
  "& .MuiFormControlLabel-label": { fontSize: FONT.sm, fontWeight: 600 },
};

/** Quiet helper line under a form control (or a field's unit adornment). */
export const formHintTextSx: SxProps<Theme> = {
  display: "block",
  color: "text.secondary",
  fontSize: FONT.xs,
  lineHeight: 1.5,
  whiteSpace: "normal",
};

/** Label row above a non-text form control: label left, live hint right. */
export const scheduleFieldHeadSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 1,
  mb: 0.75,
};

/** Small field label matching the outlined inputs' floating labels. */
export const scheduleFieldLabelSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: FONT.xs,
  fontWeight: 500,
  lineHeight: 1.3,
};

/** Schedule type picker: three option cards in a row, stacked on phones. */
export const scheduleTypeGroupSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
  gap: 1,
};

/**
 * One schedule type option: icon, name and a one-line hint. Selected reads as
 * an accent border with a light tint (a radio card, not a filled button).
 */
export const scheduleTypeCardSx =
  (selected: boolean): SxProps<Theme> =>
  (theme) => {
    const accent = theme.palette.primary.main;
    const isDark = theme.palette.mode === "dark";
    return {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      gap: 1.25,
      px: 1.5,
      py: 1.25,
      textAlign: "left",
      borderRadius: RADIUS_PX.md,
      border: "1px solid",
      borderColor: selected ? accent : theme.palette.divider,
      bgcolor: selected ? alpha(accent, isDark ? 0.14 : 0.06) : "transparent",
      boxShadow: selected ? `0 0 0 1px ${accent} inset` : "none",
      transition: theme.transitions.create(["border-color", "background-color", "box-shadow"], {
        duration: theme.transitions.duration.shorter,
      }),
      "&:hover": {
        borderColor: selected ? accent : alpha(theme.palette.text.primary, 0.32),
        bgcolor: selected ? alpha(accent, isDark ? 0.18 : 0.09) : alpha(theme.palette.text.primary, isDark ? 0.04 : 0.03),
      },
      "&.Mui-focusVisible": { outline: `2px solid ${accent}`, outlineOffset: 2 },
      "&.Mui-disabled": { opacity: 0.45 },
      "& > .MuiSvgIcon-root": {
        mt: 0.25,
        fontSize: FONT.lg,
        color: selected ? accent : "text.secondary",
      },
      "& .MuiTypography-root:first-of-type": {
        display: "block",
        color: "text.primary",
        fontSize: FONT.sm,
        fontWeight: 600,
        lineHeight: 1.35,
      },
      "& .MuiTypography-root:last-of-type": {
        display: "block",
        mt: 0.25,
        color: "text.secondary",
        fontSize: FONT.xs,
        lineHeight: 1.4,
      },
    };
  };

/** "Quick pick" label and date chips beside or under a date field. */
export const quickDateRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 0.75,
};

/** "Schedule active" checkbox with its hint as a second label line. */
export const scheduleActiveLabelSx: SxProps<Theme> = {
  // Aligns the checkbox glyph with the field edges above (MUI's default inset).
  ml: "-11px",
  mr: 0,
  alignItems: "flex-start",
  "& .MuiCheckbox-root": { py: 0.5 },
  "& .MuiFormControlLabel-label": {
    pt: 0.75,
    fontSize: FONT.sm,
    fontWeight: 600,
    lineHeight: 1.4,
  },
};

/** The live "Repeats every…" summary inside the Do List form. */
export const scheduleSummaryNoticeSx: SxProps<Theme> = { mt: 0 };

/** Shared reminder help popover  styles style or helper for the related interface. */
export const reminderHelpPopoverSx: SxProps<Theme> = {
  mt: 0.75,
  width: { xs: 300, sm: 390 },
  ...insetSx,
  borderRadius: RADIUS_PX.md,
  bgcolor: "background.paper",
  color: "text.primary",
  border: "1px solid",
  borderColor: "divider",
  overflow: "hidden",
};

/** Shared reminder help header  styles style or helper for the related interface. */
export const reminderHelpHeaderSx: SxProps<Theme> = { mb: 1 };

/** Shared reminder help icon badge  styles style or helper for the related interface. */
export const reminderHelpIconBadgeSx: SxProps<Theme> = {
  width: 26,
  height: 26,
  display: "grid",
  placeItems: "center",
  borderRadius: RADIUS_PX.sm,
  bgcolor: "action.selected",
  color: "primary.main",
};

/** Shared reminder help icon  styles style or helper for the related interface. */
export const reminderHelpIconSx: SxProps<Theme> = {
  fontSize: FONT.md,
};

/** Shared reminder help intro  styles style or helper for the related interface. */
export const reminderHelpIntroSx: SxProps<Theme> = {
  display: "block",
  color: "text.secondary",
  lineHeight: 1.45,
  mb: 1.25,
};

/** Shared reminder example text  styles style or helper for the related interface. */
export const reminderExampleTextSx: SxProps<Theme> = {
  display: "inline",
  fontSize: FONT.xs,
};

/** Shared reminder example days  styles style or helper for the related interface. */
export const reminderExampleDaysSx: SxProps<Theme> = { fontWeight: 600 };

/** Shared reminder example label  styles style or helper for the related interface. */
export const reminderExampleLabelSx: SxProps<Theme> = { fontWeight: 500 };

/** Shared reminder example chip  styles style or helper for the related interface. */
export const reminderExampleChipSx: SxProps<Theme> = {
  height: "auto",
  minHeight: 24,
  borderRadius: RADIUS_PX.sm,
  bgcolor: "action.hover",
  "& .MuiChip-label": {
    display: "block",
    whiteSpace: "normal",
    py: 0.35,
    lineHeight: 1.2,
  },
};

/** Shared reminder help example  styles style or helper for the related interface. */
export const reminderHelpExampleSx: SxProps<Theme> = {
  color: "text.secondary",
  display: "block",
  lineHeight: 1.4,
};

/** Phones: the required-fields note sits on its own line above the actions. */
export const requiredNoteRowSx: SxProps<Theme> = {
  mr: "auto",
  color: "text.secondary",
  flexBasis: { xs: "100%", sm: "auto" },
};

/** Form footer that wraps the note above equal-width actions on phones. */
export const formDialogActionsSx: SxProps<Theme> = {
  ...dialogActionsRowSx,
  flexWrap: "wrap",
  rowGap: 1,
  "& > .MuiButton-root": { flex: { xs: "1 1 0", sm: "0 0 auto" } },
  "& > .MuiButton-root:first-of-type": { ml: { xs: 0, sm: 1 } },
};

/** Shared required note icon badge  styles style or helper for the related interface. */
export const requiredNoteIconBadgeSx: SxProps<Theme> = {
  width: 22,
  height: 22,
  display: "grid",
  placeItems: "center",
  borderRadius: RADIUS_PX.sm,
  bgcolor: "action.selected",
  color: "primary.main",
};

/** Shared required note icon  styles style or helper for the related interface. */
export const requiredNoteIconSx: SxProps<Theme> = {
  fontSize: FONT.sm,
};

/** Shared required note text  styles style or helper for the related interface. */
export const requiredNoteTextSx: SxProps<Theme> = {
  color: "text.secondary",
  fontWeight: 600,
};

/** Shared required mark  styles style or helper for the related interface. */
export const requiredMarkSx: SxProps<Theme> = {
  color: "error.main",
  fontWeight: 600,
};
