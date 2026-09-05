import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassTopOutlinedIcon from "@mui/icons-material/HourglassTopOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
  VirtualizedTable,
  type ColumnData,
} from "../../components/common/TableView";
import api from "../../api/axios";
import type { ReportingEmployees } from "../../types/dataTypes";
import {
  pageHeaderActions,
  pageHeaderContent,
  pageHeader,
  page,
  pageContent,
  pageSubtitle,
  pageTitle,
  tabs,
  tabsContainer,
  tablePageContent,
} from "../../styles/common";

type TimesheetLogWeekColumn = {
  key: string;
  weeknumber: number;
  weekyear: number;
  label: string;
  week_start: string;
  week_end: string;
};

type TimesheetLogWeek = {
  weeknumber: number;
  weekyear: number;
  week_start: string;
  week_end: string;
  timesheet_status: string;
  submission_status: boolean;
  submission_timing: "OnTime" | "Delayed" | "Not Submitted";
  submitted_at: string | null;
  total_hours: number;
  comments: string | null;
};

type ReviewerLogApprover = {
  approver_id: number | null;
  approver_name: string;
  accepted_count: number;
  rejected_count: number;
  pending_count: number;
  status: "Accepted" | "Rejected" | "Mixed" | "Pending";
};

type ReviewerLogWeek = {
  weeknumber: number;
  weekyear: number;
  week_start: string;
  week_end: string;
  review_status: "N/A" | "No Action" | "Partially Approved" | "OnTime" | "Rejected";
  review_summary: string;
  submitted: boolean;
  total_approvers: number;
  completed_approvers: number;
  pending_approvers: number;
  approvers: ReviewerLogApprover[];
};

type TimesheetLogRow = {
  [key: string]: unknown;
  employee_id: number;
  employee_name: string;
  reporting_to: string;
  weeks: Record<string, TimesheetLogWeek>;
};

type TimesheetLogsResponse = {
  week_columns: TimesheetLogWeekColumn[];
  results: TimesheetLogRow[];
};

type ReviewerLogRow = {
  [key: string]: unknown;
  employee_id: number;
  employee_name: string;
  reporting_to: string;
  weeks: Record<string, ReviewerLogWeek>;
};

type ReviewerLogsResponse = {
  week_columns: TimesheetLogWeekColumn[];
  results: ReviewerLogRow[];
};

const currentYear = new Date().getFullYear();
const weekOptions = Array.from({ length: 52 }, (_, index) => index + 1);

const createWeekRange = (fromWeek: string, toWeek: string) => {
  if (!fromWeek || !toWeek) {
    return "";
  }

  const from = Number(fromWeek);
  const to = Number(toWeek);

  if (!Number.isInteger(from) || !Number.isInteger(to)) {
    return "";
  }

  const start = Math.min(from, to);
  const end = Math.max(from, to);

  return Array.from(
    { length: end - start + 1 },
    (_item, index) => end - index,
  ).join(",");
};

const timingColor = {
  OnTime: "success.main",
  Delayed: "warning.main",
  "Not Submitted": "error.main",
} satisfies Record<TimesheetLogWeek["submission_timing"], string>;

const reviewColor = {
  OnTime: "success.main",
  Rejected: "error.main",
  "Partially Approved": "warning.main",
  "No Action": "info.main",
  "N/A": "text.disabled",
} satisfies Record<ReviewerLogWeek["review_status"], string>;

function TimingIcon({ week }: { week?: TimesheetLogWeek }) {
  const timing = week?.submission_timing ?? "Not Submitted";
  const Icon =
    timing === "OnTime"
      ? CheckCircleOutlinedIcon
      : timing === "Delayed"
      ? HourglassTopOutlinedIcon
      : CancelOutlinedIcon;

  return (
    <Tooltip
      title={`${timing}${week ? ` | ${week.total_hours.toFixed(2)} hrs` : ""}`}
    >
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
        }}
      >
        <Icon sx={{ color: timingColor[timing], fontSize: 22 }} />
      </Box>
    </Tooltip>
  );
}

function ReviewerIcon({
  week,
  onOpen,
}: {
  week?: ReviewerLogWeek;
  onOpen: () => void;
}) {
  const status = week?.review_status ?? "N/A";
  const Icon =
    status === "OnTime"
      ? CheckCircleOutlinedIcon
      : status === "Rejected"
      ? CancelOutlinedIcon
      : status === "Partially Approved"
      ? HourglassTopOutlinedIcon
      : status === "No Action"
      ? PendingActionsOutlinedIcon
      : HelpOutlineOutlinedIcon;
  const canOpen = Boolean(week?.submitted && week.approvers.length > 0);

  return (
    <Tooltip title={week ? `${status} | ${week.completed_approvers}/${week.total_approvers}` : status}>
      <Box
        component="button"
        type="button"
        onClick={canOpen ? onOpen : undefined}
        sx={{
          width: 32,
          height: 32,
          p: 0,
          border: 0,
          bgcolor: "transparent",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: canOpen ? "pointer" : "default",
        }}
      >
        <Icon sx={{ color: reviewColor[status], fontSize: 22 }} />
      </Box>
    </Tooltip>
  );
}

export default function TimesheetLogs() {
  const [tabValue, setTabValue] = useState(0);
  const [employees, setEmployees] = useState<ReportingEmployees[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [fromWeek, setFromWeek] = useState("");
  const [toWeek, setToWeek] = useState("");
  const [logs, setLogs] = useState<TimesheetLogsResponse>({
    week_columns: [],
    results: [],
  });
  const [reviewerLogs, setReviewerLogs] = useState<ReviewerLogsResponse>({
    week_columns: [],
    results: [],
  });
  const [selectedReviewerCell, setSelectedReviewerCell] = useState<{
    employeeName: string;
    week: ReviewerLogWeek;
  } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = [
    selectedEmployee,
    selectedYear,
    fromWeek,
    toWeek,
  ].filter(Boolean).length;

  useEffect(() => {
    let active = true;

    void api
      .get("/teams/")
      .then((response) => {
        if (!active) return;
        setEmployees(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const requestParams = useMemo(() => {
    const params: Record<string, string> = {};

    if (selectedEmployee) {
      params.employee_id = selectedEmployee;
    }

    if (selectedYear) {
      params.year = selectedYear;
    }

    const weeks = createWeekRange(fromWeek, toWeek);
    if (weeks) {
      params.weeks = weeks;
      params.year = selectedYear || String(currentYear);
    }

    return params;
  }, [fromWeek, selectedEmployee, selectedYear, toWeek]);

  const fetchSubmittedLogs = useCallback(() => {
    void api
      .get<TimesheetLogsResponse>("/timesheet-statuses/logs/", { params: requestParams })
      .then((response) => {
        setLogs({
          week_columns: Array.isArray(response.data?.week_columns)
            ? response.data.week_columns
            : [],
          results: Array.isArray(response.data?.results)
            ? response.data.results
            : [],
        });
      })
      .catch(() => {
        setLogs({ week_columns: [], results: [] });
      });
  }, [requestParams]);

  const fetchReviewerLogs = useCallback(() => {
    void api
      .get<ReviewerLogsResponse>("/timesheet-statuses/reviewer-logs/", { params: requestParams })
      .then((response) => {
        setReviewerLogs({
          week_columns: Array.isArray(response.data?.week_columns)
            ? response.data.week_columns
            : [],
          results: Array.isArray(response.data?.results)
            ? response.data.results
            : [],
        });
      })
      .catch(() => {
        setReviewerLogs({ week_columns: [], results: [] });
      });
  }, [requestParams]);

  useEffect(() => {
    if (tabValue === 0) {
      fetchSubmittedLogs();
      return;
    }

    fetchReviewerLogs();
  }, [fetchReviewerLogs, fetchSubmittedLogs, tabValue]);

  const columns = useMemo<ColumnData<TimesheetLogRow>[]>(
    () => [
      {
        label: "Employee",
        dataKey: "employee_name",
        width: { xs: 160, sm: 200 },
      },
      {
        label: "Reporting To",
        dataKey: "reporting_to",
        width: { xs: 160, sm: 200 },
      },
      ...logs.week_columns.map((week) => ({
        label: week.label,
        width: 86,
        render: (row: TimesheetLogRow) => (
          <TimingIcon week={row.weeks[week.key]} />
        ),
      })),
    ],
    [logs.week_columns],
  );

  const reviewerColumns = useMemo<ColumnData<ReviewerLogRow>[]>(
    () => [
      {
        label: "Employee",
        dataKey: "employee_name",
        width: { xs: 160, sm: 200 },
      },
      {
        label: "Reporting To",
        dataKey: "reporting_to",
        width: { xs: 160, sm: 200 },
      },
      ...reviewerLogs.week_columns.map((week) => ({
        label: week.label,
        width: 86,
        render: (row: ReviewerLogRow) => (
          <ReviewerIcon
            week={row.weeks[week.key]}
            onOpen={() =>
              setSelectedReviewerCell({
                employeeName: row.employee_name,
                week: row.weeks[week.key],
              })
            }
          />
        ),
      })),
    ],
    [reviewerLogs.week_columns],
  );

  const years = useMemo(
    () => Array.from({ length: 6 }, (_, index) => currentYear - index),
    [],
  );

  return (
    <Box sx={page}>
      <Box component="main" sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Typography variant="h5" sx={pageTitle}>Timesheet Logs</Typography>
            <Typography variant="body2" sx={pageSubtitle}>
              Track weekly submission and reviewer approval status across your team.
            </Typography>
          </Box>

          <Box sx={pageHeaderActions}>
            <Button
              variant="outlined"
              startIcon={
                <Badge badgeContent={activeFilterCount} color="primary">
                  <FilterListOutlinedIcon fontSize="small" />
                </Badge>
              }
              onClick={() => setFiltersOpen(true)}
            >
              Filters
            </Button>
          </Box>
        </Box>

        <Box sx={tabsContainer}>
          <Tabs
            value={tabValue}
            onChange={(_, value) => setTabValue(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={tabs}
          >
            <Tab label="Submitted Log" />
            <Tab label="Reviewer Logs" />
          </Tabs>
        </Box>

        <Box sx={tablePageContent}>
          {tabValue === 0 ? (
            <VirtualizedTable<TimesheetLogRow>
              columns={columns}
              rows={logs.results}
              height="100%"
              tableHead="Submitted Logs"
            />
          ) : (
            <VirtualizedTable<ReviewerLogRow>
              columns={reviewerColumns}
              rows={reviewerLogs.results}
              height="100%"
              tableHead="Reviewer Logs"
            />
          )}
        </Box>
      </Box>

      <Dialog
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            position: "fixed",
            top: { xs: 150, sm: 150 },
            right: { xs: "auto", sm: 15 },
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
            <Typography variant="h6">Timesheet filters</Typography>
            <IconButton
              aria-label="Close filters"
              onClick={() => setFiltersOpen(false)}
            >
              <CloseOutlinedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select
                label="Employee"
                value={selectedEmployee}
                onChange={(event) => setSelectedEmployee(event.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={String(employee.id)}>
                    {employee.first_name || `User ${employee.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                label="Year"
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
              >
                <MenuItem value="">Last 4 weeks</MenuItem>
                {years.map((year) => (
                  <MenuItem key={year} value={String(year)}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>From Week</InputLabel>
              <Select
                label="From Week"
                value={fromWeek}
                onChange={(event) => setFromWeek(event.target.value)}
                MenuProps={{ PaperProps: { sx: { maxHeight: 250 } } }}
              >
                <MenuItem value="">Any</MenuItem>
                {weekOptions.map((week) => (
                  <MenuItem key={week} value={String(week)}>
                    W-{week}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>To Week</InputLabel>
              <Select
                label="To Week"
                value={toWeek}
                onChange={(event) => setToWeek(event.target.value)}
                MenuProps={{ PaperProps: { sx: { maxHeight: 250 } } }}
              >
                <MenuItem value="">Any</MenuItem>
                {weekOptions.map((week) => (
                  <MenuItem key={week} value={String(week)}>
                    W-{week}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedReviewerCell)}
        onClose={() => setSelectedReviewerCell(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2, overflow: "hidden" } }}
      >
        <DialogTitle sx={{ px: 3, py: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <RateReviewOutlinedIcon color="primary" />
              <Box>
                <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                  {selectedReviewerCell?.employeeName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Week {selectedReviewerCell?.week.weeknumber} ·{" "}
                  {selectedReviewerCell?.week.completed_approvers}/
                  {selectedReviewerCell?.week.total_approvers} approvers actioned
                </Typography>
              </Box>
            </Stack>
            <Tooltip title="Close">
              <IconButton size="small" onClick={() => setSelectedReviewerCell(null)}>
                <CloseOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ px: 3, py: 2 }}>
          <Stack spacing={1}>
            {selectedReviewerCell?.week.approvers.map((approver) => (
              <Box
                key={`${approver.approver_id}-${approver.approver_name}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1.5,
                  p: 1.25,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                }}
              >
                <Box>
                  <Typography fontWeight={600} fontSize={13}>
                    {approver.approver_name}
                  </Typography>
                  <Typography color="text.secondary" fontSize={12}>
                    Accepted {approver.accepted_count} | Rejected {approver.rejected_count} | Pending {approver.pending_count}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={approver.status}
                  color={
                    approver.status === "Accepted"
                      ? "success"
                      : approver.status === "Rejected"
                      ? "error"
                      : approver.status === "Mixed"
                      ? "warning"
                      : "default"
                  }
                  variant={approver.status === "Pending" ? "outlined" : "filled"}
                />
              </Box>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
