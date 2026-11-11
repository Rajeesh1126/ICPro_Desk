/** Single-page layouts. */
import { type SxProps } from "@mui/material";
import { type Theme } from "@mui/material/styles";
import { FONT, insetSx } from "@/styles/tokens";
import { scrollableContent } from "@/styles/layout";
import { fileNameCellSx } from "@/styles/shared/tables";
import { flexFillPanel, surfacePanel } from "@/styles/shared/base";

// pages/Landing.tsx
// Landing-page tokens style budget links and quotation previews without inline CSS.
export const budgetSubjectButtonSx = {
  display: "block",
  width: "100%",
  minWidth: 0,
  p: 0.5,
  "@media (pointer: coarse)": { minHeight: 44 },
  textAlign: "left",
  textTransform: "none",
  color: "text.primary",
  fontWeight: 400,
  lineHeight: 1.5,
  "&:hover": { color: "primary.main" },
  "&.Mui-focusVisible": {
    outline: "2px solid",
    outlineColor: "primary.main",
    outlineOffset: 2,
  },
} satisfies SxProps<Theme>;

/** Shared quotation preview  styles style or helper for the related interface. */
export const quotationPreviewSx = {
  display: "grid", gap: 2.5,
} satisfies SxProps<Theme>;

/** Shared quotation preview title  styles style or helper for the related interface. */
export const quotationPreviewTitleSx = {
  mt: 0.5, overflowWrap: "anywhere",
} satisfies SxProps<Theme>;

/** Shared quotation facts  styles style or helper for the related interface. */
export const quotationFactsSx = {
  m: 0,
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
  gap: 2,
  "& dt": { color: "text.secondary", typography: "body2" },
  "& dd": {
    m: 0,
    mt: 0.5,
    overflowWrap: "anywhere",
    fontVariantNumeric: "tabular-nums",
  },
} satisfies SxProps<Theme>;

// pages/Login.tsx
/** Secondary link under the primary action ("Forgot password?"). */
export const authLinkSx = {
  mt: 2.5,
  // Phones: a 44px tap target without changing the visual text size.
  "@media (pointer: coarse)": { minHeight: 44, display: "inline-flex", alignItems: "center" },
  fontSize: FONT.sm,
  fontWeight: 500,
  textDecoration: "none",
  "&:hover": { textDecoration: "underline", textUnderlineOffset: "3px" },
} satisfies SxProps<Theme>;

// pages/PhaseConfiguration.tsx
// Phase configuration uses these responsive width and visibility helpers.
export const fullWidthSx = {
  width: "100%",
} satisfies SxProps<Theme>;

/** Shared sm up flex  styles style or helper for the related interface. */
export const smUpFlexSx = {
  display: { xs: "none", sm: "flex" },
} satisfies SxProps<Theme>;

// pages/ProjectConfiguration.tsx
export const projectContentSx = {
  ...scrollableContent, pt: 0.75,
} satisfies SxProps<Theme>;

/** Shared project field hint  styles style or helper for the related interface. */
export const projectFieldHintSx = {
  mt: 0.5, ml: 1.75,
} satisfies SxProps<Theme>;

// pages/general/Documents.tsx
// Document names wrap within the table instead of widening the column.
export const documentNameCellSx = {
  ...fileNameCellSx,
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  maxWidth: 280,
} satisfies SxProps<Theme>;

// pages/tickets/InternalTickets.tsx
// Work Let empty-state tokens center the message and keep the icon visually quiet.
export const workLetEmptySx = {
  height: "100%", minHeight: 240, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 1, px: 3,
} satisfies SxProps<Theme>;

/** Shared work let empty icon  styles style or helper for the related interface. */
export const workLetEmptyIconSx = {
  fontSize: FONT.xxxl, color: "text.secondary", opacity: 0.65,
} satisfies SxProps<Theme>;

/** Shared work let empty text  styles style or helper for the related interface. */
export const workLetEmptyTextSx = {
  maxWidth: 440,
} satisfies SxProps<Theme>;

// pages/timesheet/Approval.tsx
export const approvalPanelSx = {
  ...flexFillPanel, display: "flex", flexDirection: "column",
} satisfies SxProps<Theme>;

// pages/timesheet/Submission.tsx
export const submissionLayoutSx = {
  width: "100%",
  height: "100%",
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
} satisfies SxProps<Theme>;

/** Shared submission loading  styles style or helper for the related interface. */
export const submissionLoadingSx = {
  flex: 1, p: 1,
} satisfies SxProps<Theme>;

// pages/timesheet/TimeSheet.tsx
export const flexFillHeightSx = {
  flex: 1, minHeight: 0,
} satisfies SxProps<Theme>;

// pages/timesheet/TimesheetAnalysis.tsx
// Analysis styles reserve chart space while allowing the surrounding panel to flex.
export const analysisChartAreaSx = {
  flex: 1, minHeight: { xs: 240, sm: 0 }, height: "100%", width: "100%",
} satisfies SxProps<Theme>;

/** Shared analysis chart panel  styles style or helper for the related interface. */
export const analysisChartPanelSx = {
  ...surfacePanel,
  height: "100%",
  minHeight: { xs: 270, sm: 320, md: 350 },
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  ...insetSx,
} satisfies SxProps<Theme>;

/** Shared analysis chart skeleton  styles style or helper for the related interface. */
export const analysisChartSkeletonSx = {
  height: "100%", minHeight: { xs: 240, sm: 340 },
} satisfies SxProps<Theme>;

/** Shared analysis legend row  styles style or helper for the related interface. */
export const analysisLegendRowSx = {
  mb: 1.25, flexShrink: 0,
} satisfies SxProps<Theme>;

/** Shared analysis chart empty  styles style or helper for the related interface. */
export const analysisChartEmptySx = {
  display: "grid",
  placeItems: "center",
  height: "100%",
  minHeight: { xs: 220, sm: 340 },
} satisfies SxProps<Theme>;

// pages/timesheet/TimesheetLogs.tsx
export const logsHintSx = {
  display: "block", mb: 1,
} satisfies SxProps<Theme>;

// pages/timesheet/logs/LogStatusIcons.tsx
export const logStatusIconSx = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
} satisfies SxProps<Theme>;

// pages/timesheet/submission/SubmissionGrid.tsx
export const timesheetCellTextSx = {
  fontSize: FONT.sm,
} satisfies SxProps<Theme>;

// pages/users/ForgotPassword.tsx
/** Intro line under the page title. */
export const authIntroSx = {
  mt: 1,
  mb: 3.5,
  fontSize: FONT.sm,
  lineHeight: 1.5,
} satisfies SxProps<Theme>;

/** Shared auth back link  styles style or helper for the related interface. */
export const authBackLinkSx = {
  mt: 2.5,
  // Phones: a 44px tap target without changing the visual text size.
  "@media (pointer: coarse)": { minHeight: 44, display: "inline-flex", alignItems: "center" },
  fontSize: FONT.sm,
  fontWeight: 500,
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 0.75,
  "&:hover": { textDecoration: "underline", textUnderlineOffset: "3px" },
} satisfies SxProps<Theme>;

// pages/users/Roles.tsx
// Role filters share these responsive field widths and mobile action-bar rules.
export const flexColumnSx = {
  display: "flex", flexDirection: "column",
} satisfies SxProps<Theme>;

/** Shared sm up block  styles style or helper for the related interface. */
export const smUpBlockSx = {
  display: { xs: "none", sm: "block" },
} satisfies SxProps<Theme>;

/** Permission filters: a flat row above the table, no framed card. */
export const rolesFilterBarSx = {
  py: 1,
  mb: 1,
} satisfies SxProps<Theme>;

/** Shared roles filter label  styles style or helper for the related interface. */
export const rolesFilterLabelSx = {
  minWidth: { md: 230 }, flex: 1,
} satisfies SxProps<Theme>;

/** Shared roles search field  styles style or helper for the related interface. */
export const rolesSearchFieldSx = {
  width: { xs: "100%", md: 310 }, flexShrink: 0,
} satisfies SxProps<Theme>;

/** Shared roles select field  styles style or helper for the related interface. */
export const rolesSelectFieldSx = {
  width: { xs: "100%", md: 220 }, flexShrink: 0,
} satisfies SxProps<Theme>;

/** Shared roles mobile action bar  styles style or helper for the related interface. */
export const rolesMobileActionBarSx = {
  display: { xs: "flex", sm: "none" },
  position: "sticky",
  bottom: 0,
  zIndex: 2,
  justifyContent: "flex-end",
  gap: 1,
  ...insetSx,
  bgcolor: "background.paper",
  borderTop: 1,
  borderColor: "divider",
} satisfies SxProps<Theme>;
