import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Stack,
} from "@mui/material";

import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { alpha } from "@mui/material/styles";
import type { SelfTicketData } from "../../types/TicketData";
import { formatDate } from "../common/formatDate";
import { compactTextSx, detailLabelSx, detailValueSx, secondaryTextSx, selfTicketsBasicCardBoxSx1, selfTicketsBasicCardCardContentSx1, selfTicketsBasicCardDividerSx1, selfTicketsBasicCardDynamicDynamicCardSx1, selfTicketsBasicCardDynamicDynamicChipSx1, selfTicketsBasicCardDynamicDynamicTypographySx1, selfTicketsBasicCardTypographySx1, selfTicketsBasicCardTypographySx3, selfTicketsBasicCardTypographySx4 } from "../../styles/common";

interface BasicCardProps {
  ticket: SelfTicketData;
  onOpen: (data: SelfTicketData) => void;
}
const currentUserParsed = JSON.parse(
  localStorage.getItem("currentUser") || "null",
);

const currentUserId = currentUserParsed?.id ?? null;

export default function BasicCardSelfTicket({
  ticket,
  onOpen,
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

  // console.log("BasicCardSelfTicket - ticket:", ticket);

  return (
    <Card
      elevation={0}
      onClick={() => onOpen(ticket)}
      sx={selfTicketsBasicCardDynamicDynamicCardSx1({ styles })}
    >
      <CardContent sx={selfTicketsBasicCardCardContentSx1}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          // gap={0.5}
          mb={1}
        >
           <Stack direction="row">

          
          <Typography
            sx={selfTicketsBasicCardDynamicDynamicTypographySx1({ styles })}
          >
            Task No #{ticket.number}
          </Typography>

          {/* {ticket.logs?.length > 0 && (
            <Tooltip title={ticket.comments}>
              <CommentIcon 
                fontSize="small" 
                color="primary" 
                sx={{
                  animation: "blink 1s infinite",
                  "@keyframes blink": {
                    "0%": { opacity: 1 },
                    "50%": { opacity: 0.2 },
                    "100%": { opacity: 1 },
                  },
                }}
              />
            </Tooltip>
          )} */}
          </Stack>

          {ticket.reporting_to == currentUserId ? (
            <Stack direction="row">
              <Typography sx={selfTicketsBasicCardTypographySx1}>
                Owner :
              </Typography>
              <Typography sx={compactTextSx}>
                {ticket.creator_name ? ticket.creator_name : ""}
              </Typography>
            </Stack>
          ) : (
            ""
          )}
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={secondaryTextSx}
          >
            <AccessTimeIcon sx={compactTextSx} />
            <Typography
              sx={selfTicketsBasicCardTypographySx3}
            >
              {ticket.created_at ? formatDate(ticket.created_at) : "N/A"}
            </Typography>
          </Stack>
        </Stack>

        <Typography variant="h6" sx={selfTicketsBasicCardTypographySx4}>
          {ticket.task}
        </Typography>

        <Divider sx={selfTicketsBasicCardDividerSx1} />

        <Box
          sx={selfTicketsBasicCardBoxSx1}
        >
          <Box>
            <Typography
              sx={detailLabelSx}
            >
              Reminder Interval
            </Typography>
            <Typography sx={detailValueSx}>
              {/* {ticket.reminder_interval ? `${ticket.reminder_interval} days` : "N/A"} */}
              {ticket.reminder_interval
                ? `${ticket.reminder_interval} day${
                    ticket.reminder_interval > 1 ? "s" : ""
                  }`
                : "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography
              sx={detailLabelSx}
            >
              Due date
            </Typography>
            <Typography sx={detailValueSx}>
              {ticket.target_date ? formatDate(ticket.target_date) : "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography
              sx={detailLabelSx}
            >
              Ticket No
            </Typography>
            <Typography sx={detailValueSx}>
              {ticket.ticket_number ? ticket.ticket_number : "N/A"}
            </Typography>
          </Box>

          <Chip
            label={ticket.priority || "Normal"}
            size="small"
            sx={selfTicketsBasicCardDynamicDynamicChipSx1({ alpha, styles })}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
