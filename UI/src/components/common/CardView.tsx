import * as React from "react";
import {
  Box,
  ButtonBase,
  useMediaQuery,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { useTheme } from "@mui/material/styles";
import type { SelfTicketData, TicketData } from "@/types/dataTypes";
import BasicCardComponent from "@/components/tickets/BasicCard";
import BasicCardSelfTicket from "@/components/selfTickets/BasicCard";
import { isSelfTicketOverdue, shouldBlinkSelfTicket } from "@/components/selfTickets/highlight";
import { TICKET_BOARD_GROUPS } from "@/pages/tickets/ticketCollections";
import {
  boardColumnListSx,
  cardViewCollapseSx,
  cardViewExpandIcon,
  cardViewHeaderButtonSx,
  boardColumnsSx,
  boardColumnsSelfSx,
  boardColumnSx,
  boardColumnActionRequiredChipSx,
  boardColumnBulletSx,
  boardColumnCountChipSx,
  boardColumnHeaderSx,
  boardColumnEmptySx,
  boardColumnTitleSx,
  getStatusColor,
} from "@/styles/common";
import { AnimatePresence, type Variants } from "motion/react";
import { MotionBox, PresenceItem, StaggerContainer, StaggerItem } from "@/animations/MotionPrimitives";
import { EASE_OUT, SPRING_SOFT, tapPress } from "@/animations/presets";

type TicketCardViewProps = {
  /** `data` is narrowed to overdue items by the page's Overdue filter. */
  overdueOnly?: boolean;
} & (
  | {
      cardType: "Ticket";
      data: TicketData[];
      onCardClick: (ticket: TicketData) => void;
    }
  | {
      cardType: "Self";
      data: SelfTicketData[];
      onCardClick: (ticket: SelfTicketData) => void;
      onAcknowledgeAlarm?: (ticket: SelfTicketData) => void;
    }
);

type ColumnProps = {
  title: string;
  count: number;
  accent: string;
  children: React.ReactNode;
  isSmallScreen: boolean;
  expanded: boolean;
  hasAlarm: boolean;
  cardType: "Ticket" | "Self";
  onExpand: () => void;
};

function TicketColumn({
  title,
  count,
  accent,
  children,
  isSmallScreen,
  expanded,
  hasAlarm,
  onExpand,
}: ColumnProps) {
  const panelId = React.useId();
  const headerId = React.useId();
  const header = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={boardColumnHeaderSx}
    >
      {/* Inside the phone accordion button a heading is invalid; use a span. */}
      <Typography
        component={isSmallScreen ? "span" : "h3"}
        sx={boardColumnTitleSx}
      >
        <Box component="span" sx={boardColumnBulletSx({ accent })} />
        {title}
        <Chip label={count} sx={boardColumnCountChipSx} />
      </Typography>
      <Stack direction="row" spacing={0.75} alignItems="center">
        {hasAlarm && (
          <Chip
            icon={<ErrorOutlineOutlinedIcon aria-hidden="true" />}
            label="Action Required"
            sx={boardColumnActionRequiredChipSx}
          />
        )}
        {isSmallScreen && <ExpandMoreIcon sx={cardViewExpandIcon(expanded)} />}
      </Stack>
    </Stack>
  );
  return (
    // `layout="position"`: when another stage opens, the headers below glide
    // to their new place instead of jumping.
    <StaggerItem layout="position" transition={SPRING_SOFT} sx={boardColumnSx(expanded)}>
      {isSmallScreen ? (
        <ButtonBase
          id={headerId}
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={onExpand}
          sx={cardViewHeaderButtonSx(accent)}
        >
          {header}
        </ButtonBase>
      ) : (
        header
      )}
      {isSmallScreen ? (
        // The opening stage unrolls from its header (clip reveal, so the
        // flex height cap never fights a height tween); the closing one
        // folds away at once so the two never compete for space.
        <MotionBox
          initial={false}
          animate={expanded ? "open" : "closed"}
          variants={boardRevealVariants}
          // Hidden by class in the same render (not at animation end), so
          // the stage headers' layout glide sees the real before/after.
          sx={cardViewCollapseSx(expanded)}
        >
          <Box
            id={panelId}
            role="region"
            aria-labelledby={headerId}
            sx={boardColumnListSx}
          >
            {children}
          </Box>
        </MotionBox>
      ) : (
        <Box sx={boardColumnListSx}>{children}</Box>
      )}
    </StaggerItem>
  );
}

const boardRevealVariants: Variants = {
  open: {
    clipPath: "inset(0% 0% 0% 0%)",
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE_OUT },
  },
  closed: {
    clipPath: "inset(0% 0% 100% 0%)",
    opacity: 0,
    y: -8,
    transition: { duration: 0 },
  },
};

/** What an empty stage means, so a sparse board reads as intentional. */
const EMPTY_STAGE_TEXT: Record<string, string> = {
  Open: "Nothing waiting to be picked up.",
  "In progress": "Nothing is in progress right now.",
  Completed: "Completed tickets show here until they're rated and closed.",
  Closed: "Closed tasks show here.",
  Overdue: "No overdue tasks. You are on track.",
};

function EmptyColumn({ title, overdueOnly }: { title: string; overdueOnly?: boolean }) {
  return (
    <Box sx={boardColumnEmptySx}>
      <InboxOutlinedIcon />
      {overdueOnly
        ? "Nothing overdue in this stage."
        : EMPTY_STAGE_TEXT[title] ?? "Nothing in this stage."}
    </Box>
  );
}

const DateChecker = (targetDateStr: string) => {
  const targetDate = new Date(targetDateStr);

  const currentDate = new Date();

  targetDate.setHours(0, 0, 0, 0);
  currentDate.setHours(0, 0, 0, 0);

  return !Number.isNaN(targetDate.getTime()) && targetDate <= currentDate;
};

export default function TicketCardView(props: TicketCardViewProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));
  const [expandedStatus, setExpandedStatus] = React.useState<string>("Open");
  // Phone accordion: under the Overdue filter, open a stage that has cards.
  const expandedTitle = (columns: { title: string; rows: unknown[] }[]) => {
    const current = columns.find((column) => column.title === expandedStatus);
    if (!props.overdueOnly || current?.rows.length) return expandedStatus;
    return columns.find((column) => column.rows.length)?.title ?? expandedStatus;
  };
  if (props.cardType === "Ticket") {
    const columns = TICKET_BOARD_GROUPS.map((group) => ({
      title: group.title,
      accent: getStatusColor(group.accentStatus),
      rows: props.data.filter((ticket) =>
        (group.statuses as readonly string[]).includes(ticket.current_status),
      ),
    }));
    const expandedColumn = expandedTitle(columns);
    return (
      <StaggerContainer sx={boardColumnsSx}>
        {columns.map((column) => (
          <TicketColumn
            key={column.title}
            title={column.title}
            count={column.rows.length}
            accent={column.accent}
            isSmallScreen={isSmallScreen}
            expanded={expandedColumn === column.title}
            hasAlarm={column.rows.some(
              (ticket) =>
                ticket.alarm === true || DateChecker(ticket.target_date),
            )}
            cardType="Ticket"
            onExpand={() => setExpandedStatus(column.title)}
          >
            {/* Cards animate in/out as tickets change stage or get filtered. */}
            <AnimatePresence initial={false} mode="popLayout">
              {column.rows.length ? (
                column.rows.map((ticket) => (
                  <PresenceItem key={ticket.id ?? ticket.number} whileHover={{ y: -2 }} whileTap={tapPress}>
                    <BasicCardComponent
                      ticket={ticket}
                      onOpen={props.onCardClick}
                      columnStatus={column.title.toLowerCase()}
                    />
                  </PresenceItem>
                ))
              ) : (
                <PresenceItem key="empty">
                  <EmptyColumn title={column.title} overdueOnly={props.overdueOnly} />
                </PresenceItem>
              )}
            </AnimatePresence>
          </TicketColumn>
        ))}
      </StaggerContainer>
    );
  }

  const columns = [
    {
      title: "Open",
      accent: getStatusColor("open"),
      rows: props.data.filter(
        (ticket) =>
          ["open", "date revision"].includes(ticket.current_status) &&
          !isSelfTicketOverdue(ticket)
      ),
    },
    {
      title: "Overdue",
      accent: getStatusColor("closed"),
      rows: props.data.filter(
        (ticket) =>
          ["open", "date revision"].includes(ticket.current_status) &&
          isSelfTicketOverdue(ticket)
      ),
    },
  ];
  const expandedColumn = expandedTitle(columns);

  return (
    <StaggerContainer sx={boardColumnsSelfSx}>
      {columns.map((column) => (
        <TicketColumn
          key={column.title}
          title={column.title}
          count={column.rows.length}
          accent={column.accent}
          isSmallScreen={isSmallScreen}
          expanded={expandedColumn === column.title}
          hasAlarm={column.rows.some((ticket) => shouldBlinkSelfTicket(ticket))}
          cardType="Self"
          onExpand={() => setExpandedStatus(column.title)}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {column.rows.length ? (
              column.rows.map((ticket) => (
                <PresenceItem key={ticket.id ?? ticket.number} whileHover={{ y: -2 }} whileTap={tapPress}>
                  <BasicCardSelfTicket
                    ticket={ticket}
                    onOpen={props.onCardClick}
                    onAcknowledgeAlarm={props.onAcknowledgeAlarm}
                  />
                </PresenceItem>
              ))
            ) : (
              <PresenceItem key="empty">
                <EmptyColumn title={column.title} overdueOnly={props.overdueOnly} />
              </PresenceItem>
            )}
          </AnimatePresence>
        </TicketColumn>
      ))}
    </StaggerContainer>
  );
}
