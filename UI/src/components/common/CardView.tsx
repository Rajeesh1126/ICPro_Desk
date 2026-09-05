import * as React from "react";
import {
  Box,
  Chip,
  Collapse,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import type { SelfTicketData, TicketData } from "../../types/dataTypes";
import BasicCardComponent from "../tickets/BasicCard";
import BasicCardSelfTicket from "../selfTickets/BasicCard";
import {
  cardViewBoxSx1,
  cardViewBoxSx2,
  cardViewBoxSx3,
  cardViewCollapseContent,
  cardViewDynamicDynamicBoxSx1,
  cardViewDynamicDynamicChipSx1,
  cardViewDynamicDynamicStackSx1,
  cardViewExpandIcon,
  cardViewOverdueChip,
  cardViewTypographySx1,
  getStatusColor,
  type TableRowStatus,
} from "../../styles/common";

type TicketCardViewProps =
  | {
      cardType: "Ticket";
      data: TicketData[];
      onCardClick: (ticket: TicketData) => void;
      getCardStatus?: (ticket: TicketData) => TableRowStatus | undefined;
    }
  | {
      cardType: "Self";
      data: SelfTicketData[];
      onCardClick: (ticket: SelfTicketData) => void;
      getCardStatus?: (ticket: SelfTicketData) => TableRowStatus | undefined;
    };

type ColumnProps = {
  title: string;
  count: number;
  overdueCount: number;
  accent: string;
  children: React.ReactNode;
  expanded: boolean;
  isMobile: boolean;
  onToggle: () => void;
};

function TicketColumn({
  title,
  count,
  overdueCount,
  accent,
  children,
  expanded,
  isMobile,
  onToggle,
}: ColumnProps) {
  return (
    <Box sx={cardViewDynamicDynamicBoxSx1({ alpha })}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        onClick={onToggle}
        onKeyDown={(event) => {
          if (!isMobile) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle();
          }
        }}
        role={isMobile ? "button" : undefined}
        tabIndex={isMobile ? 0 : undefined}
        aria-expanded={isMobile ? expanded : undefined}
        sx={cardViewDynamicDynamicStackSx1({ accent })}
      >
        <Typography fontWeight={800}>{title}</Typography>
        <Stack direction="row" spacing={0.75} alignItems="center">
          {overdueCount > 0 && (
            <Chip
              icon={<WarningAmberOutlinedIcon />}
              label={`${overdueCount} overdue`}
              size="small"
              sx={cardViewOverdueChip}
            />
          )}
          <Chip
            label={count}
            size="small"
            sx={cardViewDynamicDynamicChipSx1({ accent, alpha })}
          />
          <KeyboardArrowDownOutlinedIcon sx={cardViewExpandIcon(expanded)} />
        </Stack>
      </Stack>
      {isMobile ? (
        <Collapse in={expanded} timeout="auto">
          <Box sx={[cardViewBoxSx1, cardViewCollapseContent]}>{children}</Box>
        </Collapse>
      ) : (
        <Box sx={cardViewBoxSx1}>{children}</Box>
      )}
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
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md"),
  );
  const [expandedColumn, setExpandedColumn] = React.useState("");

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
    const firstColumnTitle = columns[0]?.title ?? "";
    const activeExpandedColumn =
      isMobile && columns.some((column) => column.title === expandedColumn)
        ? expandedColumn
        : firstColumnTitle;

    return (
      <Box sx={cardViewBoxSx2}>
        {columns.map((column) => (
          <TicketColumn
            key={column.title}
            title={column.title}
            count={column.rows.length}
            overdueCount={
              column.rows.filter(
                (ticket) => props.getCardStatus?.(ticket) === "warning",
              ).length
            }
            accent={column.accent}
            expanded={!isMobile || activeExpandedColumn === column.title}
            isMobile={isMobile}
            onToggle={() => {
              if (isMobile) setExpandedColumn(column.title);
            }}
          >
            {column.rows.length ? (
              column.rows.map((ticket) => (
                <BasicCardComponent
                  key={ticket.id ?? ticket.number}
                  ticket={ticket}
                  onOpen={props.onCardClick}
                  highlighted={props.getCardStatus?.(ticket) === "warning"}
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
  const firstColumnTitle = columns[0]?.title ?? "";
  const activeExpandedColumn =
    isMobile && columns.some((column) => column.title === expandedColumn)
      ? expandedColumn
      : firstColumnTitle;

  return (
    <Box sx={cardViewBoxSx3}>
      {columns.map((column) => (
        <TicketColumn
          key={column.title}
          title={column.title}
          count={column.rows.length}
          overdueCount={
            column.rows.filter(
              (ticket) => props.getCardStatus?.(ticket) === "warning",
            ).length
          }
          accent={column.accent}
          expanded={!isMobile || activeExpandedColumn === column.title}
          isMobile={isMobile}
          onToggle={() => {
            if (isMobile) setExpandedColumn(column.title);
          }}
        >
          {column.rows.length ? (
            column.rows.map((ticket) => (
              <BasicCardSelfTicket
                key={ticket.id ?? ticket.number}
                ticket={ticket}
                onOpen={props.onCardClick}
                highlighted={props.getCardStatus?.(ticket) === "warning"}
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
