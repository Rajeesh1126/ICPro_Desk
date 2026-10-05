import type { SelfTicketData } from "../../types/dataTypes";

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

  if (reason === "alarm") return "Alerting because reminder alarm is active.";
  if (reason === "target-date") {
    return "Alerting because target date over-due.";
  }

  return null;
}

export function shouldBlinkSelfTicket(
  ticket: SelfTicketData,
  currentDate = new Date(),
) {
  return getSelfTicketAlertReason(ticket, currentDate) !== null;
}
