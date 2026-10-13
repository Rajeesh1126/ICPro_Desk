import type { ReactElement } from "react";
import { Box, Typography } from "@mui/material";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { formatStatusLabel, getStatusColor } from "../../styles/common";

const iconByStatus: Record<string, ReactElement> = {
  accepted: <CheckCircleOutlineOutlinedIcon />,
  ontime: <CheckCircleOutlineOutlinedIcon />,
  completed: <CheckCircleOutlineOutlinedIcon />,
  rejected: <CancelOutlinedIcon />,
  "unlock rejected": <CancelOutlinedIcon />,
  delayed: <ScheduleOutlinedIcon />,
  "not submitted": <RemoveCircleOutlineOutlinedIcon />,
  submitted: <SendOutlinedIcon />,
  pending: <HourglassEmptyOutlinedIcon />,
  requested: <HourglassEmptyOutlinedIcon />,
  unlocked: <LockOpenOutlinedIcon />,
};

/**
 * Status shown as icon + text + colour, so no state relies on colour alone.
 * Unknown statuses fall back to a coloured dot beside the label.
 */
export default function StatusIndicator({ status }: { status: string | null | undefined }) {
  const key = String(status ?? "").trim().toLowerCase();
  const icon = iconByStatus[key] ?? <FiberManualRecordIcon sx={{ fontSize: "10px !important" }} />;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        color: getStatusColor(status ?? undefined),
        "& .MuiSvgIcon-root": { fontSize: 16 },
      }}
    >
      <Box component="span" aria-hidden="true" sx={{ display: "inline-flex" }}>
        {icon}
      </Box>
      <Typography component="span" variant="body2" fontWeight={700} color="text.primary">
        {formatStatusLabel(status ?? "")}
      </Typography>
    </Box>
  );
}
