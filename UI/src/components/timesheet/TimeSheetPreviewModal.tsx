import { formatHoursMinutes } from "../../utils/hoursMinutes";
import { INSET_X, INSET_Y } from "../../styles/tokens";
import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TableCell,
  TableRow,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import {
  VirtualizedTable,
  type ColumnData,
} from "../common/TableView";

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
      <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
      <TableCell align="right" sx={{ fontWeight: 700 }}>
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
      PaperProps={{
        sx: {
          borderRadius: "8px",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          px: INSET_X,
          py: INSET_Y,
          fontSize: "20px",
          fontWeight: 600,
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        Total Work Hours

        <IconButton aria-label="Close dialog"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 6,
            color: "text.secondary",
          }}
        >
          <CloseOutlinedIcon />
        </IconButton>
      </DialogTitle>

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
        <Box sx={{ mt: 2 }}>
          <Typography
            sx={{
              fontSize: "16px",
              color: "text.primary",
              mb: 0.5,
            }}
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
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? undefined : <SendOutlinedIcon />}
            sx={{
              textTransform: "none",
              backgroundColor: "primary.main",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TimeSheetPreviewModal;
