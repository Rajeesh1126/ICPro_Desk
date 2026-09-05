import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import {
  VirtualizedTable,
  type ColumnData,
} from "../../components/common/TableView";
import CreateTicketModal from "../../components/tickets/CreateModal";
import TicketDetailModal from "../../components/tickets/DetailModal";
import TicketCardView from "../../components/common/CardView";
import type {
  TicketCollections,
  TicketData,
  TicketLog,
} from "../../types/dataTypes";
import api from "../../api/axios";
import {
  buttonLabelCompact,
  buttonLabelFull,
  inlineCenterGapSx,
  pageHeaderActions,
  pageHeaderContent,
  pageHeader,
  page,
  pageContent,
  pageSubtitle,
  pageTitle,
  priorityDueRowHighlight,
  tabs,
  tabsContainer,
  tablePageContent,
  toggleButton,
} from "../../styles/common";

const emptyTickets: TicketCollections = {
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

function parseTicketDueDay(value: string | null | undefined) {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).setHours(0, 0, 0, 0);
  }

  const normalizedValue = value.replace(" ", "T");
  const dueDate = new Date(normalizedValue);
  const timestamp = dueDate.getTime();
  dueDate.setHours(0, 0, 0, 0);

  return Number.isNaN(timestamp) ? null : dueDate.getTime();
}

function isOpenOrInProgressDueTicket(ticket: TicketData) {
  const dueDay = parseTicketDueDay(ticket.target_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const status = ticket.current_status?.toLowerCase() ?? "";
  const activeStatuses = [
    "open",
    "modified",
    "reopened",
    "in progress",
    "assigned",
    "not-satisfied",
    "accepted",
    "recall requested",
  ];

  return (
    dueDay !== null &&
    dueDay <= today.getTime() &&
    activeStatuses.includes(status)
  );
}

export default function Tickets() {
  const userId = useMemo(() => loggedUser(), []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TicketData | null>(null);
  const [view, setView] = useState<"table" | "card">("table");
  const [tabValue, setTabValue] = useState(0);
  const [tickets, setTickets] = useState<TicketCollections>(emptyTickets);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    void api
      .get("/tickets/")
      .then((response) => {
        console.log("tickets....", response);
        if (!active) return;
        const source = (
          Array.isArray(response.data) ? response.data : []
        ) as TicketData[];
        const all = source.map((ticket) => {
          const latestAcceptedLog: TicketLog | null =
            ticket.current_status === "assigned"
              ? (ticket.logs?.find((log) => log.status.includes("open")) ??
                null)
              : null;
          return {
            ...ticket,
            assigned_to_name: ticket.assigned_to_name || "Unassigned",
            creator_name: ticket.creator_name || "Unassigned",
            display_status: ticket.current_status,
            latestAcceptedLog,
          };
        });
        const inactiveStatuses = ["rejected", "closed", "recall successful"];
        setTickets({
          all: all.filter(
            (ticket) =>
              ticket.assigned_to === userId || ticket.creator === userId,
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
          closed: all.filter(
            (ticket) =>
              (ticket.assigned_to === userId || ticket.creator === userId) &&
              ticket.display_status === "closed",
          ),
          rejected: all.filter(
            (ticket) =>
              ticket.current_status === "rejected" &&
              (ticket.assigned_to === userId || ticket.creator === userId),
          ),
          recalled: all.filter(
            (ticket) =>
              ticket.current_status === "recall successful" &&
              (ticket.assigned_to === userId || ticket.creator === userId),
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

  const columns = useMemo<ColumnData<TicketData>[]>(
    () => [
      {
        label: "#",
        width: 20,
        render: (_row, index) => index + 1,
        numeric: true,
      },
      {
        label: "Ticket Number",
        width: 195,
        render: (row) => (
          <Box sx={inlineCenterGapSx}>
            <Tooltip title="View details">
              <IconButton
                aria-label={`View ${row.number}`}
                color="primary"
                onClick={() => openDetails(row)}
              >
                <VisibilityOutlinedIcon fontSize="small" color="primary" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit ticket">
              <IconButton
                aria-label={`Edit ${row.number}`}
                onClick={() => openEdit(row)}
                color="secondary"
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
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="body2">{row.number}</Typography>
          </Box>
        ),
      },
      { label: "Subject", dataKey: "task", width: 350 },
      { label: "Status", dataKey: "current_status" },
      { label: "Assigned By", dataKey: "creator_name" },
      { label: "Assigned To", dataKey: "assigned_to_name" },
      { label: "Priority", dataKey: "priority" },
      { label: "Est Hrs", dataKey: "est_hours"},
      { label: "Act Hrs", dataKey: "act_hours"},
      { label: "Target Completion", dataKey: "target_date" },
      { label: "Actual Completion", dataKey: "actual_end_date"},
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
    <Box sx={page}>
      <Box component="main" sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Typography variant="h5" sx={pageTitle}>Tickets</Typography>
            <Typography variant="body2" sx={pageSubtitle}>
              Track, assign, and complete team tickets from one workspace.
            </Typography>
          </Box>
          <Stack
            direction={{ xs: "row", sm: "row" }}
            spacing={1}
            sx={pageHeaderActions}
          >
            {tabValue === 0 && (
              <Button
                startIcon={<AddOutlinedIcon />}
                variant="contained"
                onClick={openCreate}
              >
                <Box component="span" sx={buttonLabelFull}>New Ticket</Box>
                <Box component="span" sx={buttonLabelCompact}>New</Box>
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
              sx={toggleButton}
            >
              <Tooltip title="Table view" arrow>
                <ToggleButton value="table" aria-label="Table view">
                  <TableRowsOutlinedIcon fontSize="small" />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Board view" arrow>
                <ToggleButton value="card" aria-label="Board view">
                  <ViewKanbanOutlinedIcon fontSize="small" />
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>
          </Stack>
        </Box>

        {/* <Paper square elevation={0} sx={ticketsPagePaperSx1}> */}
        <Box sx={tabsContainer}>
          <Tabs
            value={tabValue}
            onChange={(_, value: number) => setTabValue(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={tabs}
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

        <Box sx={tablePageContent}>
          {view === "card" ? (
            <TicketCardView
              data={activeRows}
              onCardClick={openDetails}
              cardType="Ticket"
              getCardStatus={(ticket) =>
                isOpenOrInProgressDueTicket(ticket) ? "warning" : undefined
              }
            />
          ) : (
            <VirtualizedTable
              columns={columns}
              rows={activeRows}
              height="100%"
              getRowSx={(row) =>
                isOpenOrInProgressDueTicket(row)
                  ? priorityDueRowHighlight(row.priority)
                  : undefined
              }
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
