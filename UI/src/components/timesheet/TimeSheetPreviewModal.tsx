import { formatHoursMinutes } from "@/utils/hoursMinutes";
import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  TableCell,
  TableRow,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import {
  VirtualizedTable,
  type ColumnData,
} from "@/components/common/TableView";
import DialogHeader from "@/components/common/DialogHeader";
import {
  previewActionsSx,
  previewSectionSx,
  previewSectionTitleSx,
  strongTextSx,
} from "@/styles/common";

export interface TimeSheetDay {
  day: string;
  hours: number;
}

type TimeSheetPreviewRow = TimeSheetDay;

interface TimeSheetPreviewModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    days: TimeSheetDay[];
    totalHours: number;
    comments: string;
  }) => void;
  days?: TimeSheetDay[];
  submitting?: boolean;
}

const TimeSheetPreviewModal: React.FC<TimeSheetPreviewModalProps> = ({
  open,
  onClose,
  onSubmit,
  days,
  submitting = false,
}) => {
  const [comments, setComments] = useState("");

  const timeSheetDays = useMemo<TimeSheetPreviewRow[]>(
    () => (days ?? []).map((item) => ({ ...item })),
    [days],
  );

  const totalHours = useMemo(() => {
    return timeSheetDays.reduce(
      (total, item) => total + Number(item.hours || 0),
      0
    );
  }, [timeSheetDays]);

  const handleSubmit = () => {
    onSubmit({
      days: timeSheetDays,
      totalHours,
      comments,
    });
  };

  // `hours` arrive as decimal hours; show them in the timesheet's h.mm
  // notation (1.30 = 1 h 30 m) so the preview matches the grid.
  const formatHours = (hours: number) =>
    hours > 0 ? formatHoursMinutes(hours * 3600) : "";

  const columns = useMemo<ColumnData<TimeSheetPreviewRow>[]>(
    () => [
      {
        label: "Day",
        dataKey: "day",
      },
      {
        label: "Hours",
        dataKey: "hours",
        width: 120,
        numeric: true,
        render: (row) => formatHours(row.hours),
      },
    ],
    [],
  );

  const renderFooter = () => (
    <TableRow>
      <TableCell sx={strongTextSx}>Total</TableCell>
      <TableCell align="right" sx={strongTextSx}>
        {formatHoursMinutes(totalHours * 3600)}
      </TableCell>
    </TableRow>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      {/* Header */}
      <DialogHeader title="Total Work Hours" onClose={onClose} />

      <DialogContent>
        <VirtualizedTable
          columns={columns}
          rows={timeSheetDays}
          height="45dvh"
          tableHead="Work Hours"
          tableMinWidth={360}
          fixedFooterContent={renderFooter}
        />

        {/* Comments */}
        <Box sx={previewSectionSx}>
          <Typography
            sx={previewSectionTitleSx}
          >
            Comments
          </Typography>

          <TextField
            fullWidth
            multiline
            minRows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            variant="outlined"
          />
        </Box>

        {/* Submit */}
        <Box
          sx={previewActionsSx}
        >
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? undefined : <SendOutlinedIcon />}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TimeSheetPreviewModal;
