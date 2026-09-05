import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Stack,
} from "@mui/material";

// import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

import { alpha } from "@mui/material/styles";
import type { SelfTicketData } from "../../types/dataTypes";
import { formatDate } from "../common/formatDate";
import {
  compactTextSx,
  detailLabelSx,
  detailValueSx,
  // secondaryTextSx,
  selfTicketsBasicCardBoxSx1,
  selfTicketsBasicCardCardContentSx1,
  selfTicketsBasicCardDividerSx1,
  selfTicketsBasicCardDynamicDynamicCardSx1,
  selfTicketsBasicCardDynamicDynamicChipSx1,
  selfTicketsBasicCardDynamicDynamicTypographySx1,
  // selfTicketsBasicCardTypographySx1,
  selfTicketsBasicCardTypographySx3,
  selfTicketsBasicCardTypographySx4,
} from "../../styles/common";

interface BasicCardProps {
  ticket: SelfTicketData;
  onOpen: (data: SelfTicketData) => void;
}
const currentUserParsed = Number(localStorage.getItem("user") || "null");

const userId = currentUserParsed ?? null;

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

  return (
    <Card
      elevation={0}
      onClick={() => onOpen(ticket)}
      sx={selfTicketsBasicCardDynamicDynamicCardSx1({ styles })}
    >
      <CardContent sx={selfTicketsBasicCardCardContentSx1}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Typography
            sx={selfTicketsBasicCardDynamicDynamicTypographySx1({ styles })}
          >
            Task No #{ticket.number}
          </Typography>
          <Stack
            direction="column"
            sx={{
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            {ticket.creator !== userId ? (
              <Stack direction="row">
                {/* <Typography sx={selfTicketsBasicCardTypographySx1}>
                Owner: 
              </Typography> */}
                <Typography sx={compactTextSx}>
                  {ticket.creator_name ? ticket.creator_name : ""}
                </Typography>
              </Stack>
            ) : (
              ""
            )}

            <Typography sx={selfTicketsBasicCardTypographySx3}>
              {ticket.created_at ? formatDate(ticket.created_at) : "N/A"}
            </Typography>
          </Stack>
        </Box>

        <Typography variant="h6" sx={selfTicketsBasicCardTypographySx4}>
          {ticket.task}
        </Typography>

        <Divider sx={selfTicketsBasicCardDividerSx1} />

        <Box sx={selfTicketsBasicCardBoxSx1}>
          <Box>
            <Typography sx={detailLabelSx}>Reminder Interval</Typography>
            <Typography sx={detailValueSx}>
              {ticket.reminder_interval
                ? `${ticket.reminder_interval} day${
                    ticket.reminder_interval > 1 ? "s" : ""
                  }`
                : "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography sx={detailLabelSx}>Due date</Typography>
            <Typography sx={detailValueSx}>
              {ticket.target_date ? formatDate(ticket.target_date) : "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography sx={detailLabelSx}>Ticket No</Typography>
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
