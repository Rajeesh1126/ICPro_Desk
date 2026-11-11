import Pill from "@/components/common/Pill";
import { priorityColor, priorityLabel, statusColor, statusLabel } from "@/components/common/pillValues";
import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
} from "@mui/material";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";

import { VirtualizedTable, type ColumnData } from "@/components/common/TableView";
import DialogHeader from "@/components/common/DialogHeader";
import {
  ticketsDialogContentSx,
  ticketsDialogNoteSx,
} from "@/styles/common";

/** Time Sheet Ticket Option declaration used across the frontend. */
export type TimeSheetTicketOption = {
  id: number;
  number: string;
  task: string;
  current_status: string;
  priority?: string;
  target_date?: string;
};

type TimeSheetTicketsModalProps = {
  open: boolean;
  tickets: TimeSheetTicketOption[];
  loading?: boolean;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (ticketIds: number[]) => void | Promise<void>;
};

// Selects assigned tickets to attach to a timesheet entry using a virtualized table.
const TimeSheetTicketsModal: React.FC<TimeSheetTicketsModalProps> = ({
  open,
  tickets,
  loading = false,
  submitting = false,
  onClose,
  onSubmit,
}) => {
  const [selectedTicketIds, setSelectedTicketIds] = useState<number[]>([]);

  // Adds or removes one ticket while preserving the selection order.
  const toggleTicket = (ticketId: number, checked: boolean) => {
    setSelectedTicketIds((current) =>
      checked
        ? current.includes(ticketId)
          ? current
          : [...current, ticketId]
        : current.filter((id) => id !== ticketId),
    );
  };

  // Clears local selection before leaving the modal so the next open starts clean.
  const closeModal = () => {
    setSelectedTicketIds([]);
    onClose();
  };

  // Submits the selected IDs and resets the selection after the parent completes.
  const submitTickets = async () => {
    await onSubmit(selectedTicketIds);
    setSelectedTicketIds([]);
  };

  // Derives table columns from selection state so each checkbox reflects the current choice.
  const columns = useMemo<ColumnData<TimeSheetTicketOption>[]>(
    () => [
      {
        label: "",
        width: 56,
        render: (row) => (
          <Checkbox
            checked={selectedTicketIds.includes(row.id)}
            onChange={(event) => toggleTicket(row.id, event.target.checked)}
            inputProps={{
              "aria-label": `Select ticket ${row.number}`,
            }}
          />
        ),
      },
      { label: "Ticket Number", dataKey: "number", width: 160 },
      { label: "Task", dataKey: "task", width: 260 },
      { label: "Status", dataKey: "current_status", width: 150, render: (row) => <Pill value={statusLabel(row.current_status)} color={statusColor(row.current_status)} dot /> },
      { label: "Priority", dataKey: "priority", width: 90, render: (row) => <Pill value={priorityLabel(row.priority)} color={priorityColor(row.priority)} /> },
      { label: "Target Date", dataKey: "target_date", width: 140 },
    ],
    [selectedTicketIds],
  );

  return (
    <Dialog open={open} onClose={closeModal} fullWidth maxWidth="lg">
      <DialogHeader title="Assigned Tickets" onClose={closeModal} />
      <DialogContent sx={ticketsDialogContentSx}>
        <VirtualizedTable
          columns={columns}
          rows={tickets}
          height="100%"
          tableHead={loading ? "Loading tickets..." : "Tickets"}
        />
      </DialogContent>
      <DialogActions>
        <Box sx={ticketsDialogNoteSx}>
          Open and closed tickets are not listed.
        </Box>
        <Button
          variant="contained"
          startIcon={<AssignmentTurnedInOutlinedIcon />}
          disabled={submitting || selectedTicketIds.length === 0}
          onClick={() => void submitTickets()}
        >
          {submitting ? "Assigning..." : "Assign Tickets"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimeSheetTicketsModal;
