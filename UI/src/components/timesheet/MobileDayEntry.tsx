import { insetSx } from "../../styles/tokens";
import {
  Box,
  ButtonBase,
  Checkbox,
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
import EmptyTableState from "../common/EmptyTableState";
import type { AssignedTask, Milestone, SubmissionProject } from "../../types/dataTypes";

type WeekDay = { label: string; date: string };
type OwnerOption = { value: string; label: string };

interface MobileDayEntryProps {
  projects: SubmissionProject[];
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

  const rows = projects.flatMap((project) =>
    project.milestones.flatMap((milestone: Milestone) =>
      milestone.assigned_tasks.map((task) => ({ project, milestone, task })),
    ),
  );

  return (
    <Box sx={{ display: "flex", flex: 1, minHeight: 0, flexDirection: "column", gap: 1 }}>
      {/* Day stepper */}
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <IconButton
          aria-label="Previous day"
          disabled={activeIndex === 0}
          onClick={() => onActiveIndexChange(activeIndex - 1)}
        >
          <ChevronLeftOutlinedIcon />
        </IconButton>
        <Box
          role="tablist"
          aria-label="Day of week"
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${weekDays.length}, minmax(0, 1fr))`,
            gap: 0.5,
            flex: 1,
            minWidth: 0,
          }}
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
                  py: 0.5,
                  borderRadius: 1,
                  border: 1,
                  borderColor: selected ? "primary.main" : "divider",
                  bgcolor: selected
                    ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.12 : 0.1)
                    : "background.paper",
                  color: selected ? "primary.main" : "text.primary",
                  "&.Mui-focusVisible": { outline: "2px solid", outlineColor: "primary.main" },
                })}
              >
                <Typography variant="caption" fontWeight={700} lineHeight={1.2}>
                  {day.label.slice(0, 3)}
                </Typography>
                <Typography variant="caption" lineHeight={1.2} color={hasHours ? "inherit" : "text.secondary"}>
                  {formatHours(dayTotals[index] ?? 0)}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
        <IconButton
          aria-label="Next day"
          disabled={activeIndex >= weekDays.length - 1}
          onClick={() => onActiveIndexChange(activeIndex + 1)}
        >
          <ChevronRightOutlinedIcon />
        </IconButton>
      </Stack>

      <Stack direction="row" justifyContent="space-between" sx={{ px: 0.5 }}>
        <Typography variant="body2" fontWeight={700}>
          {activeDay?.label} · {activeDay?.date}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Day {formatHours(dayTotals[activeIndex] ?? 0)} h · Week {weekTotalLabel} h
        </Typography>
      </Stack>

      {/* Task entries for the active day */}
      <Box role="tabpanel" sx={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1, pb: 1 }}>
        {rows.length === 0 && (
          <Box sx={{ display: "grid", placeItems: "center", minHeight: 220 }}>
            <EmptyTableState
              title="No timesheet entries"
              description="Jobs and assigned ticket work for the selected week will appear here."
            />
          </Box>
        )}
        {activeDay &&
          rows.map(({ project, milestone, task }) => {
            const editable = canEditDate(activeDay.date, project);
            const others = isOthersProject(project);
            const hoursId = `hours-${task.assign_id}-${activeDay.date}`;
            return (
              <Paper key={task.assign_id} variant="outlined" sx={{ ...insetSx }}>
                <Typography variant="caption" color="text.secondary" component="p" sx={{ overflowWrap: "anywhere" }}>
                  {project.code}
                  {project.description ? ` · ${project.description}` : ""} › {milestone.name}
                </Typography>
                <Typography variant="body2" fontWeight={700} sx={{ overflowWrap: "anywhere", mb: 1 }}>
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
                    helperText={editable ? "h.mm: 1.30 = 1 h 30 m" : undefined}
                    slotProps={{
                      htmlInput: { inputMode: "decimal", placeholder: "0.00" },
                      input: editable
                        ? undefined
                        : { startAdornment: <LockOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} aria-hidden="true" /> },
                    }}
                    sx={{ width: 140, flexShrink: 0 }}
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

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {editable ? `Week total ${formatHours(taskWeekTotal(task))} h` : `Locked for this day · Week total ${formatHours(taskWeekTotal(task))} h`}
                  </Typography>
                  {!others && (
                    <FormControlLabel
                      sx={{ mr: 0 }}
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
    </Box>
  );
}
