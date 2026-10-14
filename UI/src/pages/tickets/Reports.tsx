import DateRange from "../../components/common/DateRange";
import DateRangeSummary from "../../components/common/DateRangeSummary";
import { useCallback, useMemo, useState } from "react";
import FilterPopover, { ActiveFilterChips, type ActiveFilter } from "../../components/common/FilterPopover";
import {
  Box,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  VirtualizedTable,
  type ColumnData,
} from "../../components/common/TableView";
import ArticleIcon from "@mui/icons-material/Article";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import type {
  TicketData,
  UserSummary,
  SelfTicketData,
} from "../../types/dataTypes";
import { loadXlsx, useExportStatus } from "../../utils/useExportStatus";
import { asArray, useApiQuery } from "../../api/useApiQuery";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import TicketDetailModal from "../../components/tickets/DetailModal";
import SelfTicketDetailModel from "../../components/selfTickets/DetailModel";
import ReportHeaderActions from "../../components/common/ReportHeaderActions";
import { inlineCenterGapSx } from "../../styles/common";
import { dateFieldSx } from "../../styles/filters";
import {
  pageHeaderActions,
  pageHeaderContent,
  pageHeader,
  pageHeaderTitleGroup,
  page,
  pageContent,
  pageSubtitle,
  pageTitle,
  tablePageContent,
  tabs,
  tabsContainer,
} from "../../styles/layout";

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
      <Grid size={12}>
        <DateRangeSummary start={filters.startDate} end={filters.endDate} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="From"
          type="date"
          value={filters.startDate}
          onChange={(event) => update("startDate", event.target.value)}
          sx={dateFieldSx}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { max: filters.endDate || undefined },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="To"
          type="date"
          value={filters.endDate}
          onChange={(event) => update("endDate", event.target.value)}
          sx={dateFieldSx}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { min: filters.startDate || undefined },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, lg: 12 }}>
        <FormControl fullWidth>
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
          <FormControl fullWidth>
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
          <FormControl fullWidth>
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
          <FormControl fullWidth>
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
        <FormControl fullWidth>
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
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  // The Filters button; the filter panel drops down from it.
  const [filterButton, setFilterButton] = useState<HTMLButtonElement | null>(null);
  // const [selectedRow, setSelectedRow] = useState<TicketData | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [selectedSelfTicket, setSelectedSelfTicket] =
    useState<SelfTicketData | null>(null);
  const [dialogTicketOpen, setDialogTicketOpen] = useState(false);
  const [dialogSelfOpen, setDialogSelfOpen] = useState(false);
  const [reportType, setReportType] = useState<"tickets" | "dolist">("tickets");
  const { exporting, runExport } = useExportStatus();

  // Filter reference data (shared cache entry with Internal Tickets).
  const groupsQuery = useApiQuery<{
    userslist?: UserSummary[];
    departments?: Department[];
  }>("/users/currentUserGroups/");
  const users = useMemo(
    () => asArray<UserSummary>(groupsQuery.data?.userslist),
    [groupsQuery.data],
  );
  const departments = useMemo(
    () => asArray<Department>(groupsQuery.data?.departments),
    [groupsQuery.data],
  );

  // Each report is cached on its own: switching tabs or coming back shows
  // the last rows immediately. Filters are applied client-side, so changing
  // them never refetches.
  const ticketsQuery = useApiQuery<TicketData[]>(
    "/tickets/",
    { include_executive: true, is_internal: false },
    { enabled: reportType === "tickets" },
  );
  const selfTicketsQuery = useApiQuery<SelfTicketData[]>(
    "/self-tickets/",
    { include_executive: true },
    { enabled: reportType === "dolist" },
  );
  const tickets = useMemo(
    () =>
      asArray<TicketData>(ticketsQuery.data).map((ticket) => ({
        ...ticket,
        assigned_to_name: ticket.assigned_to_name || "Unassigned",
        creator_name: ticket.creator_name || "Unassigned",
        display_status: ticket.current_status,
      })),
    [ticketsQuery.data],
  );
  const selfTickets = useMemo(
    () => asArray<SelfTicketData>(selfTicketsQuery.data),
    [selfTicketsQuery.data],
  );
  const loading =
    reportType === "tickets" ? ticketsQuery.isPending : selfTicketsQuery.isPending;

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
         width: { xs: 160, sm: 180 },
        render: (row) => (
          <Box sx={inlineCenterGapSx}>
            <Tooltip title="View details">
              <IconButton
                aria-label={`View ${row.number}`}
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
      open: ["open", "revised", "revised-open"],
      accepted: ["accepted", "revised-accepted"],
      assigned: ["assigned", "revised-assigned"],
      completed: ["completed"],
      progress: ["in progress", "feedback provided", "date revision", "pending"],
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
      open: ["open", "revised-open", "date revision"],
      closed: ["closed", "recall requested", "recall successful"],
    };

    return selfTickets.filter((ticket) => {
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

  const exportToExcel = async () => {
    const XLSX = await loadXlsx();
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
    const fileName = `Ticket_Export_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    return fileName;
  };

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const defaults = initialFilters();
    const userName = (id: string) => {
      const user = users.find((item) => String(item.id ?? item.users_id) === id);
      return user ? user.first_name || user.username : id;
    };
    const list: ActiveFilter[] = [
      {
        key: "dates",
        label: <DateRange start={filters.startDate} end={filters.endDate} />,
        onRemove:
          filters.startDate !== defaults.startDate || filters.endDate !== defaults.endDate
            ? () => setFilters((current) => ({ ...current, startDate: defaults.startDate, endDate: defaults.endDate }))
            : undefined,
      },
    ];
    if (filters.status) list.push({ key: "status", label: `Status: ${filters.status}`, onRemove: () => setFilters((c) => ({ ...c, status: "" })) });
    if (filters.priority) list.push({ key: "priority", label: `Priority: ${filters.priority}`, onRemove: () => setFilters((c) => ({ ...c, priority: "" })) });
    if (filters.department && reportType === "tickets") {
      const team = departments.find((item) => String(item.id) === String(filters.department));
      list.push({ key: "team", label: `Team: ${team?.name ?? filters.department}`, onRemove: () => setFilters((c) => ({ ...c, department: "" })) });
    }
    if (filters.creator) {
      list.push({
        key: "creator",
        label: `${reportType === "tickets" ? "Assigned by" : "Created by"}: ${userName(String(filters.creator))}`,
        onRemove: () => setFilters((c) => ({ ...c, creator: "" })),
      });
    }
    return list;
  }, [departments, filters, reportType, users]);

  const renderReportControls = () => (
    <ReportHeaderActions
      onExport={() => runExport(exportToExcel)}
      exportDisabled={loading}
      exporting={exporting}
      onFilter={() => setFilterOpen(true)}
      filterButtonRef={setFilterButton}
    />
  );

  return (
    <Box sx={page}>
      <Box sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Box sx={pageHeaderTitleGroup}>
              <Typography variant="h5" component="h1" sx={pageTitle}>Executive Overview</Typography>
            </Box>
            <Typography variant="body2" sx={pageSubtitle}>
              Filter performance data and export a focused Tickets / Do-list
              report.
            </Typography>
          </Box>
          <Box sx={pageHeaderActions}>{renderReportControls()}</Box>
        </Box>

        <Box sx={tabsContainer}>
          <Tabs
            value={reportType}
            onChange={(_, value: "tickets" | "dolist") => setReportType(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={tabs}
          >
            <Tab
              value="tickets"
              icon={reportType === "tickets" ? <ArticleIcon /> : <ArticleOutlinedIcon />}
              iconPosition="start"
              label={`Tickets (${filteredTickets.length})`}
            />
            <Tab
              value="dolist"
              icon={reportType === "dolist" ? <AssignmentTurnedInIcon /> : <AssignmentTurnedInOutlinedIcon />}
              iconPosition="start"
              label={`Do List (${filteredSelfTickets.length})`}
            />
          </Tabs>
        </Box>

        <ActiveFilterChips
          filters={activeFilters}
          onClearAll={() => setFilters(initialFilters())}
        />

        <Box sx={tablePageContent}>
          {reportType === "tickets" ? (
            <VirtualizedTable
              columns={ticketColumns}
              rows={filteredTickets}
              height="100%"
              tableMinWidth={1600}
              tableHead={`Tickets`}
              loading={loading}
              emptyTitle="No tickets match these filters"
              emptyDescription="Widen the date range or remove a filter."
            />
          ) : (
            <VirtualizedTable
              columns={dolistColumns}
              rows={filteredSelfTickets}
              height="100%"
              tableMinWidth={900}
              tableHead={`Do-List`}
              loading={loading}
              emptyTitle="No tasks match these filters"
              emptyDescription="Widen the date range or remove a filter."
            />
          )}
        </Box>
      </Box>

      <FilterPopover
        open={filterOpen}
        anchorEl={filterButton}
        onClose={() => setFilterOpen(false)}
        title="Report filters"
        onReset={() => setFilters(initialFilters())}
        applyLabel={
          reportType === "tickets"
            ? `Show ${filteredTickets.length} tickets`
            : `Show ${filteredSelfTickets.length} tasks`
        }
      >
        <FilterFields
          filters={filters}
          setFilters={setFilters}
          departments={departments}
          users={users}
          reportType={reportType}
        />
      </FilterPopover>
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
