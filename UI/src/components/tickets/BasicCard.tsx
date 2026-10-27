import { Card, CardContent, Typography, Box, Avatar } from "@mui/material";
import { isActiveTicket, isOverdueTicket } from "@/utils/ticketDue";

import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";

import type { TicketData } from "@/types/dataTypes";
import { formatDate, formatDueDate, formatOverdueLabel } from "@/components/common/formatDate";
import { PriorityPill, StatusPill } from "@/components/common/StatusPill";
import {
  boardCardCreatedSx,
  boardCardDueLabelSx,
  boardCardDueSx,
  boardCardFieldLabelSx,
  boardCardFieldSx,
  boardCardFieldValueSx,
  boardCardFooterSx,
  boardCardIndicatorsSx,
  boardCardMetaSx,
  boardCardNumberSx,
  boardCardTagSx,
  boardCardSx,
  boardCardTopRowSx,
  sharedCardContentSx,
  sharedCardTitleSx,
  ticketCardAssigneeAvatarSx,
  ticketCardDescriptionSx,
} from "@/styles/common";

interface BasicCardProps {
  ticket: TicketData;
  onOpen: (data: TicketData) => void;
  /** The board column's own stage; its status pill would only repeat it. */
  columnStatus?: string;
}

/**
 * Ticket work item (Tickets and Work Let boards):
 * 1. identifier + creation date, 2. subject, 3. description preview,
 * 4. status / priority / urgency, 5. assignee + target date.
 * Everything shown here is also in the details dialog.
 */
export default function BasicCardComponent({
  ticket,
  onOpen,
  columnStatus,
}: BasicCardProps) {
  if (!ticket?.number) return null;

  const hasAlarm = ticket.alarm === true;
  const isOverdue = isOverdueTicket(ticket);
  const due = formatDueDate(ticket.target_date);
  const exactDue = formatDate(ticket.target_date);
  // Urgency colours only matter while the ticket is still active.
  const dueTone = isActiveTicket(ticket) ? due.tone : "upcoming";
  const assignedInitials = ticket.assigned_to_name
    ? ticket.assigned_to_name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";
  // What needs action, in plain words for the banner and screen readers.
  const alertParts = [
    isOverdue ? formatOverdueLabel(ticket.target_date) ?? "Overdue" : null,
    hasAlarm ? "Reminder active" : null,
  ].filter((part): part is string => Boolean(part));

  return (
    <Card
      elevation={0}
      onClick={() => onOpen(ticket)}
      role="button"
      tabIndex={0}
      aria-label={`Open ticket ${ticket.number}${ticket.task ? `: ${ticket.task}` : ""}${
        alertParts.length ? `, ${alertParts.join(", ")}` : ""
      }`}
      onKeyDown={(event: React.KeyboardEvent) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(ticket);
        }
      }}
      sx={boardCardSx()}
    >
      <CardContent sx={sharedCardContentSx}>
        <Box sx={boardCardTopRowSx}>
          <Typography sx={boardCardNumberSx}>
            Ticket No #{ticket.number}
          </Typography>
          <Box sx={boardCardMetaSx}>
            <Typography sx={boardCardCreatedSx}>
              {formatDate(ticket.created_at)}
            </Typography>
          </Box>
        </Box>

        <Typography variant="h6" sx={sharedCardTitleSx}>
          {ticket.task}
        </Typography>

        {ticket.description && (
          <Typography variant="body2" sx={ticketCardDescriptionSx}>
            {ticket.description}
          </Typography>
        )}

        <Box sx={boardCardIndicatorsSx}>
          {/* Exact status only when it adds to the column (e.g. "Revised" under Open). */}
          {ticket.current_status !== columnStatus && <StatusPill status={ticket.current_status} />}
          <PriorityPill priority={ticket.priority || "Normal"} />
          {isOverdue && (
            <Box component="span" sx={boardCardTagSx("overdue")}>
              <EventBusyOutlinedIcon aria-hidden="true" />
              {formatOverdueLabel(ticket.target_date) ?? "Overdue"}
            </Box>
          )}
          {hasAlarm && !isOverdue && (
            <Box component="span" sx={boardCardTagSx("reminder")}>
              <NotificationsActiveRoundedIcon aria-hidden="true" />
              Reminder active
            </Box>
          )}
        </Box>

        <Box sx={boardCardFooterSx}>
          <Box sx={boardCardFieldSx}>
            <Avatar sx={ticketCardAssigneeAvatarSx} aria-hidden="true">
              {assignedInitials}
            </Avatar>
            <Box minWidth={0}>
              <Typography sx={boardCardFieldLabelSx}>Assigned</Typography>
              <Typography sx={boardCardFieldValueSx}>
                {ticket.assigned_to_name || "Unassigned"}
              </Typography>
            </Box>
          </Box>
          <Box sx={boardCardFieldSx} textAlign="right">
            <Box minWidth={0}>
              <Typography sx={boardCardFieldLabelSx}>Target date</Typography>
              <Typography sx={boardCardDueSx(dueTone, !isActiveTicket(ticket))}>
                <Box component="span" sx={boardCardDueLabelSx(dueTone)}>
                  {due.label}
                </Box>
                {due.label !== exactDue && exactDue !== "—" && (
                  <Box component="span" sx={boardCardCreatedSx}>
                    {" · "}
                    {exactDue}
                  </Box>
                )}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
