import { useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { formatDate } from "@/components/common/formatDate";
import { hoursMinutesToSeconds } from "@/utils/hoursMinutes";
import { insetSx, RADIUS_PX } from "@/styles/tokens";
import {
  Box,
  ButtonBase,
  Checkbox,
  Collapse,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmptyTableState from "@/components/common/EmptyTableState";
import type { AssignedTask, Milestone, SubmissionProject } from "@/types/dataTypes";
import {
  mobileDayEntryEmptySx,
  mobileDayEntryHintSx,
  mobileDayEntryListSx,
  mobileDayEntryNavSx,
  mobileDayEntryOwnerFieldSx,
  mobileDayEntryOwnerLabelSx,
  mobileDayEntrySelectLabelSx,
  mobileDayEntrySx,
  mobileDayEntryTaskNameSx,
  mobileDayJobSx,
  mobileDayStepArrowSx,
  mobileDayStripSx,
  mobileDayTaskListSx,
  mobileDayToggleRowSx,
  wrapAnywhereSx,
} from "@/styles/common";

type WeekDay = { label: string; date: string };
type OwnerOption = { value: string; label: string };

interface MobileDayEntryProps {
  /** The jobs to show, already filtered by the search. */
  projects: SubmissionProject[];
  /** A search is active: every match stays open, so there is nothing to toggle. */
  searching: boolean;
  searchField: ReactNode;
  weekDays: WeekDay[];
  /** Seconds entered per day, aligned with `weekDays`. */
  dayTotals: number[];
  weekTotalLabel: string;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  formatHours: (seconds: number) => string;
  taskWeekTotal: (task: AssignedTask) => number;
  canEditDate: (date: string, project: SubmissionProject) => boolean;
  isOthersProject: (project: SubmissionProject) => boolean;
  budgetOwnerOptions: OwnerOption[];
  budgetOwnerDisabled: boolean;
  onHoursChange: (projectId: number, milestoneId: number, taskId: number, date: string, value: string) => void;
  onBudgetOwnerChange: (projectId: number, milestoneId: number, taskId: number, owner: string) => void;
  selectedAssignedTaskIds: number[];
  onAssignedTaskSelectionChange: (assignedTaskId: number, checked: boolean) => void;
}

/**
 * Phone layout for timesheet submission: pick one day, then enter hours task
 * by task. Budget owner, the day total and the week total stay in view
 * without a horizontal scan across a 1,180px grid.
 */
export default function MobileDayEntry({
  projects,
  searching,
  searchField,
  weekDays,
  dayTotals,
  weekTotalLabel,
  activeIndex,
  onActiveIndexChange,
  formatHours,
  taskWeekTotal,
  canEditDate,
  isOthersProject,
  budgetOwnerOptions,
  budgetOwnerDisabled,
  onHoursChange,
  onBudgetOwnerChange,
  selectedAssignedTaskIds,
  onAssignedTaskSelectionChange,
}: MobileDayEntryProps) {
  const activeDay = weekDays[activeIndex] ?? weekDays[0];

  // One job open at a time (this view is used below 1200px, where several
  // open jobs push each other's tasks out of view). Milestones toggle freely.
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [expandedMilestones, setExpandedMilestones] = useState<string[]>([]);
  const jobRefs = useRef(new Map<number, HTMLDivElement>());
  const toggle = <K,>(set: Dispatch<SetStateAction<K[]>>, key: K) =>
    set((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));

  const toggleProject = (project: SubmissionProject) => {
    if (expandedProject === project.id) {
      setExpandedProject(null);
      return;
    }
    setExpandedProject(project.id);
    // A single milestone opens with its job, so the tasks show straight away.
    if (project.milestones.length === 1) {
      const key = `${project.id}-${project.milestones[0].id}`;
      setExpandedMilestones((current) => (current.includes(key) ? current : [...current, key]));
    }
  };

  // Bring the newly opened job to the top of the list once it has expanded
  // (the previous one collapses at the same time and would shift it).
  useEffect(() => {
    if (expandedProject === null) return;
    const timer = window.setTimeout(() => {
      jobRefs.current.get(expandedProject)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 320);
    return () => window.clearTimeout(timer);
  }, [expandedProject]);

  return (
    <Box sx={mobileDayEntrySx}>
      {/* One hint for the whole day, as above the week grid (not per field). */}
      <Typography variant="body2" color="text.secondary">
        Enter hours as <strong>h.mm</strong> (for example, <strong>1.30</strong>{" "}
        = 1 h 30 m). The <strong>h:mm</strong> format is also accepted.
      </Typography>

      {/* Day stepper */}
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <IconButton
          aria-label="Previous day"
          disabled={activeIndex === 0}
          onClick={() => onActiveIndexChange(activeIndex - 1)}
          sx={mobileDayStepArrowSx}
        >
          <ChevronLeftOutlinedIcon />
        </IconButton>
        <Box
          role="tablist"
          aria-label="Day of week"
          sx={mobileDayStripSx(weekDays.length)}
        >
          {weekDays.map((day, index) => {
            const selected = index === activeIndex;
            const hasHours = (dayTotals[index] ?? 0) > 0;
            return (
              <ButtonBase
                key={day.date}
                role="tab"
                aria-selected={selected}
                aria-label={`${day.label} ${day.date}, ${formatHours(dayTotals[index] ?? 0)} hours`}
                onClick={() => onActiveIndexChange(index)}
                sx={(theme) => ({
                  flexDirection: "column",
                  minWidth: 0,
                  overflow: "hidden",
                  py: 0.5,
                  borderRadius: RADIUS_PX.md,
                  border: 1,
                  borderColor: selected ? "primary.main" : "divider",
                  bgcolor: selected
                    ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.12 : 0.1)
                    : "background.paper",
                  color: selected ? "primary.main" : "text.primary",
                  "&.Mui-focusVisible": { outline: "2px solid", outlineColor: "primary.main" },
                })}
              >
                <Typography variant="caption" fontWeight={600} lineHeight={1.2} noWrap>
                  {day.label.slice(0, 3)}
                </Typography>
                <Typography variant="caption" lineHeight={1.2} noWrap color={hasHours ? "inherit" : "text.secondary"}>
                  {formatHours(dayTotals[index] ?? 0)}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
        <IconButton
          sx={mobileDayStepArrowSx}
          aria-label="Next day"
          disabled={activeIndex >= weekDays.length - 1}
          onClick={() => onActiveIndexChange(activeIndex + 1)}
        >
          <ChevronRightOutlinedIcon />
        </IconButton>
      </Stack>

      <Stack direction="row" justifyContent="space-between" sx={mobileDayEntryNavSx}>
        <Typography variant="body2" fontWeight={600}>
          {activeDay?.label} · {activeDay?.date ? formatDate(activeDay.date) : ""}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Day {formatHours(dayTotals[activeIndex] ?? 0)} h · Week {weekTotalLabel} h
        </Typography>
      </Stack>

      {searchField}

      {/* Task entries for the active day */}
      <Box role="tabpanel" sx={mobileDayEntryListSx}>
        {projects.length === 0 && (
          <Box sx={mobileDayEntryEmptySx}>
            {searching ? (
              <EmptyTableState
                title="No matching jobs or tasks"
                description="Clear or change the search to see this week's jobs."
              />
            ) : (
              <EmptyTableState
                title="No timesheet entries"
                description="Jobs and assigned ticket work for the selected week will appear here."
              />
            )}
          </Box>
        )}
        {activeDay &&
          projects.map((project) => {
            const projectOpen = searching || expandedProject === project.id;
            const projectSeconds = project.milestones.reduce(
              (sum: number, milestone: Milestone) =>
                sum +
                milestone.assigned_tasks.reduce(
                  (taskSum, task) => taskSum + hoursMinutesToSeconds(task.entries[activeDay.date] ?? ""),
                  0,
                ),
              0,
            );
            return (
              <Box
                key={project.id}
                ref={(node: HTMLDivElement | null) => {
                  if (node) jobRefs.current.set(project.id, node);
                  else jobRefs.current.delete(project.id);
                }}
                sx={mobileDayJobSx}
              >
                {/* Job row: same hierarchy as the week grid's Jobs column. */}
                <ButtonBase
                  aria-expanded={projectOpen}
                  aria-label={`${projectOpen ? "Collapse" : "Expand"} ${project.code}`}
                  disabled={searching}
                  onClick={() => toggleProject(project)}
                  sx={mobileDayToggleRowSx("job")}
                >
                  <ChevronRightOutlinedIcon />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} sx={wrapAnywhereSx}>
                      {project.description || project.code}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="p">
                      {project.code}
                    </Typography>
                  </Box>
                  {/* A search may hide some of the job's tasks: no partial total. */}
                  {!searching && (
                    <Typography variant="body2" fontWeight={600}>
                      {formatHours(projectSeconds)} h
                    </Typography>
                  )}
                </ButtonBase>

                <Collapse in={projectOpen} unmountOnExit>
                  {project.milestones.map((milestone: Milestone) => {
                    const milestoneKey = `${project.id}-${milestone.id}`;
                    const milestoneOpen = searching || expandedMilestones.includes(milestoneKey);
                    return (
                      <Box key={milestone.id}>
                        <ButtonBase
                          aria-expanded={milestoneOpen}
                          aria-label={`${milestoneOpen ? "Collapse" : "Expand"} ${milestone.name}`}
                          disabled={searching}
                          onClick={() => toggle(setExpandedMilestones, milestoneKey)}
                          sx={mobileDayToggleRowSx("milestone")}
                        >
                          <ChevronRightOutlinedIcon />
                          <Typography variant="body2" sx={{ flex: 1, minWidth: 0, ...wrapAnywhereSx }}>
                            {milestone.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {milestone.assigned_tasks.length}{" "}
                            {milestone.assigned_tasks.length === 1 ? "task" : "tasks"}
                          </Typography>
                        </ButtonBase>

                        <Collapse in={milestoneOpen} unmountOnExit>
                          <Box sx={mobileDayTaskListSx}>
                            {milestone.assigned_tasks.map((task) => {
                              const editable = canEditDate(activeDay.date, project);
                              const others = isOthersProject(project);
                              const hoursId = `hours-${task.assign_id}-${activeDay.date}`;
                              return (
                    <Paper key={task.assign_id} variant="outlined" sx={insetSx}>
                      <Typography variant="body2" fontWeight={600} sx={mobileDayEntryTaskNameSx}>
                        {task.name}
                      </Typography>

                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <TextField
                          id={hoursId}
                          label="Hours"
                          value={task.entries[activeDay.date] ?? ""}
                          disabled={!editable}
                          onChange={(event) =>
                            onHoursChange(project.id, milestone.id, task.assign_id, activeDay.date, event.target.value)
                          }
                          slotProps={{
                            htmlInput: { inputMode: "decimal", placeholder: "0.00" },
                            input: editable
                              ? undefined
                              : { startAdornment: <LockOutlinedIcon fontSize="small" sx={mobileDayEntryOwnerLabelSx} aria-hidden="true" /> },
                          }}
                          sx={mobileDayEntryOwnerFieldSx}
                        />
                        {!others && (
                          <FormControl fullWidth>
                            <InputLabel id={`owner-${task.assign_id}`}>Budget owner</InputLabel>
                            <Select
                              labelId={`owner-${task.assign_id}`}
                              label="Budget owner"
                              value={task.assign_by ?? ""}
                              disabled={budgetOwnerDisabled}
                              onChange={(event) =>
                                onBudgetOwnerChange(project.id, milestone.id, task.assign_id, event.target.value)
                              }
                            >
                              {budgetOwnerOptions.map((owner) => (
                                <MenuItem key={owner.value} value={owner.value}>
                                  {owner.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </Stack>

                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={mobileDayEntryHintSx}>
                        <Typography variant="caption" color="text.secondary">
                          {editable ? `Week total ${formatHours(taskWeekTotal(task))} h` : `Locked for this day · Week total ${formatHours(taskWeekTotal(task))} h`}
                        </Typography>
                        {!others && (
                          <FormControlLabel
                            sx={mobileDayEntrySelectLabelSx}
                            control={
                              <Checkbox
                                checked={selectedAssignedTaskIds.includes(task.assign_id)}
                                onChange={(event) => onAssignedTaskSelectionChange(task.assign_id, event.target.checked)}
                              />
                            }
                            label={<Typography variant="caption">Select</Typography>}
                          />
                        )}
                      </Stack>
                    </Paper>
                              );
                            })}
                          </Box>
                        </Collapse>
                      </Box>
                    );
                  })}
                </Collapse>
              </Box>
            );
          })}
      </Box>
    </Box>
  );
}
