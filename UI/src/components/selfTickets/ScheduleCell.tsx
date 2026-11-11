import { Box, Typography } from "@mui/material";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import DateRangeOutlinedIcon from "@mui/icons-material/DateRangeOutlined";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
import type { SelfTicketSchedule } from "@/types/dataTypes";
import { scheduleLabel } from "@/components/selfTickets/schedule";
import { inlineCenterGapSx } from "@/styles/common";

const ICONS = {
  static: EventOutlinedIcon,
  period: DateRangeOutlinedIcon,
  recurring: EventRepeatOutlinedIcon,
};

/** Schedule type icon for a Do List task (one-time, period, recurring). */
export function ScheduleIcon({ type }: { type: SelfTicketSchedule["schedule_type"] }) {
  const Icon = ICONS[type ?? "static"] ?? EventOutlinedIcon;
  return <Icon fontSize="small" color="action" aria-hidden="true" />;
}

/** Table cell: schedule icon and label, styled like the Reminder column. */
export default function ScheduleCell({ type }: { type: SelfTicketSchedule["schedule_type"] }) {
  return (
    <Box sx={inlineCenterGapSx}>
      <ScheduleIcon type={type} />
      <Typography fontSize={13.5}>{scheduleLabel(type)}</Typography>
    </Box>
  );
}
