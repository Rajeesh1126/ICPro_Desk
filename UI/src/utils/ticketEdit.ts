import type { SelfTicketData, TicketData } from "@/types/dataTypes";

export const isTicketEditDisabled = (ticket: TicketData, userId: number | null) =>
  ticket.creator !== userId ||
  ["closed", "recall successful", "recall requested", "completed"].includes(ticket.current_status);

export const isSelfTicketEditDisabled = (task: SelfTicketData, userId: number | null) =>
  task.creator !== userId || ["closed", "cancelled"].includes(task.current_status);
