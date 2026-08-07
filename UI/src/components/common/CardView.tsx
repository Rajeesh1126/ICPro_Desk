import { Box, Chip, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { SelfTicketData, TicketData } from "../../types/TicketData";
import BasicCardComponent from "../Tickets/BasicCard";
import BasicCardSelfTicket from "../SelfTickets/BasicCard";
import { cardViewBoxSx1, cardViewBoxSx2, cardViewBoxSx3, cardViewDynamicDynamicBoxSx1, cardViewDynamicDynamicChipSx1, cardViewDynamicDynamicStackSx1, cardViewTypographySx1, getStatusColor } from "../../styles/common";

type TicketCardViewProps =
  | { cardType: "Ticket"; data: TicketData[]; onCardClick: (ticket: TicketData) => void }
  | { cardType: "Self"; data: SelfTicketData[]; onCardClick: (ticket: SelfTicketData) => void };

type ColumnProps = {
  title: string;
  count: number;
  accent: string;
  children: React.ReactNode;
};

function TicketColumn({ title, count, accent, children }: ColumnProps) {
  return (
    <Box sx={cardViewDynamicDynamicBoxSx1({ alpha })}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={cardViewDynamicDynamicStackSx1({ accent })}>
        <Typography fontWeight={800}>{title}</Typography>
        <Chip label={count} size="small" sx={cardViewDynamicDynamicChipSx1({ accent, alpha })} />
      </Stack>
      <Box sx={cardViewBoxSx1}>
        {children}
      </Box>
    </Box>
  );
}

function EmptyColumn() {
  return <Typography align="center" color="text.secondary" variant="body2" sx={cardViewTypographySx1}>No tickets in this stage</Typography>;
}

export default function TicketCardView(props: TicketCardViewProps) {
  if (props.cardType === "Ticket") {
    const columns = [
      { title: "Open", accent: getStatusColor("open"), rows: props.data.filter((ticket) => ["open", "modified", "reopened"].includes(ticket.current_status)) },
      { title: "In progress", accent: getStatusColor("assigned"), rows: props.data.filter((ticket) => ["assigned", "not-satisfied", "accepted", "recall requested"].includes(ticket.current_status)) },
      { title: "Completed", accent: getStatusColor("completed"), rows: props.data.filter((ticket) => ticket.current_status === "completed") },
    ];
    return (
      <Box sx={cardViewBoxSx2}>
        {columns.map((column) => (
          <TicketColumn key={column.title} title={column.title} count={column.rows.length} accent={column.accent}>
            {column.rows.length ? column.rows.map((ticket) => <BasicCardComponent key={ticket.id ?? ticket.number} ticket={ticket} onOpen={props.onCardClick} />) : <EmptyColumn />}
          </TicketColumn>
        ))}
      </Box>
    );
  }

  const columns = [
    {
      title: "Open",
      accent: getStatusColor("open"),
      rows: props.data.filter((ticket) => ticket.current_status === "open")
    },
    {
      title: "Closed",
      accent: getStatusColor("closed"),
      rows: props.data.filter((ticket) => ticket.current_status === "closed")
    },
  ];


  return (
    <Box
      sx={cardViewBoxSx3}
    >
      {columns.map((column) => (
        <TicketColumn key={column.title} title={column.title} count={column.rows.length} accent={column.accent}>
          {column.rows.length ? column.rows.map((ticket) =>
            <BasicCardSelfTicket
              key={ticket.id ?? ticket.number}
              ticket={ticket}
              onOpen={props.onCardClick} />
          ) : <EmptyColumn />}
        </TicketColumn>
      ))}
    </Box>
  );
}
