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
import { alpha, useTheme } from "@mui/material/styles";
import type { SelfTicketData, TicketData } from "../../types/dataTypes";
import BasicCardComponent from "../tickets/BasicCard";
import BasicCardSelfTicket from "../selfTickets/BasicCard";
import {
  cardViewBoxSx1,
  cardViewCollapseSx,
  cardViewExpandIcon,
  cardViewBoxSx2,
  cardViewBoxSx3,
  cardViewDynamicDynamicBoxSx1,
  cardViewDynamicDynamicActionRequiredSx1,
  cardViewDynamicDynamicChipSx1,
  cardViewDynamicDynamicStackSx1,
  cardViewTypographySx1,
  getStatusColor,
} from "../../styles/common";

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
  cardType,
  onExpand,
}: ColumnProps) {
  const panelId = React.useId();
  const headerId = React.useId();
  const header = (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={cardViewDynamicDynamicStackSx1({ accent })}
      >
        <Typography fontWeight={800}>{title}</Typography>
        <Stack direction="row" spacing={0.75} alignItems="center">
          {hasAlarm && (
            <Chip
              label="Action Required"
              size="small"
              sx={cardViewDynamicDynamicActionRequiredSx1({ accent, alpha })}
            />
          )}
          <Chip
            label={count}
            size="small"
            sx={cardViewDynamicDynamicChipSx1({ accent, alpha })}
          />
          {isSmallScreen && <ExpandMoreIcon sx={cardViewExpandIcon(expanded)} />}
        </Stack>
      </Stack>
  );
  return (
    <Box sx={cardViewDynamicDynamicBoxSx1({ alpha }, expanded)}>
      {isSmallScreen ? (
        <ButtonBase
          id={headerId}
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={onExpand}
          sx={{ display: "block", width: "100%", textAlign: "left",
            "&.Mui-focusVisible": { outline: "2px solid", outlineColor: accent, outlineOffset: -2 } }}
        >
          {header}
        </ButtonBase>
      ) : header}
      {isSmallScreen ? (
        <Collapse in={expanded} sx={cardViewCollapseSx}>
          <Box id={panelId} role="region" aria-labelledby={headerId} sx={cardViewBoxSx1(cardType)}>
            {children}
          </Box>
        </Collapse>
      ) : <Box sx={cardViewBoxSx1(cardType)}>{children}</Box>}
    </Box>
  );
}

function EmptyColumn() {
  return (
    <Typography
      align="center"
      color="text.secondary"
      variant="body2"
      sx={cardViewTypographySx1}
    >
      No tickets in this stage
    </Typography>
  );
}

export default function TicketCardView(props: TicketCardViewProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));
  const [expandedStatus, setExpandedStatus] = React.useState("Open");
  if (props.cardType === "Ticket") {
    const columns = [
      {
        title: "Open",
        accent: getStatusColor("open"),
        rows: props.data.filter((ticket) =>
          ["open", "modified", "reopened"].includes(ticket.current_status),
        ),
      },
      {
        title: "In progress",
        accent: getStatusColor("assigned"),
        rows: props.data.filter((ticket) =>
          [
            "assigned",
            "not-satisfied",
            "accepted",
            "in progress",
            "recall requested",
          ].includes(ticket.current_status),
        ),
      },
      {
        title: "Completed",
        accent: getStatusColor("completed"),
        rows: props.data.filter(
          (ticket) => ticket.current_status === "completed",
        ),
      },
    ];
    return (
      <Box sx={cardViewBoxSx2}>
        {columns.map((column) => (
          <TicketColumn
            key={column.title}
            title={column.title}
            count={column.rows.length}
            accent={column.accent}
            isSmallScreen={isSmallScreen}
            expanded={expandedStatus === column.title}
            hasAlarm={column.rows.some((ticket) => ticket.alarm === true)}
            cardType="Ticket"
            onExpand={() => setExpandedStatus(column.title)}
          >
            {column.rows.length ? (
              column.rows.map((ticket) => (
                <BasicCardComponent
                  key={ticket.id ?? ticket.number}
                  ticket={ticket}
                  onOpen={props.onCardClick}
                />
              ))
            ) : (
              <EmptyColumn />
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
      rows: props.data.filter((ticket) => ticket.current_status === "open"),
    },
    {
      title: "Closed",
      accent: getStatusColor("closed"),
      rows: props.data.filter((ticket) => ticket.current_status === "closed"),
    },
  ];
  return (
    <Box sx={cardViewBoxSx3}>
      {columns.map((column) => (
        <TicketColumn
          key={column.title}
          title={column.title}
          count={column.rows.length}
          accent={column.accent}
          isSmallScreen={isSmallScreen}
          expanded={expandedStatus === column.title}
          hasAlarm={column.rows.some((ticket) => ticket.alarm === true)}
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
            <EmptyColumn />
          )}
        </TicketColumn>
      ))}
    </Box>
  );
}
