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
import EmployeeProgressPanel, { type ProgressPanelLabels } from "@/components/dashboard/EmployeeProgressPanel";
import WorkItemRecordDialog from "@/components/dashboard/WorkItemRecordDialog";
import WorkStatusOverview from "@/components/dashboard/WorkStatusOverview";
import {
  getPresetRange,
  useTeamAnalysis,
  type DatePreset,
  type DateRange as DateRangeValue,
  type TeamProgress,
  type TeamWorkItem,
} from "@/pages/tickets/teamSummaryQuery";
import type { EmployeePerformance } from "@/pages/tickets/teamPerformanceQuery";
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

/** Teams in the shared progress panel: Tickets and Do List bars. */
const teamLabels: ProgressPanelLabels = {
  title: "Teams workload",
  caption: "Select a team to show only its target tickets.",
  unit: { one: "team", other: "teams" },
  listLabel: "Teams workload list",
  workTypes: ["Tickets", "Do List"],
  itemNoun: "tickets and Do List items",
  selectHint: "Show only this team's target tickets",
  empty: "No team workload yet",
};

/** Team target ticket columns. Remaining fields are in the item details. */
const targetColumns: ColumnData<TeamWorkItem>[] = [
  { label: "Number", dataKey: "number", width: 160 },
  { label: "Subject", dataKey: "task", width: 220, wrap: true },
  { label: "Work type", dataKey: "kind", width: 90 },
  { label: "Team", dataKey: "team_name", width: 120 },
  // Do List items have an owner rather than an assignee.
  {
    label: "Employee",
    dataKey: "assigned_to_name",
    width: 130,
    render: (row) => row.assigned_to_name || row.creator_name || "—",
    searchValue: (row) => row.assigned_to_name || row.creator_name,
  },
  { label: "Status", dataKey: "current_status", width: 120, render: (row) => <Pill value={statusLabel(row.current_status)} color={statusColor(row.current_status)} dot /> },
  { label: "Priority", dataKey: "priority", width: 90, render: (row) => <Pill value={priorityLabel(row.priority)} color={priorityColor(row.priority)} /> },
  { label: "Due date", dataKey: "target_date", width: 120, render: (row) => formatIfDate(row.target_date) },
];

export default function Dashboard() {
  const [datePreset, setDatePreset] = useState<DatePreset>("weekly");
  // Applied range: this drives the summary query.
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => getPresetRange("weekly"));
  // Dates being edited in the panel; they reach `dateRange` on Apply dates.
  const [draftRange, setDraftRange] = useState<DateRangeValue>(dateRange);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  // The Filters button; the filter panel drops down from it.
  const [filterButton, setFilterButton] = useState<HTMLButtonElement | null>(null);
  // Cached per date range and team. A new range shows skeletons until its own
  // numbers arrive, so figures for the wrong range are never on screen.
  const analysis = useTeamAnalysis(dateRange);
  const summaryLoading = analysis.loading;
  // Team the target table is narrowed to; null shows every team.
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const selectedTeam = analysis.teams.find((team) => team.id === selectedTeamId) ?? null;
  const targetRows = useMemo(() => {
    if (selectedTeam) {
      return analysis.items.filter((item) => item.team_id === selectedTeam.id);
    }
    // An item listed by two teams shows once in the all-teams view.
    const seen = new Set<string>();
    return analysis.items.filter((item) => {
      const id = `${item.kind}-${item.number}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [analysis.items, selectedTeam]);
  // Status strip counts the rows the table lists for all teams.
  const statuses = useMemo(() => {
    const seen = new Set<string>();
    const counts: Record<string, number> = {};
    analysis.items.forEach((item) => {
      const id = `${item.kind}-${item.number}`;
      if (seen.has(id)) return;
      seen.add(id);
      const status = String(item.current_status || "unknown").toLowerCase();
      counts[status] = (counts[status] ?? 0) + 1;
    });
    return counts;
  }, [analysis.items]);
  // Selecting the same team again goes back to every team.
  const toggleTeam = useCallback(
    (team: EmployeePerformance) =>
      setSelectedTeamId((current) => (current === team.id ? null : team.id)),
    [],
  );
  const teamManager = useCallback(
    (team: EmployeePerformance) => {
      const manager = (team as TeamProgress).manager;
      return manager ? `Manager: ${manager}` : undefined;
    },
    [],
  );
  // Ticket or Do List row whose detail dialog is open.
  const [openItem, setOpenItem] = useState<TeamWorkItem | null>(null);

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
              Team Tickets and Do List progress for{" "}
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

        {analysis.isError && (
          <Alert
            severity="error"
            sx={{ mb: 1.5 }}
            action={
              <Button color="inherit" size="small" disabled={analysis.isFetching} onClick={analysis.refetch}>
                Retry
              </Button>
            }
          >
            {analysis.hasData
              ? "Could not refresh team analysis. Showing the last loaded figures."
              : "Could not load team analysis. Please try again."}
          </Alert>
        )}

        {/* A failed first load has no figures, so zeros are never shown as real data. */}
        {!(analysis.isError && !analysis.hasData) && (
          <MotionBox variants={staggerContainer()} sx={teamAnalysisGridSx}>
            <StaggerItem sx={teamAnalysisStatusSx}>
              <WorkStatusOverview
                statuses={statuses}
                loading={summaryLoading}
                title="Ticket status"
              />
            </StaggerItem>
            <StaggerItem sx={teamAnalysisPanelSx}>
              <EmployeeProgressPanel
                employees={analysis.teams}
                labels={teamLabels}
                getSubtitle={teamManager}
                loading={summaryLoading}
                selectedId={selectedTeam?.id ?? null}
                onSelect={toggleTeam}
              />
            </StaggerItem>
            <StaggerItem sx={teamAnalysisPanelSx}>
              <VirtualizedTable
                columns={targetColumns}
                rows={targetRows}
                height="100%"
                tableMinWidth={900}
                searchPlaceholder="Search target tickets"
                tableHead={selectedTeam ? `${selectedTeam.name}’s target tickets` : "Target tickets"}
                headerAction={
                  selectedTeam && (
                    <Button
                      variant="outlined"
                      startIcon={<GroupsOutlinedIcon />}
                      onClick={() => setSelectedTeamId(null)}
                    >
                      All teams
                    </Button>
                  )
                }
                tableHeadSub={
                  <>
                    Tickets and Do List items
                  </>
                }
                onRowClick={setOpenItem}
                loading={summaryLoading}
                emptyTitle={selectedTeam ? `No tickets for ${selectedTeam.name} in this range` : "No team tickets in this range"}
                emptyDescription="Change the date range to review other target tickets."
              />
            </StaggerItem>
          </MotionBox>
        )}
      </StaggerContainer>

      {openItem && <WorkItemRecordDialog item={openItem} onClose={() => setOpenItem(null)} />}

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
