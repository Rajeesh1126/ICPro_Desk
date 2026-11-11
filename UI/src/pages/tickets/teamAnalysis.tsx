import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import DateRange from "@/components/common/DateRange";
import FilterPopover from "@/components/common/FilterPopover";
import PageHeader from "@/components/common/PageHeader";
import Pill from "@/components/common/Pill";
import { priorityColor, priorityLabel, statusColor, statusLabel } from "@/components/common/pillValues";
import { VirtualizedTable, type ColumnData } from "@/components/common/TableView";
import EmployeeProgressPanel from "@/components/dashboard/EmployeeProgressPanel";
import WorkItemRecordDialog from "@/components/dashboard/WorkItemRecordDialog";
import WorkStatusOverview from "@/components/dashboard/WorkStatusOverview";
import { useApiQuery } from "@/api/useApiQuery";
import {
  getPresetRange,
  type DatePreset,
  type DateRange as DateRangeValue,
} from "@/pages/tickets/teamSummaryQuery";
import {
  TEAM_PERFORMANCE_URL,
  teamPerformanceParams,
  type EmployeePerformance,
  type EmployeeWorkItem,
  type TeamPerformanceSummary,
} from "@/pages/tickets/teamPerformanceQuery";
import {
  buttonLabelCompact,
  buttonLabelFull,
  dateFieldSx,
  page,
  pageContent,
  teamAnalysisGridSx,
  teamAnalysisPanelSx,
  teamAnalysisStatusSx,
  toggleButton,
} from "@/styles/common";
import { MotionBox, StaggerContainer, StaggerItem } from "@/animations/MotionPrimitives";
import { staggerContainer } from "@/animations/presets";
import AnimatedToggleGroup from "@/animations/AnimatedToggleGroup";
import { formatIfDate } from "@/utils/dateRange";

const datePresets: DatePreset[] = ["weekly", "biweekly", "monthly", "custom"];
const emptySummary: TeamPerformanceSummary = { total: 0, statuses: {}, employees: [], work_items: [] };

/** Team due-work columns. Remaining fields are in the item details. */
const dueWorkColumns: ColumnData<EmployeeWorkItem>[] = [
  { label: "Work number", dataKey: "number", width: 140 },
  { label: "Subject", dataKey: "task", width: 220, wrap: true },
  { label: "Work type", dataKey: "kind", width: 90 },
  { label: "Employee", dataKey: "assigned_to_name", width: 130 },
  { label: "Status", dataKey: "current_status", width: 120, render: (row) => <Pill value={statusLabel(row.current_status)} color={statusColor(row.current_status)} dot /> },
  { label: "Priority", dataKey: "priority", width: 90, render: (row) => <Pill value={priorityLabel(row.priority)} color={priorityColor(row.priority)} /> },
  { label: "Due date", dataKey: "target_date", width: 110, render: (row) => formatIfDate(row.target_date) },
];

export default function TeamAnalysis() {
  const [datePreset, setDatePreset] = useState<DatePreset>("weekly");
  // Applied range: this drives the summary query.
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => getPresetRange("weekly"));
  // Dates being edited in the panel; they reach `dateRange` on Apply dates.
  const [draftRange, setDraftRange] = useState<DateRangeValue>(dateRange);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  // The Filters button; the filter panel drops down from it.
  const [filterButton, setFilterButton] = useState<HTMLButtonElement | null>(null);
  // Cached per date range. A new range shows skeletons until its own numbers
  // arrive, so figures for the wrong range are never on screen.
  const summaryQuery = useApiQuery<Partial<TeamPerformanceSummary>>(
    TEAM_PERFORMANCE_URL,
    teamPerformanceParams(dateRange),
  );
  const summary = useMemo<TeamPerformanceSummary>(
    () => ({ ...emptySummary, ...summaryQuery.data }),
    [summaryQuery.data],
  );
  const summaryLoading = summaryQuery.isPending;
  // Employee the due-work table is narrowed to; null shows everyone.
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const selectedEmployee = summary.employees.find((employee) => employee.id === selectedEmployeeId) ?? null;
  const dueWorkRows = useMemo(
    () =>
      selectedEmployee
        ? summary.work_items.filter((item) => item.employee_id === selectedEmployee.id)
        : summary.work_items,
    [selectedEmployee, summary.work_items],
  );
  // Selecting the same employee again goes back to everyone.
  const toggleEmployee = useCallback(
    (employee: EmployeePerformance) =>
      setSelectedEmployeeId((current) => (current === employee.id ? null : employee.id)),
    [],
  );
  // Due-work row whose Work Let or Do List dialog is open.
  const [dueWorkItem, setDueWorkItem] = useState<EmployeeWorkItem | null>(null);

  // The panel always starts from the applied range; closing it discards edits.
  const openDateFilter = useCallback(() => {
    setDraftRange(dateRange);
    setFilterOpen(true);
  }, [dateRange]);

  const updateDatePreset = useCallback((next: unknown) => {
    if (!datePresets.includes(next as DatePreset)) {
      return;
    }

    const preset = next as DatePreset;

    if (preset === "custom") {
      openDateFilter();
      return;
    }

    const range = getPresetRange(preset);
    setDatePreset(preset);
    setDateRange(range);
    setDraftRange(range);
  }, [openDateFilter]);

  /** Runs the summary query for the panel's dates, only if they changed. */
  const applyDraftRange = () => {
    if (draftRange.startDate !== dateRange.startDate || draftRange.endDate !== dateRange.endDate) {
      setDatePreset("custom");
      setDateRange(draftRange);
    }
    setFilterOpen(false);
  };

  const updateDraftRange = useCallback(
    (field: "startDate" | "endDate", value: string) => {
      setDraftRange((current) => {
        if (
          field === "startDate" &&
          current.endDate &&
          value > current.endDate
        ) {
          return { startDate: value, endDate: value };
        }
        if (
          field === "endDate" &&
          current.startDate &&
          value < current.startDate
        ) {
          return { startDate: value, endDate: value };
        }
        return { ...current, [field]: value };
      });
    },
    [],
  );

  // "custom" comes from the Custom dates panel, not from these choices.
  const presetChoices = ["weekly", "biweekly", "monthly"] as const;
  const presetLabels = {
    weekly: "Weekly",
    biweekly: "Biweekly",
    monthly: "Monthly",
  };

  return (
    <Box sx={page}>
      <StaggerContainer sx={pageContent}>
        <PageHeader
          title="Team Analysis"
          subtitle={
            <>
              Direct reportees Work Let and Do List progress for{" "}
              <DateRange start={dateRange.startDate} end={dateRange.endDate} />
            </>
          }
          actions={[
            {
              key: "preset",
              priority: "medium",
              node: (
                <AnimatedToggleGroup
                  exclusive
                  value={datePreset}
                  onChange={(_, next) => updateDatePreset(next)}
                  aria-label="Team Analysis date range"
                  sx={toggleButton}
                >
                  {presetChoices.map((preset) => (
                    <ToggleButton key={preset} value={preset} aria-label={presetLabels[preset]}>
                      <Tooltip title={presetLabels[preset]} arrow>
                        <Box component="span">{presetLabels[preset]}</Box>
                      </Tooltip>
                    </ToggleButton>
                  ))}
                </AnimatedToggleGroup>
              ),
              menuLabel: "Date range",
              menuItems: presetChoices.map((preset) => ({
                key: preset,
                label: presetLabels[preset],
                onClick: () => updateDatePreset(preset),
                selected: datePreset === preset,
              })),
            },
            {
              key: "dates",
              priority: "high",
              node: (
                <Button
                  startIcon={<FilterListOutlinedIcon />}
                  variant="outlined"
                  ref={setFilterButton}
                  onClick={openDateFilter}
                >
                  <Box component="span" sx={buttonLabelFull}>
                    Custom dates
                  </Box>
                  <Box component="span" sx={buttonLabelCompact}>
                    Dates
                  </Box>
                </Button>
              ),
            },
          ]}
        />

        {summaryQuery.isError && (
          <Alert
            severity="error"
            sx={{ mb: 1.5 }}
            action={
              <Button color="inherit" size="small" disabled={summaryQuery.isFetching} onClick={() => void summaryQuery.refetch()}>
                Retry
              </Button>
            }
          >
            {summaryQuery.data
              ? "Could not refresh team analysis. Showing the last loaded figures."
              : "Could not load team analysis. Please try again."}
          </Alert>
        )}

        {/* A failed first load has no figures, so zeros are never shown as real data. */}
        {!(summaryQuery.isError && !summaryQuery.data) && (
          <MotionBox variants={staggerContainer()} sx={teamAnalysisGridSx}>
            <StaggerItem sx={teamAnalysisStatusSx}>
              <WorkStatusOverview statuses={summary.statuses} loading={summaryLoading} />
            </StaggerItem>
            <StaggerItem sx={teamAnalysisPanelSx}>
              <EmployeeProgressPanel
                employees={summary.employees}
                loading={summaryLoading}
                selectedId={selectedEmployee?.id ?? null}
                onSelect={toggleEmployee}
              />
            </StaggerItem>
            <StaggerItem sx={teamAnalysisPanelSx}>
              <VirtualizedTable
                columns={dueWorkColumns}
                rows={dueWorkRows}
                height="100%"
                tableMinWidth={780}
                searchPlaceholder="Search due work"
                tableHead={selectedEmployee ? `${selectedEmployee.name}’s due work` : "Subordinates’ due work"}
                headerAction={
                  selectedEmployee && (
                    <Button
                      variant="outlined"
                      startIcon={<GroupsOutlinedIcon />}
                      onClick={() => setSelectedEmployeeId(null)}
                    >
                      All employees
                    </Button>
                  )
                }
                tableHeadSub={
                  <>
                    Work Let and Do List items
                  </>
                }
                onRowClick={setDueWorkItem}
                loading={summaryLoading}
                emptyTitle={selectedEmployee ? `No work for ${selectedEmployee.name} in this range` : "No subordinate work in this range"}
                emptyDescription="Change the date range to review other due work."
              />
            </StaggerItem>
          </MotionBox>
        )}
      </StaggerContainer>

      {dueWorkItem && <WorkItemRecordDialog item={dueWorkItem} onClose={() => setDueWorkItem(null)} />}

      <FilterPopover
        open={filterOpen}
        anchorEl={filterButton}
        onClose={() => setFilterOpen(false)}
        title="Date range"
        onReset={() => updateDatePreset("weekly")}
        applyLabel="Apply dates"
        onApply={applyDraftRange}
      >
          <Stack spacing={1.5}>
            <TextField
              fullWidth
              label="From"
              type="date"
              value={draftRange.startDate}
              onChange={(event) =>
                updateDraftRange("startDate", event.target.value)
              }
              sx={dateFieldSx}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { max: draftRange.endDate || undefined },
              }}
            />
            <TextField
              fullWidth
              label="To"
              type="date"
              value={draftRange.endDate}
              onChange={(event) =>
                updateDraftRange("endDate", event.target.value)
              }
              sx={dateFieldSx}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: draftRange.startDate || undefined },
              }}
            />
          </Stack>
      </FilterPopover>
    </Box>
  );
}
