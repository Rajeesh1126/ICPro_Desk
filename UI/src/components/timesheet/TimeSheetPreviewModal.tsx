import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import {
  tableHeaderCellSx,
  tableHeadSx,
} from "../../styles/common";

export interface TimeSheetDay {
  day: string;
  hours: number;
}

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
  const theme = useTheme();
  const [comments, setComments] = useState("");

  const timeSheetDays = useMemo(() => days ?? [], [days]);

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
        {/* Hours Table */}
        <TableContainer>
          <Table size="small">
            <TableHead sx={tableHeadSx(theme)}>
              <TableRow>
                <TableCell sx={tableHeaderCellSx(theme)}>
                  Day
                </TableCell>

                <TableCell sx={tableHeaderCellSx(theme)}>
                  Hours
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {timeSheetDays.map((item) => (
                <TableRow key={item.day}>
                  <TableCell
                    sx={{
                      py: 1.1,
                      color: "#444",
                      backgroundColor:
                        item.hours > 0 ? "#fafafa" : "#fff",
                    }}
                  >
                    {item.day}
                  </TableCell>

                  <TableCell
                    sx={{
                      py: 1.1,
                      color: "#555",
                      backgroundColor:
                        item.hours > 0 ? "#fafafa" : "#fff",
                    }}
                  >
                    {formatHours(item.hours)}
                  </TableCell>
                </TableRow>
              ))}

              {/* Total */}
              <TableRow
                sx={{
                  borderTop: "2px solid #222",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <TableCell
                  sx={{
                    fontWeight: 500,
                    color: "#555",
                    py: 1.1,
                  }}
                >
                  Total
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "#555",
                    py: 1.1,
                  }}
                >
                  {totalHours.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

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
