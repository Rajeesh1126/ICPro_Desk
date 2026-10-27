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

const TimeSheetTicketsModal: React.FC<TimeSheetTicketsModalProps> = ({
  open,
  tickets,
  loading = false,
  submitting = false,
  onClose,
  onSubmit,
}) => {
  const [selectedTicketIds, setSelectedTicketIds] = useState<number[]>([]);

  const toggleTicket = (ticketId: number, checked: boolean) => {
    setSelectedTicketIds((current) =>
      checked
        ? current.includes(ticketId)
          ? current
          : [...current, ticketId]
        : current.filter((id) => id !== ticketId),
    );
  };

  const closeModal = () => {
    setSelectedTicketIds([]);
    onClose();
  };

  const submitTickets = async () => {
    await onSubmit(selectedTicketIds);
    setSelectedTicketIds([]);
  };

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
      { label: "Status", dataKey: "current_status", width: 150 },
      { label: "Priority", dataKey: "priority", width: 120 },
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
        <Button
          variant="contained"
          startIcon={<AssignmentTurnedInOutlinedIcon />}
          disabled={submitting || selectedTicketIds.length === 0}
          onClick={() => void submitTickets()}
        >
          {submitting ? "Assigning..." : "Assign Tickets"}
        </Button>
      </DialogActions>
      <Box sx={ticketsDialogNoteSx}>
        Open and closed tickets are not listed.
      </Box>
    </Dialog>
  );
};

export default TimeSheetTicketsModal;
