import * as React from "react";
import {
  Box,
  ButtonBase,
  Collapse,
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

type TicketCardViewProps =
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
    };

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
    <Box sx={boardColumnSx(expanded)}>
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
        <Collapse in={expanded} timeout={200} sx={cardViewCollapseSx}>
          <Box
            id={panelId}
            role="region"
            aria-labelledby={headerId}
            sx={boardColumnListSx}
          >
            {children}
          </Box>
        </Collapse>
      ) : (
        <Box sx={boardColumnListSx}>{children}</Box>
      )}
    </Box>
  );
}

/** What an empty stage means, so a sparse board reads as intentional. */
const EMPTY_STAGE_TEXT: Record<string, string> = {
  Open: "Nothing waiting to be picked up.",
  "In progress": "Nothing is in progress right now.",
  Completed: "Completed tickets show here until they're rated and closed.",
  Closed: "Closed tasks show here.",
};

function EmptyColumn({ title }: { title: string }) {
  return (
    <Box sx={boardColumnEmptySx}>
      <InboxOutlinedIcon />
      {EMPTY_STAGE_TEXT[title] ?? "Nothing in this stage."}
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
  const [expandedStatus, setExpandedStatus] = React.useState("Open");
  if (props.cardType === "Ticket") {
    const columns = TICKET_BOARD_GROUPS.map((group) => ({
      title: group.title,
      accent: getStatusColor(group.accentStatus),
      rows: props.data.filter((ticket) =>
        (group.statuses as readonly string[]).includes(ticket.current_status),
      ),
    }));
    return (
      <Box sx={boardColumnsSx}>
        {columns.map((column) => (
          <TicketColumn
            key={column.title}
            title={column.title}
            count={column.rows.length}
            accent={column.accent}
            isSmallScreen={isSmallScreen}
            expanded={expandedStatus === column.title}
            hasAlarm={column.rows.some(
              (ticket) =>
                ticket.alarm === true || DateChecker(ticket.target_date),
            )}
            cardType="Ticket"
            onExpand={() => setExpandedStatus(column.title)}
          >
            {column.rows.length ? (
              column.rows.map((ticket) => (
                <BasicCardComponent
                  key={ticket.id ?? ticket.number}
                  ticket={ticket}
                  onOpen={props.onCardClick}
                  columnStatus={column.title.toLowerCase()}
                />
              ))
            ) : (
              <EmptyColumn title={column.title} />
            )}
          </TicketColumn>
        ))}
      </Box>
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
      title: "Over due",
      accent: getStatusColor("closed"),
      rows: props.data.filter(
        (ticket) =>
          ["open", "date revision"].includes(ticket.current_status) &&
          isSelfTicketOverdue(ticket)
      ),
    },
  ];

  console.log(columns);
  return (
    <Box sx={boardColumnsSelfSx}>
      {columns.map((column) => (
        <TicketColumn
          key={column.title}
          title={column.title}
          count={column.rows.length}
          accent={column.accent}
          isSmallScreen={isSmallScreen}
          expanded={expandedStatus === column.title}
          hasAlarm={column.rows.some((ticket) => shouldBlinkSelfTicket(ticket))}
          cardType="Self"
          onExpand={() => setExpandedStatus(column.title)}
        >
          {column.rows.length ? (
            column.rows.map((ticket) => (
              <BasicCardSelfTicket
                key={ticket.id ?? ticket.number}
                ticket={ticket}
                onOpen={props.onCardClick}
                onAcknowledgeAlarm={props.onAcknowledgeAlarm}
              />
            ))
          ) : (
            <EmptyColumn title={column.title} />
          )}
        </TicketColumn>
      ))}
    </Box>
  );
}
