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
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import EmptyTableState from "@/components/common/EmptyTableState";
import HoursInput from "@/components/timesheet/HoursInput";
import {
  expandToggleSpacerSx,
  tableHeadSx,
  timesheetCellTextSx,
} from "@/styles/common";
import { formatHoursMinutes } from "@/utils/hoursMinutes";
import type {
  AssignedTask,
  Milestone,
  SubmissionProject,
} from "@/types/dataTypes";
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
} from "@/pages/timesheet/submission/timesheetMath";
import {
  timesheetColumnWidths as columnWidths,
  timesheetCellSx,
  timesheetDayCellSx,
  timesheetDayFooterCellSx,
  timesheetDayHeaderCellSx,
  timesheetDayHoursEmptySx,
  timesheetDayHoursSx,
  timesheetDayInputCellSx,
  timesheetEmptyCellSx,
  timesheetEmptyStateSx,
  timesheetFooterCellSx,
  timesheetGridContainerSx,
  timesheetGridTableSx,
  timesheetHintScrollSx,
  timesheetHintSx,
  timesheetHoursInputSx,
  timesheetJobCellSx,
  timesheetJobFooterCellSx,
  timesheetJobHeaderCellSx,
  timesheetMilestoneNameSx,
  timesheetNestedRowCellSx,
  timesheetNestedTableSx,
  timesheetOwnerCellSx,
  timesheetOwnerHeaderCellSx,
  timesheetProjectCodeSx,
  timesheetProjectNameRowSx,
  timesheetProjectTitleSx,
  timesheetSelectAllSx,
  timesheetSelectCellSx,
  timesheetSelectFooterCellSx,
  timesheetSelectHeaderCellSx,
  timesheetSmallTextSx,
  timesheetTaskNameSx,
  timesheetTaskSelectCellSx,
  timesheetTotalCellSx,
  timesheetTotalFooterCellSx,
  timesheetTotalHeaderCellSx,
} from "@/styles/timesheet";

export type BudgetOwnerOption = { value: string; label: string };

/** Everything the rows need from the page. */
export interface SubmissionGridProps {
  projects: SubmissionProject[];
  weekDays: WeekDay[];
  estimatedWeekHours: number;
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
      sx={timesheetDayHoursSx}
    >
      {hours}
    </Typography>
  ) : (
    <Typography
      component="span"
      variant="body2"
      aria-label={`${label}: no hours`}
      sx={timesheetDayHoursEmptySx}
    >
      –
    </Typography>
  );
}

function ExpandToggle({
  expanded,
  label,
  onToggle,
  empty = false,
}: {
  expanded: boolean;
  label: string;
  onToggle: () => void;
  /** No children: keep the indent but show no (dead) chevron. */
  empty?: boolean;
}) {
  if (empty) return <Box sx={expandToggleSpacerSx} aria-hidden="true" />;
  return (
    <IconButton
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

function GridHeader({
  weekDays,
  estimatedWeekHours,
}: {
  weekDays: WeekDay[];
  estimatedWeekHours: number;
}) {
  const theme = useTheme();
  return (
    <TableHead sx={tableHeadSx(theme)}>
      <TableRow>
        <TableCell
          sx={timesheetJobHeaderCellSx(theme)}
          className="timesheet-jobs-cell"
        >
          Jobs
        </TableCell>
        <TableCell
          sx={timesheetOwnerHeaderCellSx(theme)}
        >
          Budget Owner
        </TableCell>
        {weekDays.map((day) => (
          <TableCell
            key={day.date}
            align="center"
            sx={timesheetDayHeaderCellSx(theme, day.date, estimatedWeekHours)}
          >
            {day.label}
          </TableCell>
        ))}
        <TableCell
          align="center"
          sx={timesheetTotalHeaderCellSx(theme)}
        >
          Total
        </TableCell>
        <TableCell
          align="center"
          sx={timesheetSelectHeaderCellSx(theme)}
        ></TableCell>
      </TableRow>
    </TableHead>
  );
}

function GridFooter({
  weekDayTotals,
  weekTotal,
  estimatedWeekHours,
}: {
  weekDayTotals: { date: string; hours: number }[];
  weekTotal: number;
  estimatedWeekHours: number;
}) {
  const theme = useTheme();
  return (
    <TableFooter>
      <TableRow>
        <TableCell
          sx={timesheetJobFooterCellSx(theme)}
          className="timesheet-jobs-cell"
        >
          Total
        </TableCell>
        <TableCell sx={timesheetFooterCellSx(theme, columnWidths.budgetOwner, false)} />
        {weekDayTotals.map((dayTotal) => (
          <TableCell
            key={dayTotal.date}
            align="center"
            sx={timesheetDayFooterCellSx(theme, dayTotal.date, estimatedWeekHours)}
          >
            {formatHoursMinutes(dayTotal.hours)}
          </TableCell>
        ))}
        <TableCell
          align="center"
          sx={timesheetTotalFooterCellSx(theme)}
        >
          {formatHoursMinutes(weekTotal)}
        </TableCell>
        <TableCell
          align="center"
          sx={timesheetSelectFooterCellSx(theme)}
        />
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
        sx={timesheetJobCellSx(theme)}
        className="timesheet-jobs-cell"
      >
        <Box sx={timesheetTaskNameSx}>{task.name}</Box>
      </TableCell>

      <TableCell sx={timesheetOwnerCellSx(theme)}>
        <FormControl fullWidth>
          <Select
            value={task.assign_by ?? ""}
            disabled={props.budgetOwnerDisabled}
            onChange={(event) =>
              props.onBudgetOwnerChange(ref, event.target.value)
            }
            inputProps={{ "aria-label": `Budget owner for ${task.name}` }}
            sx={timesheetSmallTextSx}
          >
            {props.budgetOwnerOptions.map((owner) => (
              <MenuItem
                key={owner.value}
                value={owner.value}
                sx={timesheetSmallTextSx}
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
          sx={timesheetDayInputCellSx(theme, day.date, props.estimatedWeekHours)}
        >
          <HoursInput
            value={task.entries[day.date] ?? ""}
            disabled={!props.canEditDate(day.date, project)}
            ariaLabel={`${task.name}, ${day.label}`}
            onChange={(next) => props.onHoursChange(ref, day.date, next)}
            sx={timesheetHoursInputSx(theme)}
          />
        </TableCell>
      ))}

      <TableCell
        align="center"
        sx={timesheetTotalCellSx(theme)}
      >
        {formatHoursMinutes(getTaskTotal(task, props.weekDays))}
      </TableCell>

      <TableCell
        align="center"
        sx={timesheetTaskSelectCellSx(theme)}
      >
        {!others && (
          <Checkbox
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
          sx={timesheetJobCellSx(theme)}
          className="timesheet-jobs-cell"
        >
          <Box sx={timesheetMilestoneNameSx}>
            <ExpandToggle
              expanded={expanded}
              label={milestone.name}
              onToggle={() => props.onToggleMilestone(milestone.id)}
            />
            <Box sx={timesheetCellTextSx}>{milestone.name}</Box>
          </Box>
        </TableCell>

        <TableCell sx={timesheetCellSx(theme, columnWidths.budgetOwner)} />

        {props.weekDays.map((day) => (
          <TableCell
            key={day.date}
            align="center"
            sx={timesheetDayCellSx(theme, day.date, props.estimatedWeekHours)}
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
          sx={timesheetTotalCellSx(theme)}
        >
          {!expanded &&
            formatHoursMinutes(getMilestoneTotal(milestone, props.weekDays))}
        </TableCell>

        <TableCell
          align="center"
          sx={timesheetSelectCellSx(theme)}
        />
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
          sx={timesheetJobCellSx(theme, true)}
          className="timesheet-jobs-cell"
        >
          <Box sx={timesheetProjectNameRowSx}>
            <ExpandToggle
              expanded={expanded}
              label={project.code}
              onToggle={() => props.onToggleProject(project.id)}
              empty={project.milestones.length === 0}
            />
            <Box>
              <Box sx={timesheetProjectTitleSx}>
                {project.description}
              </Box>
              <Box sx={timesheetProjectCodeSx}>
                {project.code}
              </Box>
            </Box>
          </Box>
        </TableCell>

        <TableCell sx={timesheetCellSx(theme, columnWidths.budgetOwner)} />

        {props.weekDays.map((day) => (
          <TableCell
            key={day.date}
            align="center"
            sx={timesheetDayCellSx(theme, day.date, props.estimatedWeekHours)}
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
          sx={timesheetTotalCellSx(theme)}
        >
          {!expanded &&
            formatHoursMinutes(getProjectTotal(project, props.weekDays))}
        </TableCell>

        <TableCell
          align="center"
          sx={timesheetSelectCellSx(theme)}
        >
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={(event) =>
              selectableIds.forEach((taskId) =>
                props.onAssignedTaskSelectionChange(
                  taskId,
                  event.target.checked,
                ),
              )
            }
            sx={timesheetSelectAllSx(
              !isOthersProject(project) && selectableIds.length > 0,
            )}
            inputProps={{
              "aria-label": `Select all tasks for ${project.description || project.code}`,
            }}
          />
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow>
          <TableCell
            colSpan={2 + props.weekDays.length + 2}
            sx={timesheetNestedRowCellSx}
          >
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Table
                sx={timesheetNestedTableSx}
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
  const theme = useTheme();

  return (
    <>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={timesheetHintSx}
      >
        Enter hours as <strong>h.mm</strong> (for example, <strong>1.30</strong>{" "}
        = 1 h 30 m). The <strong>h:mm</strong> format is also accepted.
        <Box component="span" sx={timesheetHintScrollSx}>
          {" "}
          Scroll sideways for all days; Jobs, Total, and Select stay pinned.
        </Box>
      </Typography>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={timesheetGridContainerSx(theme)}
      >
        <Table
          sx={timesheetGridTableSx}
        >
          <GridHeader
            weekDays={weekDays}
            estimatedWeekHours={props.estimatedWeekHours}
          />

          <TableBody>
            {projects.map((project) => (
              <ProjectRows key={project.id} {...props} project={project} />
            ))}
            {projects.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={weekDays.length + 4}
                  sx={timesheetEmptyCellSx}
                >
                  <Box sx={timesheetEmptyStateSx}>
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
            estimatedWeekHours={props.estimatedWeekHours}
          />
        </Table>
      </TableContainer>
    </>
  );
}
