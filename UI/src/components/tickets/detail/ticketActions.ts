/**
 * Ticket workflow rules: which actions a user may take, how each action's
 * dialog is worded, and the request it sends. Pure data and functions (no
 * React), so the workflow can be unit-tested and changed in one place.
 */
import type { SvgIconComponent } from "@mui/icons-material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import type { TicketData } from "../../../types/dataTypes";

export type TicketActionId =
  | "accept"
  | "reassign"
  | "pending"
  | "reject"
  | "recallRequest"
  | "feedback"
  | "progress"
  | "complete"
  | "hold"
  | "reviseDate"
  | "notSatisfied"
  | "rate"
  | "recallClose";

type Tone = "primary" | "secondary" | "success" | "warning" | "error" | "info";

export type TicketActionButton = {
  label: string;
  icon: SvgIconComponent;
  variant: "contained" | "outlined";
  color: Tone;
  /** Shown but not yet available. */
  disabled?: boolean;
};

export const ACTION_BUTTONS: Record<TicketActionId, TicketActionButton> = {
  accept: { label: "Accept", icon: CheckCircleOutlinedIcon, variant: "contained", color: "success" },
  reassign: { label: "Reassign", icon: PersonAddAltOutlinedIcon, variant: "contained", color: "secondary", disabled: true },
  pending: { label: "Pending", icon: PauseCircleOutlineOutlinedIcon, variant: "outlined", color: "warning" },
  reject: { label: "Reject", icon: BlockOutlinedIcon, variant: "outlined", color: "error" },
  recallRequest: { label: "Recall Request", icon: UndoOutlinedIcon, variant: "outlined", color: "warning" },
  feedback: { label: "FeedBack", icon: FeedbackOutlinedIcon, variant: "contained", color: "info" },
  progress: { label: "Update Progress", icon: PendingActionsOutlinedIcon, variant: "contained", color: "primary" },
  complete: { label: "Completed", icon: TaskAltOutlinedIcon, variant: "contained", color: "success" },
  hold: { label: "On Hold", icon: PauseCircleOutlineOutlinedIcon, variant: "outlined", color: "warning" },
  reviseDate: { label: "Revise Target Date", icon: EventRepeatOutlinedIcon, variant: "outlined", color: "warning" },
  notSatisfied: { label: "Not Satisfactory & Re Open", icon: ThumbDownAltOutlinedIcon, variant: "outlined", color: "error" },
  rate: { label: "Rate & Close Ticket", icon: StarOutlinedIcon, variant: "contained", color: "primary" },
  recallClose: { label: "Recall and closed", icon: AssignmentTurnedInOutlinedIcon, variant: "contained", color: "success" },
};

/**
 * Button groups the user sees, by ticket status and their role on the ticket
 * (assignee or creator). Each inner array renders as one group.
 */
export function getAvailableActionGroups(ticket: TicketData, userId: number | null): TicketActionId[][] {
  const status = ticket.current_status;
  const isAssignee = ticket.assigned_to === userId;
  const isCreator = ticket.creator === userId;
  const groups: TicketActionId[][] = [];

  // New work assigned to me: take it on, park it or refuse it.
  if (["open", "revised", "reopened"].includes(status) && isAssignee) {
    groups.push(["accept", "reassign", "pending", "reject"]);
  }
  // Work I raised that is in flight: recall it or comment on it.
  if (
    ["accepted", "assigned", "in progress", "feedback provided", "date revision", "pending"].includes(status) &&
    isCreator
  ) {
    groups.push(["recallRequest", "feedback"]);
  }
  // Work I'm doing: report progress, finish, pause or re-plan.
  if (["accepted", "assigned", "in progress", "feedback provided", "date revision"].includes(status) && isAssignee) {
    groups.push(["progress", "complete", "hold", "reviseDate"]);
  }
  // Finished or refused work I raised: reopen, comment, or rate and close.
  if (["completed", "rejected"].includes(status) && isCreator) {
    groups.push(["notSatisfied", "feedback", "rate"]);
  }
  // Withdraw an unstarted ticket I raised, or confirm a recall asked of me.
  if (
    (["open", "revised", "reopened", "not-satisfied"].includes(status) && isCreator) ||
    (status === "recall requested" && isAssignee)
  ) {
    groups.push(["recallClose"]);
  }
  return groups;
}

/** Actions that ask for a written reason before changing status. */
export type ReasonActionId =
  | "reject"
  | "hold"
  | "notSatisfied"
  | "pending"
  | "progress"
  | "reviseDate"
  | "feedback"
  | "recallRequest";

export type ReasonDialogConfig = {
  status: string;
  title: string;
  description?: string;
  fieldLabel: string;
  placeholder: string;
  confirmLabel: string;
  tone: Exclude<Tone, "primary">;
  icon: SvgIconComponent;
  confirmIcon?: SvgIconComponent;
};

export const REASON_DIALOGS: Record<ReasonActionId, ReasonDialogConfig> = {
  reject: {
    status: "rejected",
    title: "Reject Ticket",
    description: "Please provide a reason for rejecting this ticket. This will be visible to the creator.",
    fieldLabel: "Reason for Rejection",
    placeholder: "e.g., Insufficient information provided, Duplicate ticket, Out of scope...",
    confirmLabel: "Confirm Rejection",
    tone: "error",
    icon: BlockOutlinedIcon,
    confirmIcon: BlockOutlinedIcon,
  },
  hold: {
    status: "on hold",
    title: "Hold Ticket",
    description: "Please provide a reason for holding this ticket. This will be visible to the creator.",
    fieldLabel: "Details for Hold",
    placeholder:
      "e.g., Work is temporarily stopped, usually waiting for another department, vendor, hardware, etc.",
    confirmLabel: "Confirm On Hold",
    tone: "warning",
    icon: PauseCircleOutlineOutlinedIcon,
    confirmIcon: PauseCircleOutlineOutlinedIcon,
  },
  notSatisfied: {
    status: "not-satisfied",
    title: "Not Satisfactory & Re Open Ticket",
    description: "Please specify why this ticket is being marked as not satisfactory.",
    fieldLabel: "Reason for not satisfactory",
    placeholder: "e.g., Insufficient information provided, Duplicate ticket, Out of scope...",
    confirmLabel: "Confirm Not Satisfied",
    tone: "error",
    icon: ThumbDownAltOutlinedIcon,
    confirmIcon: ThumbDownAltOutlinedIcon,
  },
  pending: {
    status: "pending",
    title: "Mark Ticket Pending",
    fieldLabel: "Pending Reason",
    placeholder: "Waiting for information/action from the requester.",
    confirmLabel: "Mark Pending",
    tone: "warning",
    icon: PauseCircleOutlineOutlinedIcon,
  },
  progress: {
    status: "in progress",
    title: "Update Progress",
    description: "Please provide an update on the current progress of this ticket.",
    fieldLabel: "Progress Notes",
    placeholder: "Describe the current progress, completed work, and any pending tasks...",
    confirmLabel: "Submit",
    tone: "info",
    icon: PendingActionsOutlinedIcon,
    confirmIcon: SendOutlinedIcon,
  },
  reviseDate: {
    status: "date revision",
    title: "Request Target Date Revision",
    description: "Please provide the reason for extending or revising the target date.",
    fieldLabel: "Reason for target date revision",
    placeholder: "Explain why the target date needs to be revised or extended...",
    confirmLabel: "Send Request",
    tone: "warning",
    icon: EventRepeatOutlinedIcon,
    confirmIcon: SendOutlinedIcon,
  },
  feedback: {
    status: "feedback provided",
    title: "Give Feedback",
    description: "Please give feedback for this ticket.",
    fieldLabel: "Feedback & Suggestions",
    placeholder:
      "Provide your feedback on the task, including challenges, suggestions, or areas for improvement...",
    confirmLabel: "Submit",
    tone: "info",
    icon: PendingActionsOutlinedIcon,
    confirmIcon: SendOutlinedIcon,
  },
  recallRequest: {
    status: "recall requested",
    title: "Recall Request Ticket",
    description: "Please specify the reason for requesting this ticket recall.",
    fieldLabel: "Reason for recall request",
    placeholder: "e.g., Insufficient information provided, Duplicate ticket, Out of scope...",
    confirmLabel: "Confirm Request",
    tone: "error",
    icon: UndoOutlinedIcon,
    confirmIcon: UndoOutlinedIcon,
  },
};

export const isReasonAction = (action: TicketActionId): action is ReasonActionId =>
  action in REASON_DIALOGS;

export const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Average",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

/** Success toast per resulting status. */
export const STATUS_MESSAGES: Record<string, string> = {
  accepted: "Ticket accepted successfully.",
  completed: "Ticket completed successfully.",
  "in progress": "Ticket marked as In Progress successfully.",
  "feedback provided": "Feedback provided successfully.",
  "recall requested": "Recall request sent successfully.",
  "recall successful": "Recalled and closed successful.",
  "not-satisfied": "Ticket marked as Not Satisfactory successfully.",
  "on hold": "Ticket put on hold successfully.",
  "date revision": "Target date revision request sent successfully.",
  pending: "Ticket marked as pending successfully.",
  closed: "Ticket closed successfully.",
  cancelled: "Ticket cancelled successfully.",
};

export type StatusChangeExtras = {
  /** "userId|Display Name" from the reassign picker. */
  assigned_to?: string;
  remarks?: string;
  rating?: number;
  est_hours?: number;
};

/**
 * PATCH body for a status change. Without a written reason, the log gets a
 * generated remark ("Status changed to … by …").
 */
export function buildStatusChangePayload(
  ticket: TicketData,
  status: string,
  extras: StatusChangeExtras,
  actorName: string,
) {
  const [assigneeId, assigneeName] = extras.assigned_to ? extras.assigned_to.split("|") : [];
  return {
    current_status: status,
    ...extras,
    remarks:
      extras.remarks ||
      `Status changed to "${status}" by user ${actorName}` +
        (assigneeName ? ` and assigned to ${assigneeName}` : ""),
    assigned_to: assigneeId ? Number(assigneeId) : ticket.assigned_to,
  };
}