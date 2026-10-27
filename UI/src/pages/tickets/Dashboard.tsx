import { useCallback, useMemo, useState } from "react";
import DateRange from "@/components/common/DateRange";
import {
  Box,
  Button,
  ButtonBase,
  Chip,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import AnalysisPieChart from "@/components/dashboard/AnalysisPieChart";
import FilterPopover from "@/components/common/FilterPopover";
import TeamReportModal, {
  type TeamReportDetail,
} from "@/components/dashboard/TeamReportModal";
import { type ColumnData } from "@/components/common/TableView";
import type { TicketData } from "@/types/dataTypes";
import CollapsibleTableView, {
  type ExpandedColumnData,
} from "@/components/common/CollapsibleTableView";
import { apiQueryKey, fetchApi, useApiQuery } from "@/api/useApiQuery";
import { queryClient } from "@/api/queryClient";
import {
  getPresetRange,
  TEAM_SUMMARY_URL,
  teamSummaryParams,
  type DatePreset,
} from "@/pages/tickets/teamSummaryQuery";
import {
  buttonLabelCompact,
  buttonLabelFull,
  dateFieldSx,
  emptyStateSx,
  fillContainer,
  largeMutedIcon,
  minWidthZeroSx,
  page,
  pageContent,
  overviewFullGridItem,
  overviewGrid,
  overviewPrimaryGridItem,
  overviewSecondaryGridItem,
  flexFillSx,
  panelTitleRowFull,
  teamWorkloadListSx,
  verticalPadSx,
  teamWorkloadBadgeSx,
  teamWorkloadBarSx,
  teamWorkloadChevronSx,
  teamWorkloadCountSx,
  teamWorkloadNameSx,
  teamWorkloadRowSx,
  teamWorkloadTotalSx,
  surfacePanelLoadingSx,
  surfacePanel,
  toggleButton,
} from "@/styles/common";
import PageHeader from "@/components/common/PageHeader";

type DepartmentLoad = {
  id: number;
  name: string;
  count: number;
  color?: string;
};
const datePresets: DatePreset[] = ["weekly", "biweekly", "monthly", "custom"];
type TicketSummary = {
  total: number;
  statuses: Record<string, number>;
  departments: Record<string, number>;
  weekly_target_tickets: TicketData[];
  deptData: DepartmentLoad[];
};

const emptySummary: TicketSummary = {
  total: 0,
  statuses: {},
  departments: {},
  weekly_target_tickets: [],
  deptData: [],
};


/** Up to two initials for a team's badge, e.g. "Field Service" -> "FS". */
const teamInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

export default function Dashboard() {
  const [datePreset, setDatePreset] = useState<DatePreset>("weekly");
  const [dateRange, setDateRange] = useState(() => getPresetRange("weekly"));
  const [filterOpen, setFilterOpen] = useState(false);
  // The Filters button; the filter panel drops down from it.
  const [filterButton, setFilterButton] = useState<HTMLButtonElement | null>(null);
  // Cached per date range. A new range shows skeletons until its own numbers
  // arrive, so figures for the wrong range are never on screen.
  const summaryQuery = useApiQuery<Partial<TicketSummary>>(
    TEAM_SUMMARY_URL,
    teamSummaryParams(dateRange),
  );
  const summary = useMemo<TicketSummary>(
    () => ({ ...emptySummary, ...summaryQuery.data }),
    [summaryQuery.data],
  );
  const summaryLoading = summaryQuery.isPending;
  const [teamReportOpen, setTeamReportOpen] = useState(false);
  const [teamReportLoading, setTeamReportLoading] = useState(false);
  const [teamReportDetail, setTeamReportDetail] =
    useState<TeamReportDetail | null>(null);


  const openTeamReport = useCallback(
    async (department: DepartmentLoad) => {
      setTeamReportOpen(true);
      setTeamReportLoading(true);
      setTeamReportDetail(null);

      try {
        // Cached per team and range: reopening a team report is instant.
        const params = teamSummaryParams(dateRange, department.id);
        const detail = await queryClient.fetchQuery({
          queryKey: apiQueryKey(TEAM_SUMMARY_URL, params),
          queryFn: ({ signal }) =>
            fetchApi<TeamReportDetail>(TEAM_SUMMARY_URL, params, signal),
        });

        setTeamReportDetail(detail);
      } finally {
        setTeamReportLoading(false);
      }
    },
    [dateRange],
  );

  const columns = useMemo<ColumnData<TicketData>[]>(
    () => [
      { label: "Ticket Number", dataKey: "number", width: 120 },
      { label: "Subject", dataKey: "task", width: 220, wrap: true },
      { label: "Status", dataKey: "current_status", width: { xs: 80, sm: 120 } },
      { label: "Assigned By", dataKey: "creator_name" },
      { label: "Assigned To", dataKey: "assigned_to_name" },
      { label: "Priority", dataKey: "priority", width: { xs: 80, sm: 120 } },
      { label: "Target Completion", dataKey: "target_date", width: { xs: 80, sm: 120 } },
    ],
    [],
  );

  const expandedColumns = useMemo<ExpandedColumnData<TicketData>[]>(
    () => [
      { label: "Subject", dataKey: "task", size: { xs: 12, md: 6 } },
      { label: "Est Hrs", dataKey: "est_hours", format: "hours", size: { xs: 4, md: 2 } },
      { label: "Act Hrs", dataKey: "act_hours", format: "hours", size: { xs: 4, md: 2 } },
      {
        label: "Actual Completion",
        dataKey: "actual_end_date",
        size: { xs: 4, md: 2 },
      },
    ],
    [],
  );

  const updateDatePreset = useCallback((next: unknown) => {
    if (!datePresets.includes(next as DatePreset)) {
      return;
    }

    const preset = next as DatePreset;

    if (preset === "custom") {
      setDatePreset("custom");
      setFilterOpen(true);
      return;
    }

    setDatePreset(preset);
    setDateRange(getPresetRange(preset));
  }, []);

  const updateDateRange = useCallback(
    (field: "startDate" | "endDate", value: string) => {
      setDatePreset("custom");
      setDateRange((current) => {
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
      <Box sx={pageContent}>
        <PageHeader
          title="Team Analysis"
          subtitle={
            <>
              Due work, team load and ticket status for{" "}
              <DateRange start={dateRange.startDate} end={dateRange.endDate} />
            </>
          }
          actions={[
            {
              key: "preset",
              priority: "medium",
              node: (
                <ToggleButtonGroup
                  exclusive
                  value={datePreset}
                  onChange={(_, next) => updateDatePreset(next)}
                  aria-label="Dashboard date range"
                  sx={toggleButton}
                >
                  {presetChoices.map((preset) => (
                    <ToggleButton key={preset} value={preset} aria-label={presetLabels[preset]}>
                      <Tooltip title={presetLabels[preset]} arrow>
                        <Box component="span">{presetLabels[preset]}</Box>
                      </Tooltip>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
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
                  onClick={() => setFilterOpen(true)}
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

        <Box sx={overviewGrid}>
          <Box sx={overviewPrimaryGridItem}>
            <Paper elevation={0} sx={surfacePanel}>
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
                sx={panelTitleRowFull}
              >
                <Box sx={flexFillSx}>
                  <Typography fontWeight={600}>Teams workload</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Click a team to open its report. Bars compare ticket counts.
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  variant="outlined"
                  label={summaryLoading ? "Teams" : `${summary.deptData.length} teams`}
                  sx={teamWorkloadTotalSx}
                />
              </Stack>
              <Stack
                component="div"
                role="region"
                aria-label="Teams workload list"
                spacing={0}
                sx={teamWorkloadListSx}
              >
                {summaryLoading ? (
                  <Stack spacing={1.25} role="status" aria-label="Loading team workload" sx={verticalPadSx}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <Box key={index}>
                        <Skeleton variant="text" width="55%" />
                        <Skeleton variant="rounded" height={6} />
                      </Box>
                    ))}
                  </Stack>
                ) : summary.deptData.length ? (
                  summary.deptData.map((department, index) => {
                    return (
                      <ButtonBase
                        key={department.name}
                        onClick={() => void openTeamReport(department)}
                        aria-label={`${department.name}: ${department.count} ${department.count === 1 ? "ticket" : "tickets"}. Open team report`}
                        title={department.name}
                        sx={teamWorkloadRowSx(index < summary.deptData.length - 1)}
                      >
                        <Box aria-hidden="true" sx={teamWorkloadBadgeSx}>
                          {teamInitials(department.name)}
                        </Box>
                        <Box sx={minWidthZeroSx}>
                          <Typography noWrap sx={teamWorkloadNameSx}>
                            {department.name}
                          </Typography>
                          {/* Relative counts are visual comparison only; this is not a capacity meter. */}
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(
                              100,
                              (department.count /
                                Math.max(
                                  1,
                                  ...summary.deptData.map((item) => item.count),
                                )) *
                                100,
                            )}
                            sx={teamWorkloadBarSx}
                          />
                        </Box>
                        <Typography component="span" sx={teamWorkloadCountSx}>
                          <strong>{department.count}</strong>
                          {department.count === 1 ? "ticket" : "tickets"}
                        </Typography>
                        <ChevronRightRoundedIcon
                          aria-hidden="true"
                          className="team-workload-chevron"
                          sx={teamWorkloadChevronSx}
                        />
                      </ButtonBase>
                    );
                  })
                ) : (
                  <Box sx={emptyStateSx}>
                    <Box>
                      <EventAvailableOutlinedIcon sx={largeMutedIcon} />
                      <Typography fontWeight={600}>
                        No team workload yet
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Box>
          <Box sx={overviewSecondaryGridItem}>
            <Box sx={fillContainer}>
              {summaryLoading ? (
                <Paper
                  elevation={0}
                  role="status"
                  aria-label="Loading ticket status"
                  sx={surfacePanelLoadingSx}
                >
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="circular" width={150} height={150} />
                  <Skeleton variant="text" width="70%" />
                </Paper>
              ) : (
                <AnalysisPieChart
                  title={`Total ${summary.total}`}
                  data={summary.statuses}
                  height={210}
                />
              )}
            </Box>
          </Box>
          <Box sx={overviewFullGridItem}>
            <CollapsibleTableView
              columns={columns}
              expandedColumns={expandedColumns}
              rows={summary.weekly_target_tickets}
              tableHead="Target tickets"
              tableHeadSub={
                <>
                  Commitments due{" "}
                  <DateRange start={dateRange.startDate} end={dateRange.endDate} />
                </>
              }
              getRowId={(row) => row.id ?? row.number}
              loading={summaryLoading}
              emptyTitle="No target tickets in this range"
              emptyDescription="Change the date range to see other commitments."
            />
          </Box>
        </Box>
      </Box>

      <TeamReportModal
        open={teamReportOpen}
        loading={teamReportLoading}
        detail={teamReportDetail}
        onClose={() => setTeamReportOpen(false)}
      />

      <FilterPopover
        open={filterOpen}
        anchorEl={filterButton}
        onClose={() => setFilterOpen(false)}
        title="Date range"
        onReset={() => updateDatePreset("weekly")}
        applyLabel="Apply dates"
      >
          <Stack spacing={1.5}>
            <TextField
              fullWidth
              label="From"
              type="date"
              value={dateRange.startDate}
              onChange={(event) =>
                updateDateRange("startDate", event.target.value)
              }
              sx={dateFieldSx}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { max: dateRange.endDate || undefined },
              }}
            />
            <TextField
              fullWidth
              label="To"
              type="date"
              value={dateRange.endDate}
              onChange={(event) =>
                updateDateRange("endDate", event.target.value)
              }
              sx={dateFieldSx}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: dateRange.startDate || undefined },
              }}
            />
          </Stack>
      </FilterPopover>
    </Box>
  );
}
