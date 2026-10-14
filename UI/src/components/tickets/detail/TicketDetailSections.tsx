import { Avatar, Box, Chip, DialogTitle, Grid, IconButton, Paper, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import AttachmentOutlinedIcon from "@mui/icons-material/AttachmentOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import type { TicketData, TicketFile, TicketLog } from "../../../types/dataTypes";
import { formatDate, formatDateTime } from "../../common/formatDate";
import {
  attachmentHeaderSx,
  attachmentIconSx,
  attachmentItemSx,
  attachmentListSx,
  attachmentNameSx,
  attachmentOpenSx,
  attachmentSectionSx,
  detailDescriptionTextSx,
  detailLabelSx,
  detailSubjectSx,
  detailValueSx,
  formatStatusLabel,
  formSectionSx,
  getModalPalette,
  getPriorityPalette,
  getStatusColor,
  ticketActivityCountChipSx,
  ticketActivityTitleSx,
  ticketDetailActivityPaperSx,
  ticketDetailActivitySectionSx,
  ticketDetailAssigneeAvatarSx,
  ticketDetailCloseButtonSx,
  ticketDetailDescriptionSx,
  ticketDetailFieldSx,
  ticketDetailFieldValueSx,
  ticketDetailFormSectionSx,
  ticketDetailHeaderRowSx,
  ticketDetailIconAvatarSx,
  ticketDetailNumberSx,
  ticketDetailPanelHeaderSx,
  ticketDetailPriorityChipSx,
  ticketDetailStatusPanelSx,
  ticketDetailStatusValueSx,
  ticketDetailSummaryBannerSx,
  ticketDetailSummaryLabelSx,
  ticketTimelineDotSx,
  ticketTimelineEntrySx,
  ticketTimelineItemSx,
  ticketTimelineRailSx,
  ticketTimelineRemarksSx,
  ticketTimelineScrollSx,
  ticketTimelineStatusChipSx,
} from "../../../styles/common";

/* The read-only parts of the ticket detail dialog. */

/** Ticket number, priority, assignee and close button. */
export function TicketDetailHeader({ ticket, onClose }: { ticket: TicketData; onClose: () => void }) {
  const theme = useTheme();
  const modalPalette = getModalPalette(theme);
  const pStyle = getPriorityPalette(theme, ticket.priority);

  return (
    <DialogTitle component="div" sx={ticketDetailHeaderRowSx}>
      <Stack direction="row" spacing={1.4} alignItems="center">
        <Avatar sx={ticketDetailIconAvatarSx}>
          <CheckOutlinedIcon fontSize="small" />
        </Avatar>
        <Box>
          <Typography sx={detailLabelSx}>Ticket details</Typography>
          <Typography sx={ticketDetailNumberSx}>{ticket.number}</Typography>
          <Chip
            label={`${ticket.priority?.toUpperCase()} PRIORITY`}
            sx={ticketDetailPriorityChipSx({ pStyle })}
          />
        </Box>
      </Stack>

      <Stack direction="row" spacing={2.5} alignItems="center">
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={ticketDetailStatusPanelSx({ modalPalette })}
        >
          <Avatar sx={ticketDetailAssigneeAvatarSx}>
            {ticket.assigned_to_name ? ticket.assigned_to_name.charAt(0).toUpperCase() : "U"}
          </Avatar>
          <Box>
            <Typography sx={detailLabelSx}>Assigned to</Typography>
            <Typography sx={ticketDetailStatusValueSx({ detailValueSx })}>
              {ticket.assigned_to_name || "Unassigned"}
            </Typography>
          </Box>
        </Stack>
        <IconButton aria-label="Close dialog" onClick={onClose} sx={ticketDetailCloseButtonSx}>
          <CloseOutlinedIcon />
        </IconButton>
      </Stack>
    </DialogTitle>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  const modalPalette = getModalPalette(useTheme());
  return (
    <Box sx={ticketDetailFieldSx({ modalPalette })}>
      <Box>
        <Typography sx={detailLabelSx}>{label}</Typography>
        <Typography sx={ticketDetailFieldValueSx({ detailValueSx })}>{value}</Typography>
      </Box>
    </Box>
  );
}

/** Subject, description and the hours / target date figures. */
export function TicketSummaryPanel({ ticket }: { ticket: TicketData }) {
  const theme = useTheme();
  const modalPalette = getModalPalette(theme);

  return (
    <Paper variant="outlined" sx={ticketDetailFormSectionSx({ formSectionSx })}>
      <Box sx={ticketDetailSummaryBannerSx({ theme })}>
        <Typography sx={ticketDetailSummaryLabelSx({ alpha, detailLabelSx, theme })}>Subject</Typography>
        <Typography sx={detailSubjectSx}>{ticket.task}</Typography>
      </Box>

      <Typography sx={detailLabelSx}>Description</Typography>
      <Box sx={ticketDetailDescriptionSx({ modalPalette })}>
        <Typography variant="body2" sx={detailDescriptionTextSx}>
          {ticket.description}
        </Typography>
      </Box>

      <Paper variant="outlined" sx={ticketDetailActivityPaperSx}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 4 }}>
            <SummaryField label="Estimated" value={ticket.est_hours != null ? `${ticket.est_hours} hrs` : "N/A"} />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <SummaryField label="actual hrs" value={ticket.act_hours != null ? `${ticket.act_hours} hrs` : "N/A"} />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <SummaryField label="target date" value={ticket.target_date ? formatDate(ticket.target_date) : "N/A"} />
          </Grid>
        </Grid>
      </Paper>
    </Paper>
  );
}

/** Status history, newest first, on a vertical rail. */
export function TicketActivityTimeline({ logs }: { logs?: TicketLog[] }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const modalPalette = getModalPalette(theme);

  return (
    <Paper variant="outlined" sx={ticketDetailActivitySectionSx({ formSectionSx })}>
      <Box sx={ticketDetailPanelHeaderSx({ modalPalette })}>
        <Typography sx={ticketActivityTitleSx}>Activity logs</Typography>
        <Chip label="Latest First" sx={ticketActivityCountChipSx} />
      </Box>
      <Box sx={ticketTimelineScrollSx}>
        <Box sx={ticketTimelineRailSx({ modalPalette })} />
        <Stack spacing={2}>
          {logs?.map((log, index) => (
            <Box key={log.id} sx={ticketTimelineItemSx}>
              <Box sx={ticketTimelineDotSx({ getStatusColor, log })} />
              <Box sx={ticketTimelineEntrySx({ index, modalPalette })}>
                <Chip
                  label={formatStatusLabel(log.status).toUpperCase()}
                  sx={ticketTimelineStatusChipSx({ alpha, getStatusColor, isDark, log })}
                />
                <Typography variant="body2" sx={ticketTimelineRemarksSx}>
                  {log.remarks}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {log.changed_by_name} : {formatDateTime(log.created_at)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Paper>
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
