import {
  Box,
  Checkbox,
  Collapse,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import EmptyTableState from "../../../components/common/EmptyTableState";
import HoursInput from "../../../components/timesheet/HoursInput";
import {
  stickyFirstColumnCell,
  stickyFirstColumnHeaderCell,
  stickyTableCellSx,
  tableContainerSx,
  tableHeaderCellSx,
  tableHeadSx,
  tableWithMinWidthSx,
} from "../../../styles/common";
import { formatHoursMinutes } from "../../../utils/hoursMinutes";
import type {
  AssignedTask,
  Milestone,
  SubmissionProject,
} from "../../../types/dataTypes";
import {
  getMilestoneDayTotal,
  getMilestoneTotal,
  getProjectDayTotal,
  getProjectTotal,
  getSelectableProjectAssignedTaskIds,
  getTaskTotal,
  isOthersProject,
  type TaskRef,
  type WeekDay,
} from "./timesheetMath";

const columnWidths = {
  job: { xs: 200, sm: 300 },
  budgetOwner: 160,
  day: 100,
  total: 90,
  select: 70,
};

/** Same minimum width for the outer grid and each job's nested table, so columns line up. */
const gridMinWidth = { xs: 1180, md: 1320, lg: 1450 };

export type BudgetOwnerOption = { value: string; label: string };

/** Everything the rows need from the page. */
export interface SubmissionGridProps {
  projects: SubmissionProject[];
  weekDays: WeekDay[];
  weekDayTotals: { date: string; hours: number }[];
  weekTotal: number;
  expandedProjects: number[];
  expandedMilestones: number[];
  onToggleProject: (projectId: number) => void;
  onToggleMilestone: (milestoneId: number) => void;
  selectedAssignedTaskIds: number[];
  onAssignedTaskSelectionChange: (
    assignedTaskId: number,
    checked: boolean,
  ) => void;
  canEditDate: (date: string, project: SubmissionProject) => boolean;
  budgetOwnerOptions: BudgetOwnerOption[];
  budgetOwnerDisabled: boolean;
  onHoursChange: (ref: TaskRef, date: string, value: string) => void;
  onBudgetOwnerChange: (ref: TaskRef, owner: string) => void;
}

/**
 * Read-only per-day roll-up shown in a collapsed job/milestone row. Same
 * `0.00` format as the hour fields; days with no hours show a muted dash.
 */
function DayHoursSummary({
  seconds,
  label,
}: {
  seconds: number;
  label: string;
}) {
  const hours = formatHoursMinutes(seconds);
  return seconds > 0 ? (
    <Typography
      component="span"
      variant="body2"
      aria-label={`${label}: ${hours} hours`}
      sx={{
        fontWeight: 600,
        color: "text.primary",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {hours}
    </Typography>
  ) : (
    <Typography
      component="span"
      variant="body2"
      aria-label={`${label}: no hours`}
      sx={{ color: "text.disabled" }}
    >
      –
    </Typography>
  );
}

const cellSx = (theme: Theme, width: number | object) => ({
  ...stickyTableCellSx(theme),
  width,
  minWidth: width,
});

function ExpandToggle({
  expanded,
  label,
  onToggle,
}: {
  expanded: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <IconButton
      size="small"
      aria-label={`${expanded ? "Collapse" : "Expand"} ${label}`}
      aria-expanded={expanded}
      onClick={onToggle}
    >
      {expanded ? <ExpandMoreOutlinedIcon /> : <ChevronRightOutlinedIcon />}
    </IconButton>
  );
}

// ---------------------------------------------------------------------------
// Header and footer
// ---------------------------------------------------------------------------

function GridHeader({ weekDays }: { weekDays: WeekDay[] }) {
  const theme = useTheme();
  return (
    <TableHead sx={tableHeadSx(theme)}>
      <TableRow>
        <TableCell
          sx={{
            ...stickyFirstColumnHeaderCell(theme),
            width: columnWidths.job,
            minWidth: columnWidths.job,
          }}
          className="timesheet-jobs-cell"
        >
          Jobs
        </TableCell>
        <TableCell
          sx={{
            ...tableHeaderCellSx(theme),
            width: columnWidths.budgetOwner,
            minWidth: columnWidths.budgetOwner,
          }}
        >
          Budget Owner
        </TableCell>
        {weekDays.map((day) => (
          <TableCell
            key={day.date}
            align="center"
            sx={{
              ...tableHeaderCellSx(theme),
              // tableHeaderCellSx defaults to left-aligned labels; the hour
              // columns are centred in every row, header included.
              textAlign: "center",
              width: columnWidths.day,
              minWidth: columnWidths.day,
            }}
          >
            {day.label}
          </TableCell>
        ))}
        <TableCell
          align="center"
          sx={{
            ...tableHeaderCellSx(theme),
            textAlign: "center",
            width: columnWidths.total,
            minWidth: columnWidths.total,
          }}
        >
          Total
        </TableCell>
        <TableCell
          align="center"
          sx={{
            ...tableHeaderCellSx(theme),
            width: columnWidths.select,
            minWidth: columnWidths.select,
          }}
        >
          Actions
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

function GridFooter({
  weekDayTotals,
  weekTotal,
}: {
  weekDayTotals: { date: string; hours: number }[];
  weekTotal: number;
}) {
  const theme = useTheme();
  const footerCell = (width: number | object, bold = true) => ({
    ...cellSx(theme, width),
    ...(bold && { fontWeight: 700 }),
    bgcolor: "background.default",
    borderTop: `1px solid ${theme.palette.divider}`,
  });
  return (
    <TableFooter>
      <TableRow>
        <TableCell
          sx={{
            ...stickyFirstColumnCell(theme),
            width: columnWidths.job,
            minWidth: columnWidths.job,
            fontWeight: 700,
            bgcolor: "background.default",
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
          className="timesheet-jobs-cell"
        >
          Total
        </TableCell>
        <TableCell sx={footerCell(columnWidths.budgetOwner, false)} />
        {weekDayTotals.map((dayTotal) => (
          <TableCell
            key={dayTotal.date}
            align="center"
            sx={footerCell(columnWidths.day)}
          >
            {formatHoursMinutes(dayTotal.hours)}
          </TableCell>
        ))}
        <TableCell align="center" sx={footerCell(columnWidths.total)}>
          {formatHoursMinutes(weekTotal)}
        </TableCell>
        <TableCell align="center" sx={footerCell(columnWidths.select, false)} />
      </TableRow>
    </TableFooter>
  );
}

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------

function TaskRow({
  project,
  milestone,
  task,
  ...props
}: SubmissionGridProps & {
  project: SubmissionProject;
  milestone: Milestone;
  task: AssignedTask;
}) {
  const theme = useTheme();
  const ref: TaskRef = {
    projectId: project.id,
    milestoneId: milestone.id,
    taskId: task.assign_id,
  };
  const others = isOthersProject(project);

  return (
    <TableRow>
      <TableCell
        sx={{
          ...stickyFirstColumnCell(theme),
          width: columnWidths.job,
          minWidth: columnWidths.job,
        }}
        className="timesheet-jobs-cell"
      >
        <Box sx={{ fontSize: "0.875rem", pl: 10 }}>{task.name}</Box>
      </TableCell>

      <TableCell sx={{ ...cellSx(theme, columnWidths.budgetOwner), p: 0.6 }}>
        <FormControl size="small" fullWidth>
          <Select
            value={task.assign_by ?? ""}
            disabled={others || props.budgetOwnerDisabled}
            onChange={(event) =>
              props.onBudgetOwnerChange(ref, event.target.value)
            }
            inputProps={{ "aria-label": `Budget owner for ${task.name}` }}
            sx={{ fontSize: "0.8rem" }}
          >
            {props.budgetOwnerOptions.map((owner) => (
              <MenuItem
                key={owner.value}
                value={owner.value}
                sx={{ fontSize: "0.8rem" }}
              >
                {owner.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </TableCell>

      {props.weekDays.map((day) => (
        <TableCell
          key={day.date}
          align="center"
          sx={{ width: columnWidths.day, minWidth: columnWidths.day, p: 0.6 }}
        >
          <HoursInput
            value={task.entries[day.date] ?? ""}
            disabled={!props.canEditDate(day.date, project)}
            ariaLabel={`${task.name}, ${day.label}`}
            onChange={(next) => props.onHoursChange(ref, day.date, next)}
            sx={{
              width: 90,
              "& .MuiOutlinedInput-root.Mui-disabled": {
                bgcolor: theme.palette.action.disabledBackground,
                cursor: "not-allowed",
              },
              "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: theme.palette.action.disabled,
                },
              "& input": { textAlign: "center", py: 0.8 },
              "& .MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: theme.palette.text.disabled,
                cursor: "not-allowed",
              },
            }}
          />
        </TableCell>
      ))}

      <TableCell
        align="center"
        sx={{ ...cellSx(theme, columnWidths.total), fontWeight: 600 }}
      >
        {formatHoursMinutes(getTaskTotal(task, props.weekDays))}
      </TableCell>

      <TableCell
        align="center"
        sx={{ width: columnWidths.select, minWidth: columnWidths.select }}
      >
        {!others && (
          <Checkbox
            size="small"
            checked={props.selectedAssignedTaskIds.includes(task.assign_id)}
            onChange={(event) =>
              props.onAssignedTaskSelectionChange(
                task.assign_id,
                event.target.checked,
              )
            }
            inputProps={{ "aria-label": `Select ${task.name}` }}
          />
        )}
      </TableCell>
    </TableRow>
  );
}

function MilestoneRows({
  project,
  milestone,
  ...props
}: SubmissionGridProps & { project: SubmissionProject; milestone: Milestone }) {
  const theme = useTheme();
  const expanded = props.expandedMilestones.includes(milestone.id);

  return (
    <>
      <TableRow>
        <TableCell
          sx={{
            ...stickyFirstColumnCell(theme),
            width: columnWidths.job,
            minWidth: columnWidths.job,
          }}
          className="timesheet-jobs-cell"
        >
          <Box sx={{ display: "flex", alignItems: "center", pl: 5 }}>
            <ExpandToggle
              expanded={expanded}
              label={milestone.name}
              onToggle={() => props.onToggleMilestone(milestone.id)}
            />
            <Box sx={{ fontSize: "0.875rem" }}>{milestone.name}</Box>
          </Box>
        </TableCell>

        <TableCell sx={cellSx(theme, columnWidths.budgetOwner)} />

        {props.weekDays.map((day) => (
          <TableCell
            key={day.date}
            align="center"
            sx={cellSx(theme, columnWidths.day)}
          >
            {/* Collapsed: show the milestone's hours per day, since its hour
                fields are hidden. Expanded: the fields show them. */}
            {!expanded && (
              <DayHoursSummary
                seconds={getMilestoneDayTotal(milestone, day.date)}
                label={`${milestone.name} on ${day.label}`}
              />
            )}
          </TableCell>
        ))}

        <TableCell
          align="center"
          sx={{ ...cellSx(theme, columnWidths.total), fontWeight: 600 }}
        >
          {formatHoursMinutes(getMilestoneTotal(milestone, props.weekDays))}
        </TableCell>

        <TableCell align="center" sx={cellSx(theme, columnWidths.select)} />
      </TableRow>

      {expanded &&
        milestone.assigned_tasks.map((task) => (
          <TaskRow
            key={task.assign_id}
            {...props}
            project={project}
            milestone={milestone}
            task={task}
          />
        ))}
    </>
  );
}

function ProjectRows({
  project,
  ...props
}: SubmissionGridProps & { project: SubmissionProject }) {
  const theme = useTheme();
  const expanded = props.expandedProjects.includes(project.id);
  const selectableIds = getSelectableProjectAssignedTaskIds(project);
  const selectedCount = selectableIds.filter((id) =>
    props.selectedAssignedTaskIds.includes(id),
  ).length;
  const allSelected =
    selectableIds.length > 0 && selectedCount === selectableIds.length;
  const someSelected =
    selectedCount > 0 && selectedCount < selectableIds.length;

  return (
    <>
      <TableRow>
        <TableCell
          sx={{
            ...stickyFirstColumnCell(theme),
            width: columnWidths.job,
            minWidth: columnWidths.job,
            fontWeight: 600,
          }}
          className="timesheet-jobs-cell"
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ExpandToggle
              expanded={expanded}
              label={project.code}
              onToggle={() => props.onToggleProject(project.id)}
            />
            <Box>
              <Box sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                {project.description}
              </Box>
              <Box sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                {project.code}
              </Box>
            </Box>
          </Box>
        </TableCell>

        <TableCell sx={cellSx(theme, columnWidths.budgetOwner)} />

        {props.weekDays.map((day) => (
          <TableCell
            key={day.date}
            align="center"
            sx={cellSx(theme, columnWidths.day)}
          >
            {/* Collapsed: show the job's hours per day, since its hour fields
                are hidden. Expanded: the fields show them. */}
            {!expanded && (
              <DayHoursSummary
                seconds={getProjectDayTotal(project, day.date)}
                label={`${project.code} on ${day.label}`}
              />
            )}
          </TableCell>
        ))}

        <TableCell
          align="center"
          sx={{ ...cellSx(theme, columnWidths.total), fontWeight: 600 }}
        >
          {formatHoursMinutes(getProjectTotal(project, props.weekDays))}
        </TableCell>

        <TableCell align="center" sx={cellSx(theme, columnWidths.select)}>
          <Checkbox
            size="small"
            checked={allSelected}
            indeterminate={someSelected}
            disabled={isOthersProject(project) || selectableIds.length === 0}
            onChange={(event) =>
              selectableIds.forEach((taskId) =>
                props.onAssignedTaskSelectionChange(
                  taskId,
                  event.target.checked,
                ),
              )
            }
            inputProps={{
              "aria-label": `Select all tasks for ${project.description || project.code}`,
            }}
          />
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow>
          {/* p: 0 keeps the nested table's columns aligned with the grid's. */}
          <TableCell
            colSpan={2 + props.weekDays.length + 2}
            sx={{ p: 0, borderBottom: 0 }}
          >
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Table
                sx={{
                  ...tableWithMinWidthSx(gridMinWidth),
                  "& .timesheet-jobs-cell": { padding: "4px 0px" },
                }}
              >
                <TableBody>
                  {project.milestones.map((milestone) => (
                    <MilestoneRows
                      key={milestone.id}
                      {...props}
                      project={project}
                      milestone={milestone}
                    />
                  ))}
                </TableBody>
              </Table>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Grid
// ---------------------------------------------------------------------------

/** Desktop/tablet week grid: jobs → milestones → tasks × days, with totals. */
export default function SubmissionGrid(props: SubmissionGridProps) {
  const { projects, weekDays } = props;

  return (
    <>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: { xs: "none", sm: "block" }, px: 1, pb: 0.75 }}
      >
        Enter hours and minutes, for example <strong>1:30</strong> for 1 hour 30 minutes.
        You can also enter <strong>1.30</strong>.
        <Box component="span" sx={{ display: { sm: "inline", lg: "none" } }}>
          {" "}
          Scroll sideways to see every day and action; the Jobs column stays pinned.
        </Box>
      </Typography>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          ...tableContainerSx,
        }}
      >
        <Table
          sx={{
            ...tableWithMinWidthSx(gridMinWidth),
            "& .timesheet-jobs-cell": { padding: "4px 8px" },
          }}
        >
          <GridHeader weekDays={weekDays} />

          <TableBody>
            {projects.map((project) => (
              <ProjectRows key={project.id} {...props} project={project} />
            ))}
            {projects.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={weekDays.length + 4}
                  sx={{ py: 4, borderBottom: 0 }}
                >
                  <Box sx={{ display: "grid", placeItems: "center" }}>
                    <EmptyTableState
                      title="No timesheet entries"
                      description="Jobs and assigned ticket work for the selected week will appear here."
                    />
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          <GridFooter
            weekDayTotals={props.weekDayTotals}
            weekTotal={props.weekTotal}
          />
        </Table>
      </TableContainer>
    </>
  );
}
