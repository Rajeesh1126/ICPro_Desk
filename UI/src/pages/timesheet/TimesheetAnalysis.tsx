import { insetSx } from "../../styles/tokens";
import DateRange from "../../components/common/DateRange";
import DateRangeSummary from "../../components/common/DateRangeSummary";
import { useEffect, useMemo, useRef, useState } from "react";
import FilterPopover, { ActiveFilterChips } from "../../components/common/FilterPopover";
import EmptyTableState from "../../components/common/EmptyTableState";
import ChartDataTable from "../../components/common/ChartDataTable";
import { summariseSeries } from "../../utils/chartSummary";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Skeleton,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useTheme } from "@mui/material/styles";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import { echarts, type ECharts, type EChartsOption } from "../../utils/charts";
import { loadXlsx, useExportStatus } from "../../utils/useExportStatus";
import {
  VirtualizedTable,
  type ColumnData,
} from "../../components/common/TableView";
import ReportHeaderActions from "../../components/common/ReportHeaderActions";
import { asArray, useApiQuery } from "../../api/useApiQuery";
import { useDebouncedValue } from "../../utils/useDebouncedValue";
import { surfacePanel } from "../../styles/common";
import { dateFieldSx } from "../../styles/filters";
import {
  page,
  pageContent,
  pageHeader,
  pageHeaderActions,
  pageHeaderContent,
  pageSubtitle,
  pageTitle,
  tablePageContent,
  tabs,
  tabsContainer,
} from "../../styles/layout";

type AnalysisRow = {
  id: number;
  date: string;
  employee_name: string;
  project: string;
  task: string;
  hours: number;
  status: string;
  rate: number;
  approver_name: string;
};

type ChartPoint = {
  project?: string;
  task?: string;
  employee: string;
  hours: number;
};

type BarChartSeries = {
  label: string;
  data: number[];
};

type AnalysisResponse = {
  filters: {
    start_date: string;
    end_date: string;
    employee_id: string;
    project_id: string;
    task_id: string;
  };
  filter_options: {
    employees: FilterOption[];
    projects: FilterOption[];
    tasks: FilterOption[];
  };
  rows: AnalysisRow[];
  project_employee: ChartPoint[];
  task_employee: ChartPoint[];
};

type DateFilters = {
  startDate: string;
  endDate: string;
  employeeId: string;
  projectId: string;
  taskId: string;
};

type FilterOption = {
  id: number;
  name: string;
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const initialFilters = (): DateFilters => {
  const today = new Date();
  const previousDate = new Date(today);
  previousDate.setDate(today.getDate() - 30);
  return {
    startDate: formatDate(previousDate),
    endDate: formatDate(today),
    employeeId: "",
    projectId: "",
    taskId: "",
  };
};

function aggregateChartRows(rows: ChartPoint[], groupKey: "project" | "task") {
  const groupNames = Array.from(
    new Set(rows.map((row) => row[groupKey] || "Unassigned")),
  );
  const employees = Array.from(
    new Set(rows.map((row) => row.employee || "Unassigned")),
  );

  const series = employees.map((employee) => ({
    label: employee,
    data: groupNames.map((group) => {
      const point = rows.find(
        (row) =>
          (row[groupKey] || "Unassigned") === group &&
          row.employee === employee,
      );
      return point?.hours ?? 0;
    }),
  }));

  return { groupNames, series };
}

function TimesheetBarChart({
  labels,
  series,
}: {
  labels: string[];
  series: BarChartSeries[];
}) {
  const chartElement = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const element = chartElement.current;
    if (!element) return;

    const chart =
      chartInstance.current ??
      echarts.getInstanceByDom(element) ??
      echarts.init(element, undefined, { renderer: "canvas" });
    chartInstance.current = chart;

    chart.setOption(
      {
        animationDuration: 450,
        color: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.info.main,
          theme.palette.error.main,
        ],
        grid: {
          left: 58,
          right: 24,
          top: 54,
          bottom: labels.length > 8 ? 92 : 62,
          containLabel: true,
        },
        legend: {
          top: 8,
          type: "scroll",
          itemWidth: 12,
          itemHeight: 12,
          textStyle: {
            color: theme.palette.text.secondary,
            fontSize: 12,
          },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.divider,
          textStyle: { color: theme.palette.text.primary },
          valueFormatter: (value) =>
            typeof value === "number" ? `${value} hrs` : `${value ?? 0} hrs`,
        },
        xAxis: {
          type: "category",
          data: labels,
          axisLabel: {
            color: theme.palette.text.secondary,
            fontSize: 11,
            interval: 0,
            rotate: labels.length > 5 ? 35 : 0,
            width: 88,
            overflow: "truncate",
          },
          axisLine: { lineStyle: { color: theme.palette.divider } },
          axisTick: { alignWithLabel: true },
        },
        yAxis: {
          type: "value",
          name: "Hours",
          nameTextStyle: {
            color: theme.palette.text.secondary,
            fontSize: 12,
          },
          axisLabel: {
            color: theme.palette.text.secondary,
            fontSize: 11,
          },
          splitLine: {
            lineStyle: { color: theme.palette.divider },
          },
        },
        dataZoom:
          labels.length > 10
            ? [
                {
                  type: "inside",
                  xAxisIndex: 0,
                  filterMode: "none",
                },
                {
                  type: "slider",
                  xAxisIndex: 0,
                  height: 18,
                  bottom: 18,
                  borderColor: theme.palette.divider,
                  fillerColor: theme.palette.action.selected,
                  handleStyle: {
                    color: theme.palette.primary.main,
                  },
                  textStyle: {
                    color: theme.palette.text.secondary,
                  },
                },
              ]
            : [],
        series: series.map((item) => ({
          name: item.label,
          type: "bar",
          data: item.data,
          barMaxWidth: 42,
          emphasis: { focus: "series" },
        })),
      } satisfies EChartsOption,
      true,
    );

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [labels, series, theme]);

  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  const totals = labels.map((label, index) => ({
    name: label,
    value: Number(series.reduce((sum, item) => sum + (item.data[index] ?? 0), 0).toFixed(2)),
  }));

  return (
    <>
      <Box
        ref={chartElement}
        role="img"
        aria-label={`Hours by group. ${summariseSeries(totals, " h")}`}
        sx={{ height: "100%", width: "100%" }}
      />
      <ChartDataTable
        caption="Hours by group and employee"
        rowHeader="Group"
        rows={labels}
        columns={series.map((item) => ({ label: item.label, values: item.data }))}
      />
    </>
  );
}

export default function TimesheetAnalysis() {
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState<DateFilters>(initialFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  // The Filters button; the filter panel drops down from it.
  const [filterButton, setFilterButton] = useState<HTMLButtonElement | null>(null);
  const { exporting, runExport } = useExportStatus();
  // Debounced and cached per filter combination.
  const debouncedFilters = useDebouncedValue(filters);
  const analysisQuery = useApiQuery<AnalysisResponse>(
    "/timesheet-analysis/",
    {
      start_date: debouncedFilters.startDate,
      end_date: debouncedFilters.endDate,
      employee_id: debouncedFilters.employeeId || undefined,
      project_id: debouncedFilters.projectId || undefined,
      task_id: debouncedFilters.taskId || undefined,
    },
  );
  // Skeleton from the moment filters change (including the debounce wait).
  const loading = filters !== debouncedFilters || analysisQuery.isPending;
  const analysis = useMemo<AnalysisResponse>(() => {
    const data = analysisQuery.data;
    return {
      filters: data?.filters ?? {
        start_date: debouncedFilters.startDate,
        end_date: debouncedFilters.endDate,
        employee_id: debouncedFilters.employeeId,
        project_id: debouncedFilters.projectId,
        task_id: debouncedFilters.taskId,
      },
      filter_options: data?.filter_options ?? {
        employees: [],
        projects: [],
        tasks: [],
      },
      rows: asArray(data?.rows),
      project_employee: asArray(data?.project_employee),
      task_employee: asArray(data?.task_employee),
    };
  }, [analysisQuery.data, debouncedFilters]);

  const columns = useMemo<ColumnData<AnalysisRow>[]>(
    () => [
      {
        label: "#",
        width: { xs: 40, sm: 40 },
        render: (_row, index) => index + 1,
        numeric: true,
      },
      { label: "Date", dataKey: "date", width: 120 },
      { label: "Employee", dataKey: "employee_name", width: 180 },
      { label: "Project", dataKey: "project", width: 180 },
      { label: "Task", dataKey: "task", width: "auto" },
      { label: "Hours", dataKey: "hours", width: 90, numeric: true },
      { label: "Status", dataKey: "status", width: 130 },
      {
        label: "Rating",
        dataKey: "rate",
        width: 100,
        numeric: true,
        render: (row) => (row.rate > 0 ? row.rate : "Not rated"),
      },
      { label: "Approver", dataKey: "approver_name", width: 180 },
    ],
    [],
  );

  const projectChart = useMemo(
    () => aggregateChartRows(analysis.project_employee, "project"),
    [analysis.project_employee],
  );
  const taskChart = useMemo(
    () => aggregateChartRows(analysis.task_employee, "task"),
    [analysis.task_employee],
  );

  const updateDate = (field: keyof DateFilters, value: string) => {
    setFilters((current) => {
      if (field === "startDate" && current.endDate && value > current.endDate) {
        return { ...current, startDate: value, endDate: value };
      }
      if (
        field === "endDate" &&
        current.startDate &&
        value < current.startDate
      ) {
        return { ...current, startDate: value, endDate: value };
      }
      return { ...current, [field]: value };
    });
  };

  const updateSelectFilter = (
    field: "employeeId" | "projectId" | "taskId",
    event: SelectChangeEvent,
  ) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }));
  };

  const exportReportToExcel = async () => {
    const XLSX = await loadXlsx();
    const rows = analysis.rows.map((row, index) => ({
      "#": index + 1,
      Date: row.date,
      Employee: row.employee_name,
      Project: row.project,
      Task: row.task,
      Hours: row.hours,
      Status: row.status,
      Rating: row.rate > 0 ? row.rate : "Not rated",
      Approver: row.approver_name,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 14 },
      { wch: 24 },
      { wch: 24 },
      { wch: 34 },
      { wch: 12 },
      { wch: 16 },
      { wch: 10 },
      { wch: 24 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheet Report");
    const fileName = `Timesheet_Analysis_${analysis.filters.start_date}_to_${analysis.filters.end_date}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    return fileName;
  };

  const renderBarChart = (labels: string[], series: BarChartSeries[]) => (
    <Box
      sx={{
        ...surfacePanel,
        height: "100%",
        // Short phones (and landscape) must not force a page-level scroll.
        minHeight: { xs: "min(320px, 60dvh)", sm: 380, md: 440 },
        ...insetSx,
      }}
    >
      {loading ? (
        <Skeleton variant="rounded" sx={{ height: "100%", minHeight: { xs: 240, sm: 340 } }} aria-label="Loading chart" />
      ) : labels.length ? (
        <TimesheetBarChart labels={labels} series={series} />
      ) : (
        <Box sx={{ display: "grid", placeItems: "center", height: "100%", minHeight: { xs: 220, sm: 340 } }}>
          <EmptyTableState
            title="No analysis data for these filters"
            description="Widen the date range or clear the employee, project or task filter."
          />
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={page}>
      <Box sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Typography variant="h5" component="h1" sx={pageTitle}>
              Timesheet Analysis
            </Typography>
            <Typography variant="body2" sx={pageSubtitle}>
              Employee, project, task, hours, status, rating and approver report.
            </Typography>
          </Box>
          <Box sx={pageHeaderActions}>
            <ReportHeaderActions
              onExport={
                tabValue === 0
                  ? () => runExport(exportReportToExcel)
                  : undefined
              }
              exportDisabled={analysis.rows.length === 0 || loading}
              exporting={exporting}
              onFilter={() => setFilterOpen(true)}
              filterButtonRef={setFilterButton}
            />
          </Box>
        </Box>

        <Box sx={tabsContainer}>
          <Tabs
            value={tabValue}
            onChange={(_, value: number) => setTabValue(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={tabs}
          >
            <Tab
              icon={tabValue === 0 ? <AssessmentIcon /> : <AssessmentOutlinedIcon />}
              iconPosition="start"
              label={`Report (${analysis.rows.length})`}
            />
            <Tab
              icon={tabValue === 1 ? <GroupsIcon /> : <GroupsOutlinedIcon />}
              iconPosition="start"
              label="Project vs Employee"
            />
            <Tab
              icon={tabValue === 2 ? <AssignmentIcon /> : <AssignmentOutlinedIcon />}
              iconPosition="start"
              label="Task vs Employee"
            />
          </Tabs>
        </Box>

        <ActiveFilterChips
          onClearAll={() => setFilters(initialFilters())}
          filters={[
            {
              key: "dates",
              label: <DateRange start={filters.startDate} end={filters.endDate} />,
            },
            ...(filters.employeeId
              ? [{
                  key: "employee",
                  label: `Employee: ${analysis.filter_options.employees.find((item) => String(item.id) === filters.employeeId)?.name ?? filters.employeeId}`,
                  onRemove: () => setFilters((current) => ({ ...current, employeeId: "" })),
                }]
              : []),
            ...(filters.projectId
              ? [{
                  key: "project",
                  label: `Project: ${analysis.filter_options.projects.find((item) => String(item.id) === filters.projectId)?.name ?? filters.projectId}`,
                  onRemove: () => setFilters((current) => ({ ...current, projectId: "" })),
                }]
              : []),
            ...(filters.taskId
              ? [{
                  key: "task",
                  label: `Task: ${analysis.filter_options.tasks.find((item) => String(item.id) === filters.taskId)?.name ?? filters.taskId}`,
                  onRemove: () => setFilters((current) => ({ ...current, taskId: "" })),
                }]
              : []),
          ]}
        />

        <Box sx={tablePageContent}>
          {tabValue === 0 && (
            <VirtualizedTable
              columns={columns}
              rows={analysis.rows}
              height="100%"
              tableHead="Timesheet Report"
              tableMinWidth={700}
              loading={loading}
              emptyTitle="No timesheet entries for these filters"
              emptyDescription="Widen the date range or clear a filter."
            />
          )}
          {tabValue === 1 &&
            renderBarChart(projectChart.groupNames, projectChart.series)}
          {tabValue === 2 &&
            renderBarChart(taskChart.groupNames, taskChart.series)}
        </Box>
      </Box>

      <FilterPopover
        open={filterOpen}
        anchorEl={filterButton}
        onClose={() => setFilterOpen(false)}
        title="Timesheet analysis filters"
        onReset={() => setFilters(initialFilters())}
        applyLabel="Show results"
      >
        <Stack spacing={1.5}>
            <DateRangeSummary
              start={filters.startDate}
              end={filters.endDate}
            />
            <TextField
              fullWidth
              label="From"
              type="date"
              value={filters.startDate}
              onChange={(event) => updateDate("startDate", event.target.value)}
              sx={dateFieldSx}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { max: filters.endDate || undefined },
              }}
            />
            <TextField
              fullWidth
              label="To"
              type="date"
              value={filters.endDate}
              onChange={(event) => updateDate("endDate", event.target.value)}
              sx={dateFieldSx}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: filters.startDate || undefined },
              }}
            />
            <FormControl fullWidth size="small">
              <InputLabel id="timesheet-analysis-employee-label">
                Employee
              </InputLabel>
              <Select
                labelId="timesheet-analysis-employee-label"
                label="Employee"
                value={filters.employeeId}
                onChange={(event) => updateSelectFilter("employeeId", event)}
              >
                <MenuItem value="">All Employees</MenuItem>
                {analysis.filter_options.employees.map((employee) => (
                  <MenuItem key={employee.id} value={String(employee.id)}>
                    {employee.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="timesheet-analysis-project-label">
                Project
              </InputLabel>
              <Select
                labelId="timesheet-analysis-project-label"
                label="Project"
                value={filters.projectId}
                onChange={(event) => updateSelectFilter("projectId", event)}
              >
                <MenuItem value="">All Projects</MenuItem>
                {analysis.filter_options.projects.map((project) => (
                  <MenuItem key={project.id} value={String(project.id)}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="timesheet-analysis-task-label">Task</InputLabel>
              <Select
                labelId="timesheet-analysis-task-label"
                label="Task"
                value={filters.taskId}
                onChange={(event) => updateSelectFilter("taskId", event)}
              >
                <MenuItem value="">All Tasks</MenuItem>
                {analysis.filter_options.tasks.map((task) => (
                  <MenuItem key={task.id} value={String(task.id)}>
                    {task.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
        </Stack>
      </FilterPopover>
    </Box>
  );
}
