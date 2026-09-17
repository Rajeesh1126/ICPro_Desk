import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Avatar,
  Stack,
  Tooltip,
} from "@mui/material";

import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";

import { alpha } from "@mui/material/styles";
import type { TicketData } from "../../types/dataTypes";
import { formatDate } from "../common/formatDate";
import {
  alarmBellSx,
  detailLabelSx,
  detailValueSx,
  minWidthZeroSx,
  pushRightSx,
  secondaryTextSx,
  ticketsBasicCardAvatarSx1,
  ticketsBasicCardBoxSx1,
  ticketsBasicCardBoxSx2,
  ticketsBasicCardCardContentSx1,
  ticketsBasicCardDividerSx1,
  ticketsBasicCardDynamicDynamicCardSx1,
  ticketsBasicCardDynamicDynamicChipSx1,
  ticketsBasicCardDynamicDynamicTypographySx1,
  ticketsBasicCardTypographySx1,
  ticketsBasicCardTypographySx2,
  ticketsBasicCardTypographySx3,
} from "../../styles/common";

interface BasicCardProps {
  ticket: TicketData;
  onOpen: (data: TicketData) => void;
}

function parseTicketDueDay(value: string | null | undefined) {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).setHours(0, 0, 0, 0);
  }

  const normalizedValue = value.replace(" ", "T");
  const dueDate = new Date(normalizedValue);
  const timestamp = dueDate.getTime();
  dueDate.setHours(0, 0, 0, 0);

  return Number.isNaN(timestamp) ? null : dueDate.getTime();
}

function isActiveDueTicket(ticket: TicketData) {
  const dueDay = parseTicketDueDay(ticket.target_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const status = ticket.current_status?.toLowerCase() ?? "";
  const activeStatuses = [
    "open",
    "modified",
    "reopened",
    "in progress",
    "assigned",
    "not-satisfied",
    "accepted",
    "recall requested",
  ];

  return (
    dueDay !== null &&
    dueDay <= today.getTime() &&
    activeStatuses.includes(status)
  );
}

export default function BasicCardComponent({
  ticket,
  onOpen,
}: BasicCardProps) {
  if (!ticket?.number) return null;

  const getPriorityStyles = (priority: string | null | undefined) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return { color: "#d32f2f", bg: "#feebea", border: "#fcc7c3" };
      case "medium":
        return { color: "#d1a104", bg: "#fff4e5", border: "#ffe2b7" };
      case "low":
        return { color: "#2e7d32", bg: "#edf7ed", border: "#c8e6c9" };
      default:
        return { color: "#607d8b", bg: "#f5f5f5", border: "#e0e0e0" };
    }
  };

  const styles = getPriorityStyles(ticket.priority);
  const hasAlarm = ticket.alarm === true;
  const highlighted = hasAlarm || isActiveDueTicket(ticket);
  const assignedInitials = ticket.assigned_to_name
    ? ticket.assigned_to_name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <Card
      elevation={0}
      onClick={() => onOpen(ticket)}
      sx={ticketsBasicCardDynamicDynamicCardSx1({ highlighted, styles })}
    >
      <CardContent sx={ticketsBasicCardCardContentSx1}>
        <Stack
          direction={{ xs: "row", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={0.5}
          mb={1}
        >
          <Typography
            sx={ticketsBasicCardDynamicDynamicTypographySx1({ styles })}
          >
            Ticket No #{ticket.number}
          </Typography>
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={secondaryTextSx}
          >
            {hasAlarm && (
              <Tooltip title="Reminder active">
                <NotificationsActiveRoundedIcon
                  fontSize="small"
                  style={{ color: styles.color }}
                  titleAccess="Reminder active"
                  sx={alarmBellSx}
                />
              </Tooltip>
            )}
            <Typography sx={ticketsBasicCardTypographySx1}>
              {ticket.created_at ? formatDate(ticket.created_at) : "N/A"}
            </Typography>
          </Stack>
        </Stack>

        <Typography variant="h6" sx={ticketsBasicCardTypographySx2}>
          {ticket.task}
        </Typography>

        <Typography variant="body2" sx={ticketsBasicCardTypographySx3}>
          {ticket.description}
        </Typography>

        <Divider sx={ticketsBasicCardDividerSx1} />

        <Box sx={ticketsBasicCardBoxSx1}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={minWidthZeroSx}
          >
            <Avatar sx={ticketsBasicCardAvatarSx1}>{assignedInitials}</Avatar>
            <Box>
              <Typography sx={detailLabelSx}>Assigned</Typography>
              <Typography sx={detailValueSx}>
                {ticket.assigned_to_name || "Unassigned"}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={pushRightSx}
          >
            <Box sx={ticketsBasicCardBoxSx2}>
              <Typography sx={detailLabelSx}>Target date</Typography>
              <Typography sx={detailValueSx}>
                {ticket.target_date ? formatDate(ticket.target_date) : "N/A"}
              </Typography>
            </Box>
            <Chip
              label={ticket.priority || "Normal"}
              size="small"
              sx={ticketsBasicCardDynamicDynamicChipSx1({ alpha, styles })}
            />
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
