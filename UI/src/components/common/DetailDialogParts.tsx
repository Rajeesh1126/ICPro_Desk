import { Children, useLayoutEffect, useRef, type ReactNode } from "react";
import {
  Avatar,
  Box,
  Chip,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import { getPriorityPalette } from "@/styles/common";
import { StatusPill } from "@/components/common/StatusPill";
import {
  detailChatAvatarSx,
  detailChatBodySx,
  detailChatBubbleSx,
  detailChatListSx,
  detailChatMetaSx,
  detailChatNameSx,
  detailChatRowSx,
  detailChatTimeSx,
  detailDescriptionTextSx,
  detailEyebrowSx,
  detailFieldBodySx,
  detailFieldLabelSx,
  detailFieldSx,
  detailFieldValueSx,
  detailHeaderCloseSx,
  detailHeaderGridSx,
  detailHeaderMainSx,
  detailNumberSx,
  detailPanelBadgeSx,
  detailPanelHeaderSx,
  detailPanelSx,
  detailPanelTitleSx,
  detailPersonAvatarSx,
  detailPersonLabelSx,
  detailPersonNameSx,
  detailPersonPillSx,
  detailPriorityChipSx,
  detailSubjectTextSx,
  detailTextFieldSx,
} from "@/styles/detailDialog";

/* Building blocks shared by the Do List, Ticket and Work Let detail dialogs. */

const initial = (name?: string | null, fallback = "U") =>
  name ? name.charAt(0).toUpperCase() : fallback;

/** Eyebrow, number + priority, an optional person pill, and close. */
export function DetailDialogHeader({
  eyebrow,
  number,
  priority,
  status,
  person,
  onClose,
}: {
  eyebrow: string;
  number: ReactNode;
  priority?: string | null;
  /** Current status, shown beside priority so it never hides in the timeline. */
  status?: string | null;
  person?: { label: string; name?: string | null } | null;
  onClose: () => void;
}) {
  const pStyle = getPriorityPalette(useTheme(), priority);

  return (
    <DialogTitle component="div">
      <Box sx={detailHeaderGridSx}>
        <Box sx={detailHeaderMainSx}>
          <Box minWidth={0}>
            <Typography sx={detailEyebrowSx}>{eyebrow}</Typography>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
              mt={0.25}
            >
              <Typography component="h2" sx={detailNumberSx}>
                {number}
              </Typography>
              {status && <StatusPill status={status} />}
              <Chip
                label={`${priority?.toUpperCase()} PRIORITY`}
                sx={detailPriorityChipSx(pStyle)}
              />
            </Stack>
          </Box>
        </Box>

        {person && (
          <Box sx={detailPersonPillSx}>
            <Avatar sx={detailPersonAvatarSx}>{initial(person.name)}</Avatar>
            <Box minWidth={0}>
              <Typography sx={detailPersonLabelSx}>{person.label}</Typography>
              <Typography sx={detailPersonNameSx}>
                {person.name || "Unassigned"}
              </Typography>
            </Box>
          </Box>
        )}
        <IconButton
          aria-label="Close dialog"
          onClick={onClose}
          sx={detailHeaderCloseSx}
        >
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>
    </DialogTitle>
  );
}

/** Label/value pair. `status` renders the value as a coloured status pill. */
export function DetailField({
  label,
  value,
  capitalize,
  status,
  note,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
  status?: boolean;
  /** Context under the value, e.g. an "Overdue by 3 days" tag. */
  note?: ReactNode;
}) {
  return (
    <Box sx={detailFieldSx}>
      <Box sx={detailFieldBodySx}>
        <Typography sx={detailFieldLabelSx}>{label}</Typography>
        {status ? (
          <StatusPill status={value} />
        ) : (
          <Typography sx={detailFieldValueSx(capitalize)}>{value}</Typography>
        )}
        {note}
      </Box>
    </Box>
  );
}

/** Label/value for the subject (one line) or description (fills the column). */
export function DetailTextField({
  label,
  value,
  multiline,
}: {
  label: string;
  value?: string | null;
  multiline?: boolean;
}) {
  return (
    <Box sx={detailTextFieldSx(multiline)}>
      <Box sx={detailFieldBodySx}>
        <Typography sx={detailFieldLabelSx}>{label}</Typography>
        <Typography
          sx={multiline ? detailDescriptionTextSx : detailSubjectTextSx}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * Bordered side panel with a header and a scrolling chat list. Like a
 * messenger, it opens scrolled to the latest (bottom) message, and jumps there
 * again only when the number of messages changes.
 */
export function DetailChatPanel({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const messageCount = Children.count(children);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messageCount]);

  return (
    <Box sx={detailPanelSx}>
      <Box sx={detailPanelHeaderSx}>
        <ForumOutlinedIcon />
        <Typography component="h3" sx={detailPanelTitleSx}>
          {title}
        </Typography>
        {badge != null && <Box sx={detailPanelBadgeSx}>{badge}</Box>}
      </Box>
      <Box ref={listRef} sx={detailChatListSx}>
        {children}
      </Box>
    </Box>
  );
}

/** One chat message: avatar, author + time, and the bubble. */
export function DetailChatMessage({
  mine,
  name,
  time,
  children,
}: {
  mine: boolean;
  name: string;
  time: string;
  children: ReactNode;
}) {
  return (
    <Box sx={detailChatRowSx(mine)}>
      <Avatar sx={detailChatAvatarSx(mine)}>{initial(name)}</Avatar>
      <Box sx={detailChatBodySx(mine)}>
        <Box sx={detailChatMetaSx}>
          <Typography component="span" sx={detailChatNameSx}>
            {name}
          </Typography>
          <Typography component="span" sx={detailChatTimeSx}>
            {time}
          </Typography>
        </Box>
        <Box sx={detailChatBubbleSx(mine)}>{children}</Box>
      </Box>
    </Box>
  );
}

