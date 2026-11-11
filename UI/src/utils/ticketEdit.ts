import type { SelfTicketData, TicketData } from "@/types/dataTypes";

/** is Ticket Edit Disabled declaration used across the frontend. */
export const isTicketEditDisabled = (ticket: TicketData, userId: number | null) =>
  ticket.creator !== userId ||
  ["closed", "recall successful", "recall requested", "completed"].includes(ticket.current_status);

/** is Self Ticket Edit Disabled declaration used across the frontend. */
export const isSelfTicketEditDisabled = (task: SelfTicketData, userId: number | null) =>
  task.creator !== userId || ["closed", "cancelled"].includes(task.current_status);

/** Why a ticket can't be edited, for the disabled control's tooltip. */
export const ticketEditDisabledReason = (ticket: TicketData, userId: number | null) => {
  if (!isTicketEditDisabled(ticket, userId)) return null;
  return ticket.creator !== userId
    ? "Only the person who raised this ticket can edit it"
    : `A ${ticket.current_status} ticket can't be edited`;
};

/** Why a Do List task can't be edited, for the disabled control's tooltip. */
export const selfTicketEditDisabledReason = (task: SelfTicketData, userId: number | null) => {
  if (!isSelfTicketEditDisabled(task, userId)) return null;
  return task.creator !== userId
    ? "Only the task owner can edit it"
    : `A ${task.current_status} task can't be edited`;
};
