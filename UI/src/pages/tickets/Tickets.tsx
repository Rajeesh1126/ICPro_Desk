import { useCallback, useMemo, useState } from "react";
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
import DashboardIcon from "@mui/icons-material/Dashboard";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CancelIcon from "@mui/icons-material/Cancel";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import UndoIcon from "@mui/icons-material/Undo";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import {
  VirtualizedTable,
  type ColumnData,
} from "../../components/common/TableView";
import CreateTicketModal from "../../components/tickets/CreateModal";
import TicketDetailModal from "../../components/tickets/DetailModal";
import TicketCardView from "../../components/common/CardView";
import TableLoadingState from "../../components/common/TableLoadingState";
import type {
  TicketData,
} from "../../types/dataTypes";
import { useApiQuery } from "../../api/useApiQuery";
import { buildTicketCollections } from "./ticketCollections";
import { useSessionState } from "../../utils/useSessionState";
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
  priorityAlarmRowHighlight,
  priorityDueRowHighlight,
  tabs,
  tabsContainer,
  tablePageContent,
  toggleButton,
} from "../../styles/common";


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
    "revised",
    "reopened",
    "in progress",
    "assigned",
    "not-satisfied",
    "accepted",
    "recall requested",
    "date revision",
    "pending",
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
  const [view, setView] = useSessionState<"table" | "card">(
    "tickets:view",
    "table",
    (value): value is "table" | "card" => value === "table" || value === "card",
  );
  const [tabValue, setTabValue] = useSessionState(
    "tickets:tab",
    0,
    (value): value is number => typeof value === "number" && value >= 0 && value <= 5,
  );
  // List-only tabs are unavailable on the board; remember where the user was.
  const [tableTabBeforeBoard, setTableTabBeforeBoard] = useState<number | null>(null);

  // One cached response feeds every tab, so tab switches are instant and a
  // return visit renders immediately while refreshing in the background.
  const ticketsQuery = useApiQuery<TicketData[]>("/tickets/", {
    is_internal: false,
  });
  const tickets = useMemo(
    () => buildTicketCollections(ticketsQuery.data, userId),
    [ticketsQuery.data, userId],
  );
  const loading = ticketsQuery.isPending;

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
        // View + edit buttons (2 × 36px) plus the full number, e.g. TM-050926-001.
        width: 230,
        render: (row) => (
          <Box sx={inlineCenterGapSx}>
            <Tooltip title="View details">
              <IconButton
                aria-label={`View ${row.number}`}
                size="small"
                onClick={() => openDetails(row)}
              >
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit ticket">
              <span><IconButton
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
                <EditOutlinedIcon fontSize="small" />
              </IconButton></span>
            </Tooltip>
            <Typography variant="body2" fontWeight={700}>{row.number}</Typography>
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
      <Box sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Typography variant="h5" component="h1" sx={pageTitle}>Tickets</Typography>
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
              onChange={(_, next: "table" | "card" | null) => {
                if (!next) return;

                setView(next);
                if (next === "card" && tabValue > 2) {
                  setTableTabBeforeBoard(tabValue);
                  setTabValue(0);
                } else if (next === "table" && tableTabBeforeBoard !== null) {
                  setTabValue(tableTabBeforeBoard);
                  setTableTabBeforeBoard(null);
                }
              }}
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

        <Box sx={tabsContainer}>
          <Tabs
            value={tabValue}
            onChange={(_, value: number) => {
              setTabValue(value);
              setTableTabBeforeBoard(null);
            }}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={tabs}
          >
            <Tab icon={tabValue === 0 ? <DashboardIcon /> : <DashboardOutlinedIcon />} iconPosition="start" label={`Overview (${tickets.all.length})`} />
            <Tab icon={tabValue === 1 ? <AssignmentIndIcon /> : <AssignmentIndOutlinedIcon />} iconPosition="start" label={`Assigned To Me (${tickets.assigned.length})`} />
            <Tab icon={tabValue === 2 ? <AssignmentIcon /> : <AssignmentOutlinedIcon />} iconPosition="start" label={`Assigned By Me (${tickets.created.length})`} />
            <Tab
              icon={tabValue === 3 ? <CancelIcon /> : <CancelOutlinedIcon />}
              iconPosition="start"
              label={`Rejected (${tickets.rejected.length})`}
              disabled={view === "card"}
            />
            <Tab
              icon={tabValue === 4 ? <UndoIcon /> : <UndoOutlinedIcon />}
              iconPosition="start"
              label={`Recalled (${tickets.recalled.length})`}
              disabled={view === "card"}
            />
            <Tab
              icon={tabValue === 5 ? <TaskAltIcon /> : <TaskAltOutlinedIcon />}
              iconPosition="start"
              label={`Closed (${tickets.closed.length})`}
              disabled={view === "card"}
            />
          </Tabs>
        </Box>
        {view === "card" && (
          <Typography variant="caption" color="text.secondary" sx={{ px: { xs: 2, sm: 0 }, mt: -0.5, mb: 0.5 }}>
            Rejected, Recalled and Closed are list-only. Switch to Table view to see them
            {tableTabBeforeBoard !== null ? "; your previous tab will be restored." : "."}
          </Typography>
        )}
        <Box sx={tablePageContent}>
          {view === "card" && loading ? (
            <TableLoadingState variant="cards" label="Loading tickets" />
          ) : view === "card" ? (
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
              getRowSx={(row) =>
                row.alarm === true
                  ? priorityAlarmRowHighlight(row.priority)
                  : isOpenOrInProgressDueTicket(row)
                  ? priorityDueRowHighlight(row.priority)
                  : undefined
              }
              tableHead="Tickets"
              loading={loading}
              emptyTitle="No tickets in this view"
              emptyDescription="Tickets you create or are assigned will appear here."
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
