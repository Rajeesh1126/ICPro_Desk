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
  if (ticket.is_active === false || ticket.current_status?.toLowerCase() !== "open") return null;
  // Recurring: judged by its open occurrences, not the schedule start date.
  if (ticket.schedule_type === "recurring") {
    const open = (ticket.occurrences ?? []).filter((item) => item.current_status === "open");
    if (open.some((item) => item.alarm)) return "alarm";
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    return open.some(
      (item) => (parseSelfTicketTargetDay(item.scheduled_date) ?? Infinity) <= today.getTime(),
    )
      ? "target-date"
      : null;
  }
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
  const targetDay = parseSelfTicketTargetDay(selfTicketDisplayDueDate(ticket));
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);
  return targetDay !== null && targetDay <= today.getTime();
}

export type ReminderState = "active" | "scheduled" | "off";

/** Reminder off (none set), scheduled (days before due or an interval) or active (due now). */
export function getReminderState(ticket: SelfTicketData): ReminderState {
  if (ticket.alarm === true) return "active";
  const setting =
    ticket.reminder_mode === "before_due" ? ticket.reminder_days_before : ticket.reminder_interval;
  return setting ? "scheduled" : "off";
}

/**
 * Date to show for a task: its target date, or for a recurring task the next
 * open occurrence (target_date stays the schedule start used when editing).
 */
export function selfTicketDisplayDueDate(ticket: SelfTicketData): string {
  if (ticket.schedule_type !== "recurring") return ticket.target_date;
  return ticket.occurrences?.find((item) => item.current_status === "open")?.scheduled_date ?? "";
}
