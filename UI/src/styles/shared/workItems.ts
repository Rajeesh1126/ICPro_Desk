/** Do List, Tickets and Work Let: page parts, boards and cards. */
import { type SxProps } from "@mui/material";
import { alpha, keyframes, type Theme } from "@mui/material/styles";
import { type AccentStyleArgs, inlineCenterGapSx } from "@/styles/shared/base";
import { CARD_PADDING, ELEVATION, FONT, MOTION, RADIUS_PX, TABULAR_NUMS } from "@/styles/tokens";
import { type DueTone } from "@/components/common/formatDate";

// components/common/TicketPageParts.tsx — shared by Do List, Tickets, Work Let
/** "Task/Ticket Number" cell: view + edit buttons, the number, extras. */
export const recordNumberCellSx: SxProps<Theme> = {
  ...inlineCenterGapSx,
  flexWrap: "nowrap",
};

/** Shared record number text  styles style or helper for the related interface. */
export const recordNumberTextSx: SxProps<Theme> = {
  fontWeight: 600,
  whiteSpace: "nowrap",
};

/** Shared due date cell  styles style or helper for the related interface. */
export const dueDateCellSx: SxProps<Theme> = {
  ...inlineCenterGapSx,
  flexWrap: "wrap",
  columnGap: 1,
  rowGap: 0.25,
};

/** Shared overdue tag  styles style or helper for the related interface. */
export const overdueTagSx: SxProps<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.25,
  color: "error.main",
  fontWeight: 600,
  "& .MuiSvgIcon-root": { fontSize: FONT.sm },
};

/** Header filter (e.g. Employee) that shares the actions row on phones. */
export const headerFilterFieldSx = {
  flex: { xs: "1 1 140px", sm: "0 0 auto" },
  minWidth: { xs: 0, sm: 210 },
} satisfies SxProps<Theme>;

// components/common/FilterPopover.tsx — applied filters under the tabs
export const activeFilterBarSx: SxProps<Theme> = {
  pt: 1,
};

/** Shared active filter label  styles style or helper for the related interface. */
export const activeFilterLabelSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: FONT.xs,
  fontWeight: 600,
  mr: 0.25,
};

// components/common/PageNotice.tsx — info notice under a page's tabs
export const pageNoticeSx: SxProps<Theme> = (theme) => ({
  display: "flex",
  alignItems: { xs: "flex-start", sm: "center" },
  gap: 1.25,
  flexShrink: 0,
  mt: 1.5,
  px: 1.5,
  py: 1,
  borderRadius: RADIUS_PX.sm,
  color: "text.primary",
  bgcolor: alpha(
    theme.palette.info.main,
    theme.palette.mode === "dark" ? 0.12 : 0.08,
  ),
  fontSize: FONT.sm,
  lineHeight: 1.5,
  "& > .MuiSvgIcon-root": { color: "info.main", fontSize: FONT.lg, flexShrink: 0 },
  "& strong": { fontWeight: 600 },
});

// components/common/CardView.tsx — board columns (Do List, Tickets, Work Let)
/** Responsive board column surface used by ticket and Do List card views. */
export const boardColumnSx =
  (expanded = false): SxProps<Theme> =>
  (theme) => ({
    minWidth: 0,
    height: "auto",
    maxHeight: { lg: "100%" },
    minHeight: 0,
    // Small screens (accordion): the expanded column is as tall as its cards,
    // capped at the remaining board height (then its list scrolls), so the
    // collapsed stages stay right below it. On lg each column is a grid cell.
    flex: { xs: expanded ? "0 1 auto" : "0 0 auto" },
    borderRadius: RADIUS_PX.lg,
    // A quiet track, not another raised surface: the cards are the surfaces.
    bgcolor: alpha(
      theme.palette.text.primary,
      theme.palette.mode === "dark" ? 0.03 : 0.035,
    ),
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    scrollSnapAlign: "start",
  });

/** Shared board column header  styles style or helper for the related interface. */
export const boardColumnHeaderSx: SxProps<Theme> = {
  px: 2,
  pt: 1.5,
  pb: { xs: 1.5, lg: 1 },
  gap: 1,
  cursor: { xs: "pointer", lg: "default" },
};

/** Shared board column title  styles style or helper for the related interface. */
export const boardColumnTitleSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  minWidth: 0,
  fontSize: FONT.sm,
  fontWeight: 600,
  color: "text.primary",
};

/** Shared board column bullet  styles style or helper for the related interface. */
export const boardColumnBulletSx = ({
  accent,
}: AccentStyleArgs): SxProps<Theme> => ({
  width: 8,
  height: 8,
  flexShrink: 0,
  borderRadius: "50%",
  bgcolor: accent,
});

/** Shared board column count chip  styles style or helper for the related interface. */
export const boardColumnCountChipSx: SxProps<Theme> = (theme) => ({
  height: 20,
  minWidth: 24,
  fontSize: FONT.xs,
  fontWeight: 600,
  ...TABULAR_NUMS,
  color: "text.secondary",
  bgcolor: alpha(
    theme.palette.text.primary,
    theme.palette.mode === "dark" ? 0.08 : 0.07,
  ),
  "& .MuiChip-label": { px: 1 },
});

/**
 * "Action Required" marker in a board column header: an alert-red tint,
 * red text/icon and a faint red outline so it is noticed at a glance.
 * Static (no pulsing); the darker / lighter red step keeps AA contrast.
 */
export const boardColumnActionRequiredChipSx: SxProps<Theme> = (theme) => {
  const isDark = theme.palette.mode === "dark";
  const red = theme.palette.error;
  return {
    height: 22,
    color: isDark ? red.light : red.dark,
    bgcolor: alpha(red.main, isDark ? 0.2 : 0.1),
    border: `1px solid ${alpha(red.main, isDark ? 0.45 : 0.3)}`,
    fontSize: FONT.xs,
    fontWeight: 600,
    "& .MuiChip-label": { px: 0.75 },
    "& .MuiChip-icon": { ml: 0.5, mr: -0.25, color: "inherit", fontSize: FONT.sm },
  };
};

/** Shared board column list  styles style or helper for the related interface. */
export const boardColumnListSx: SxProps<Theme> = {
  px: 1,
  pt: 0.25,
  // The scroll box fills its (bounded) column and scrolls internally on every
  // screen size. On small screens the column is bounded by flex (see
  // boardColumnSx + cardViewCollapseSx); on lg by the grid row.
  pb: { xs: "calc(env(safe-area-inset-bottom, 0px) + 12px)", lg: 1.25 },
  display: "flex",
  flexDirection: "column",
  gap: 1,
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  overscrollBehavior: "contain",
  flex: "1 1 auto",
  minHeight: 0,
  height: "auto",
  scrollPaddingBottom: { xs: "8px", lg: 1.25 },
  scrollbarGutter: "stable",
};

/** Shared card view header button  styles style or helper for the related interface. */
export const cardViewHeaderButtonSx = (accent: string): SxProps<Theme> => ({
  display: "block",
  width: "100%",
  textAlign: "left",
  "&.Mui-focusVisible": {
    outline: "2px solid",
    outlineColor: accent,
    outlineOffset: -2,
  },
});

/** Shared card view collapse  styles style or helper for the related interface. */
export const cardViewCollapseSx = (expanded: boolean): SxProps<Theme> => ({
  // Content height, shrinking when the column hits its cap so the inner
  // scroll box is bounded. Collapsed stages take no space at all.
  flex: "0 1 auto",
  minHeight: 0,
  display: expanded ? "flex" : "none",
  flexDirection: "column",
});

/** Shared card view expand icon style or helper for the related interface. */
export const cardViewExpandIcon =
  (expanded: boolean): SxProps<Theme> =>
  (theme) => ({
    display: { xs: "inline-flex", lg: "none" },
    color: "text.secondary",
    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shorter,
    }),
  });

/** Quiet empty column: one muted line, no extra nested surface. */
export const boardColumnEmptySx: SxProps<Theme> = {
  py: 4,
  px: 2,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 0.75,
  color: "text.secondary",
  fontSize: FONT.sm,
  textAlign: "center",
  "& .MuiSvgIcon-root": { fontSize: FONT.md, opacity: 0.6 },
};

/** Shared board columns  styles style or helper for the related interface. */
export const boardColumnsSx: SxProps<Theme> = {
  // Small screens: flex column accordion — the expanded column fills the height
  // and scrolls internally. lg+: kanban grid with a full-height row so each
  // column is bounded and scrolls internally. Neither the board itself scrolls.
  display: { xs: "flex", lg: "grid" },
  flexDirection: { xs: "column" },
  gridTemplateColumns: { lg: "repeat(3, minmax(0, 1fr))" },
  gridTemplateRows: { lg: "minmax(0, auto)" },
  gap: { xs: 1.25, lg: 1.5 },
  height: "100%",
  minHeight: 0,
  alignContent: { lg: "start" },
  overflow: "hidden",
};

/** Do List: Open and Closed side by side at equal width from lg. */
export const boardColumnsSelfSx: SxProps<Theme> = {
  ...boardColumnsSx,
  gridTemplateColumns: { lg: "repeat(2, minmax(0, 1fr))" },
};

// components/tickets/BasicCard.tsx + components/selfTickets/BasicCard.tsx
export type CardAlertTone = "overdue" | "reminder";

/**
 * Work-item card: neutral opaque surface, fine border, gentle hover and a
 * clear focus ring. Urgency is communicated with one restrained text tag in
 * the status row instead of tinting the whole card.
 */
export const boardCardSx = (): SxProps<Theme> => (theme) => {
  const isDark = theme.palette.mode === "dark";
  return {
    flexShrink: 0,
    position: "relative",
    overflow: "hidden",
    cursor: "pointer",
    borderRadius: RADIUS_PX.md,
    // One depth cue: shadow in light mode, hairline in dark mode.
    border: isDark ? `1px solid ${theme.palette.divider}` : "1px solid transparent",
    backgroundImage: "none",
    backgroundColor: theme.palette.background.paper,
    boxShadow: isDark ? "none" : ELEVATION.light.card,
    transition: `box-shadow ${MOTION.base} ${MOTION.easing}, border-color ${MOTION.base} ${MOTION.easing}`,
    "&:hover": {
      borderColor: isDark ? alpha(theme.palette.text.primary, 0.28) : "transparent",
      boxShadow: isDark ? "none" : ELEVATION.light.cardHover,
    },
    "&:focus-visible": {
      outline: "2px solid",
      outlineColor: theme.palette.primary.main,
      outlineOffset: 2,
    },
    "@media (prefers-reduced-motion: reduce)": {
      transition: "none",
      "&:hover": { transform: "none" },
    },
  };
};

/** Shared card body spacing keeps board cards visually consistent. */
export const sharedCardContentSx: SxProps<Theme> = {
  px: CARD_PADDING,
  pt: 1.75,
  "&:last-child": { pb: 1.5 },
  display: "flex",
  flexDirection: "column",
  gap: 0.75,
};

/** Row 1: identifier on the left, creation date (and reminder) on the right. */
export const boardCardTopRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1,
  minHeight: 24,
};

/** Shared board card number  styles style or helper for the related interface. */
export const boardCardNumberSx: SxProps<Theme> = {
  fontSize: FONT.sm,
  fontWeight: 500,
  letterSpacing: "0.01em",
  color: "text.secondary",
  ...TABULAR_NUMS,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

/** Shared board card meta  styles style or helper for the related interface. */
export const boardCardMetaSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.75,
  flexShrink: 0,
  color: "text.secondary",
};

/** Shared board card created  styles style or helper for the related interface. */
export const boardCardCreatedSx: SxProps<Theme> = {
  fontSize: FONT.sm,
  fontWeight: 400,
  color: "text.secondary",
  ...TABULAR_NUMS,
  whiteSpace: "nowrap",
};

/** Shared board card creator  styles style or helper for the related interface. */
export const boardCardCreatorSx: SxProps<Theme> = {
  ...boardCardCreatedSx,
  fontWeight: 600,
  color: "text.primary",
  maxWidth: 120,
  overflow: "hidden",
  textOverflow: "ellipsis",
};

/** Row 2: the subject, medium weight, up to two lines. */
export const sharedCardTitleSx: SxProps<Theme> = {
  fontSize: FONT.md,
  fontWeight: 600,
  lineHeight: 1.35,
  color: "text.primary",
  overflowWrap: "anywhere",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

/** Row 3: description preview, two lines, supporting colour. */
export const ticketCardDescriptionSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: FONT.sm,
  lineHeight: 1.5,
  overflowWrap: "anywhere",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

/** Row 4: status / priority / urgency indicators, clearly separated. */
export const boardCardIndicatorsSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 0.75,
  mt: 0.25,
};

/**
 * Overdue / reminder marker: neutral text with a small coloured glyph. The
 * target date is the one red element on a card, so this tag stays quiet.
 */
export const boardCardTagSx =
  (tone: CardAlertTone): SxProps<Theme> =>
  (theme) => {
    const color =
      tone === "overdue"
        ? theme.palette.error.main
        : theme.palette.warning.main;
    const isDark = theme.palette.mode === "dark";
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 0.5,
      px: 1,
      py: 0.25,
      borderRadius: RADIUS_PX.pill,
      fontSize: FONT.xs,
      fontWeight: 500,
      lineHeight: 1.4,
      color: theme.palette.text.secondary,
      bgcolor: alpha(theme.palette.text.primary, isDark ? 0.08 : 0.05),
      "& .MuiSvgIcon-root": { fontSize: FONT.sm, color },
    };
  };

/** Neutral tag for a task's kind, e.g. its schedule (Recurring, Continuous period). */
export const boardCardTypeTagSx: SxProps<Theme> = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 0.5,
  "& .MuiSvgIcon-root": { fontSize: FONT.sm, color: "text.secondary" },
  px: 1,
  py: 0.125,
  borderRadius: RADIUS_PX.xs,
  border: "1px solid",
  borderColor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.24 : 0.2),
  fontSize: FONT.xs,
  fontWeight: 600,
  lineHeight: 1.4,
  color: "text.secondary",
});

/**
 * Do List footer: a fixed two-column grid, reminder on the left and target
 * date on the right at every width; optional rows span both columns.
 */
export const doListCardFooterSx: SxProps<Theme> = {
  mt: 0.75,
  pt: 1.25,
  borderTop: "1px solid",
  borderColor: "divider",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "start",
  columnGap: 2,
  rowGap: 1,
};

/** Shared do list reminder value  styles style or helper for the related interface. */
export const doListReminderValueSx =
  (state: "active" | "scheduled" | "off"): SxProps<Theme> =>
  (theme) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 0.5,
    mt: 0.25,
    fontSize: FONT.sm,
    fontWeight: 600,
    lineHeight: 1.3,
    color:
      state === "active"
        ? theme.palette.mode === "dark"
          ? theme.palette.warning.light
          : theme.palette.warning.dark
        : state === "scheduled"
          ? "text.primary"
          : "text.secondary",
    "& .MuiSvgIcon-root": { fontSize: FONT.md },
  });

export const acknowledgeBorderBlink = keyframes`
  0%, 100% { border-color: var(--ack-border); box-shadow: 0 0 0 0 transparent; }
  50% { border-color: var(--ack-strong); box-shadow: 0 0 0 3px var(--ack-glow); }
`;

/**
 * Pending reminder: the button's border pulses three times to draw the eye,
 * then holds a steady warning border until it is acknowledged (an endless
 * blink across a board of overdue cards is distracting).
 */
export const doListAcknowledgeButtonSx: SxProps<Theme> = (theme) => {
  const warning = theme.palette.warning.main;
  return {
    gridColumn: "1 / -1",
    justifySelf: "start",
    "--ack-border": alpha(warning, 0.35),
    "--ack-strong": warning,
    "--ack-glow": alpha(warning, theme.palette.mode === "dark" ? 0.3 : 0.22),
    borderColor: warning,
    animation: `${acknowledgeBorderBlink} 1.4s ease-in-out 3`,
    "&:hover, &.Mui-focusVisible": { animation: "none", borderColor: warning },
    "@media (prefers-reduced-motion: reduce)": { animation: "none" },
  };
};

/** A linked ticket reads as a reference: icon, label and the number. */
export const doListLinkedTicketSx: SxProps<Theme> = {
  gridColumn: "1 / -1",
  display: "inline-flex",
  alignItems: "center",
  gap: 0.5,
  fontSize: FONT.sm,
  color: "text.secondary",
  "& .MuiSvgIcon-root": { fontSize: FONT.md, color: "primary.main" },
  "& > span": {
    color: "primary.main",
    fontSize: FONT.sm,
    fontWeight: 600,
    ...TABULAR_NUMS,
  },
};

/** Row 5: footer — assignee identity on the left, target date on the right. */
export const boardCardFooterSx: SxProps<Theme> = {
  mt: 0.75,
  pt: 1.25,
  borderTop: "1px solid",
  borderColor: "divider",
  // Fixed columns: assignee always left, target date always right.
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "end",
  columnGap: 1.5,
};

/** Shared board card field  styles style or helper for the related interface. */
export const boardCardFieldSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  minWidth: 0,
};

/** Shared board card field label  styles style or helper for the related interface. */
export const boardCardFieldLabelSx: SxProps<Theme> = {
  fontSize: FONT.xs,
  fontWeight: 500,
  lineHeight: 1.2,
  color: "text.secondary",
  whiteSpace: "nowrap",
};

/** Shared board card field value  styles style or helper for the related interface. */
export const boardCardFieldValueSx: SxProps<Theme> = {
  fontSize: FONT.sm,
  fontWeight: 600,
  lineHeight: 1.3,
  color: "text.primary",
  ...TABULAR_NUMS,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

/**
 * Prominent target date, coloured only by real urgency. A finished item
 * (completed / closed) shows its date at the same 13px as an upcoming one.
 */
export const boardCardDueSx =
  (tone: DueTone, finished = false): SxProps<Theme> =>
  (theme) => {
    // Only real urgency is coloured: red overdue, amber due today.
    const color =
      tone === "overdue"
        ? theme.palette.error.main
        : tone === "today"
          ? theme.palette.warning.main
          : null;
    return {
      ...(boardCardFieldValueSx as object),
      // Finished dates step down one size on the 1.25 scale.
      fontSize: finished ? FONT.xs : FONT.sm,
      ...(color && { color }),
    };
  };

/** Neutral identity mark: primary is reserved for interaction and selection. */
/**
 * Relative target label ("Tomorrow", "in 3 days", "Today") as a light tinted
 * pill, so an approaching date is hard to miss. Other tones stay plain.
 */
export const boardCardDueLabelSx =
  (tone: DueTone): SxProps<Theme> =>
  (theme) => {
    const palette =
      tone === "soon" ? theme.palette.info : tone === "today" ? theme.palette.warning : null;
    if (!palette) return {};
    const isDark = theme.palette.mode === "dark";
    return {
      display: "inline-block",
      px: 0.75,
      py: 0.125,
      borderRadius: RADIUS_PX.pill,
      fontSize: FONT.sm,
      fontWeight: 600,
      lineHeight: 1.35,
      color: isDark ? palette.light : palette.dark,
      bgcolor: alpha(palette.main, isDark ? 0.18 : 0.12),
    };
  };

/** Shared ticket card assignee avatar  styles style or helper for the related interface. */
export const ticketCardAssigneeAvatarSx: SxProps<Theme> = (theme) => ({
  width: 28,
  height: 28,
  fontSize: FONT.xs,
  fontWeight: 600,
  color: "text.primary",
  bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.14 : 0.08),
});
