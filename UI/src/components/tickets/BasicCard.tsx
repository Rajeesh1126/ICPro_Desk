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

import { alpha, useTheme } from "@mui/material/styles";
import type { TicketData } from "../../types/dataTypes";
import { formatDate } from "../common/formatDate";
import {
  alarmBellSx,
  detailLabelSx,
  detailValueSx,
  minWidthZeroSx,
  pushRightSx,
  secondaryTextSx,
  ticketCardAssigneeAvatarSx,
  sharedCardMetaRowSx,
  ticketCardTargetDateSx,
  sharedCardContentSx,
  sharedCardDividerSx,
  ticketCardSx,
  ticketCardPriorityChipSx,
  ticketCardNumberSx,
  ticketCardDateSx,
  sharedCardTitleSx,
  ticketCardDescriptionSx,
  getPriorityCardStyles,
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
    "revised",
    "reopened",
    "in progress",
    "assigned",
    "not-satisfied",
    "accepted",
    "recall requested",
    "date revision",
    "pending",
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
  const theme = useTheme();
  if (!ticket?.number) return null;

  const styles = getPriorityCardStyles(theme, ticket.priority);
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
      role="button"
      tabIndex={0}
      aria-label={`Open ticket ${ticket.number}${ticket.task ? `: ${ticket.task}` : ""}`}
      onKeyDown={(event: React.KeyboardEvent) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpen(ticket);
            }
          }}
      sx={ticketCardSx({ highlighted, styles })}
    >
      <CardContent sx={sharedCardContentSx}>
        <Stack
          direction={{ xs: "row", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={0.5}
          mb={1}
        >
          <Typography
            sx={ticketCardNumberSx({ styles })}
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
            <Typography sx={ticketCardDateSx}>
              {ticket.created_at ? formatDate(ticket.created_at) : "N/A"}
            </Typography>
          </Stack>
        </Stack>

        <Typography variant="h6" sx={sharedCardTitleSx}>
          {ticket.task}
        </Typography>

        <Typography variant="body2" sx={ticketCardDescriptionSx}>
          {ticket.description}
        </Typography>

        <Divider sx={sharedCardDividerSx} />

        <Box sx={sharedCardMetaRowSx}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={minWidthZeroSx}
          >
            <Avatar sx={ticketCardAssigneeAvatarSx}>{assignedInitials}</Avatar>
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
            <Box sx={ticketCardTargetDateSx}>
              <Typography sx={detailLabelSx}>Target date</Typography>
              <Typography sx={detailValueSx}>
                {ticket.target_date ? formatDate(ticket.target_date) : "N/A"}
              </Typography>
            </Box>
            <Chip
              label={ticket.priority || "Normal"}
              size="small"
              sx={ticketCardPriorityChipSx({ alpha, styles })}
            />
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
