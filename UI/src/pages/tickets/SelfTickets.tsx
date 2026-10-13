import { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import {
  VirtualizedTable,
  type ColumnData,
} from "../../components/common/TableView";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CreateSelfTicketModel from "../../components/selfTickets/CreateModel";
import TicketCardView from "../../components/common/CardView";
import TableLoadingState from "../../components/common/TableLoadingState";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import { formatDate } from "../../components/common/formatDate";
import { shouldBlinkSelfTicket, getSelfTicketAlertReason } from "../../components/selfTickets/highlight";
import type {
  SelfTicketCollections,
  SelfTicketData,
  ReportingEmployees,
} from "../../types/dataTypes";
import api from "../../api/axios";
import { asArray, useApiQuery } from "../../api/useApiQuery";
import { useSessionState } from "../../utils/useSessionState";
import SelfTicketDetailModel from "../../components/selfTickets/DetailModel";
import {
  buttonLabelCompact,
  buttonLabelFull,
  filterField,
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

export default function SelfTickets() {
  const userId = useMemo(() => loggedUser(), []);
  const [selectedUser, setSelectedUser] = useState("");
  const [view, setView] = useSessionState<"table" | "card">(
    "do-list:view",
    "card",
    (value): value is "table" | "card" => value === "table" || value === "card",
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedRow, setSelectedRow] = useState<SelfTicketData | null>(null);
  const [tabValue, setTabValue] = useSessionState(
    "do-list:tab",
    0,
    (value): value is number => value === 0 || value === 1,
  );
  const [acknowledgeTarget, setAcknowledgeTarget] =
    useState<SelfTicketData | null>(null);
  const [acknowledging, setAcknowledging] = useState(false);

  // Cached Do List: both tabs come from one response, and a return visit
  // renders immediately while refreshing in the background.
  const ticketsQuery = useApiQuery<SelfTicketData[]>("/self-tickets/", {
    do_List: true,
  });
  const tickets = useMemo<SelfTicketCollections>(() => {
    const all = asArray<SelfTicketData>(ticketsQuery.data);
    return {
      self: all.filter((ticket) => ticket.creator === userId),
      others: all.filter((ticket) => ticket.creator !== userId),
      all,
    };
  }, [ticketsQuery.data, userId]);
  const loading = ticketsQuery.isPending;

  // Team list is reference data shared with Timesheet Logs (same cache entry).
  const teamsQuery = useApiQuery<ReportingEmployees[]>("/teams/");
  const users = useMemo(
    () => asArray<ReportingEmployees>(teamsQuery.data),
    [teamsQuery.data],
  );

  const openCreate = useCallback(() => {
    setSelectedRow(null);
    setEditing(false);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((ticket: SelfTicketData) => {
    setSelectedRow(ticket);
    setEditing(true);
    setDialogOpen(true);
  }, []);

  const openDetails = useCallback((ticket: SelfTicketData) => {
    setSelectedRow(ticket);
    setEditing(false);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditing(false);
    setSelectedRow(null);
  }, []);

  const requestAcknowledgeAlarm = useCallback((ticket: SelfTicketData) => {
    setAcknowledgeTarget(ticket);
  }, []);

  const closeAcknowledgeDialog = useCallback(() => {
    if (acknowledging) return;
    setAcknowledgeTarget(null);
  }, [acknowledging]);

  const confirmAcknowledgeAlarm = useCallback(async () => {
    const ticket = acknowledgeTarget;
    if (!ticket?.id) return;

    setAcknowledging(true);
    try {
      await api.post(`/self-tickets/${ticket.id}/acknowledge-alarm/`);
      setAcknowledgeTarget(null);
    } catch {
      // The shared request error dialog explains the failure.
    } finally {
      setAcknowledging(false);
    }
  }, [acknowledgeTarget]);

  const columns = useMemo<ColumnData<SelfTicketData>[]>(
    () => [
      {
        label: "#",
        width: 45,
        render: (_row, index) => index + 1,
        numeric: true,
      },
      {
        label: "Task Number",
        // This cell contains three action icons and the task number. Reserve
        // enough fixed-table width for an active reminder bell as well.
        width: 280,
        render: (row) => (
          <Box sx={{ ...inlineCenterGapSx, flexWrap: "nowrap" }}>
            <Tooltip title="View details">
              <IconButton
                aria-label={`View ${row.number}`}
                size="small"
                onClick={() => openDetails(row)}
              >
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit task">
              <span><IconButton
                aria-label={`Edit ${row.number}`}
                size="small"
                onClick={() => openEdit(row)}
                disabled={
                  row.creator !== userId || row.current_status !== "open"
                }
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton></span>
            </Tooltip>
            <Typography variant="body2" fontWeight={700}>{row.number}</Typography>
            {row.alarm && (
              <Tooltip title="Acknowledge reminder">
                <IconButton
                  aria-label={`Acknowledge reminder ${row.number}`}
                  size="small"
                  color="warning"
                  onClick={() => requestAcknowledgeAlarm(row)}
                >
                  <NotificationsActiveOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
      { label: "Subject", dataKey: "task", width: 350  },
      { label: "Owner", dataKey: "creator_name" },
      { label: "Status", dataKey: "current_status" },
      {
        label: "Due Date",
        dataKey: "target_date",
        render: (row) => {
          const overdue = getSelfTicketAlertReason(row) === "target-date";
          return (
            <Box sx={inlineCenterGapSx}>
              <Typography variant="body2">
                {row.target_date ? formatDate(row.target_date) : "N/A"}
              </Typography>
              {overdue && (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, color: "error.main", fontWeight: 700 }}
                >
                  <EventBusyOutlinedIcon sx={{ fontSize: 14 }} aria-hidden="true" />
                  Overdue
                </Typography>
              )}
            </Box>
          );
        },
      },
      { label: "Type", dataKey: "type" },
      { label: "Priority", dataKey: "priority" },
      { label: "Est Hrs", dataKey: "est_hours" },
      {
        label: "Reminder",
        width: 120,
        render: (row) =>
          row.alarm ? (
            <Box sx={inlineCenterGapSx}>
              <NotificationsActiveOutlinedIcon color="warning" fontSize="small" aria-hidden="true" />
              <Typography color="warning.main" fontWeight={700} fontSize={13}>
                Active
              </Typography>
            </Box>
          ) : (
            <Box sx={inlineCenterGapSx}>
              <NotificationsOffOutlinedIcon color="disabled" fontSize="small" />
              <Typography color="text.secondary" fontSize={13}>
                Off
              </Typography>
            </Box>
          ),
      },
    ],
    [requestAcknowledgeAlarm, userId, openDetails, openEdit],
  );

  const activeRows = tabValue === 0 ? tickets.self : tickets.others;

  const filteredRows = useMemo(
    () =>
      [...activeRows.filter(
        (ticket) => !selectedUser || ticket.creator === Number(selectedUser),
      )].sort((left, right) => {
        const urgency = (ticket: SelfTicketData) => {
          const reason = getSelfTicketAlertReason(ticket);
          if (reason === "target-date") return 0;
          if (reason === "alarm") return 1;
          return 2;
        };
        return urgency(left) - urgency(right);
      }),
    [activeRows, selectedUser],
  );

  return (
    <Box sx={page}>
      <Box sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Typography variant="h5" component="h1" sx={pageTitle}>Do List</Typography>
            <Typography variant="body2" sx={pageSubtitle}>
              Organize personal actions, reminders, and follow-ups.
            </Typography>
          </Box>
          <Stack
            direction={{ xs: "row", sm: "row" }}
            spacing={1}
            sx={pageHeaderActions}
          >
            {tabValue !== 0 && (
              <FormControl size="small" sx={[filterField, { flex: { xs: "1 1 140px", sm: "0 0 auto" }, minWidth: { xs: 0, sm: 210 } }]}>
                <InputLabel>Employee</InputLabel>
                <Select
                  value={selectedUser}
                  label="Employee"
                  onChange={(event) => setSelectedUser(event.target.value)}
                >
                  <MenuItem value="">
                    <em>All employees</em>
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.first_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {tabValue === 0 && (
              <Button
                startIcon={<AddOutlinedIcon />}
                variant="contained"
                onClick={openCreate}
              >
                <Box component="span" sx={buttonLabelFull}>New Task</Box>
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

        <Box sx={tabsContainer}>
          <Tabs
            value={tabValue}
            onChange={(_, value: number) => {
              setTabValue(value);
              setSelectedUser("");
            }}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={tabs}
          >
            <Tab
              icon={tabValue === 0 ? <AssignmentTurnedInIcon /> : <AssignmentTurnedInOutlinedIcon />}
              iconPosition="start"
              label={`My Do List (${tickets.self.length})`}
            />
            <Tab
              icon={tabValue === 1 ? <GroupsIcon /> : <GroupsOutlinedIcon />}
              iconPosition="start"
              label={`My Teams Do List (${tickets.others.length})`}
            />
          </Tabs>
        </Box>

        <Box sx={tablePageContent}>
          {view === "card" && loading ? (
            <TableLoadingState variant="cards" label="Loading tasks" />
          ) : view === "card" ? (
            <TicketCardView
              data={filteredRows}
              onCardClick={openDetails}
              cardType="Self"
              onAcknowledgeAlarm={requestAcknowledgeAlarm}
            />
          ) : (
            <VirtualizedTable
              columns={columns}
              rows={filteredRows}
              height="100%"
              tableMinWidth="100%"
              getRowSx={(row) =>
                row.alarm === true
                  ? priorityAlarmRowHighlight(row.priority)
                  : shouldBlinkSelfTicket(row)
                  ? priorityDueRowHighlight(row.priority)
                  : undefined
              }
              tableHead="Tasks"
              loading={loading}
              emptyTitle="No tasks in this view"
              emptyDescription="Add a task or reminder to start your Do List."
            />
          )}
        </Box>
      </Box>

      {!selectedRow && !editing && (
        <CreateSelfTicketModel
          open={dialogOpen}
          handleClose={closeDialog}
          Data={null}
        />
      )}
      {selectedRow && editing && (
        <CreateSelfTicketModel
          open={dialogOpen}
          handleClose={closeDialog}
          Data={selectedRow}
        />
      )}
      {selectedRow && !editing && (
        <SelfTicketDetailModel
          open={dialogOpen}
          onClose={closeDialog}
          data={selectedRow}
        />
      )}
      <ConfirmDialog
        open={Boolean(acknowledgeTarget)}
        title="Acknowledge Reminder"
        description={`Are you sure you want to acknowledge reminder ${
          acknowledgeTarget?.number ? `#${acknowledgeTarget.number}` : ""
        }?`}
        titleIcon={<NotificationsActiveOutlinedIcon fontSize="small" />}
        confirmLabel={acknowledging ? "Acknowledging..." : "Acknowledge"}
        confirmColor="warning"
        confirmIcon={<NotificationsActiveOutlinedIcon fontSize="small" />}
        confirmDisabled={acknowledging}
        tone="warning"
        onClose={closeAcknowledgeDialog}
        onConfirm={() => void confirmAcknowledgeAlarm()}
      />
    </Box>
  );
}
