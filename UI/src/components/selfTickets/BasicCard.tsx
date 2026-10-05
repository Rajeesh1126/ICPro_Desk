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

import { alpha } from "@mui/material/styles";
import type { SelfTicketData } from "../../types/dataTypes";
import { formatDate } from "../common/formatDate";
import {
  getSelfTicketAlertMessage,
  shouldBlinkSelfTicket,
} from "./highlight";
import {
  compactTextSx,
  alarmBellSx,
  detailLabelSx,
  detailValueSx,
  secondaryTextSx,
  // secondaryTextSx,
  // selfTicketsBasicCardBoxSx1,
  selfTicketsBasicCardCardContentSx1,
  selfTicketsBasicCardDividerSx1,
  selfTicketsBasicCardDynamicDynamicCardSx1,
  selfTicketsBasicCardDynamicDynamicChipSx1,
  selfTicketsBasicCardDynamicDynamicTypographySx1,
  selfTicketsBasicCardTypographySx3,
  selfTicketsBasicCardTypographySx4,
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
  if (!ticket?.number) return null;

  const getPriorityStyles = (priority: string | null) => {
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
  const highlighted = shouldBlinkSelfTicket(ticket);
  const alertMessage = getSelfTicketAlertMessage(ticket);

  return (
    <Card
      elevation={0}
      onClick={() => onOpen(ticket)}
      sx={selfTicketsBasicCardDynamicDynamicCardSx1({ highlighted, styles })}
    >
      <CardContent sx={selfTicketsBasicCardCardContentSx1}>

        {alertMessage && (
          <Stack direction="row" justifyContent="flex-end" mb={0.75}>
            <Chip
              label={alertMessage}
              size="small"
              variant="outlined"
              sx={{
                color: styles.color,
                borderColor: styles.color,
              }}
              // sx={{
              //   ...selfTicketsBasicCardDynamicDynamicChipSx1({ alpha, styles }),
              //   minWidth: { xs: "auto", sm: 60 },
              // }}
            />
            {/* <Typography
              variant="caption"
              sx={{
                color: styles.color,
                fontSize: 11,
                fontWeight: 700,
                lineHeight: 1.3,
                textAlign: "right",
              }}
            >
              {alertMessage}
            </Typography> */}
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
            sx={selfTicketsBasicCardDynamicDynamicTypographySx1({ styles })}
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
            <Typography sx={selfTicketsBasicCardTypographySx3}>
              {ticket.created_at ? formatDate(ticket.created_at) : "N/A"}
            </Typography>
          </Stack>
        </Stack>

        

        <Typography variant="h6" sx={selfTicketsBasicCardTypographySx4}>
          {ticket.task}
        </Typography>

        <Divider sx={selfTicketsBasicCardDividerSx1} />

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
                ...selfTicketsBasicCardDynamicDynamicChipSx1({ alpha, styles }),
                minWidth: { xs: "auto", sm: 60 },
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
