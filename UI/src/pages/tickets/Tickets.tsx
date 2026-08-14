import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import ViewKanbanRoundedIcon from "@mui/icons-material/ViewKanbanRounded";
import { VirtualizedTable, type ColumnData } from "../../components/common/TableView";
import CreateTicketModal from "../../components/Tickets/CreateModal";
import TicketDetailModal from "../../components/Tickets/DetailModal";
import TicketCardView from "../../components/common/CardView";
import type {
  TicketCollections,
  TicketData,
  TicketLog,
} from "../../types/dataTypes";
import api from "../../api/axios";
import {
  appPageBox,
  flexColumnFillSx,
  modalActionButtonSx,
  pageHeaderSx,
  responsiveRightActionsSx,
  ticketsPageBoxSx3,
  TOGGLE_BUTTON,
} from "../../styles/common";

const EMPTY_TICKETS: TicketCollections = {
  all: [],
  assigned: [],
  created: [],
  closed: [],
  rejected: [],
  recalled: [],
};

function loggedUser(): number | null {
	const value = localStorage.getItem("user");
	const id = value ? Number(value) : NaN;

	return Number.isInteger(id) ? id : null;
}


export default function Tickets() {
  const userId = useMemo(() => loggedUser(), []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TicketData | null>(null);
  const [view, setView] = useState<"table" | "card">("table");
  const [tabValue, setTabValue] = useState(0);
  const [tickets, setTickets] = useState<TicketCollections>(EMPTY_TICKETS);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    void api
      .get("/tickets/")
      .then((response) => {
        console.log(response.data)
        if (!active) return;
        const source = (
          Array.isArray(response.data) ? response.data : []
        ) as TicketData[];
        const all = source.map((ticket) => {
          const assigned = ticket.assigned_to_details;
          const creator = ticket.creator_details;
          const assignedName = assigned
            ? `${assigned.first_name ?? ""} ${assigned.last_name ?? ""}`.trim() ||
              "Unassigned"
            : "Unassigned";
          const creatorName = creator
            ? `${creator.first_name ?? ""} ${creator.last_name ?? ""}`.trim() ||
              "Unassigned"
            : "Unassigned";
          const latestAcceptedLog: TicketLog | null =
            ticket.current_status === "assigned"
              ? (ticket.logs?.find((log) => log.status.includes("open")) ??
                null)
              : null;
          return {
            ...ticket,
            assigned_to_name: assignedName,
            creator_name: creatorName,
            display_status: ticket.current_status,
            latestAcceptedLog,
          };
        });
        const inactiveStatuses = ["rejected", "closed", "recall successful"];
        setTickets({
          all: all.filter(
            (ticket) =>
              ticket.assigned_to === userId ||
              ticket.creator === userId,
          ),
          assigned: all.filter(
            (ticket) =>
              (!inactiveStatuses.includes(ticket.current_status) &&
                ticket.assigned_to === userId) ||
              ticket.latestAcceptedLog?.assigned_to === userId,
          ),
          created: all.filter(
            (ticket) =>
              ticket.creator === userId &&
              !inactiveStatuses.includes(ticket.current_status),
          ),
          closed: all.filter((ticket) => (ticket.assigned_to === userId ||
              ticket.creator === userId) && ticket.display_status === "closed"),
          rejected: all.filter(
            (ticket) =>
              ticket.current_status === "rejected" &&
              (ticket.assigned_to === userId ||
                ticket.creator === userId),
          ),
          recalled: all.filter(
            (ticket) =>
              ticket.current_status === "recall successful" &&
              (ticket.assigned_to === userId ||
                ticket.creator === userId),
          ),
        });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [userId, refreshKey]);

  const openCreate = useCallback(() => {
    setSelectedRow(null);
    setEditing(false);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((ticket: TicketData) => {
    setSelectedRow(ticket);
    setEditing(true);
    setDialogOpen(true);
  }, []);

  const openDetails = useCallback((ticket: TicketData) => {
    setSelectedRow(ticket);
    setEditing(false);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditing(false);
    setSelectedRow(null);
    setRefreshKey((key) => key + 1);
  }, []);

  const columns = useMemo<ColumnData<TicketData>[]>(() => [
      { label: "#",width: 10,render: (_row, index) => index + 1, number:true},
      {
        label: "Ticket Number",
        width: 180,
        render: (row) => (
          <Stack direction="row" spacing={1}>
            <Tooltip title="View details">
              <IconButton
                aria-label={`View ${row.number}`}
                size="small"
                onClick={() => openDetails(row)}
              >
                <VisibilityRoundedIcon fontSize="small" color="primary" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit ticket">
              <span>
                <IconButton
                  aria-label={`Edit ${row.number}`}
                  size="small"
                  onClick={() => openEdit(row)}
                  disabled={
                    row.creator !== userId ||
                    [
                      "closed",
                      "recall successful",
                      "recall requested",
                      "completed",
                    ].includes(row.current_status)
                  }
                >
                  <EditRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Typography variant="body2">{row.number}</Typography>
          </Stack>
        ),
      },
      { label: "Subject", dataKey: "task", width: 500 },
      { label: "Status", dataKey: "current_status" },
      { label: "Assigned By", dataKey: "creator_name" },
      { label: "Assigned To", dataKey: "assigned_to_name" },
      { label: "Priority", dataKey: "priority" },
      { label: "Est Hrs", dataKey: "est_hours" },
      { label: "Act Hrs", dataKey: "act_hours" },
      { label: "Target Completion", dataKey: "target_date" },
      { label: "Actual Completion", dataKey: "actual_end_date" },
    ],
    [userId, openDetails, openEdit],
  );

  const activeRows =
    [
      tickets.all,
      tickets.assigned,
      tickets.created,
      tickets.rejected,
      tickets.recalled,
      tickets.closed,
    ][tabValue] ?? tickets.all;

  return (
    <Box sx={appPageBox}>
      <Box component="main" sx={flexColumnFillSx}>
        <Box sx={pageHeaderSx}>
          <Box>
            <Typography variant="h5">Tickets</Typography>
            <Typography variant="body2" color="text.secondary">
              Track, assign, and complete team tickets from one workspace.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={responsiveRightActionsSx}>
            {tabValue === 0 && (
              <Button
                startIcon={<AddRoundedIcon />}
                variant="contained"
                onClick={openCreate}
                sx={modalActionButtonSx}
              >
                New Ticket
              </Button>
            )}
            <ToggleButtonGroup
              exclusive
              value={view}
              size="small"
              onChange={(_, next: "table" | "card" | null) =>
                next && setView(next)
              }
              aria-label="Task view"
               sx={TOGGLE_BUTTON}
            >
              <Tooltip title="Table view" arrow>
                <ToggleButton value="table" aria-label="Table view">
                  <TableRowsRoundedIcon fontSize="small" />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Board view" arrow>
                <ToggleButton value="card" aria-label="Board view">
                  <ViewKanbanRoundedIcon fontSize="small" />
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>
          </Stack>
        </Box>

        {/* <Paper square elevation={0} sx={ticketsPagePaperSx1}> */}
        <Box sx={{ mx: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(_, value: number) => setTabValue(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label={`Overview (${tickets.all.length})`} />
            <Tab label={`Assigned To Me (${tickets.assigned.length})`} />
            <Tab label={`Assigned By Me (${tickets.created.length})`} />
            <Tab label={`Rejected (${tickets.rejected.length})`} />
            <Tab label={`Recalled (${tickets.recalled.length})`} />
            <Tab label={`Closed (${tickets.closed.length})`} />
          </Tabs>
          </Box>
        {/* </Paper> */}

        <Box sx={ticketsPageBoxSx3}>
          {view === "card" ? (
            <TicketCardView
              data={activeRows}
              onCardClick={openDetails}
              cardType="Ticket"
            />
          ) : (
            <VirtualizedTable
              columns={columns}
              rows={activeRows}
              height="100%"
              tableHead="Tickets"
            />
          )}
        </Box>
      </Box>

      {!selectedRow && !editing && (
        <CreateTicketModal
          open={dialogOpen}
          handleClose={closeDialog}
          Data={null}
        />
      )}
      {selectedRow && !editing && (
        <TicketDetailModal
          open={dialogOpen}
          onClose={closeDialog}
          data={selectedRow}
        />
      )}
      {selectedRow && editing && (
        <CreateTicketModal
          open={dialogOpen}
          handleClose={closeDialog}
          Data={selectedRow}
        />
      )}
    </Box>
  );
}
