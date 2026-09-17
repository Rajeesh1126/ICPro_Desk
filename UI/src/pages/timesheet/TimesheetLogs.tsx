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
  TableCell,
  TableRow,
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
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import type { SvgIconComponent } from "@mui/icons-material";
import * as XLSX from "xlsx";
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
  submission_timing: "OnTime" | "Delayed" | "Not Submitted" | "Not Applicable";
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
  review_status: "N/A" | "No Action" | "Partially Approved" | "Delayed" | "OnTime" | "Rejected";
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

type ApproverSubmitterDetail = {
  employee_id: number;
  employee_name: string;
  reporting_to: string;
  status: ReviewerLogApprover["status"];
  accepted_count: number;
  rejected_count: number;
  pending_count: number;
};

type ApproverWeekDetail = {
  weeknumber: number;
  weekyear: number;
  week_start: string;
  week_end: string;
  submitted_count: number;
  accepted_count: number;
  rejected_count: number;
  pending_count: number;
  submitters: ApproverSubmitterDetail[];
};

type ApproverLogRow = {
  [key: string]: unknown;
  approver_key: string;
  approver_id: number | null;
  approver_name: string;
  total_submitters: number;
  weeks: Record<string, ApproverWeekDetail>;
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

const formatWeekRange = (week: TimesheetLogWeekColumn | TimesheetLogWeek | ReviewerLogWeek) =>
  `${week.week_start} to ${week.week_end}`;

const formatSubmittedWeekValue = (week?: TimesheetLogWeek) => {
  if (!week) {
    return "Not Submitted";
  }

  const hours = `${week.total_hours.toFixed(2)} hrs`;
  return `${week.submission_timing} | ${week.timesheet_status} | ${hours}`;
};

const formatSubmittedWeekExportValue = (week?: TimesheetLogWeek) =>
  formatSubmittedWeekValue(week).split("|")[0].trim();

const formatApproverDetails = (approvers: ReviewerLogApprover[]) => {
  if (approvers.length === 0) {
    return "";
  }

  return approvers
    .map(
      (approver) =>
        `${approver.approver_name}: ${approver.status} ` +
        `(Accepted ${approver.accepted_count}, Rejected ${approver.rejected_count}, Pending ${approver.pending_count})`,
    )
    .join("; ");
};

const formatReviewerWeekValue = (week?: ReviewerLogWeek) => {
  if (!week) {
    return "N/A";
  }

  return `${week.review_status} | ${week.completed_approvers}/${week.total_approvers} approvers actioned`;
};

const formatApproverWeekValue = (week?: ApproverWeekDetail) => {
  if (!week) {
    return "N/A";
  }

  return `${week.submitted_count} submitters | Accepted ${week.accepted_count} | Rejected ${week.rejected_count} | Pending ${week.pending_count}`;
};

const timingColor = {
  OnTime: "success.main",
  Delayed: "warning.main",
  "Not Submitted": "error.main",
  "Not Applicable": "text.disabled",
} satisfies Record<TimesheetLogWeek["submission_timing"], string>;

const reviewColor = {
  OnTime: "success.main",
  Rejected: "error.main",
  "Partially Approved": "warning.main",
  Delayed: "warning.dark",
  "No Action": "info.main",
  "N/A": "text.disabled",
} satisfies Record<ReviewerLogWeek["review_status"], string>;

const submissionLegendItems = [
  { icon: CheckCircleOutlinedIcon, color: timingColor.OnTime, label: "OnTime Submitted" },
  { icon: HourglassTopOutlinedIcon, color: timingColor.Delayed, label: "Delayed Submitted" },
  { icon: CancelOutlinedIcon, color: timingColor["Not Submitted"], label: "Not Submitted" },
  { icon: HelpOutlineOutlinedIcon, color: timingColor["Not Applicable"], label: "Not Applicable" },
];

const reviewerLegendItems = [
  { icon: CheckCircleOutlinedIcon, color: reviewColor.OnTime, label: "Approved OnTime" },
  { icon: RateReviewOutlinedIcon, color: reviewColor["Partially Approved"], label: "Partially Approved" },
  { icon: HourglassTopOutlinedIcon, color: reviewColor.Delayed, label: "Approval Delayed" },
  { icon: CancelOutlinedIcon, color: reviewColor.Rejected, label: "Rejected" },
  { icon: PendingActionsOutlinedIcon, color: reviewColor["No Action"], label: "No Action" },
  { icon: HelpOutlineOutlinedIcon, color: reviewColor["N/A"], label: "N/A" },
];

function LegendItem({
  icon: Icon,
  color,
  label,
}: {
  icon: SvgIconComponent;
  color: string;
  label: string;
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <Icon sx={{ color, fontSize: 18 }} />
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
    </Stack>
  );
}

function IconLegendFooter({
  colSpan,
  items,
}: {
  colSpan: number;
  items: Array<{
    icon: SvgIconComponent;
    color: string;
    label: string;
  }>;
}) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} sx={{ py: 1, px: 2, bgcolor: "background.paper" }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.75}
          useFlexGap
          flexWrap="wrap"
        >
          {items.map((item) => (
            <LegendItem
              key={item.label}
              icon={item.icon}
              color={item.color}
              label={item.label}
            />
          ))}
        </Stack>
      </TableCell>
    </TableRow>
  );
}

function TimingIcon({ week }: { week?: TimesheetLogWeek }) {
  const timing = week?.submission_timing ?? "Not Submitted";
  const Icon =
    timing === "OnTime"
      ? CheckCircleOutlinedIcon
      : timing === "Delayed"
      ? HourglassTopOutlinedIcon
      : timing === "Not Applicable"
      ? HelpOutlineOutlinedIcon
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
      ? RateReviewOutlinedIcon
      : status === "Delayed"
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

function ApproverWeekIcon({
  week,
  onOpen,
}: {
  week?: ApproverWeekDetail;
  onOpen: () => void;
}) {
  const canOpen = Boolean(week?.submitters.length);
  const hasRejected = Boolean(week && week.rejected_count > 0);
  const hasPending = Boolean(week && week.pending_count > 0);
  const color = !week
    ? reviewColor["N/A"]
    : hasRejected
    ? reviewColor.Rejected
    : hasPending
    ? reviewColor["No Action"]
    : reviewColor.OnTime;

  return (
    <Tooltip title={formatApproverWeekValue(week)}>
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
        <Badge
          badgeContent={week?.submitted_count ?? 0}
          color={hasRejected ? "error" : hasPending ? "warning" : "success"}
          max={99}
          invisible={!canOpen}
        >
          <RateReviewOutlinedIcon sx={{ color, fontSize: 22 }} />
        </Badge>
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
  const [selectedApproverCell, setSelectedApproverCell] = useState<{
    approverName: string;
    week: ApproverWeekDetail;
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
      .get<TimesheetLogsResponse>("/timesheet-week-logs/logs/", { params: requestParams })
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
      .get<ReviewerLogsResponse>("/timesheet-week-logs/reviewer-logs/", { params: requestParams })
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
        label: "#",
        width: { xs: 40, sm: 40 },
        render: (_row, index) => index + 1,
        numeric: true,
      },
      {
        label: "Employee",
        dataKey: "employee_name",
        // width: { xs: 160, sm: 200 },
      },
      {
        label: "Reporting To",
        dataKey: "reporting_to",
        // width: { xs: 160, sm: 200 },
      },
      ...logs.week_columns.map((week) => ({
        label: week.label,
        width: 54,
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
        label: "#",
        width: { xs: 40, sm: 40 },
        render: (_row, index) => index + 1,
        numeric: true,
      },
      {
        label: "Employee",
        dataKey: "employee_name",
        // width: { xs: 160, sm: 200 },
      },
      {
        label: "Reporting To",
        dataKey: "reporting_to",
        // width: { xs: 160, sm: 200 },
      },
      ...reviewerLogs.week_columns.map((week) => ({
        label: week.label,
        width: 54,
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

  const approverRows = useMemo<ApproverLogRow[]>(() => {
    const approvers = new Map<string, ApproverLogRow>();

    reviewerLogs.results.forEach((employee) => {
      reviewerLogs.week_columns.forEach((weekColumn) => {
        const week = employee.weeks[weekColumn.key];
        if (!week?.submitted) {
          return;
        }

        week.approvers.forEach((approver) => {
          const approverKey = `${approver.approver_id ?? "unknown"}-${approver.approver_name}`;
          const approverRow =
            approvers.get(approverKey) ??
            {
              approver_key: approverKey,
              approver_id: approver.approver_id,
              approver_name: approver.approver_name,
              total_submitters: 0,
              weeks: {},
            };

          const approverWeek =
            approverRow.weeks[weekColumn.key] ??
            {
              weeknumber: week.weeknumber,
              weekyear: week.weekyear,
              week_start: week.week_start,
              week_end: week.week_end,
              submitted_count: 0,
              accepted_count: 0,
              rejected_count: 0,
              pending_count: 0,
              submitters: [],
            };

          approverWeek.submitted_count += 1;
          approverWeek.accepted_count += approver.accepted_count;
          approverWeek.rejected_count += approver.rejected_count;
          approverWeek.pending_count += approver.pending_count;
          approverWeek.submitters.push({
            employee_id: employee.employee_id,
            employee_name: employee.employee_name,
            reporting_to: employee.reporting_to,
            status: approver.status,
            accepted_count: approver.accepted_count,
            rejected_count: approver.rejected_count,
            pending_count: approver.pending_count,
          });

          approverRow.weeks[weekColumn.key] = approverWeek;
          approverRow.total_submitters += 1;
          approvers.set(approverKey, approverRow);
        });
      });
    });

    return Array.from(approvers.values()).sort((first, second) =>
      first.approver_name.localeCompare(second.approver_name),
    );
  }, [reviewerLogs.results, reviewerLogs.week_columns]);

  const approverColumns = useMemo<ColumnData<ApproverLogRow>[]>(
    () => [
      {
        label: "#",
        width: { xs: 40, sm: 40 },
        render: (_row, index) => index + 1,
        numeric: true,
      },
      {
        label: "Approver",
        dataKey: "approver_name",
      },
      {
        label: "Submitted Employees",
        dataKey: "total_submitters",
        numeric: true,
        width: { xs: 130, sm: 160 },
      },
      ...reviewerLogs.week_columns.map((week) => ({
        label: week.label,
        width: 54,
        render: (row: ApproverLogRow) => (
          <ApproverWeekIcon
            week={row.weeks[week.key]}
            onOpen={() =>
              setSelectedApproverCell({
                approverName: row.approver_name,
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

  const exportSubmittedLogsToExcel = () => {
    const rows = logs.results.map((row, index) => {
      const exportRow: Record<string, string | number> = {
        "#": index + 1,
        Employee: row.employee_name,
        "Reporting To": row.reporting_to,
      };

      logs.week_columns.forEach((weekColumn) => {
        exportRow[`${weekColumn.label} (${formatWeekRange(weekColumn)})`] = formatSubmittedWeekExportValue(
          row.weeks[weekColumn.key],
        );
      });

      return exportRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 26 },
      { wch: 26 },
      ...logs.week_columns.map(() => ({ wch: 34 })),
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Submitted Logs");
    XLSX.writeFile(
      workbook,
      `Timesheet_Submitted_Logs_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const exportReviewerLogsToExcel = () => {
    const rows = reviewerLogs.results.map((row, index) => {
      const exportRow: Record<string, string | number> = {
        "#": index + 1,
        Employee: row.employee_name,
        "Reporting To": row.reporting_to,
      };

      reviewerLogs.week_columns.forEach((weekColumn) => {
        const week = row.weeks[weekColumn.key];
        const weekLabel = `${weekColumn.label} (${formatWeekRange(weekColumn)})`;
        exportRow[`${weekLabel} Review Status`] = formatReviewerWeekValue(week);
        exportRow[`${weekLabel} Pending Approvers`] = week?.pending_approvers ?? 0;
        exportRow[`${weekLabel} Approver Details`] = week
          ? formatApproverDetails(week.approvers)
          : "";
      });

      return exportRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 26 },
      { wch: 26 },
      ...reviewerLogs.week_columns.flatMap(() => [
        { wch: 34 },
        { wch: 18 },
        { wch: 70 },
      ]),
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Approval Logs");
    XLSX.writeFile(
      workbook,
      `Timesheet_Approval_Logs_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const exportApproverLogsToExcel = () => {
    const rows = approverRows.map((row, index) => {
      const exportRow: Record<string, string | number> = {
        "#": index + 1,
        Approver: row.approver_name,
        "Submitted Employees": row.total_submitters,
      };

      reviewerLogs.week_columns.forEach((weekColumn) => {
        const week = row.weeks[weekColumn.key];
        const weekLabel = `${weekColumn.label} (${formatWeekRange(weekColumn)})`;
        exportRow[`${weekLabel} Summary`] = formatApproverWeekValue(week);
        exportRow[`${weekLabel} Submitter Details`] = week
          ? week.submitters
              .map(
                (submitter) =>
                  `${submitter.employee_name}: ${submitter.status} ` +
                  `(Accepted ${submitter.accepted_count}, Rejected ${submitter.rejected_count}, Pending ${submitter.pending_count})`,
              )
              .join("; ")
          : "";
      });

      return exportRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 26 },
      { wch: 20 },
      ...reviewerLogs.week_columns.flatMap(() => [
        { wch: 34 },
        { wch: 70 },
      ]),
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Approver Logs");
    XLSX.writeFile(
      workbook,
      `Timesheet_Approver_Logs_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const exportActiveTabToExcel = () => {
    if (tabValue === 0) {
      exportSubmittedLogsToExcel();
      return;
    }

    if (tabValue === 1) {
      exportReviewerLogsToExcel();
      return;
    }

    exportApproverLogsToExcel();
  };

  const exportLabel =
    tabValue === 0 ? "Submitted" : tabValue === 1 ? "Approval" : "Approver";

  const exportDisabled =
    tabValue === 0
      ? logs.results.length === 0
      : tabValue === 1
      ? reviewerLogs.results.length === 0
      : approverRows.length === 0;

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
              variant="contained"
              startIcon={<FileDownloadOutlinedIcon fontSize="small" />}
              onClick={exportActiveTabToExcel}
              disabled={exportDisabled}
            >
              Export {exportLabel}
            </Button>
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
            <Tab label="Approval Logs" />
            <Tab label="Approver Logs" />
          </Tabs>
        </Box>

        <Box sx={tablePageContent}>
          {tabValue === 0 ? (
            <VirtualizedTable<TimesheetLogRow>
              columns={columns}
              rows={logs.results}
              height="100%"
              tableHead="Submitted Logs"
              fixedFooterContent={() => (
                <IconLegendFooter
                  colSpan={columns.length}
                  items={submissionLegendItems}
                />
              )}
            />
          ) : tabValue === 1 ? (
            <VirtualizedTable<ReviewerLogRow>
              columns={reviewerColumns}
              rows={reviewerLogs.results}
              height="100%"
              tableHead="Approval Logs"
              fixedFooterContent={() => (
                <IconLegendFooter
                  colSpan={reviewerColumns.length}
                  items={reviewerLegendItems}
                />
              )}
            />
          ) : (
            <VirtualizedTable<ApproverLogRow>
              columns={approverColumns}
              rows={approverRows}
              height="100%"
              tableHead="Approver Logs"
              fixedFooterContent={() => (
                <IconLegendFooter
                  colSpan={approverColumns.length}
                  items={reviewerLegendItems}
                />
              )}
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

      <Dialog
        open={Boolean(selectedApproverCell)}
        onClose={() => setSelectedApproverCell(null)}
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
                  {selectedApproverCell?.approverName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Week {selectedApproverCell?.week.weeknumber} ·{" "}
                  {selectedApproverCell?.week.submitted_count} submitted employees
                </Typography>
              </Box>
            </Stack>
            <Tooltip title="Close">
              <IconButton size="small" onClick={() => setSelectedApproverCell(null)}>
                <CloseOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ px: 3, py: 2 }}>
          <Stack spacing={1}>
            {selectedApproverCell?.week.submitters.map((submitter) => (
              <Box
                key={`${submitter.employee_id}-${submitter.employee_name}`}
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
                    {submitter.employee_name}
                  </Typography>
                  <Typography color="text.secondary" fontSize={12}>
                    Reporting To: {submitter.reporting_to || "N/A"}
                  </Typography>
                  <Typography color="text.secondary" fontSize={12}>
                    Accepted {submitter.accepted_count} | Rejected {submitter.rejected_count} | Pending {submitter.pending_count}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={submitter.status}
                  color={
                    submitter.status === "Accepted"
                      ? "success"
                      : submitter.status === "Rejected"
                      ? "error"
                      : submitter.status === "Mixed"
                      ? "warning"
                      : "default"
                  }
                  variant={submitter.status === "Pending" ? "outlined" : "filled"}
                />
              </Box>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
