import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
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
  TextField,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { useTheme } from "@mui/material/styles";
import * as echarts from "echarts";
import * as XLSX from "xlsx";
import {
  VirtualizedTable,
  type ColumnData,
} from "../../components/common/TableView";
import api from "../../api/axios";
import {
  dateFieldSx,
  dialogContentTop,
  marginBottomSectionSx,
  page,
  pageContent,
  pageHeader,
  pageHeaderActions,
  pageHeaderContent,
  pageSubtitle,
  pageTitle,
  surfacePanel,
  tablePageContent,
  tabs,
  tabsContainer,
} from "../../styles/common";

type AnalysisRow = Record<string, unknown> & {
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
  const chartInstance = useRef<echarts.ECharts | null>(null);
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
      } satisfies echarts.EChartsOption,
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

  return <Box ref={chartElement} sx={{ height: '100%', width: "100%" }} />;
}

export default function TimesheetAnalysis() {
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState<DateFilters>(initialFilters);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse>({
    filters: {
      start_date: filters.startDate,
      end_date: filters.endDate,
      employee_id: filters.employeeId,
      project_id: filters.projectId,
      task_id: filters.taskId,
    },
    filter_options: {
      employees: [],
      projects: [],
      tasks: [],
    },
    rows: [],
    project_employee: [],
    task_employee: [],
  });

  useEffect(() => {
    let active = true;

    void api
      .get<AnalysisResponse>("/timesheet-analysis/", {
        params: {
          start_date: filters.startDate,
          end_date: filters.endDate,
          employee_id: filters.employeeId || undefined,
          project_id: filters.projectId || undefined,
          task_id: filters.taskId || undefined,
        },
      })
      .then((response) => {
        if (!active) return;

        setAnalysis({
          filters: response.data.filters,
          filter_options: response.data.filter_options ?? {
            employees: [],
            projects: [],
            tasks: [],
          },
          rows: Array.isArray(response.data.rows) ? response.data.rows : [],
          project_employee: Array.isArray(response.data.project_employee)
            ? response.data.project_employee
            : [],
          task_employee: Array.isArray(response.data.task_employee)
            ? response.data.task_employee
            : [],
        });
      });

    return () => {
      active = false;
    };
  }, [
    filters.employeeId,
    filters.endDate,
    filters.projectId,
    filters.startDate,
    filters.taskId,
  ]);

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
      { label: "Rate", dataKey: "rate", width: 80, numeric: true },
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

  const exportReportToExcel = () => {
    const rows = analysis.rows.map((row, index) => ({
      "#": index + 1,
      Date: row.date,
      Employee: row.employee_name,
      Project: row.project,
      Task: row.task,
      Hours: row.hours,
      Status: row.status,
      Rate: row.rate,
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
    XLSX.writeFile(
      workbook,
      `Timesheet_Analysis_${analysis.filters.start_date}_to_${analysis.filters.end_date}.xlsx`,
    );
  };

  const renderBarChart = (labels: string[], series: BarChartSeries[]) => (
    <Box sx={{ ...surfacePanel, height: "100%", minHeight: 440, p: 2 }}>
      {labels.length ? (
        <TimesheetBarChart labels={labels} series={series} />
      ) : (
        <Box sx={{ display: "grid", placeItems: "center", height: 360 }}>
          <Typography color="text.secondary">
            No analysis data found.
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={page}>
      <Box component="main" sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Typography variant="h5" sx={pageTitle}>
              Timesheet Analysis
            </Typography>
            <Typography variant="body2" sx={pageSubtitle}>
              Employee, project, task, hours, status, rating and approver report.
            </Typography>
          </Box>
          <Box sx={pageHeaderActions}>
            <Button
              variant="outlined"
              startIcon={<FilterListOutlinedIcon />}
              onClick={() => setFilterDialogOpen(true)}
            >
              Filters
            </Button>
            {tabValue === 0 && (
              <Button
                variant="contained"
                startIcon={<DownloadOutlinedIcon />}
                onClick={exportReportToExcel}
                disabled={analysis.rows.length === 0}
              >
                Export Excel
              </Button>
            )}
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
            <Tab label={`Report (${analysis.rows.length})`} />
            <Tab label="Project vs Employee" />
            <Tab label="Task vs Employee" />
          </Tabs>
        </Box>

        <Box sx={tablePageContent}>
          {tabValue === 0 && (
            <VirtualizedTable
              columns={columns}
              rows={analysis.rows}
              height="100%"
              tableHead="Timesheet Report"
              tableHeadSub={`${analysis.filters.start_date} to ${analysis.filters.end_date}`}
              tableMinWidth={700}
            />
          )}
          {tabValue === 1 &&
            renderBarChart(projectChart.groupNames, projectChart.series)}
          {tabValue === 2 &&
            renderBarChart(taskChart.groupNames, taskChart.series)}
        </Box>
      </Box>

      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">Timesheet analysis filters</Typography>
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
              size="small"
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
