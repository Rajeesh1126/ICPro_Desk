import { Box, Typography } from "@mui/material";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { getReminderState } from "@/components/selfTickets/highlight";
import { reminderSummary } from "@/components/selfTickets/schedule";
import type { SelfTicketData } from "@/types/dataTypes";
import { inlineCenterGapSx } from "@/styles/common";

/** Reminder column cell: active, scheduled or off. */
export default function ReminderCell({ row }: { row: SelfTicketData }) {
  const reminder = getReminderState(row);
  if (reminder === "active") {
    return (
      <Box sx={inlineCenterGapSx}>
        <NotificationsActiveOutlinedIcon color="warning" fontSize="small" aria-hidden="true" />
        <Typography color="warning.main" fontWeight={600} fontSize={13.5}>
          Active
        </Typography>
      </Box>
    );
  }
  if (reminder === "scheduled") {
    return (
      <Box sx={inlineCenterGapSx}>
        <NotificationsNoneOutlinedIcon fontSize="small" aria-hidden="true" />
        <Typography fontSize={13.5}>{reminderSummary(row)}</Typography>
      </Box>
    );
  }
  return (
    <Box sx={inlineCenterGapSx}>
      <NotificationsOffOutlinedIcon color="disabled" fontSize="small" aria-hidden="true" />
      <Typography color="text.secondary" fontSize={13.5}>
        Off
      </Typography>
    </Box>
  );
}
