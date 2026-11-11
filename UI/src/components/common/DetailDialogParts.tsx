import { priorityColor, priorityLabel, statusColor, statusLabel } from "@/components/common/pillValues";
import { sentenceCase } from "@/components/common/tableCell";
import { Children, useLayoutEffect, useRef, type ReactNode } from "react";
import {
  Avatar,
  Box,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import Pill from "@/components/common/Pill";
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
  detailPanelBodySx,
  detailPanelFooterSx,
  detailPanelIntroSx,
  detailPersonAvatarSx,
  detailPersonLabelSx,
  detailPersonNameSx,
  detailPersonPillSx,
  detailSubjectTextSx,
  detailTextFieldSx,
} from "@/styles/detailDialog";
import { AnimatePresence } from "motion/react";
import { MotionBox } from "@/animations/MotionPrimitives";

/* Building blocks shared by the Do List, Ticket and Work Let detail dialogs. */

const initial = (name?: string | null, fallback = "U") =>
  name ? name.charAt(0).toUpperCase() : fallback;

/** Dialog name for detail dialogs: the eyebrow and number, not the whole header. */
export const DETAIL_DIALOG_LABEL = "detail-dialog-eyebrow detail-dialog-number";

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

  return (
    <DialogTitle component="div" id="detail-dialog-header">
      <Box sx={detailHeaderGridSx}>
        <Box sx={detailHeaderMainSx}>
          <Box minWidth={0}>
            <Typography id="detail-dialog-eyebrow" sx={detailEyebrowSx}>{eyebrow}</Typography>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
              mt={0.25}
            >
              <Typography id="detail-dialog-number" component="h2" sx={detailNumberSx}>
                {number}
              </Typography>
              {status && <Pill value={statusLabel(status)} color={statusColor(status)} dot />}
              <Pill
                value={`${priorityLabel(priority)} priority`}
                color={priorityColor(priority)}
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
          // Hug the start like the text values (a flex column would stretch it).
          <Pill value={statusLabel(value)} color={statusColor(value)} dot sx={{ alignSelf: "flex-start" }} />
        ) : (
          // Sentence case, like the table cells ("Follow-up", not "Follow-Up").
          <Typography sx={detailFieldValueSx(false)}>
            {capitalize ? sentenceCase(value) || value : value}
          </Typography>
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

  const scrolledOnce = useRef(false);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    // Jump to the latest on open; glide to it when a new message arrives.
    list.scrollTo({ top: list.scrollHeight, behavior: scrolledOnce.current ? "smooth" : "auto" });
    scrolledOnce.current = true;
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
        {/* Messages already there on open stay still; new ones pop in. */}
        <AnimatePresence initial={false}>{children}</AnimatePresence>
      </Box>
    </Box>
  );
}

/**
 * Side panel with the chat panel's chrome (hairline divider, icon header and
 * count badge) for any list, e.g. a recurring task's occurrences. `intro`
 * stays put above the scrolling body; `footer` stays put below it.
 */
export function DetailPanel({
  icon,
  title,
  badge,
  intro,
  footer,
  scrollToEndKey,
  children,
}: {
  icon: ReactNode;
  title: string;
  badge?: ReactNode;
  intro?: ReactNode;
  footer?: ReactNode;
  /**
   * Chat-style lists: when set, the body opens scrolled to the end (newest)
   * and glides there again whenever this value changes, e.g. the count.
   */
  scrollToEndKey?: unknown;
  children: ReactNode;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const scrolledOnce = useRef(false);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body || scrollToEndKey === undefined) return;
    // Jump on open; glide when something new arrives.
    body.scrollTo({ top: body.scrollHeight, behavior: scrolledOnce.current ? "smooth" : "auto" });
    scrolledOnce.current = true;
  }, [scrollToEndKey]);

  return (
    <Box component="section" sx={detailPanelSx}>
      <Box sx={detailPanelHeaderSx}>
        {icon}
        <Typography component="h3" sx={detailPanelTitleSx}>
          {title}
        </Typography>
        {badge != null && <Box sx={detailPanelBadgeSx}>{badge}</Box>}
      </Box>
      {intro && <Box sx={detailPanelIntroSx}>{intro}</Box>}
      <Box ref={bodyRef} sx={detailPanelBodySx}>
        {children}
      </Box>
      {footer && <Box sx={detailPanelFooterSx}>{footer}</Box>}
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
    <MotionBox
      // Grows from the sender's side. Scale (not slide) so it never
      // overflows the scrolling list.
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 32 }}
      style={{ transformOrigin: mine ? "100% 100%" : "0% 100%" }}
      sx={detailChatRowSx(mine)}
    >
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
    </MotionBox>
  );
}

