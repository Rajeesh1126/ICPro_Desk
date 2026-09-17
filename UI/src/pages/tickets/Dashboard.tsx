import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import AnalysisPieChart from "../../components/dashboard/AnalysisPieChart";
import TeamReportModal, {
  type TeamReportDetail,
} from "../../components/dashboard/TeamReportModal";
import { type ColumnData } from "../../components/common/TableView";
import type { TicketData } from "../../types/dataTypes";
import CollapsibleTableView, {
  type ExpandedColumnData,
} from "../../components/common/CollapsibleTableView";
import api from "../../api/axios";
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
  marginBottomSectionSx,
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
type DatePreset = "weekly" | "biweekly" | "monthly" | "custom";
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

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getPresetRange = (preset: Exclude<DatePreset, "custom">) => {
  const today = new Date();

  if (preset === "monthly") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { startDate: formatDate(start), endDate: formatDate(end) };
  }

  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + (preset === "biweekly" ? 13 : 6));
  return { startDate: formatDate(start), endDate: formatDate(end) };
};

export default function Dashboard() {
  const [datePreset, setDatePreset] = useState<DatePreset>("weekly");
  const [dateRange, setDateRange] = useState(() => getPresetRange("weekly"));
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
  const [summary, setSummary] = useState<TicketSummary>(emptySummary);
  const [teamReportOpen, setTeamReportOpen] = useState(false);
  const [teamReportLoading, setTeamReportLoading] = useState(false);
  const [teamReportDetail, setTeamReportDetail] =
    useState<TeamReportDetail | null>(null);

  useEffect(() => {
    let active = true;
    void api
      .get("/summary/", {
        params: {
          include_executive: true,
          is_internal: false,
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
        },
      })
      .then((response) => {
        if (active) setSummary({ ...emptySummary, ...response.data });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [dateRange.endDate, dateRange.startDate]);

  const openTeamReport = useCallback(
    async (department: DepartmentLoad) => {
      setTeamReportOpen(true);
      setTeamReportLoading(true);
      setTeamReportDetail(null);

      try {
        const response = await api.get<TeamReportDetail>("/summary/", {
          params: {
            include_executive: true,
            is_internal: false,
            department_id: department.id,
            start_date: dateRange.startDate,
            end_date: dateRange.endDate,
          },
        });

        setTeamReportDetail(response.data);
      } finally {
        setTeamReportLoading(false);
      }
    },
    [dateRange.endDate, dateRange.startDate],
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
    console.log("updateDatePreset called with:", next);
    if (!datePresets.includes(next as DatePreset)) {
      return;
    }

    const preset = next as DatePreset;

    if (preset === "custom") {
      setDatePreset("custom");
      setFilterDialogOpen(true);
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
          <ToggleButton value="custom" aria-label="Custom">
            <Tooltip title="Custom date range" arrow>
              <Box component="span">Custom</Box>
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
        <Button
          startIcon={<FilterListOutlinedIcon />}
          variant="outlined"
          onClick={() => setFilterDialogOpen(true)}
        >
          <Box component="span" sx={buttonLabelFull}>
            Date Filter
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
      <Box component="main" sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Box sx={pageHeaderTopRow}>
              <Box sx={pageHeaderTitleGroup}>
                <Typography variant="h5" sx={pageTitle}>
                  Team Analysis
                </Typography>
              </Box>
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
            </Box>
            <Typography variant="body2" sx={pageSubtitle}>
              A live view of due work, team load, and overall ticket status from{" "}
              {dateRange.startDate} to {dateRange.endDate}.
            </Typography>
            <Box sx={pageHeaderFilterPanel}>
              <Collapse in={mobileControlsOpen} timeout="auto" unmountOnExit>
                <Stack spacing={1} sx={pageHeaderControlsMobile}>
                  {renderDashboardControls()}
                </Stack>
              </Collapse>
            </Box>
          </Box>
          <Stack
            spacing={1}
            direction={{ xs: "row-reverse", sm: "row" }}
            sx={pageHeaderControlsDesktop}
          >
            {renderDashboardControls()}
          </Stack>
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
                    Tickets by team Click on a team to view detailed report
                  </Typography>
                </Box>
              </Stack>
              <Stack spacing={0} sx={scrollColumn}>
                {summary.deptData.length ? (
                  summary.deptData.map((department, index) => {
                    const color = department.color || "primary.main";
                    return (
                      <Box
                        key={department.name}
                        onClick={() => void openTeamReport(department)}
                        sx={{
                          ...dividerListRow(
                            index < summary.deptData.length - 1,
                          ),
                          cursor: "pointer",
                          // borderRadius: 0.5,
                          px: 0.75,
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                          // border: '1px solid red'
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
                      </Box>
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
              <AnalysisPieChart
                title={`Total ${summary.total}`}
                data={summary.statuses}
                height={210}
              />
            </Box>
          </Box>
          <Box sx={overviewFullGridItem}>
            <CollapsibleTableView
              columns={columns}
              expandedColumns={expandedColumns}
              rows={summary.weekly_target_tickets}
              tableHead="Target tickets"
              tableHeadSub={`Commitments due from ${dateRange.startDate} to ${dateRange.endDate}`}
              getRowId={(row) => row.id ?? row.number}
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
            <Typography variant="h6">Dashboard filters</Typography>
            <IconButton
              aria-label="Close filters"
              onClick={() => setFilterDialogOpen(false)}
            >
              <CloseOutlinedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={dialogContentTop}>
            <TextField
              fullWidth
              label="From"
              type="date"
              size="small"
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
              size="small"
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
        </DialogContent>
        <DialogActions sx={marginBottomSectionSx}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<FilterAltOutlinedIcon />}
            onClick={() => setFilterDialogOpen(false)}
          >
            Apply Filter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
