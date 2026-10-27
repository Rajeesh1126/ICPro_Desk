import type { ReactNode } from "react";
import { Box, Chip, Dialog, DialogContent, Stack, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import DialogHeader from "@/components/common/DialogHeader";
import {
  logDetailSummarySx,
  minWidthZero,
  noShrinkSx,
} from "@/styles/common";

interface LogDetailDialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
}

/** Shared shell for the Timesheet Logs per-week detail dialogs. */
export default function LogDetailDialog({ open, onClose, title, subtitle, children }: LogDetailDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Dialog open={open} onClose={onClose} fullWidth fullScreen={fullScreen} maxWidth="sm" scroll="paper">
      <DialogHeader title={title} subtitle={subtitle} onClose={onClose} />
      <DialogContent>
        <Stack spacing={1}>{children}</Stack>
      </DialogContent>
    </Dialog>
  );
}

type ReviewStatus = "Accepted" | "Rejected" | "Mixed" | "Pending" | string;

const statusChip: Record<string, { color: "success" | "error" | "warning" | "default"; icon: ReactNode }> = {
  Accepted: { color: "success", icon: <CheckCircleOutlineOutlinedIcon /> },
  Rejected: { color: "error", icon: <CancelOutlinedIcon /> },
  Mixed: { color: "warning", icon: <RuleOutlinedIcon /> },
  Pending: { color: "default", icon: <HourglassEmptyOutlinedIcon /> },
};

/** One person row inside a log detail dialog; the status reads by icon and text, not colour alone. */
export function LogDetailItem({
  name,
  details,
  status,
}: {
  name: ReactNode;
  details: ReactNode[];
  status: ReviewStatus;
}) {
  const chip = statusChip[status] ?? statusChip.Pending;
  return (
    <Box
      sx={logDetailSummarySx}
    >
      <Box sx={minWidthZero}>
        <Typography variant="body2" fontWeight={600}>
          {name}
        </Typography>
        {details.map((line, index) => (
          <Typography key={index} variant="caption" color="text.secondary" component="p">
            {line}
          </Typography>
        ))}
      </Box>
      <Chip
        icon={chip.icon as React.ReactElement}
        label={status}
        color={chip.color}
        variant={status === "Pending" ? "outlined" : "filled"}
        sx={noShrinkSx}
      />
    </Box>
  );
}
