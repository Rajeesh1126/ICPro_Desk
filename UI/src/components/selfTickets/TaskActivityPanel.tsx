import type { ReactNode } from "react";
import { Avatar, Box, Typography } from "@mui/material";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
import type { SelfTicketLog } from "@/types/dataTypes";
import { DetailPanel } from "@/components/common/DetailDialogParts";
import { formatDateTime } from "@/components/common/formatDate";
import { oldestFirst } from "@/utils/chatOrder";
import {
  activityAvatarSx,
  activityCardSx,
  activityEventSx,
  activityHeadSx,
  activityItemSx,
  activityQuoteSx,
  activitySubtitleSx,
  type ActivityTone,
} from "@/styles/detailDialog";

type ActivityEvent = { title: string; icon: ReactNode; tone: ActivityTone };

/** "2026-11-02: closed" is how the API records an occurrence change. */
const OCCURRENCE_LOG = /^\d{4}-\d{2}-\d{2}:\s*(\w[\w\s-]*)$/;

/** What a log entry was, from its status or (for occurrences) its text. */
function describe(log: SelfTicketLog): ActivityEvent {
  const occurrence = log.comments?.trim().match(OCCURRENCE_LOG);
  if (occurrence) {
    const status = occurrence[1].trim().toLowerCase();
    return {
      title: `Occurrence marked ${status}`,
      icon: status === "cancelled" ? <BlockOutlinedIcon /> : <CheckOutlinedIcon />,
      tone: status === "cancelled" ? "muted" : "success",
    };
  }
  const status = log.status?.trim().toLowerCase();
  if (status === "closed") return { title: "Task closed", icon: <CheckOutlinedIcon />, tone: "success" };
  if (status === "cancelled") return { title: "Task cancelled", icon: <BlockOutlinedIcon />, tone: "error" };
  if (status === "revised" || status === "date revision") {
    return { title: "Target date revision requested", icon: <EventRepeatOutlinedIcon />, tone: "warning" };
  }
  return { title: "Comment", icon: <ChatBubbleOutlineOutlinedIcon />, tone: "muted" };
}

/**
 * Do List "Status & comments" as a conversation, oldest first: the signed-in
 * user's updates on the right, everyone else's on the left, each with the
 * author and time, then a card with what happened and the note.
 */
export default function TaskActivityPanel({ logs, userId }: { logs: SelfTicketLog[]; userId: number | null }) {
  return (
    <DetailPanel
      icon={<ChatBubbleOutlineOutlinedIcon />}
      title="Status & comments"
      badge={logs.length}
      // Opens on the newest update, like a chat; scroll up for older ones.
      scrollToEndKey={logs.length}
      intro={
        <Typography sx={activitySubtitleSx}>
          A history of updates made to this task and its occurrences.
        </Typography>
      }
    >
      <Box component="ol" aria-label="Task activity" sx={{ listStyle: "none", m: 0, p: 0 }}>
        {oldestFirst(logs).map((log) => {
          const event = describe(log);
          const mine = log.creator === userId;
          const name = log.creator_name || "User";
          return (
            <Box component="li" key={log.id} sx={activityItemSx(mine)}>
              <Box sx={activityHeadSx(mine)}>
                <Avatar sx={activityAvatarSx(mine)}>{name.charAt(0).toUpperCase()}</Avatar>
                <Box minWidth={0}>
                  <Typography fontWeight={600} fontSize={13} noWrap>
                    {name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="p">
                    {formatDateTime(log.created_at)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={activityCardSx(mine)}>
                <Typography component="span" sx={activityEventSx(event.tone)}>
                  {event.icon}
                  {event.title}
                </Typography>
                {log.comments?.trim() && <Typography sx={activityQuoteSx}>{log.comments}</Typography>}
              </Box>
            </Box>
          );
        })}
      </Box>
    </DetailPanel>
  );
}
