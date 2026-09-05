import { useEffect, useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
  VirtualizedTable,
  type ColumnData,
} from "../../components/common/TableView";
import type {
  TicketData,
  UserSummary,
  SelfTicketData,
} from "../../types/dataTypes";
import * as XLSX from "xlsx";
import api from "../../api/axios";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import TicketDetailModal from "../../components/tickets/DetailModal";
import SelfTicketDetailModel from "../../components/selfTickets/DetailModel";
import {
  buttonLabelCompact,
  buttonLabelFull,
  dialogContentTop,
  inlineCenterGapSx,
  marginBottomSectionSx,
  pageHeaderControlsDesktop,
  pageHeaderControlsMobile,
  pageHeaderContent,
  pageHeaderFilterPanel,
  pageHeaderFilterToggle,
  pageHeader,
  pageHeaderTitleGroup,
  pageHeaderTopRow,
  page,
  pageContent,
  pageSubtitle,
  pageTitle,
  tablePageContent,
  toggleButton,
} from "../../styles/common";

type Department = { id: number; name: string };
type Filters = {
  startDate: string;
  endDate: string;
  status: string;
  priority: string;
  department: string;
  creator: string;
};

function initialFilters(): Filters {
  const today = new Date();
  const previousDate = new Date(today);
  previousDate.setDate(today.getDate() - 30);
  const format = (date: Date) => date.toISOString().split("T")[0];
  return {
    startDate: format(previousDate),
    endDate: format(today),
    status: "",
    priority: "",
    department: "",
    creator: "",
  };
}

type FilterFieldsProps = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  departments: Department[];
  users: UserSummary[];
  reportType: "tickets" | "dolist";
};

function FilterFields({
  filters,
  setFilters,
  departments,
  users,
  reportType,
}: FilterFieldsProps) {
  const update = (field: keyof Filters, value: string) =>
    setFilters((current) => {
      if (field === "startDate" && current.endDate && value > current.endDate) {
        return { ...current, startDate: value, endDate: value };
      }

      if (field === "endDate" && current.startDate && value < current.startDate) {
        return { ...current, startDate: value, endDate: value };
      }

      return { ...current, [field]: value };
    });

  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, sm: 12, lg: 12 }}>
        <TextField
          fullWidth
          label="From"
          type="date"
          size="small"
          value={filters.startDate}
          onChange={(event) => update("startDate", event.target.value)}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { max: filters.endDate || undefined },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, lg: 12 }}>
        <TextField
          fullWidth
          label="To"
          type="date"
          size="small"
          value={filters.endDate}
          onChange={(event) => update("endDate", event.target.value)}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { min: filters.startDate || undefined },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, lg: 12 }}>
        <FormControl fullWidth size="small">
          <InputLabel shrink>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            displayEmpty
            onChange={(event) => update("status", event.target.value)}
          >
            <MenuItem value="">
              <em>All statuses</em>
            </MenuItem>
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
      {reportType === "tickets" ? (
        <Grid size={{ xs: 12, sm: 12, lg: 12 }}>
          <FormControl fullWidth size="small">
            <InputLabel shrink>Assigned By</InputLabel>
            <Select
              value={filters.creator}
              label="Assigned By"
              displayEmpty
              onChange={(event) => update("creator", event.target.value)}
            >
              <MenuItem value="">
                <em>All users</em>
              </MenuItem>
              {users.map((user) => (
                <MenuItem
                  key={user.id ?? user.users_id}
                  value={user.id ?? user.users_id}
                >
                  {user.first_name || user.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      ) : (
        ""
      )}
      {reportType === "dolist" ? (
        <Grid size={{ xs: 12, sm: 12, lg: 12 }}>
          <FormControl fullWidth size="small">
            <InputLabel shrink>Created By</InputLabel>
            <Select
              value={filters.creator}
              label="Created By"
              displayEmpty
              onChange={(event) => update("creator", event.target.value)}
            >
              <MenuItem value="">
                <em>All users</em>
              </MenuItem>
              {users.map((user) => (
                <MenuItem
                  key={user.id ?? user.users_id}
                  value={user.id ?? user.users_id}
                >
                  {user.first_name || user.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      ) : (
        ""
      )}
      {reportType === "tickets" ? (
        <Grid size={{ xs: 12, sm: 12, lg: 12 }}>
          <FormControl fullWidth size="small">
            <InputLabel shrink>Teams</InputLabel>
            <Select
              value={filters.department}
              label="Teams"
              displayEmpty
              onChange={(event) => update("department", event.target.value)}
            >
              <MenuItem value="">
                <em>All Teams</em>
              </MenuItem>
              {departments.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      ) : (
        ""
      )}
      <Grid size={{ xs: 12, sm: 12, lg: 12 }}>
        <FormControl fullWidth size="small">
          <InputLabel shrink>Priority</InputLabel>
          <Select
            value={filters.priority}
            label="Priority"
            displayEmpty
            onChange={(event) => update("priority", event.target.value)}
          >
            <MenuItem value="">
              <em>All priorities</em>
            </MenuItem>
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
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  // const [selectedRow, setSelectedRow] = useState<TicketData | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [selectedSelfTicket, setSelectedSelfTicket] =
    useState<SelfTicketData | null>(null);
  const [dialogTicketOpen, setDialogTicketOpen] = useState(false);
  const [dialogSelfOpen, setDialogSelfOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [reportType, setReportType] = useState<"tickets" | "dolist">("tickets");
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);

  useEffect(() => {
    let active = true;
    void api
      .get("/users/currentUserGroups/")
      .then((response) => {
        if (!active) return;
        setUsers(
          (Array.isArray(response.data.userslist)
            ? response.data.userslist
            : []) as UserSummary[],
        );
        setDepartments(
          (Array.isArray(response.data.departments)
            ? response.data.departments
            : []) as Department[],
        );
        setGroupIds(
          (Array.isArray(response.data.department_ids)
            ? response.data.department_ids
            : []) as number[],
        );
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
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
        if (!active) return;
        if (reportType === "tickets") {
          const source = (
            Array.isArray(response.data) ? response.data : []
          ) as TicketData[];
          const mapped = source.map((ticket) => ({
            ...ticket,
            assigned_to_name: ticket.assigned_to_name || "Unassigned",
            creator_name: ticket.creator_name || "Unassigned",
            display_status: ticket.current_status,
          }));
          setTickets(mapped);
        } else {
          const source = (
            Array.isArray(response.data) ? response.data : []
          ) as SelfTicketData[];
          setSelfTickets(source);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
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

  const ticketColumns = useMemo<ColumnData<TicketData>[]>(
    () => [
      {
        label: "#",
        width: { xs: 45, sm: 10 },
        render: (_row, index) => index + 1,
        numeric: true,
      },
      {
        label: "Ticket Number",
        width: { xs: 160, sm: 180 },
        render: (row) => (
          <Box sx={inlineCenterGapSx}>
            <Tooltip title="View details">
              <IconButton
                aria-label={`View ${row.number}`}
                size="small"
                onClick={() => openTicketDetails(row)}
              >
                <VisibilityOutlinedIcon fontSize="small" color="primary" />
              </IconButton>
            </Tooltip>

            <Typography variant="body2">{row.number}</Typography>
          </Box>
        ),
      },
      { label: "Subject", dataKey: "task", width: "auto" },
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
      {
        label: "Rating",
        dataKey: "rating",
        render: (row) =>
          ({
            1: "Poor",
            2: "Average",
            3: "Good",
            4: "Very Good",
            5: "Excellent",
          })[row.rating ?? 0] ?? "—",
      },
      { label: "Work Efficiency", dataKey: "work_efficiency" },
      { label: "Schedule Efficiency", dataKey: "schedule_efficiency" },
    ],
    [openTicketDetails],
  );

  const dolistColumns = useMemo<ColumnData<SelfTicketData>[]>(
    () => [
      {
        label: "#",
        width: 10,
        render: (_row, index) => index + 1,
        numeric: true,
      },
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
                <VisibilityOutlinedIcon fontSize="small" color="primary" />
              </IconButton>
            </Tooltip>

            <Typography variant="body2">{row.number}</Typography>
          </Box>
        ),
      },
      { label: "Subject", dataKey: "task", width: "auto" },
      { label: "Status", dataKey: "current_status" },
      // { label: "Team", dataKey: "team_name" },
      { label: "Name", dataKey: "creator_name" },
      { label: "Priority", dataKey: "priority" },
      { label: "Est Hrs", dataKey: "est_hours" },
    ],
    [openSelfTicketDetails],
  );

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
        (!filters.creator || ticket.creator === Number(filters.creator)) &&
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
      console.log(ticket);
      const created = ticket.created_at ? new Date(ticket.created_at) : null;

      return (
        (!filters.status ||
          statusGroups[filters.status]?.includes(ticket.current_status)) &&
        (!filters.priority || ticket.priority === filters.priority) &&
        (!filters.creator || ticket.creator === Number(filters.creator)) &&
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
    const rows =
      reportType === "tickets"
        ? filteredTickets.map((ticket) => ({
            "Ticket #": ticket.number,
            Subject: ticket.task,
            Priority: ticket.priority,
            Status: ticket.display_status,
            "Estimated Start": ticket.created_at,
            "Target Date": ticket.target_date,
            "Actual Start": ticket.actual_start_date,
            "Actual Finish": ticket.actual_end_date,
            "Estimated Hours": ticket.est_hours,
            "Actual Hours": ticket.act_hours,
            Rating: ticket.rating ?? "",
            "Work Efficiency": ticket.work_efficiency ?? "",
            "Schedule Efficiency": ticket.schedule_efficiency ?? "",
          }))
        : filteredSelfTickets.map((ticket) => ({
            "Task #": ticket.number,
            Subject: ticket.task,
            Priority: ticket.priority,
            Status: ticket.current_status,
            "Target Date": ticket.target_date,
            "Estimated Hours": ticket.est_hours,
          }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 16 },
      { wch: 34 },
      { wch: 14 },
      { wch: 16 },
      { wch: 18 },
      { wch: 18 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets Report");
    XLSX.writeFile(
      workbook,
      `Ticket_Export_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const renderReportControls = () => (
    <>
      <ToggleButtonGroup
        exclusive
        value={reportType}
        onChange={(_, next: "tickets" | "dolist" | null) =>
          next && setReportType(next)
        }
        aria-label="Task view"
        sx={toggleButton}
      >
        <ToggleButton value="tickets" aria-label="Tickets">
          <Tooltip title="Tickets" arrow>
            <Box component="span">Tickets</Box>
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="dolist" aria-label="Do List">
          <Tooltip title="Do List" arrow>
            <Box component="span">Do List</Box>
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
      <Button
        startIcon={<FilterAltOutlinedIcon />}
        variant="outlined"
        onClick={() => setFilterDialogOpen(true)}
      >
        Filters
      </Button>
      <Button
        startIcon={<DownloadOutlinedIcon />}
        variant="contained"
        onClick={exportToExcel}
      >
        <Box component="span" sx={buttonLabelFull}>Export Excel</Box>
        <Box component="span" sx={buttonLabelCompact}>Export</Box>
      </Button>
    </>
  );

  return (
    <Box sx={page}>
      <Box component="main" sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Box sx={pageHeaderTopRow}>
              <Box sx={pageHeaderTitleGroup}>
                <Typography variant="h5" sx={pageTitle}>Executive Overview</Typography>
              </Box>
              <Tooltip title={mobileControlsOpen ? "Hide controls" : "Show controls"}>
                <IconButton
                  aria-label={mobileControlsOpen ? "Hide report controls" : "Show report controls"}
                  onClick={() => setMobileControlsOpen((open) => !open)}
                  sx={pageHeaderFilterToggle}
                >
                  <FilterAltOutlinedIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body2" sx={pageSubtitle}>
              Filter performance data and export a focused Tickets / Do-list
              report.
            </Typography>
            <Box sx={pageHeaderFilterPanel}>
              <Collapse in={mobileControlsOpen} timeout="auto" unmountOnExit>
                <Stack spacing={1} sx={pageHeaderControlsMobile}>
                  {renderReportControls()}
                </Stack>
              </Collapse>
            </Box>
          </Box>
          <Stack
            spacing={1}
            direction={{ xs: "row-reverse", sm: "row" }}
            sx={pageHeaderControlsDesktop}
          >
            {renderReportControls()}
          </Stack>
        </Box>

        <Box sx={tablePageContent}>
          {reportType === "tickets" ? (
            <VirtualizedTable
              columns={ticketColumns}
              rows={filteredTickets}
              height="100%"
              tableMinWidth={1600}
              tableHead={`Tickets`}
            />
          ) : (
            <VirtualizedTable
              columns={dolistColumns}
              rows={filteredSelfTickets}
              height="100%"
              tableMinWidth={900}
              tableHead={`Do-List`}
            />
          )}
        </Box>
      </Box>

      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            position: "fixed",
            top: { xs: "auto", sm: 150 },
            right: { xs: "auto", sm: 50 },
            m: 0,
          },
        }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">Report filters</Typography>
            <IconButton
              aria-label="Close filters"
              onClick={() => setFilterDialogOpen(false)}
            >
              <CloseOutlinedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={dialogContentTop}>
            <FilterFields
              filters={filters}
              setFilters={setFilters}
              departments={departments}
              users={users}
              reportType={reportType}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={marginBottomSectionSx}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setFilterDialogOpen(false)}
          >
            {reportType === "tickets"
              ? `Show ${filteredTickets.length} Tickets`
              : `Show ${filteredSelfTickets.length} Tasks`}
          </Button>
        </DialogActions>
      </Dialog>
      {selectedTicket && (
        <TicketDetailModal
          open={dialogTicketOpen}
          onClose={closeDialog}
          data={selectedTicket}
        />
      )}
      {selectedSelfTicket && (
        <SelfTicketDetailModel
          open={dialogSelfOpen}
          onClose={closeDialog}
          data={selectedSelfTicket}
        />
      )}
    </Box>
  );
}
