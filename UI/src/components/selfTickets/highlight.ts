import type { SelfTicketData } from "@/types/dataTypes";

export type SelfTicketAlertReason = "alarm" | "target-date";

function parseSelfTicketTargetDay(value: string | null | undefined) {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).setHours(0, 0, 0, 0);
  }

  const targetDate = new Date(value.replace(" ", "T"));
  const timestamp = targetDate.getTime();
  targetDate.setHours(0, 0, 0, 0);

  return Number.isNaN(timestamp) ? null : targetDate.getTime();
}

export function getSelfTicketAlertReason(
  ticket: SelfTicketData,
  currentDate = new Date(),
): SelfTicketAlertReason | null {
  if (ticket.current_status?.toLowerCase() !== "open") return null;
  if (ticket.alarm === true) return "alarm";
  if (ticket.alarm !== false) return null;

  const targetDay = parseSelfTicketTargetDay(ticket.target_date);
  const currentDay = new Date(currentDate);
  currentDay.setHours(0, 0, 0, 0);

  return targetDay !== null && targetDay <= currentDay.getTime()
    ? "target-date"
    : null;
}

export function getSelfTicketAlertMessage(ticket: SelfTicketData) {
  const reason = getSelfTicketAlertReason(ticket);

  if (reason === "alarm") return "Reminder active";
  if (reason === "target-date") return "Overdue";

  return null;
}

export function shouldBlinkSelfTicket(
  ticket: SelfTicketData,
  currentDate = new Date(),
) {
  return getSelfTicketAlertReason(ticket, currentDate) !== null;
}

/**
 * Overdue for display (cards, calendar): the task is flagged by the existing
 * rule (reminder or target date) and is open with a target date of today or
 * earlier. An active reminder alone is not "overdue".
 */
export function isSelfTicketOverdue(ticket: SelfTicketData, currentDate = new Date()) {
  if (!getSelfTicketAlertReason(ticket, currentDate)) return false;
  const targetDay = parseSelfTicketTargetDay(ticket.target_date);
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);
  return targetDay !== null && targetDay <= today.getTime();
}

export type ReminderState = "active" | "scheduled" | "off";

/** Reminder off (no interval), scheduled (interval set) or active (due now). */
export function getReminderState(ticket: SelfTicketData): ReminderState {
  if (ticket.alarm === true) return "active";
  return ticket.reminder_interval ? "scheduled" : "off";
}
