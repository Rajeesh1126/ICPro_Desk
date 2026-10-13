import { useCallback, useMemo, useState } from "react";
import DateRange from "../../components/common/DateRange";
import {
  Box,
  Button,
  ButtonBase,
  Collapse,
  IconButton,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import AnalysisPieChart from "../../components/dashboard/AnalysisPieChart";
import FilterPopover from "../../components/common/FilterPopover";
import TeamReportModal, {
  type TeamReportDetail,
} from "../../components/dashboard/TeamReportModal";
import { type ColumnData } from "../../components/common/TableView";
import type { TicketData } from "../../types/dataTypes";
import CollapsibleTableView, {
  type ExpandedColumnData,
} from "../../components/common/CollapsibleTableView";
import { apiQueryKey, fetchApi, useApiQuery } from "../../api/useApiQuery";
import { queryClient } from "../../api/queryClient";
import {
  getPresetRange,
  TEAM_SUMMARY_URL,
  teamSummaryParams,
  type DatePreset,
} from "./teamSummaryQuery";
import {
  buttonLabelCompact,
  buttonLabelFull,
  compactStackGap,
  contentFill,
  dateFieldSx,
  dialogContentTop,
  dividerListRow,
  emptyStateSx,
  fillContainer,
  inlineProgress,
  largeMutedIcon,
  minWidthZeroSx,
  page,
  pageContent,
  overviewFullGridItem,
  overviewGrid,
  overviewPrimaryGridItem,
  overviewSecondaryGridItem,
  pageHeader,
  pageHeaderControlsDesktop,
  pageHeaderControlsMobile,
  pageHeaderContent,
  pageHeaderFilterPanel,
  pageHeaderFilterToggle,
  pageHeaderTitleGroup,
  pageHeaderTopRow,
  pageSubtitle,
  pageTitle,
  panelIconBadge,
  panelTitleRow,
  rightMetric,
  scrollColumn,
  statusDot,
  surfacePanel,
  toggleButton,
} from "../../styles/common";

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


export default function Dashboard() {
  const [datePreset, setDatePreset] = useState<DatePreset>("weekly");
  const [dateRange, setDateRange] = useState(() => getPresetRange("weekly"));
  const [filterOpen, setFilterOpen] = useState(false);
  // The Filters button; the filter panel drops down from it.
  const [filterButton, setFilterButton] = useState<HTMLButtonElement | null>(null);
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
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
  const theme = useTheme();
  // Render the filter controls once, in the layout that matches the viewport,
  // so hidden duplicates can never receive focus.
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
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
      {
        label: "#",
        width: 30,
        render: (_row, index) => index + 1,
        numeric: true,
      },
      { label: "Ticket Number", dataKey: "number", width: 120 },
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
      { label: "Est Hrs", dataKey: "est_hours", size: { xs: 4, md: 2 } },
      { label: "Act Hrs", dataKey: "act_hours", size: { xs: 4, md: 2 } },
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

  const renderDashboardControls = useCallback(
    () => (
      <>
        <ToggleButtonGroup
          exclusive
          value={datePreset}
          onChange={(_, next) => updateDatePreset(next)}
          aria-label="Dashboard date range"
          sx={toggleButton}
        >
          <ToggleButton value="weekly" aria-label="Weekly">
            <Tooltip title="Weekly" arrow>
              <Box component="span">Weekly</Box>
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="biweekly" aria-label="Biweekly">
            <Tooltip title="Biweekly" arrow>
              <Box component="span">Biweekly</Box>
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="monthly" aria-label="Monthly">
            <Tooltip title="Monthly" arrow>
              <Box component="span">Monthly</Box>
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
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
      </>
    ),
    [datePreset, updateDatePreset],
  );

  return (
    <Box sx={page}>
      <Box sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Box sx={pageHeaderTopRow}>
              <Box sx={pageHeaderTitleGroup}>
                <Typography variant="h5" component="h1" sx={pageTitle}>
                  Team Analysis
                </Typography>
              </Box>
              {!isDesktop && (
              <Tooltip
                title={mobileControlsOpen ? "Hide filters" : "Show filters"}
              >
                <IconButton
                  aria-label={
                    mobileControlsOpen
                      ? "Hide dashboard filters"
                      : "Show dashboard filters"
                  }
                  onClick={() => setMobileControlsOpen((open) => !open)}
                  sx={pageHeaderFilterToggle}
                >
                  <FilterListOutlinedIcon />
                </IconButton>
              </Tooltip>
              )}
            </Box>
            <Typography variant="body2" sx={pageSubtitle}>
              Due work, team load and ticket status for{" "}
              <DateRange start={dateRange.startDate} end={dateRange.endDate} />
            </Typography>
            {!isDesktop && (
              <Box sx={pageHeaderFilterPanel}>
                <Collapse in={mobileControlsOpen} timeout="auto" unmountOnExit>
                  <Stack spacing={1} sx={pageHeaderControlsMobile}>
                    {renderDashboardControls()}
                  </Stack>
                </Collapse>
              </Box>
            )}
          </Box>
          {isDesktop && (
            <Stack
              spacing={1}
              direction={{ xs: "row-reverse", sm: "row" }}
              sx={pageHeaderControlsDesktop}
            >
              {renderDashboardControls()}
            </Stack>
          )}
        </Box>

        <Box sx={overviewGrid}>
          <Box sx={overviewPrimaryGridItem}>
            <Paper elevation={0} sx={surfacePanel}>
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
                sx={panelTitleRow}
              >
                <Box sx={panelIconBadge}>
                  <BusinessOutlinedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography fontWeight={800}>Teams workload</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tickets by team. Select a team to open its detailed report.
                  </Typography>
                </Box>
              </Stack>
              <Stack
                spacing={0}
                sx={[
                  scrollColumn,
                  !summary.deptData.length && {
                    overflow: "hidden",
                    pr: 0,
                    scrollbarGutter: "auto",
                  },
                ]}
              >
                {summaryLoading ? (
                  <Stack spacing={1.25} role="status" aria-label="Loading team workload" sx={{ py: 1 }}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <Box key={index}>
                        <Skeleton variant="text" width="55%" />
                        <Skeleton variant="rounded" height={6} />
                      </Box>
                    ))}
                  </Stack>
                ) : summary.deptData.length ? (
                  summary.deptData.map((department, index) => {
                    const color = department.color || "primary.main";
                    return (
                      <ButtonBase
                        key={department.name}
                        onClick={() => void openTeamReport(department)}
                        aria-label={`${department.name}: ${department.count} tickets. Open team report`}
                        title={department.name}
                        sx={{
                          ...dividerListRow(
                            index < summary.deptData.length - 1,
                          ),
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          px: 0.75,
                          borderRadius: 1,
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                          "&.Mui-focusVisible": {
                            outline: "2px solid",
                            outlineColor: "primary.main",
                            outlineOffset: -2,
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          spacing={2}
                        >
                          <Box sx={contentFill}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                              sx={compactStackGap}
                            >
                              <Box sx={statusDot(color)} />

                              <Typography
                                variant="body2"
                                fontWeight={800}
                                noWrap
                                sx={minWidthZeroSx}
                              >
                                {department.name}
                              </Typography>
                            </Stack>

                            <LinearProgress
                              variant="determinate"
                              value={Math.min(
                                100,
                                (department.count /
                                  Math.max(summary.total, 1)) *
                                  100,
                              )}
                              sx={inlineProgress(color)}
                            />
                          </Box>

                          <Box sx={rightMetric}>
                            <Typography
                              variant="subtitle2"
                              fontWeight={900}
                              lineHeight={1}
                            >
                              {department.count}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              lineHeight={1}
                            >
                              tickets
                            </Typography>
                          </Box>
                        </Stack>
                      </ButtonBase>
                    );
                  })
                ) : (
                  <Box sx={emptyStateSx}>
                    <Box>
                      <EventAvailableOutlinedIcon sx={largeMutedIcon} />
                      <Typography fontWeight={700}>
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
                  sx={{ ...surfacePanel, height: "100%", display: "grid", placeItems: "center", gap: 1.5 }}
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
          <Stack spacing={1.5} sx={dialogContentTop}>
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
