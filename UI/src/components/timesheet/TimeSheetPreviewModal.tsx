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

type TimeSheetPreviewRow = Record<string, unknown> & TimeSheetDay;

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

  const formatHours = (hours: number) => {
    return hours > 0 ? hours.toFixed(2) : "";
  };

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
      <TableCell align="right" sx={{ fontWeight: 800 }}>
        {totalHours.toFixed(2)}
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
          px: 2,
          py: 1,
          fontSize: "20px",
          fontWeight: 600,
          color: "#555",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        Total Work Hours

        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 6,
            color: "#777",
          }}
        >
          <CloseOutlinedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2, py: 2 }}>
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
              color: "#555",
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
            size="small"
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
              backgroundColor: "#55b5d3",
              "&:hover": {
                backgroundColor: "#45a5c3",
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
