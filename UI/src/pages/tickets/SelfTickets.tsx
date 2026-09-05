import { useCallback, useEffect, useMemo, useState } from "react";
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
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  VirtualizedTable,
  type ColumnData,
} from "../../components/common/TableView";
import CreateSelfTicketModel from "../../components/selfTickets/CreateModel";
import TicketCardView from "../../components/common/CardView";
import type {
  SelfTicketCollections,
  SelfTicketData,
  ReportingEmployees,
} from "../../types/dataTypes";
import api from "../../api/axios";
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
  priorityDueRowHighlight,
  tabs,
  tabsContainer,
  tablePageContent,
  toggleButton,
} from "../../styles/common";

const emptyCollections: SelfTicketCollections = {
  all: [],
  self: [],
  others: [],
};

function loggedUser(): number | null {
  const value = localStorage.getItem("user");
  const id = value ? Number(value) : NaN;

  return Number.isInteger(id) ? id : null;
}

function parseTaskDueDay(value: string | null | undefined) {
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

function isOpenDueTask(ticket: SelfTicketData) {
  const dueDay = parseTaskDueDay(ticket.target_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOpen = ticket.current_status?.toLowerCase() === "open";

  return isOpen && dueDay !== null && dueDay <= today.getTime();
}

export default function SelfTickets() {
  const userId = useMemo(() => loggedUser(), []);
  const [selectedUser, setSelectedUser] = useState("");
  const [view, setView] = useState<"table" | "card">("card");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedRow, setSelectedRow] = useState<SelfTicketData | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<ReportingEmployees[]>([]);
  const [tickets, setTickets] =
    useState<SelfTicketCollections>(emptyCollections);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    void api
      .get("/self-tickets/?do_List=true")
      .then((response) => {
        if (!active) return;
        const all = (
          Array.isArray(response.data) ? response.data : []
        ) as SelfTicketData[];
        setTickets({
          self: all.filter((ticket) => ticket.creator === userId),
          others: all.filter((ticket) => ticket.creator !== userId),
          all,
        });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [userId, refreshKey]);

  useEffect(() => {
    let active = true;
    void api
      .get("/teams/")
      .then((response) => {
        // console.log(" response data Teams....",response.data)
        if (!active) return;
        const data = (
          Array.isArray(response.data) ? response.data : []
        ) as ReportingEmployees[];
        setUsers(data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [userId]);

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
    setRefreshKey((key) => key + 1);
  }, []);

  const columns = useMemo<ColumnData<SelfTicketData>[]>(
    () => [
      {
        label: "#",
        width: 10,
        render: (_row, index) => index + 1,
        numeric: true,
      },
      {
        label: "Task Number",
        width: 195,
        render: (row) => (
          <Box sx={inlineCenterGapSx}>
            <Tooltip title="View details">
              <IconButton
                aria-label={`View ${row.number}`}
                size="small"
                onClick={() => openDetails(row)}
              >
                <VisibilityOutlinedIcon fontSize="small" color="primary" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit task">
              <IconButton
                aria-label={`Edit ${row.number}`}
                size="small"
                color="secondary"
                onClick={() => openEdit(row)}
                disabled={
                  row.creator !== userId || row.current_status !== "open"
                }
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="body2">{row.number}</Typography>
          </Box>
        ),
      },
      { label: "Subject", dataKey: "task", width: 350  },
      { label: "Owner", dataKey: "creator_name" },
      { label: "Status", dataKey: "current_status" },
      { label: "Due Date", dataKey: "target_date" },
      { label: "Type", dataKey: "type" },
      { label: "Priority", dataKey: "priority" },
      { label: "Est Hrs", dataKey: "est_hours" },
    ],
    [userId, openDetails, openEdit],
  );

  const activeRows = tabValue === 0 ? tickets.self : tickets.others;

  const filteredRows = useMemo(
    () =>
      activeRows.filter(
        (ticket) => !selectedUser || ticket.creator === Number(selectedUser),
      ),
    [activeRows, selectedUser],
  );

  return (
    <Box sx={page}>
      <Box component="main" sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Typography variant="h5" sx={pageTitle}>Do List</Typography>
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
              <FormControl sx={filterField}>
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
            <Tab label={`My Do List (${tickets.self.length})`} />
            <Tab label={`My Teams Do List (${tickets.others.length})`} />
          </Tabs>
        </Box>

        <Box sx={tablePageContent}>
          {view === "card" ? (
            <TicketCardView
              data={filteredRows}
              onCardClick={openDetails}
              cardType="Self"
              getCardStatus={(ticket) =>
                isOpenDueTask(ticket) ? "warning" : undefined
              }
            />
          ) : (
            <VirtualizedTable
              columns={columns}
              rows={filteredRows}
              height="100%"
              tableMinWidth="100%"
              getRowSx={(row) =>
                isOpenDueTask(row)
                  ? priorityDueRowHighlight(row.priority)
                  : undefined
              }
              tableHead="Tasks"
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
    </Box>
  );
}
