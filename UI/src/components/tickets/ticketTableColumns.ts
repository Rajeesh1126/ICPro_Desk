import { createElement, useMemo } from "react";
import type { ColumnData } from "@/components/common/TableView";
import { DueDateCell, RecordNumberCell } from "@/components/common/TicketPageParts";
import type { TicketData } from "@/types/dataTypes";
import { isOverdueTicket } from "@/utils/ticketDue";

/** Secondary columns users can add back from the "Columns" menu. */
export const OPTIONAL_TICKET_COLUMNS = [
  "Assigned By",
  "Team",
  "Est Hrs",
  "Act Hrs",
  "Actual Completion",
] as const;

/** Hidden until the user picks them: the table leads with what to act on. */
export const DEFAULT_HIDDEN_TICKET_COLUMNS = OPTIONAL_TICKET_COLUMNS.join(",");

const LOCKED_STATUSES = ["closed", "recall successful", "recall requested", "completed"];

/**
 * Tickets / Work Let list columns. Widths favour Subject, Assigned To, Status
 * and Target Completion; phone cards lead with subject, target date (with
 * the overdue tag), priority and assignee.
 */
export function useTicketTableColumns({
  userId,
  onView,
  onEdit,
  withTeam = false,
  withActualHours = true,
}: {
  userId: number | null;
  onView: (ticket: TicketData) => void;
  onEdit: (ticket: TicketData) => void;
  withTeam?: boolean;
  withActualHours?: boolean;
}) {
  return useMemo<ColumnData<TicketData>[]>(() => {
    const columns: (ColumnData<TicketData> | false)[] = [
      {
        label: "Ticket Number",
        // View + edit buttons (2 × 36px) plus the full number, e.g. TM-050926-001.
        width: 224,
        render: (row) =>
          createElement(RecordNumberCell, {
            number: row.number,
            editTitle: "Edit ticket",
            editDisabled: row.creator !== userId || LOCKED_STATUSES.includes(row.current_status),
            onView: () => onView(row),
            onEdit: () => onEdit(row),
          }),
      },
      { label: "Subject", dataKey: "task", width: "auto", wrap: true, mobileOrder: 1 },
      { label: "Status", dataKey: "current_status", width: 160 },
      { label: "Assigned To", dataKey: "assigned_to_name", width: 160, mobileOrder: 4 },
      { label: "Assigned By", dataKey: "creator_name", width: 150 },
      withTeam && { label: "Team", dataKey: "department_name", width: 150 },
      { label: "Priority", dataKey: "priority", width: 100, mobileOrder: 3 },
      {
        label: "Target Completion",
        dataKey: "target_date",
        width: 180,
        mobileOrder: 2,
        render: (row) =>
          createElement(DueDateCell, { date: row.target_date, overdue: isOverdueTicket(row) }),
      },
      { label: "Est Hrs", dataKey: "est_hours", format: "hours", width: 90 },
      withActualHours && { label: "Act Hrs", dataKey: "act_hours", format: "hours", width: 90 },
      { label: "Actual Completion", dataKey: "actual_end_date", width: 150 },
    ];
    return columns.filter((column): column is ColumnData<TicketData> => Boolean(column));
  }, [userId, onView, onEdit, withTeam, withActualHours]);
}
