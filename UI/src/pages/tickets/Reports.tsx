import { useEffect, useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { VirtualizedTable, type ColumnData } from "../../components/common/TableView";
import type { TicketData, UserSummary, SelfTicketData } from "../../types/dataTypes";
import * as XLSX from "xlsx";
import api from "../../api/axios";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import TicketDetailModal from "../../components/Tickets/DetailModal";
import SelfTicketDetailModel from "../../components/SelfTickets/DetailModel";
import { appPageBox, DRAWER_WIDTH, flexColumnFillSx, inlineCenterGapSx, marginBottomSectionSx, marginTopSectionSx, pageHeaderSx, reportsPageBoxSx2, reportsPageBoxSx4, reportsPageBoxSx5, reportsPageFilterDrawerPaperSx, responsiveRightActionsSx, TOGGLE_BUTTON } from "../../styles/common";

type Department = { id: number; name: string };
type Filters = { startDate: string; endDate: string; status: string; priority: string; department: string; creator: string };

function initialFilters(): Filters {
  const today = new Date();
  const previousDate = new Date(today);
  previousDate.setDate(today.getDate() - 30);
  const format = (date: Date) => date.toISOString().split("T")[0];
  return { startDate: format(previousDate), endDate: format(today), status: "", priority: "", department: "", creator: "" };
}

type FilterFieldsProps = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  departments: Department[];
  users: UserSummary[];
  reportType: "tickets" | "dolist";
};

function FilterFields({ filters, setFilters, departments, users, reportType }: FilterFieldsProps) {
  const update = (field: keyof Filters, value: string) => setFilters((current) => ({ ...current, [field]: value }));
  return (
    <Grid container spacing={1.5} sx={{ width: DRAWER_WIDTH }}>
      <Grid size={{ xs: 12, sm: 12, lg: 12 }}>
        <TextField fullWidth label="From" type="date" size="small" value={filters.startDate} onChange={(event) => update("startDate", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, lg: 12 }}>
        <TextField fullWidth label="To" type="date" size="small" value={filters.endDate} onChange={(event) => update("endDate", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, lg: 12 }}>
        <FormControl fullWidth size="small">
          <InputLabel shrink>Status</InputLabel>
          <Select value={filters.status} label="Status" displayEmpty onChange={(event) => update("status", event.target.value)}>
            <MenuItem value=""><em>All statuses</em></MenuItem>
            <MenuItem value="open">Open</MenuItem>

            <MenuItem value="completed">Completed</MenuItem>
            {reportType === "tickets" && [
              <MenuItem key="progress" value="progress">
                In Progress
              </MenuItem>,
              <MenuItem key="accepted" value="accepted">
                Accepted
              </MenuItem>,
              <MenuItem key="rejected" value="rejected">
                Rejected
              </MenuItem>,
            ]}
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      {reportType === "tickets" ? <Grid size={{ xs: 12, sm: 12, lg: 12 }}>
        <FormControl fullWidth size="small">
          <InputLabel shrink>Assigned By</InputLabel>
          <Select value={filters.creator} label="Assigned By" displayEmpty onChange={(event) => update("creator", event.target.value)}>
            <MenuItem value=""><em>All users</em></MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id ?? user.users_id} value={user.id ?? user.users_id}>
                {user.first_name || user.username}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid> : ""}
      {reportType === "dolist" ? <Grid size={{ xs: 12, sm: 12, lg: 12 }}>
        <FormControl fullWidth size="small">
          <InputLabel shrink>Created By</InputLabel>
          <Select value={filters.creator} label="Created By" displayEmpty onChange={(event) => update("creator", event.target.value)}>
            <MenuItem value=""><em>All users</em></MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id ?? user.users_id} value={user.id ?? user.users_id}>
                {user.first_name || user.username}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid> : ""}
      {reportType === "tickets" ? <Grid size={{ xs: 12, sm: 12, lg: 12 }}>
        <FormControl fullWidth size="small">
          <InputLabel shrink>Teams</InputLabel>
          <Select value={filters.department} label="Teams" displayEmpty onChange={(event) => update("department", event.target.value)}>
            <MenuItem value=""><em>All Teams</em></MenuItem>
            {departments.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid> : ""}
      <Grid size={{ xs: 12, sm: 12, lg: 12 }}>
        <FormControl fullWidth size="small">
          <InputLabel shrink>Priority</InputLabel>
          <Select value={filters.priority} label="Priority" displayEmpty onChange={(event) => update("priority", event.target.value)}>
            <MenuItem value=""><em>All priorities</em></MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default function Reports() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [selfTickets, setSelfTickets] = useState<SelfTicketData[]>([]);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [groupIds, setGroupIds] = useState<number[]>([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  // const [selectedRow, setSelectedRow] = useState<TicketData | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [selectedSelfTicket, setSelectedSelfTicket] = useState<SelfTicketData | null>(null);
  const [dialogTicketOpen, setDialogTicketOpen] = useState(false);
  const [dialogSelfOpen, setDialogSelfOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [reportType, setReportType] = useState<"tickets" | "dolist">("tickets");

  useEffect(() => {
    let active = true;
    void api
      .get("/users/currentUserGroups/")
      .then((response) => {
        if (!active) return;
        setUsers((Array.isArray(response.data.userslist) ? response.data.userslist : []) as UserSummary[]);
        setDepartments((Array.isArray(response.data.departments) ? response.data.departments : []) as Department[]);
        setGroupIds((Array.isArray(response.data.department_ids) ? response.data.department_ids : []) as number[]);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const endpoint =
      reportType === "tickets"
        ? "/tickets/?include_executive=true"
        : "/self-tickets/?include_executive=true";
    void api
      .get(endpoint)
      .then((response) => {
        console.log(response)
        if (!active) return;
        if (reportType === "tickets") {
          const source = (Array.isArray(response.data) ? response.data : []) as TicketData[];
          const mapped = source.map((ticket) => {
            const assigned = ticket.assigned_to_details;

            const creator = ticket.creator_details;
            return {
              ...ticket,
              assigned_to_name: assigned ? `${assigned.first_name ?? ""} ${assigned.last_name ?? ""}`.trim() || "Unassigned" : "Unassigned",
              creator_name: creator ? `${creator.first_name ?? ""} ${creator.last_name ?? ""}`.trim() || "Unassigned" : "Unassigned",
              display_status: ticket.current_status,
            };
          });
          setTickets(mapped);
        }
        else {
          const source = (Array.isArray(response.data)
            ? response.data
            : []) as SelfTicketData[];
          setSelfTickets(source);
        }
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [groupIds, refreshKey, reportType]);

  const openTicketDetails = useCallback((ticket: TicketData) => {
    setSelectedTicket(ticket);
    setDialogTicketOpen(true);
  }, []);

  const openSelfTicketDetails = useCallback((ticket: SelfTicketData) => {
    setSelectedSelfTicket(ticket);
    setDialogSelfOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogTicketOpen(false);
    setDialogSelfOpen(false);
    setSelectedTicket(null);
    setRefreshKey((key) => key + 1);
  }, []);

  const ticketColumns = useMemo<ColumnData<TicketData>[]>(() => [
    { label: "#", width: 10, render: (_row, index) => index + 1, number: true },
    {
      label: "Ticket Number",
      width: 180,
      render: (row) => (
        <Box sx={inlineCenterGapSx}>
          <Tooltip title="View details">
            <IconButton
              aria-label={`View ${row.number}`}
              size="small"
              onClick={() => openTicketDetails(row)}
            >
              <VisibilityRoundedIcon fontSize="small" color="primary" />
            </IconButton>
          </Tooltip>

          <Typography variant="body2">
            {row.number}
          </Typography>
        </Box>
      ),
    },
    { label: "Subject", dataKey: "task", width: 550 },
    { label: "Status", dataKey: "current_status" },
    { label: "Team", dataKey: "department_name" },
    { label: "Assigned By", dataKey: "creator_name" },
    { label: "Priority", dataKey: "priority" },
    { label: "Est Hrs", dataKey: "est_hours" },
    { label: "Act Hrs", dataKey: "act_hours" },
    // { label: "Estimated Start", dataKey: "created_at" },
    { label: "Actual Start", dataKey: "actual_start_date" },
    // { label: "Target Completion", dataKey: "target_date" },
    { label: "Actual Completion", dataKey: "actual_end_date" },
    // { label: "Assigned To", dataKey: "assigned_to_name" },
    { label: "Rating", dataKey: "rating", render: (row) => ({ 1: "Poor", 2: "Average", 3: "Good", 4: "Very Good", 5: "Excellent" }[row.rating ?? 0] ?? "—") },
    { label: "Work Efficiency", dataKey: "work_efficiency" },
    { label: "Schedule Efficiency", dataKey: "schedule_efficiency" },
  ], [openTicketDetails]);

  const dolistColumns = useMemo<ColumnData<SelfTicketData>[]>(() => [
    { label: "#", width: 10, render: (_row, index) => index + 1, number: true },
    {
      label: "Task Number",
      width: 180,
      render: (row) => (
        <Box sx={inlineCenterGapSx}>
          <Tooltip title="View details">
            <IconButton
              aria-label={`View ${row.number}`}
              size="small"
              onClick={() => openSelfTicketDetails(row)}
            >
              <VisibilityRoundedIcon fontSize="small" color="primary" />
            </IconButton>
          </Tooltip>

          <Typography variant="body2">
            {row.number}
          </Typography>
        </Box>
      ),
    },
    { label: "Subject", dataKey: "task", width: 550 },
    { label: "Status", dataKey: "current_status" },
    // { label: "Team", dataKey: "team_name" },
    { label: "Name", dataKey: "creator_name" },
    { label: "Priority", dataKey: "priority" },
    { label: "Est Hrs", dataKey: "est_hours" },
  ], [openSelfTicketDetails]);

  const filteredTickets = useMemo<TicketData[]>(() => {
    const statusGroups: Record<string, string[]> = {
      open: ["open", "modified-open"],
      accepted: ["accepted", "modified-accepted"],
      assigned: ["assigned", "modified-assigned"],
      completed: ["completed"],
      progress: ["in progress", "feedback provided"],
      rejected: ["rejected", "not-satisfied"],
      closed: ["closed", "recall requested", "recall successful"],
    };

    return tickets.filter((ticket) => {
      const created = ticket.created_at ? new Date(ticket.created_at) : null;

      return (
        (!filters.status ||
          statusGroups[filters.status]?.includes(ticket.current_status)) &&
        (!filters.priority || ticket.priority === filters.priority) &&
        (!filters.department ||
          ticket.department === Number(filters.department)) &&
        (!filters.creator ||
          ticket.creator === Number(filters.creator)) &&
        (!filters.startDate ||
          !created ||
          created >= new Date(filters.startDate)) &&
        (!filters.endDate ||
          !created ||
          created <= new Date(`${filters.endDate}T23:59:59`))
      );
    });
  }, [tickets, filters]);

  const filteredSelfTickets = useMemo<SelfTicketData[]>(() => {
    const statusGroups: Record<string, string[]> = {
      open: ["open", "modified-open"],
      closed: ["closed", "recall requested", "recall successful"],
    };

    return selfTickets.filter((ticket) => {
      console.log(ticket)
      const created = ticket.created_at ? new Date(ticket.created_at) : null;

      return (
        (!filters.status ||
          statusGroups[filters.status]?.includes(ticket.current_status)) &&
        (!filters.priority || ticket.priority === filters.priority) &&
        (!filters.creator ||
          ticket.creator === Number(filters.creator)) &&
        (!filters.startDate ||
          !created ||
          created >= new Date(filters.startDate)) &&
        (!filters.endDate ||
          !created ||
          created <= new Date(`${filters.endDate}T23:59:59`))
      );
    });
  }, [selfTickets, filters]);

  const exportToExcel = () => {

    const rows = reportType === "tickets" ?
      (filteredTickets.map((ticket) => ({
        "Ticket #": ticket.number, "Subject": ticket.task, "Priority": ticket.priority, "Status": ticket.display_status,
        "Estimated Start": ticket.created_at, "Target Date": ticket.target_date, "Actual Start": ticket.actual_start_date,
        "Actual Finish": ticket.actual_end_date, "Estimated Hours": ticket.est_hours, "Actual Hours": ticket.act_hours,
        Rating: ticket.rating ?? "", "Work Efficiency": ticket.work_efficiency ?? "", "Schedule Efficiency": ticket.schedule_efficiency ?? "",
      }))) : (filteredSelfTickets.map((ticket) => ({
        "Task #": ticket.number, "Subject": ticket.task, "Priority": ticket.priority, "Status": ticket.current_status,
        "Target Date": ticket.target_date, "Estimated Hours": ticket.est_hours,
      })));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [{ wch: 16 }, { wch: 34 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 18 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets Report");
    XLSX.writeFile(workbook, `Ticket_Export_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <Box sx={appPageBox}>
      <Box component="main" sx={flexColumnFillSx}>
        <Box sx={pageHeaderSx}>
          <Box>
            <Typography variant="h5">Executive Overview</Typography>
            <Typography variant="body2" color="text.secondary">
              Filter performance data and export a focused Tickets / Do-list report.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={responsiveRightActionsSx}>
            <ToggleButtonGroup
              exclusive
              value={reportType}
              size="small"
              onChange={(_, next: "tickets" | "dolist" | null) =>
                next && setReportType(next)
              }
              aria-label="Task view"
              sx={TOGGLE_BUTTON}
            >
              <Tooltip title="Tickets" arrow>
                <ToggleButton value="tickets" aria-label="Tickets">
                  Tickets
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Do List" arrow>
                <ToggleButton value="dolist" aria-label="Do List">
                  Do List
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>
            <Button startIcon={<FilterAltRoundedIcon />} variant="outlined" onClick={() => setFilterDrawerOpen(true)}> Filters </Button>
            {/*sx={reportsPageButtonSx1}*/}
            <Button startIcon={<DownloadRoundedIcon />} variant="contained" onClick={exportToExcel}> Export Excel </Button>
          </Stack>
        </Box>

        <Box sx={reportsPageBoxSx4}>
          {reportType === "tickets" ? (
            <VirtualizedTable columns={ticketColumns} rows={filteredTickets} height="100%" tableHead={`Tickets`} />
          ) : (
            <VirtualizedTable columns={dolistColumns} rows={filteredSelfTickets} height="100%" tableHead={`Do-List`} />
          )}
        </Box>
      </Box>

      <Drawer anchor="right" open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)} PaperProps={{ sx: reportsPageFilterDrawerPaperSx }}>
        <Box sx={reportsPageBoxSx5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={marginBottomSectionSx}>
            <Typography variant="h6">Report filters</Typography>
            <IconButton aria-label="Close filters" onClick={() => setFilterDrawerOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
          <FilterFields filters={filters} setFilters={setFilters} departments={departments} users={users} reportType={reportType} />
          <Button fullWidth variant="contained" onClick={() => setFilterDrawerOpen(false)} sx={marginTopSectionSx}>
            {reportType === "tickets" ? `Show ${filteredTickets.length} Tickets` : `Show ${filteredSelfTickets.length} Tasks`}
          </Button>
        </Box>
      </Drawer>
      {selectedTicket && <TicketDetailModal open={dialogTicketOpen} onClose={closeDialog} data={selectedTicket} />}
      {selectedSelfTicket && <SelfTicketDetailModel open={dialogSelfOpen} onClose={closeDialog} data={selectedSelfTicket} />}
    </Box>
  );
}
