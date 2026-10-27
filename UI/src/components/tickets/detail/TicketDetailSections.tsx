import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AttachmentOutlinedIcon from "@mui/icons-material/AttachmentOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import type { TicketData, TicketFile, TicketLog } from "@/types/dataTypes";
import { formatDate, formatDateTime, formatOverdueLabel } from "@/components/common/formatDate";
import { isOverdueTicket } from "@/utils/ticketDue";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import {
  DetailChatPanel,
  DetailDialogHeader,
  DetailField,
  DetailTextField,
} from "@/components/common/DetailDialogParts";
import { oldestFirst } from "@/utils/chatOrder";
import { formatDecimalHours } from "@/utils/hoursMinutes";
import { StatusPill } from "@/components/common/StatusPill";
import {
  attachmentHeaderSx,
  attachmentIconSx,
  attachmentItemSx,
  attachmentListSx,
  attachmentNameSx,
  attachmentOpenSx,
  attachmentSectionSx,
  boardCardTagSx,
  detailLabelSx,
  noWrapSx,
  ticketDetailFileMetaSx,
  ticketDetailFileRowSx,
  ticketDetailNoteSx,
  wrapAnywhereSx,
} from "@/styles/common";
import {
  detailFactsSx,
  detailMainColumnSx,
  detailTimelineItemSx,
} from "@/styles/detailDialog";

/* The read-only parts of the ticket detail dialog. */

/** Ticket number, priority, assignee and close button. */
export function TicketDetailHeader({ ticket, onClose }: { ticket: TicketData; onClose: () => void }) {
  return (
    <DetailDialogHeader
      eyebrow={ticket.is_internal ? "Internal ticket · Work Let" : "Ticket details"}
      number={ticket.number}
      priority={ticket.priority}
      status={ticket.current_status}
      person={{ label: "Assigned to", name: ticket.assigned_to_name }}
      onClose={onClose}
    />
  );
}

/** Subject, description and the hours / target date figures. */
export function TicketSummaryPanel({ ticket }: { ticket: TicketData }) {
  const overdue = isOverdueTicket(ticket);
  return (
    <Box sx={detailMainColumnSx}>
      <DetailTextField label="Subject" value={ticket.task} />
      <DetailTextField
        label="Description"
        value={ticket.description}
        multiline
      />
      <Box sx={detailFactsSx}>
        <DetailField
          label="Estimated"
          value={formatDecimalHours(ticket.est_hours)}
        />
        <DetailField
          label="Actual hrs"
          value={formatDecimalHours(ticket.act_hours)}
        />
        <DetailField
          label="Target date"
          value={formatDate(ticket.target_date)}
          note={
            overdue && (
              <Box sx={ticketDetailNoteSx}>
                <Box component="span" sx={boardCardTagSx("overdue")}>
                  <EventBusyOutlinedIcon aria-hidden="true" />
                  {formatOverdueLabel(ticket.target_date) ?? "Overdue"}
                </Box>
              </Box>
            )
          }
        />
      </Box>
    </Box>
  );
}

/** Status changes in chronological order, presented as a compact activity timeline. */
export function TicketActivityTimeline({
  logs,
  currentUserId,
}: {
  logs?: TicketLog[];
  currentUserId?: number | null;
}) {
  return (
    <DetailChatPanel title="Activity timeline" badge={logs?.length || null}>
      {oldestFirst(logs).map((log) => (
        <Box
          key={log.id}
          sx={detailTimelineItemSx(
            currentUserId != null && log.changed_by === currentUserId,
          )}
        >
          <Box sx={ticketDetailFileRowSx}>
            <Typography variant="body2" fontWeight={600} color="text.primary">{log.changed_by_name || "System"}</Typography>
            <Typography variant="caption" color="text.secondary" sx={noWrapSx}>{formatDateTime(log.created_at)}</Typography>
          </Box>
          <Box sx={ticketDetailFileMetaSx}>
            <StatusPill status={log.status} />
            {log.remarks && <Typography variant="body2" color="text.secondary" sx={wrapAnywhereSx}>{log.remarks}</Typography>}
          </Box>
        </Box>
      ))}
    </DetailChatPanel>
  );
}

/** Downloadable files attached to the ticket (renders nothing when none). */
export function TicketAttachments({ files }: { files?: TicketFile[] | null }) {
  const theme = useTheme();
  if (!files?.length) return null;

  return (
    <Box sx={attachmentSectionSx(theme)}>
      <Box sx={attachmentHeaderSx}>
        <AttachmentOutlinedIcon color="primary" fontSize="small" />
        <Typography sx={detailLabelSx}>Attachments ({files.length})</Typography>
      </Box>
      <Box sx={attachmentListSx}>
        {files.map((item) => {
          const fileName = item.file?.split("/").pop() || "Attachment";
          return (
            <Box
              key={item.id}
              component="a"
              href={item.file}
              download
              target="_blank"
              rel="noopener noreferrer"
              sx={attachmentItemSx(theme)}
            >
              <Box sx={attachmentIconSx(theme)}>
                <AttachmentOutlinedIcon fontSize="small" />
              </Box>
              <Typography sx={attachmentNameSx} title={fileName}>
                {fileName}
              </Typography>
              <OpenInNewOutlinedIcon sx={attachmentOpenSx} fontSize="small" />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
