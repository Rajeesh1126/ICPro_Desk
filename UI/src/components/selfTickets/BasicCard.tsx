import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Tooltip,
} from "@mui/material";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import DoneOutlinedIcon from "@mui/icons-material/DoneOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";

import type { SelfTicketData } from "@/types/dataTypes";
import { formatDate, formatDueDate, formatOverdueLabel } from "@/components/common/formatDate";
import {
  getReminderState,
  getSelfTicketAlertMessage,
  isSelfTicketOverdue,
  selfTicketDisplayDueDate,
} from "@/components/selfTickets/highlight";
import {
  dueDateLabel,
  reminderSummary,
  scheduleLabel,
} from "@/components/selfTickets/schedule";
import { ScheduleIcon } from "@/components/selfTickets/ScheduleCell";
import Pill from "@/components/common/Pill";
import { priorityColor, priorityLabel } from "@/components/common/pillValues";
import {
  boardCardCreatedSx,
  boardCardCreatorSx,
  boardCardDueLabelSx,
  boardCardDueSx,
  boardCardFieldLabelSx,
  boardCardIndicatorsSx,
  boardCardMetaSx,
  boardCardNumberSx,
  boardCardTagSx,
  boardCardTypeTagSx,
  boardCardSx,
  boardCardTopRowSx,
  doListAcknowledgeButtonSx,
  doListCardFooterSx,
  doListLinkedTicketSx,
  doListReminderValueSx,
  sharedCardContentSx,
  sharedCardTitleSx,
  ticketCardDescriptionSx,
} from "@/styles/common";

interface BasicCardProps {
  ticket: SelfTicketData;
  onOpen: (data: SelfTicketData) => void;
  onAcknowledgeAlarm?: (data: SelfTicketData) => void;
}
const currentUserParsed = Number(localStorage.getItem("user") || "null");

const userId = currentUserParsed ?? null;

/**
 * Do List work item: task number, creator and creation date; the subject
 * and a short description preview (as on ticket cards);
 * priority, schedule (period / recurring) and reminder / overdue state; then a fixed two-column
 * footer (reminder left, target date right) and the linked ticket when there
 * is one. Acknowledging a reminder never opens the card.
 */
export default function BasicCardSelfTicket({
  ticket,
  onOpen,
  onAcknowledgeAlarm,
}: BasicCardProps) {
  if (!ticket?.number) return null;

  const reminder = getReminderState(ticket);
  const hasAlarm = reminder === "active";
  const alertMessage = getSelfTicketAlertMessage(ticket);
  const displayDue = selfTicketDisplayDueDate(ticket);
  const due = formatDueDate(displayDue);
  const exactDue = formatDate(displayDue);
  // Urgency colours only matter while the task is still open.
  const isOpen = ticket.current_status?.toLowerCase() === "open";
  const dueTone = isOpen ? due.tone : "upcoming";
  // Same rule as the Do List highlight: an open task whose target date is
  // today or earlier needs action; so does an active reminder.
  const isOverdue = isSelfTicketOverdue(ticket);
  const overdueText = isOverdue ? formatOverdueLabel(displayDue) ?? "Overdue" : null;
  const alertParts = [
    isOverdue ? overdueText : null,
    hasAlarm ? "Reminder active" : null,
  ].filter((part): part is string => Boolean(part));
  const interval = ticket.reminder_interval ?? 0;

  const reminderValue =
    reminder === "active" ? (
      <>
        <NotificationsActiveOutlinedIcon aria-hidden="true" />
        Active now
      </>
    ) : reminder === "scheduled" ? (
      <>
        <NotificationsNoneOutlinedIcon aria-hidden="true" />
        {reminderSummary(ticket)}
      </>
    ) : (
      <>
        <NotificationsOffOutlinedIcon aria-hidden="true" />
        Off
      </>
    );

  return (
    <Card
      elevation={0}
      onClick={() => onOpen(ticket)}
      role="button"
      tabIndex={0}
      aria-label={`Open task ${ticket.number}${
        alertParts.length ? `, ${alertParts.join(", ")}` : alertMessage ? `, ${alertMessage}` : ""
      }`}
      onKeyDown={(event) => {
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
            #{ticket.number}
          </Typography>
          <Box sx={boardCardMetaSx}>
            {ticket.creator !== userId && ticket.creator_name && (
              <Typography sx={boardCardCreatorSx}>{ticket.creator_name}</Typography>
            )}
            <Typography sx={boardCardCreatedSx}>
              Created {formatDate(ticket.created_at)}
            </Typography>
          </Box>
        </Box>

        <Typography variant="h6" sx={sharedCardTitleSx}>
          {ticket.task}
        </Typography>

        {/* Same short preview as ticket cards. */}
        {ticket.description && (
          <Typography variant="body2" sx={ticketCardDescriptionSx}>
            {ticket.description}
          </Typography>
        )}

        <Box sx={boardCardIndicatorsSx}>
          <Pill value={priorityLabel(ticket.priority || "Normal")} color={priorityColor(ticket.priority || "Normal")} />
          {/* One-time is the default, so only period / recurring get a tag. */}
          {ticket.schedule_type && ticket.schedule_type !== "static" && (
            <Box component="span" sx={boardCardTypeTagSx} aria-label={`Schedule ${scheduleLabel(ticket.schedule_type)}`}>
              <ScheduleIcon type={ticket.schedule_type} />
              {scheduleLabel(ticket.schedule_type)}
            </Box>
          )}
          {isOverdue && (
            <Box component="span" sx={boardCardTagSx("overdue")}>
              <EventBusyOutlinedIcon aria-hidden="true" />
              {overdueText}
            </Box>
          )}
          {hasAlarm && !isOverdue && (
            <Box component="span" sx={boardCardTagSx("reminder")}>
              <NotificationsActiveOutlinedIcon aria-hidden="true" />
              Reminder active
            </Box>
          )}
        </Box>

        <Box sx={doListCardFooterSx}>
          <Box minWidth={0}>
            <Typography sx={boardCardFieldLabelSx}>Reminder</Typography>
            <Typography component="span" sx={doListReminderValueSx(reminder)}>
              {reminderValue}
            </Typography>
          </Box>
          <Box minWidth={0} textAlign="right">
            <Typography sx={boardCardFieldLabelSx}>{dueDateLabel(ticket.schedule_type)}</Typography>
            <Typography sx={boardCardDueSx(dueTone, !isOpen)}>
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

          {hasAlarm && onAcknowledgeAlarm && isOpen && userId == ticket.creator && (
            <Tooltip
              title={`Marks this reminder as seen and clears the alert.${
                interval ? ` The next one follows the ${interval}-day interval.` : ""
              }`}
            >
              <Button
                variant="outlined"
                color="warning"
                startIcon={<DoneOutlinedIcon />}
                aria-label={`Acknowledge reminder for task ${ticket.number}`}
                onClick={(event) => {
                  // Acknowledge only; never open the card.
                  event.stopPropagation();
                  onAcknowledgeAlarm(ticket);
                }}
                onKeyDown={(event) => event.stopPropagation()}
                sx={doListAcknowledgeButtonSx}
              >
                Acknowledge reminder
              </Button>
            </Tooltip>
          )}

          {/* Only a real link is shown; "no ticket" isn't worth a field. */}
          {ticket.ticket_number && (
            <Box component="span" sx={doListLinkedTicketSx}>
              Linked ticket
              <Box component="span">{ticket.ticket_number}</Box>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
