import {
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Grid,
} from "@mui/material";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";

import { alpha, useTheme } from "@mui/material/styles";
import type { SelfTicketData } from "../../types/dataTypes";
import { formatDate } from "../common/formatDate";
import {
  getSelfTicketAlertMessage,
  getSelfTicketAlertReason,
  shouldBlinkSelfTicket,
} from "./highlight";
import {
  compactTextSx,
  alarmBellSx,
  detailLabelSx,
  detailValueSx,
  secondaryTextSx,
  sharedCardContentSx,
  sharedCardDividerSx,
  doListCardSx,
  doListCardPriorityChipSx,
  doListCardNumberSx,
  doListCardDateSx,
  sharedCardTitleSx,
  getPriorityCardStyles,
} from "../../styles/common";

interface BasicCardProps {
  ticket: SelfTicketData;
  onOpen: (data: SelfTicketData) => void;
  onAcknowledgeAlarm?: (data: SelfTicketData) => void;
}
const currentUserParsed = Number(localStorage.getItem("user") || "null");

const userId = currentUserParsed ?? null;

export default function BasicCardSelfTicket({
  ticket,
  onOpen,
  onAcknowledgeAlarm,
}: BasicCardProps) {
  const theme = useTheme();
  if (!ticket?.number) return null;

  const styles = getPriorityCardStyles(theme, ticket.priority);
  const hasAlarm = ticket.alarm === true;
  const highlighted = shouldBlinkSelfTicket(ticket);
  const alertMessage = getSelfTicketAlertMessage(ticket);
  const alertReason = getSelfTicketAlertReason(ticket);
  const isOverdue = alertReason === "target-date";

  return (
    <Card
      elevation={0}
      onClick={() => onOpen(ticket)}
      role="button"
      tabIndex={0}
      aria-label={`Open task ${ticket.number}${alertMessage ? `, ${alertMessage}` : ""}`}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(ticket);
        }
      }}
      sx={doListCardSx({ highlighted, styles })}
    >
      <CardContent sx={sharedCardContentSx}>

        {alertMessage && (
          <Stack
            direction="row"
            justifyContent={isOverdue ? "center" : "flex-end"}
            mb={0.75}
          >
            <Chip
              icon={
                alertReason === "alarm" ? (
                  <NotificationsActiveOutlinedIcon fontSize="small" />
                ) : (
                  <EventBusyOutlinedIcon fontSize="small" />
                )
              }
              label={alertMessage}
              size="small"
              color={isOverdue ? "error" : undefined}
              variant={isOverdue ? "filled" : "outlined"}
              sx={{
                fontWeight: 700,
                ...(isOverdue
                  ? { boxShadow: `0 2px 6px ${alpha(theme.palette.error.main, 0.28)}` }
                  : {
                      color: styles.color,
                      borderColor: styles.color,
                    }),
                "& .MuiChip-icon": { color: "inherit" },
              }}
            />
          </Stack>
        )}

        <Stack
          direction={{ xs: "row", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={0.5}
          mb={1}
        >
          <Typography
            sx={doListCardNumberSx({ styles })}
          >
            Task No #{ticket.number}
          </Typography>
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={secondaryTextSx}
          >
            {hasAlarm && (
              <Tooltip title="Acknowledge reminder">
                <IconButton
                  aria-label={`Acknowledge reminder ${ticket.number}`}
                  sx={{ color: styles.color }}
                  onClick={(event) => {
                    event.stopPropagation();
                    onAcknowledgeAlarm?.(ticket);
                  }}
                >
                  <NotificationsActiveRoundedIcon sx={alarmBellSx} />
                </IconButton>
              </Tooltip>
            )}
            {ticket.creator !== userId ? (
              <Typography sx={compactTextSx}>
                {ticket.creator_name ? ticket.creator_name : ""}
              </Typography>
            ) : (
              ""
            )}
            <Typography sx={doListCardDateSx}>
              {ticket.created_at ? formatDate(ticket.created_at) : "N/A"}
            </Typography>
          </Stack>
        </Stack>

        

        <Typography variant="h6" sx={sharedCardTitleSx}>
          {ticket.task}
        </Typography>

        <Divider sx={sharedCardDividerSx} />

        <Grid container spacing={1}>
          <Grid size={{ xs: 6, md: 3.5 }}>
            <Typography sx={detailLabelSx}>Reminder Interval</Typography>
            <Typography sx={detailValueSx}>
              {ticket.reminder_interval
                ? `${ticket.reminder_interval} day${
                  ticket.reminder_interval > 1 ? "s" : ""
                }`
                : "N/A"}
            </Typography>
          </Grid>
          <Grid
            size={{ xs: 6, md: 3 }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "flex-end", sm: "flex-start" },
              justifyContent: "flex-start",
              textAlign: { xs: "right", sm: "left" },
            }}
          >
            <Typography sx={detailLabelSx}>Target date</Typography>
            <Typography sx={detailValueSx}>
              {ticket.target_date ? formatDate(ticket.target_date) : "N/A"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3.5 }}>
            <Typography sx={detailLabelSx}>Ticket No</Typography>
            <Typography sx={detailValueSx}>
              {ticket.ticket_number ? ticket.ticket_number : "N/A"}
            </Typography>
          </Grid>
          <Grid
            size={{ xs: 6, md: 2 }}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-end",
            }}
          >
            <Chip
              label={ticket.priority || "Normal"}
              size="small"
              sx={{
                ...doListCardPriorityChipSx({ alpha, styles }),
                minWidth: { xs: "auto", sm: 60 },
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
