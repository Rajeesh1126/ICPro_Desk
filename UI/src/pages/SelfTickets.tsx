import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import ViewKanbanRoundedIcon from "@mui/icons-material/ViewKanbanRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import Header from "../components/AppBar/header";
import { VirtualizedTable, type ColumnData } from "../components/common/TableView";
import CreateSelfTicketModel from "../components/SelfTickets/CreateModel";
import TicketCardView from "../components/common/CardView";
import type {
  SelfTicketCollections,
  SelfTicketData,
  ReportingEmployees,
} from "../types/TicketData";
import api from "../api/axios";
import SelfTicketDetailModel from "../components/SelfTickets/DetailModel";
import {
  flexColumnFillSx,
  inlineCenterGapSx,
  modalActionButtonSx,
  pageHeaderSx,
  selfTicketsPageBoxSx2,
  selfTicketsPageBoxSx4,
  selfTicketsPageFormControlSx1,
  selfTicketsPagePaperSx1,
  selfTicketsPageStackSx1,
  TOGGLE_BUTTON
} from "../styles/common";

const EMPTY_COLLECTIONS: SelfTicketCollections = {
  all: [],
  self: [],
  others: [],
};

function storedCurrentUserId(): number | null {
  try {
    const user: unknown = JSON.parse(
      localStorage.getItem("currentUser") ?? "null",
    );
    return typeof user === "object" &&
      user !== null &&
      "id" in user &&
      typeof user.id === "number"
      ? user.id
      : null;
  } catch {
    return null;
  }
}

export default function SelfTickets() {
  const currentUserId = useMemo(() => storedCurrentUserId(), []);
  const [selectedUser, setSelectedUser] = useState("");
  const [view, setView] = useState<"table" | "card">("card");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedRow, setSelectedRow] = useState<SelfTicketData | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<ReportingEmployees[]>([]);
  const [tickets, setTickets] =
    useState<SelfTicketCollections>(EMPTY_COLLECTIONS);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    void api
      .get("/self-tickets/?do_List=true")
      .then((response) => {
        console.log(response)
        if (!active) return;
        const all = (
          Array.isArray(response.data) ? response.data : []
        ) as SelfTicketData[];
        setTickets({
          self: all.filter((ticket) => ticket.creator === currentUserId),
          others: all.filter((ticket) => ticket.reporting_to === currentUserId),
          all,
        });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [currentUserId, refreshKey]);

  useEffect(() => {
    let active = true;
    void api
      .get("/users/GetTeamMembers/")
      .then((response) => {
        if (!active) return;
        const data = (
          Array.isArray(response.data.reporting_employees)
            ? response.data.reporting_employees
            : []
        ) as ReportingEmployees[];
        setUsers(data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [currentUserId]);

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

  const columns = useMemo<ColumnData<SelfTicketData>[]>(() => [
    { label: "#", width: 10, render: (_row, index) => index + 1, number: true },
    {
      label: "Task Number",
      width: 145,
      render: (row) => (
        <Box sx={inlineCenterGapSx}>
          <Tooltip title="View details">
            <IconButton
              aria-label={`View ${row.number}`}
              size="small"
              onClick={() => openDetails(row)}
            >
              <VisibilityRoundedIcon fontSize="small" color="primary" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit task">
            <IconButton
              aria-label={`Edit ${row.number}`}
              size="small"
              onClick={() => openEdit(row)}
              disabled={
                row.creator !== currentUserId || row.current_status !== "open"
              }
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography variant="body2">{row.number}</Typography>
        </Box>
      ),
    },
    { label: "Subject", dataKey: "task", width: 600 },
    { label: "Status", dataKey: "current_status" },
    { label: "Type", dataKey: "type" },
    { label: "Priority", dataKey: "priority" },
    { label: "Est Hrs", dataKey: "est_hours" },
  ],
    [currentUserId, openEdit],
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
    <Box sx={selfTicketsPageBoxSx2}>
      <Header />
      <Box component="main" sx={flexColumnFillSx}>
        <Box sx={pageHeaderSx}>
          <Box>
            <Typography variant="h5">Do List</Typography>
            <Typography variant="body2" color="text.secondary">
              Organize personal actions, reminders, and follow-ups.
            </Typography>
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={selfTicketsPageStackSx1}
          >
            {tabValue !== 0 && (
              <FormControl size="small" sx={selfTicketsPageFormControlSx1}>
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
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              {tabValue === 0 && (
                <Button
                  startIcon={<AddRoundedIcon />}
                  variant="contained"
                  onClick={openCreate}
                  sx={modalActionButtonSx}
                >
                  New Task
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
          </Stack>
        </Box>

        <Paper square elevation={0} sx={selfTicketsPagePaperSx1}>
          <Tabs
            value={tabValue}
            onChange={(_, value: number) => {
              setTabValue(value);
              setSelectedUser("");
            }}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label={`My Do List (${tickets.self.length})`} />
            <Tab label={`My Teams Do List (${tickets.others.length})`} />
          </Tabs>
        </Paper>

        <Box sx={selfTicketsPageBoxSx4}>
          {view === "card" ? (
            <TicketCardView
              data={filteredRows}
              onCardClick={openDetails}
              cardType="Self"
            />
          ) : (
            <VirtualizedTable
              columns={columns}
              rows={filteredRows}
              height="100%"
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
