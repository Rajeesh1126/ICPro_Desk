import { useMemo } from "react";
import { asArray, useApiQuery } from "@/api/useApiQuery";
import { shouldBlinkSelfTicket } from "@/components/selfTickets/highlight";
import type { NotificationsType, SelfTicketData, TicketData } from "@/types/dataTypes";
import { loggedUser } from "@/utils/currentUser";
import { getStoredPermissions } from "@/utils/permissions";
import { isActiveTicket } from "@/utils/ticketDue";

/**
 * Header bell counts, from the same cached requests the Do List and Tickets
 * pages use, so opening either page reuses them. There is no notifications
 * endpoint: these are the current counts, not a history of updates.
 *
 * - Do List: the person's own tasks flagged by a reminder or a due date.
 * - Tickets: active tickets assigned to the person.
 */
export function useNotificationCounts(): NotificationsType {
  const permissions = getStoredPermissions();
  const userId = loggedUser();

  const selfTickets = useApiQuery<SelfTicketData[]>(
    "/self-tickets/",
    { do_List: true },
    { enabled: permissions.has("access_self_tickets") },
  );
  const tickets = useApiQuery<TicketData[]>(
    "/tickets/",
    { is_internal: false },
    { enabled: permissions.has("access_tickets") },
  );

  return useMemo(
    () => ({
      selfticketOpenCount: asArray<SelfTicketData>(selfTickets.data).filter(
        (task) => task.creator === userId && shouldBlinkSelfTicket(task),
      ).length,
      ticketOpenCount: asArray<TicketData>(tickets.data).filter(
        (ticket) => ticket.assigned_to === userId && isActiveTicket(ticket),
      ).length,
    }),
    [selfTickets.data, tickets.data, userId],
  );
}
