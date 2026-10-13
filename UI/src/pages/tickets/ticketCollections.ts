import type { TicketCollections, TicketData, TicketLog } from "../../types/dataTypes";

export const emptyTicketCollections: TicketCollections = {
  all: [],
  assigned: [],
  created: [],
  closed: [],
  rejected: [],
  recalled: [],
};

const inactiveStatuses = ["rejected", "closed", "recall successful"];

/**
 * Splits one cached `/tickets/` response into every tab's dataset, so
 * switching tabs never triggers another request.
 */
export function buildTicketCollections(
  data: unknown,
  userId: number | null,
): TicketCollections {
  const source = (Array.isArray(data) ? data : []) as TicketData[];
  const all = source.map((ticket) => {
    const latestAcceptedLog: TicketLog | null =
      ticket.current_status === "assigned"
        ? (ticket.logs?.find((log) => log.status.includes("open")) ?? null)
        : null;
    return {
      ...ticket,
      assigned_to_name: ticket.assigned_to_name || "Unassigned",
      creator_name: ticket.creator_name || "Unassigned",
      display_status: ticket.current_status,
      latestAcceptedLog,
    };
  });
  const mine = (ticket: TicketData) =>
    ticket.assigned_to === userId || ticket.creator === userId;

  return {
    all: all.filter(mine),
    assigned: all.filter(
      (ticket) =>
        (!inactiveStatuses.includes(ticket.current_status) &&
          ticket.assigned_to === userId) ||
        ticket.latestAcceptedLog?.assigned_to === userId,
    ),
    created: all.filter(
      (ticket) =>
        ticket.creator === userId &&
        !inactiveStatuses.includes(ticket.current_status),
    ),
    closed: all.filter(
      (ticket) => mine(ticket) && ticket.display_status === "closed",
    ),
    rejected: all.filter(
      (ticket) => ticket.current_status === "rejected" && mine(ticket),
    ),
    recalled: all.filter(
      (ticket) => ticket.current_status === "recall successful" && mine(ticket),
    ),
  };
}
