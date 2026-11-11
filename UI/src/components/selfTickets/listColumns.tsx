import type { ColumnData } from "@/components/common/TableView";
import { DueDateCell } from "@/components/common/TicketPageParts";
import Pill from "@/components/common/Pill";
import { priorityColor, priorityLabel, statusColor, statusLabel } from "@/components/common/pillValues";
import ScheduleCell from "@/components/selfTickets/ScheduleCell";
import ReminderCell from "@/components/selfTickets/ReminderCell";
import type { SelfTicketData } from "@/types/dataTypes";

/**
 * The Do List table columns, shared by the Do List list view and the
 * Executive Overview Do List tab so both read the same. Callers supply the
 * task-number cell (its actions differ) and the due date (the report lists
 * each recurring occurrence as its own row).
 */
export function selfTicketListColumns({
  numberColumn,
  dueDate,
}: {
  numberColumn: ColumnData<SelfTicketData>;
  dueDate: (row: SelfTicketData) => { date: string; overdue: boolean };
}): ColumnData<SelfTicketData>[] {
  return [
    numberColumn,
    // Same order and treatment as the Tickets table: subject, status pill,
    // then schedule, due date and priority; phone cards lead with these.
    { label: "Subject", dataKey: "task", width: 280, wrap: true, mobileOrder: 1 },
    {
      label: "Status",
      dataKey: "current_status",
      width: 130,
      render: (row) => <Pill value={statusLabel(row.current_status)} color={statusColor(row.current_status)} dot />,
    },
    {
      label: "Schedule",
      width: 170,
      mobileOrder: 4,
      render: (row) => <ScheduleCell type={row.schedule_type} />,
    },
    {
      label: "Due Date",
      dataKey: "target_date",
      width: 180,
      mobileOrder: 2,
      render: (row) => {
        const { date, overdue } = dueDate(row);
        return <DueDateCell date={date} overdue={overdue} />;
      },
    },
    {
      label: "Priority",
      dataKey: "priority",
      width: 100,
      mobileOrder: 3,
      render: (row) => <Pill value={priorityLabel(row.priority)} color={priorityColor(row.priority)} />,
    },
    { label: "Owner", dataKey: "creator_name", width: 150 },
    { label: "Est Hrs", dataKey: "est_hours", format: "hours", width: 90 },
    { label: "Reminder", width: 170, render: (row) => <ReminderCell row={row} /> },
  ];
}
