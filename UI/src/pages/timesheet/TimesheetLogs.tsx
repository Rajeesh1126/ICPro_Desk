import { useMemo, useState } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import RateReviewIcon from "@mui/icons-material/RateReview";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import FilterPopover, { ActiveFilterChips } from "@/components/common/FilterPopover";
import PageHeader from "@/components/common/PageHeader";
import { reportHeaderActions } from "@/components/common/headerActions";
import StatusLegend, { type StatusLegendItem } from "@/components/timesheet/StatusLegend";
import { VirtualizedTable, type ColumnData } from "@/components/common/TableView";
import { asArray, useApiQuery } from "@/api/useApiQuery";
import { useDebouncedValue } from "@/utils/useDebouncedValue";
import { useExportStatus } from "@/utils/useExportStatus";
import type { ReportingEmployees } from "@/types/dataTypes";
import {
  page,
  pageContent,
  tabs,
  tabsContainer,
  tablePageContent,
} from "@/styles/layout";
import type {
  ApproverLogRow,
  ReviewerLogRow,
  ReviewerLogsResponse,
  TimesheetLogRow,
  TimesheetLogsResponse,
} from "@/pages/timesheet/logs/logTypes";
import {
  buildApproverRows,
  buildLogRequestParams,
  emptyLogFilters,
  weekColumnLabel,
  type LogFilters,
} from "@/pages/timesheet/logs/logData";
import {
  approverLegend,
  approverState,
  reviewerLegend,
  submissionLegend,
  submissionState,
  withCounts,
} from "@/pages/timesheet/logs/logLegend";
import { ApproverWeekIcon, ReviewerIcon, TimingIcon } from "@/pages/timesheet/logs/LogStatusIcons";
import { exportApprovalLogs, exportApproverLogs, exportSubmittedLogs } from "@/pages/timesheet/logs/logExports";
import LogFiltersForm from "@/pages/timesheet/logs/LogFiltersForm";
import {
  ApproverWeekDialog,
  ReviewerWeekDialog,
  type ApproverCell,
  type ReviewerCell,
} from "@/pages/timesheet/logs/LogWeekDialogs";
import {
  logsHintSx,
} from "@/styles/common";

const TABS = [
  { label: "Submitted Log", activeIcon: <AssignmentIcon />, inactiveIcon: <AssignmentOutlinedIcon /> },
  { label: "Approval Logs", activeIcon: <FactCheckIcon />, inactiveIcon: <FactCheckOutlinedIcon /> },
  { label: "Approver Logs", activeIcon: <RateReviewIcon />, inactiveIcon: <RateReviewOutlinedIcon /> },
] as const;

export default function TimesheetLogs() {
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState<LogFilters>(emptyLogFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // The Filters button; the filter panel drops down from it.
  const [filterButton, setFilterButton] = useState<HTMLButtonElement | null>(null);
  const [reviewerCell, setReviewerCell] = useState<ReviewerCell | null>(null);
  const [approverCell, setApproverCell] = useState<ApproverCell | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { exporting, runExport } = useExportStatus();

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // Shared, cached team list (same entry as the Do List employee filter).
  const teamsQuery = useApiQuery<ReportingEmployees[]>("/teams/");
  const employees = useMemo(() => asArray<ReportingEmployees>(teamsQuery.data), [teamsQuery.data]);

  // ---- Data -------------------------------------------------------------------
  const requestParams = useMemo(() => buildLogRequestParams(filters), [filters]);
  // Filter changes are debounced and each filter combination is cached.
  const debouncedParams = useDebouncedValue(requestParams);
  const logsQuery = useApiQuery<TimesheetLogsResponse>("/timesheet-week-logs/logs/", debouncedParams, {
    enabled: tabValue === 0,
  });
  const reviewerQuery = useApiQuery<ReviewerLogsResponse>(
    "/timesheet-week-logs/reviewer-logs/",
    debouncedParams,
    { enabled: tabValue !== 0 },
  );
  const logs = useMemo<TimesheetLogsResponse>(
    () => ({
      week_columns: asArray(logsQuery.data?.week_columns),
      results: asArray(logsQuery.data?.results),
    }),
    [logsQuery.data],
  );
  const reviewerLogs = useMemo<ReviewerLogsResponse>(
    () => ({
      week_columns: asArray(reviewerQuery.data?.week_columns),
      results: asArray(reviewerQuery.data?.results),
    }),
    [reviewerQuery.data],
  );
  const approverRows = useMemo(() => buildApproverRows(reviewerLogs), [reviewerLogs]);

  // A filter change shows the skeleton immediately, even during the debounce
  // wait, so rows for the previous filters are never shown as current.
  const filtersSettling = requestParams !== debouncedParams;
  const logsLoading = filtersSettling || logsQuery.isPending;
  const reviewerLoading = filtersSettling || reviewerQuery.isPending;

  // ---- Columns ----------------------------------------------------------------
  const columns = useMemo<ColumnData<TimesheetLogRow>[]>(
    () => [
      { label: "Employee", dataKey: "employee_name" },
      { label: "Reporting To", dataKey: "reporting_to" },
      ...logs.week_columns.map((week) => ({
        label: weekColumnLabel(week),
        width: 64,
        align: "center" as const,
        render: (row: TimesheetLogRow) => (
          <TimingIcon week={row.weeks[week.key]} weekEnd={week.week_end} />
        ),
      })),
    ],
    [logs.week_columns],
  );

  const reviewerColumns = useMemo<ColumnData<ReviewerLogRow>[]>(
    () => [
      { label: "Employee", dataKey: "employee_name" },
      { label: "Reporting To", dataKey: "reporting_to" },
      ...reviewerLogs.week_columns.map((week) => ({
        label: weekColumnLabel(week),
        width: 64,
        align: "center" as const,
        render: (row: ReviewerLogRow) => (
          <ReviewerIcon
            week={row.weeks[week.key]}
            onOpen={() => setReviewerCell({ employeeName: row.employee_name, week: row.weeks[week.key] })}
          />
        ),
      })),
    ],
    [reviewerLogs.week_columns],
  );

  const approverColumns = useMemo<ColumnData<ApproverLogRow>[]>(
    () => [
      { label: "Approver", dataKey: "approver_name" },
      ...reviewerLogs.week_columns.map((week) => ({
        label: weekColumnLabel(week),
        width: 64,
        align: "center" as const,
        render: (row: ApproverLogRow) => (
          <ApproverWeekIcon
            week={row.weeks[week.key]}
            onOpen={() => setApproverCell({ approverName: row.approver_name, week: row.weeks[week.key] })}
          />
        ),
      })),
    ],
    [reviewerLogs.week_columns],
  );

  // Live counts per status for the visible weeks, so the key doubles as a summary.
  const legendItems = useMemo<StatusLegendItem[]>(() => {
    if (tabValue === 0) {
      return withCounts(
        submissionLegend,
        logs.results.flatMap((row) =>
          logs.week_columns.map((column) => submissionState(row.weeks[column.key], column.week_end)),
        ),
      );
    }
    if (tabValue === 1) {
      return withCounts(
        reviewerLegend,
        reviewerLogs.results.flatMap((row) =>
          reviewerLogs.week_columns.map((column) => row.weeks[column.key]?.review_status ?? "N/A"),
        ),
      );
    }
    return withCounts(
      approverLegend,
      approverRows.flatMap((row) =>
        reviewerLogs.week_columns.map((column) => approverState(row.weeks[column.key])),
      ),
    );
  }, [approverRows, logs, reviewerLogs, tabValue]);

  const visibleSubmissionRows = statusFilter
    ? logs.results.filter((row) => logs.week_columns.some((column) => submissionState(row.weeks[column.key], column.week_end) === statusFilter))
    : logs.results;
  const visibleReviewerRows = statusFilter
    ? reviewerLogs.results.filter((row) => reviewerLogs.week_columns.some((column) => (row.weeks[column.key]?.review_status ?? "N/A") === statusFilter))
    : reviewerLogs.results;
  const visibleApproverRows = statusFilter
    ? approverRows.filter((row) => reviewerLogs.week_columns.some((column) => approverState(row.weeks[column.key]) === statusFilter))
    : approverRows;

  // ---- Export -----------------------------------------------------------------
  const exportActiveTab = () =>
    runExport(() =>
      tabValue === 0
        ? exportSubmittedLogs(logs)
        : tabValue === 1
          ? exportApprovalLogs(reviewerLogs)
          : exportApproverLogs(approverRows, reviewerLogs.week_columns),
    );
  const exportDisabled =
    tabValue === 0
      ? logs.results.length === 0
      : tabValue === 1
        ? reviewerLogs.results.length === 0
        : approverRows.length === 0;

  const employeeName = (id: string) =>
    employees.find((employee) => String(employee.id) === id)?.first_name ?? id;

  return (
    <Box sx={page}>
      <Box sx={pageContent}>
        <PageHeader
          title="Timesheet Logs"
          subtitle="Track weekly submission and reviewer approval status across your team."
          actions={reportHeaderActions({
            onExport: exportActiveTab,
            exportDisabled,
            exporting,
            onFilter: () => setFiltersOpen(true),
            filterButtonRef: setFilterButton,
            activeFilterCount,
          })}
        />

        <Box sx={tabsContainer}>
          <Tabs
            value={tabValue}
            onChange={(_, value) => setTabValue(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={tabs}
          >
            {TABS.map((tab, index) => (
              <Tab
                key={tab.label}
                icon={tabValue === index ? tab.activeIcon : tab.inactiveIcon}
                iconPosition="start"
                label={tab.label}
              />
            ))}
          </Tabs>
        </Box>

        <ActiveFilterChips
          onClearAll={() => setFilters(emptyLogFilters)}
          filters={[
            ...(filters.employee
              ? [{
                  key: "employee",
                  label: `Employee: ${employeeName(filters.employee)}`,
                  onRemove: () => setFilters({ ...filters, employee: "" }),
                }]
              : []),
            ...(filters.year
              ? [{
                  key: "year",
                  label: `Year: ${filters.year}`,
                  onRemove: () => setFilters({ ...filters, year: "" }),
                }]
              : []),
            ...(filters.fromWeek || filters.toWeek
              ? [{
                  key: "weeks",
                  label: `Weeks ${filters.fromWeek ? `W-${filters.fromWeek}` : "start"} – ${filters.toWeek ? `W-${filters.toWeek}` : "latest"}`,
                  onRemove: () => setFilters({ ...filters, fromWeek: "", toWeek: "" }),
                }]
              : []),
          ]}
        />

        <Box sx={tablePageContent}>
          <StatusLegend
            items={legendItems}
            activeKey={statusFilter}
            onSelectStatus={(key) => setStatusFilter((current) => current === key ? null : key)}
            hint={
              tabValue === 0
                ? "Hover an icon to see the hours entered for that week."
                : "Select an icon in the table to see each approver or submitter for that week."
            }
          />
          <Typography variant="caption" color="text.secondary" sx={logsHintSx}>
            {tabValue === 0
              ? "Submitted Log shows when employees submitted each week."
              : tabValue === 1
                ? "Approval Logs show each employee’s approval progress across assigned reviewers."
                : "Approver Logs group submissions by approver and show the status of each approver’s queue."}
            {statusFilter ? ` Showing rows with: ${legendItems.find((item) => item.key === statusFilter)?.label ?? statusFilter}.` : " Select a status count to filter rows."}
          </Typography>
          {tabValue === 0 ? (
            <VirtualizedTable<TimesheetLogRow>
              columns={columns}
              rows={visibleSubmissionRows}
              stickyFirstColumn
              height="100%"
              tableHead="Submitted Logs"
              loading={logsLoading}
              emptyDescription="No timesheet activity for the selected filters."
            />
          ) : tabValue === 1 ? (
            <VirtualizedTable<ReviewerLogRow>
              columns={reviewerColumns}
              rows={visibleReviewerRows}
              stickyFirstColumn
              height="100%"
              tableHead="Approval Logs"
              loading={reviewerLoading}
              emptyDescription="No timesheet activity for the selected filters."
            />
          ) : (
            <VirtualizedTable<ApproverLogRow>
              columns={approverColumns}
              rows={visibleApproverRows}
              stickyFirstColumn
              height="100%"
              tableHead="Approver Logs"
              loading={reviewerLoading}
              emptyDescription="No timesheet activity for the selected filters."
            />
          )}
        </Box>
      </Box>

      <FilterPopover
        open={filtersOpen}
        anchorEl={filterButton}
        onClose={() => setFiltersOpen(false)}
        title="Timesheet filters"
        onReset={activeFilterCount ? () => setFilters(emptyLogFilters) : undefined}
        applyLabel="Show results"
      >
        <LogFiltersForm filters={filters} employees={employees} onChange={setFilters} />
      </FilterPopover>

      <ReviewerWeekDialog cell={reviewerCell} onClose={() => setReviewerCell(null)} />
      <ApproverWeekDialog cell={approverCell} onClose={() => setApproverCell(null)} />
    </Box>
  );
}
