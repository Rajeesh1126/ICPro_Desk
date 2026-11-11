/** Single-component layouts. */
import { type SxProps } from "@mui/material";
import { type Theme } from "@mui/material/styles";
import { tablePanelSx } from "@/styles/shared/tables";
import { FONT, INSET_X, INSET_Y, RADIUS_PX, insetSx } from "@/styles/tokens";

/* -------------------------------------------------------------------------- */
/* Page and component layout (moved from inline sx)                            */
/* -------------------------------------------------------------------------- */

/** Shared full height  styles style or helper for the related interface. */
export const fullHeightSx = {
  height: "100%",
} satisfies SxProps<Theme>;

// components/approval/UnlockComponent.tsx
export const unlockPanelSx = {
  ...tablePanelSx({ height: "100%" }),
  width: { xs: "100%", lg: 320 },
  minWidth: { xs: "100%", lg: 320 },
  maxWidth: { xs: "100%", lg: 320 },
  height: { xs: 280, lg: "100%" },
  flex: { xs: "0 0 auto", lg: "0 0 320px" },
} satisfies SxProps<Theme>;

/** Shared unlock list  styles style or helper for the related interface. */
export const unlockListSx = {
  ...insetSx, flex: 1, minHeight: 0, overflowY: "auto",
} satisfies SxProps<Theme>;

/** Shared unlock avatar  styles style or helper for the related interface. */
export const unlockAvatarSx = {
  width: 30, height: 30, bgcolor: "warning.main", fontSize: FONT.sm, fontWeight: 600,
} satisfies SxProps<Theme>;

// components/approval/detail/ApprovalDetailSections.tsx
export const iconMediumSx = {
  fontSize: FONT.lg,
} satisfies SxProps<Theme>;

// components/approval/detail/ApprovalWeekBoard.tsx
/** Accept / Reject buttons on a task card. */
export const approvalActionButtonSx = {
  textTransform: "none", boxShadow: "none", "& .MuiButton-startIcon": { mr: 0.5 },
} satisfies SxProps<Theme>;

// components/approval/detail/RejectReasonDialog.tsx
export const rejectTaskNameSx = {
  fontSize: FONT.sm, color: "text.secondary", mb: 0.5,
} satisfies SxProps<Theme>;

/** Shared reject warning  styles style or helper for the related interface. */
export const rejectWarningSx = {
  fontSize: FONT.sm, color: "text.secondary", mb: 1.5,
} satisfies SxProps<Theme>;

// components/common/ActionDivider.tsx
export const actionDividerSx = {
  mx: 0.5,
} satisfies SxProps<Theme>;

// components/common/CommonSnackbar.tsx
// Feedback surface sizing shared by the snackbar wrapper and alert content.
export const snackbarAlertSx = {
  width: "100%",
  minWidth: { xs: "auto", sm: 350 },
  borderRadius: RADIUS_PX.md,
  alignItems: "center",
  fontSize: FONT.sm,
} satisfies SxProps<Theme>;

// components/common/DateRange.tsx
// Date-range labels use these styles to distinguish the icon, value, and metadata.
export const dateRangeIconSx = {
  fontSize: FONT.md, color: "primary.main", flexShrink: 0,
} satisfies SxProps<Theme>;

/** Shared date range value  styles style or helper for the related interface. */
export const dateRangeValueSx = {
  color: "text.primary",
  fontWeight: 600,
  overflow: "hidden",
  textOverflow: "ellipsis",
} satisfies SxProps<Theme>;

/** Shared date range meta  styles style or helper for the related interface. */
export const dateRangeMetaSx = {
  color: "text.secondary", fontWeight: 500,
} satisfies SxProps<Theme>;

// components/common/EmptyTableState.tsx
export const emptyTableStateSx = {
  maxWidth: 360, px: 2, textAlign: "center",
} satisfies SxProps<Theme>;

/** Shared empty table icon  styles style or helper for the related interface. */
export const emptyTableIconSx = {
  color: "primary.main", fontSize: FONT.xxxl, opacity: 0.72,
} satisfies SxProps<Theme>;

// components/common/FileUploadField.tsx
// File controls keep the action, selected filename, rules, and errors readable.
export const fileUploadButtonSx = {
  flexShrink: 0, alignSelf: { xs: "flex-start", sm: "center" },
} satisfies SxProps<Theme>;

/** Shared file upload name  styles style or helper for the related interface. */
export const fileUploadNameSx = {
  minWidth: 0, overflowWrap: "anywhere",
} satisfies SxProps<Theme>;

/** Shared file upload rules  styles style or helper for the related interface. */
export const fileUploadRulesSx = {
  mt: 0.75, mb: 0, pl: 2.5, color: "text.secondary",
} satisfies SxProps<Theme>;

/** Shared strong text  styles style or helper for the related interface. */
export const strongTextSx = {
  fontWeight: 600,
} satisfies SxProps<Theme>;

/** Shared file upload error  styles style or helper for the related interface. */
export const fileUploadErrorSx = {
  mt: 0.5,
} satisfies SxProps<Theme>;

// components/common/FilterPopover.tsx
// Filter dialog styles keep the body scrollable while actions remain accessible.
export const filterDialogContentSx = {
  flex: "1 1 auto", overflowY: "auto",
} satisfies SxProps<Theme>;

/** Shared filter dialog body  styles style or helper for the related interface. */
/** Shared filter reset button  styles style or helper for the related interface. */
export const filterResetButtonSx = {
  mr: "auto",
} satisfies SxProps<Theme>;

// components/common/PageLoadingSkeleton.tsx
export const pageSkeletonSx = {
  display: "flex",
  flex: 1,
  minHeight: 0,
  flexDirection: "column",
  gap: { xs: 1.25, sm: 2 },
  ...insetSx,
} satisfies SxProps<Theme>;

/** Shared page skeleton subtitle  styles style or helper for the related interface. */
export const pageSkeletonSubtitleSx = {
  display: { xs: "none", sm: "block" },
} satisfies SxProps<Theme>;

/** Shared page skeleton metrics  styles style or helper for the related interface. */
export const pageSkeletonMetricsSx = {
  display: "grid",
  gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
  gap: 1,
} satisfies SxProps<Theme>;

/** Shared page skeleton table  styles style or helper for the related interface. */
export const pageSkeletonTableSx = {
  display: "flex", flex: 1, minHeight: 280, flexDirection: "column", ...insetSx,
} satisfies SxProps<Theme>;

// components/common/TableLoadingState.tsx
export const tableLoadingCardSx = {
  border: 1, borderColor: "divider", borderRadius: RADIUS_PX.lg, ...insetSx,
} satisfies SxProps<Theme>;

// components/common/TableView.tsx
// Card-list fallbacks preserve table affordances on narrow screens.
export const tableCardListSx = {
  display: "flex",
  flex: 1,
  minHeight: 0,
  flexDirection: "column",
  gap: 1,
  overflowY: "auto",
  ...insetSx,
} satisfies SxProps<Theme>;

/** Shared table cards empty  styles style or helper for the related interface. */
export const tableCardsEmptySx = {
  display: "grid",
  flex: 1,
  minHeight: 220,
  placeItems: "center",
} satisfies SxProps<Theme>;

/** Shared table expand button  styles style or helper for the related interface. */
export const tableExpandButtonSx = {
  width: 30, height: 30, flexShrink: 0,
} satisfies SxProps<Theme>;

// components/tickets/CreateModal.tsx
// Ticket creation helpers provide predictable spacing around attachments and fields.
export const topSpacingSx = {
  mt: 1,
} satisfies SxProps<Theme>;

/** Shared attachment hint  styles style or helper for the related interface. */
export const attachmentHintSx = {
  ml: { sm: 1 },
} satisfies SxProps<Theme>;

// components/tickets/detail/TicketDetailSections.tsx
// Ticket detail styles align timeline metadata and attachment notes.
export const ticketDetailNoteSx = {
  alignSelf: "flex-start", mt: 0.5,
} satisfies SxProps<Theme>;

/** Shared ticket detail file row  styles style or helper for the related interface. */
export const ticketDetailFileRowSx = {
  display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1, mb: 0.5,
} satisfies SxProps<Theme>;

/** Shared no wrap  styles style or helper for the related interface. */
export const noWrapSx = {
  whiteSpace: "nowrap",
} satisfies SxProps<Theme>;

/** Shared ticket detail file meta  styles style or helper for the related interface. */
export const ticketDetailFileMetaSx = {
  display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.75,
} satisfies SxProps<Theme>;

// components/timesheet/AssignCostMasterTasksModal.tsx
// Tree and toolbar styles keep task assignment usable at each nesting level.
/** Fixed height only while the project tree is shown; messages size to their content. */
export const assignTaskContentSx = (hasTree: boolean) => ({
  height: hasTree ? 560 : "auto",
  overflow: "auto",
}) satisfies SxProps<Theme>;

/** Shared assign task loading  styles style or helper for the related interface. */
export const assignTaskLoadingSx = {
  py: 6,
} satisfies SxProps<Theme>;

/** Shared assign task tree  styles style or helper for the related interface. */
export const assignTaskTreeSx = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.md,
} satisfies SxProps<Theme>;

/** Shared assign task toolbar  styles style or helper for the related interface. */
export const assignTaskToolbarSx = {
  px: INSET_X, py: INSET_Y,
} satisfies SxProps<Theme>;

/** Shared assign task milestone list  styles style or helper for the related interface. */
export const assignTaskMilestoneListSx = {
  pb: 1, pl: 4, pr: 1,
} satisfies SxProps<Theme>;

/** Shared assign task task list  styles style or helper for the related interface. */
export const assignTaskTaskListSx = {
  pl: 4,
} satisfies SxProps<Theme>;

/** Shared assign task nested list  styles style or helper for the related interface. */
export const assignTaskNestedListSx = {
  pl: 5,
} satisfies SxProps<Theme>;

// components/timesheet/CreateUndefinedModal.tsx
// Undefined-job form tokens group fields, validation, and action controls.
export const undefinedJobsFormSx = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
} satisfies SxProps<Theme>;

/** Shared undefined jobs error  styles style or helper for the related interface. */
export const undefinedJobsErrorSx = {
  color: "error.main",
  fontSize: FONT.sm,
  mt: 0,
} satisfies SxProps<Theme>;

/** Shared undefined jobs actions  styles style or helper for the related interface. */
export const undefinedJobsActionsSx = {
  display: "flex",
  justifyContent: "flex-end",
  mt: 1,
} satisfies SxProps<Theme>;

// components/timesheet/ERPQuotationModal.tsx
export const erpContentSx = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  overflow: "hidden",
} satisfies SxProps<Theme>;

/** Shared erp table area  styles style or helper for the related interface. */
export const erpTableAreaSx = {
  flex: 1,
  minHeight: 0,
} satisfies SxProps<Theme>;

// components/timesheet/LogDetailDialog.tsx
export const logDetailSummarySx = {
  display: "flex",
  alignItems: { xs: "flex-start", sm: "center" },
  flexDirection: { xs: "column", sm: "row" },
  justifyContent: "space-between",
  gap: 1,
  ...insetSx,
  border: 1,
  borderColor: "divider",
  borderRadius: RADIUS_PX.md,
} satisfies SxProps<Theme>;

// components/timesheet/TimeSheetPreviewModal.tsx
export const previewSectionSx = {
  mt: 2,
} satisfies SxProps<Theme>;

/** Shared preview section title  styles style or helper for the related interface. */
export const previewSectionTitleSx = {
  fontSize: FONT.sm,
  fontWeight: 600,
  color: "text.primary",
  mb: 0.5,
} satisfies SxProps<Theme>;

/** Shared preview actions  styles style or helper for the related interface. */
export const previewActionsSx = {
  display: "flex",
  justifyContent: "flex-end",
  mt: 2,
} satisfies SxProps<Theme>;

// components/timesheet/TimeSheetTicketsModal.tsx
// The ticket picker reserves a stable viewport and a quiet explanatory note.
export const ticketsDialogContentSx = {
  height: 520,
} satisfies SxProps<Theme>;

/** Shared tickets dialog note  styles style or helper for the related interface. */
export const ticketsDialogNoteSx = {
  mr: "auto", color: "text.secondary", fontSize: FONT.sm,
} satisfies SxProps<Theme>;

// components/timesheet/TimeSheetUnlockRequestModal.tsx
export const unlockRequestSummarySx = {
  mb: 1.5,
} satisfies SxProps<Theme>;
