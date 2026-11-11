import { Box, ButtonBase, Chip, CircularProgress, LinearProgress, Paper, Skeleton, Stack, Typography } from "@mui/material";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import { motion } from "motion/react";
import { DURATION, EASE_OUT } from "@/animations/presets";
import { useRevealed } from "@/animations/useRevealed";
import type { EmployeePerformance, PerformanceCount } from "@/pages/tickets/teamPerformanceQuery";
import {
  emptyStateSx,
  flexFillSx,
  largeMutedIcon,
  minWidthZeroSx,
  panelTitleRowFull,
  surfacePanel,
  teamMemberAvatarSx,
  teamMemberBarSx,
  teamMemberBarsSx,
  teamMemberBarLabelSx,
  teamMemberListSx,
  teamMemberNameSx,
  teamMemberRingSx,
  teamMemberRingTextSx,
  teamMemberRingTrackSx,
  teamMemberRowSx,
  teamWorkloadTotalSx,
} from "@/styles/common";

const MotionButtonBase = motion.create(ButtonBase);

const SKELETON_ROWS = 4;
const RING_SIZE = 46;
const RING_THICKNESS = 4;

/** Up to two initials for an employee's badge, e.g. "Alex Smith" -> "AS". */
const employeeInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

/** One work type's bar; a type with nothing due says so instead of "0/0". */
function WorkTypeProgress({ label, counts, revealed }: { label: string; counts: PerformanceCount; revealed: boolean }) {
  return (
    <Box sx={minWidthZeroSx}>
      <Typography component="div" variant="caption" color="text.secondary" sx={teamMemberBarLabelSx}>
        <span>{label}</span>
        <span>{counts.total ? `${counts.completed}/${counts.total} · ${counts.progress}%` : "No items"}</span>
      </Typography>
      <LinearProgress
        variant="determinate"
        value={revealed ? counts.progress : 0}
        sx={teamMemberBarSx(counts.total > 0 && counts.progress >= 100)}
      />
    </Box>
  );
}

/** Wording for the panel, so Team Analysis can reuse it for teams. */
export type ProgressPanelLabels = {
  title: string;
  caption: string;
  /** Header count, e.g. "4 employees". */
  unit: { one: string; other: string };
  listLabel: string;
  /** Labels of the two bars: `worklet` first, then `dolist`. */
  workTypes: [string, string];
  /** What the totals count, e.g. "work items". */
  itemNoun: string;
  /** Screen reader action, e.g. "Show only this employee's due work". */
  selectHint: string;
  empty: string;
};

const EMPLOYEE_LABELS: ProgressPanelLabels = {
  title: "Subordinate progress",
  caption: "Select an employee to show only their due work.",
  unit: { one: "employee", other: "employees" },
  listLabel: "Subordinate progress list",
  workTypes: ["Work Let", "Do List"],
  itemNoun: "work items",
  selectHint: "Show only this employee's due work",
  empty: "No direct reportees found",
};

interface EmployeeProgressPanelProps {
  employees: EmployeePerformance[];
  labels?: ProgressPanelLabels;
  /** Optional text under a row's name, after the completion summary. */
  getSubtitle?: (employee: EmployeePerformance) => string | undefined;
  loading: boolean;
  /** Employee the due-work table is narrowed to, if any. */
  selectedId: number | null;
  onSelect: (employee: EmployeePerformance) => void;
}

/** Direct reportees with Work Let and Do List completion; a row narrows the due-work table to that employee. */
export default function EmployeeProgressPanel({
  employees,
  loading,
  selectedId,
  onSelect,
  labels = EMPLOYEE_LABELS,
  getSubtitle,
}: EmployeeProgressPanelProps) {
  const revealed = useRevealed(!loading);

  return (
    <Paper elevation={0} sx={surfacePanel}>
      <Stack direction="row" spacing={1.25} alignItems="center" sx={panelTitleRowFull}>
        <Box sx={flexFillSx}>
          <Typography fontWeight={600}>{labels.title}</Typography>
          <Typography variant="caption" color="text.secondary">
            {labels.caption}
          </Typography>
        </Box>
        <Chip
          variant="outlined"
          label={
            loading
              ? labels.unit.other.charAt(0).toUpperCase() + labels.unit.other.slice(1)
              : `${employees.length} ${employees.length === 1 ? labels.unit.one : labels.unit.other}`
          }
          sx={teamWorkloadTotalSx}
        />
      </Stack>
      <Stack role="region" aria-label={labels.listLabel} spacing={0.75} sx={teamMemberListSx}>
        {loading ? (
          <Stack spacing={0.75} role="status" aria-label="Loading employee progress">
            {Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <Skeleton key={index} variant="rounded" height={84} sx={{ flexShrink: 0 }} />
            ))}
          </Stack>
        ) : employees.length ? (
          employees.map((employee, index) => {
            const selected = employee.id === selectedId;
            return (
              <MotionButtonBase
                key={employee.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION.field, ease: EASE_OUT, delay: Math.min(index, 10) * 0.04 }}
                onClick={() => onSelect(employee)}
                aria-label={`${employee.name}: ${employee.completed} of ${employee.total} ${labels.itemNoun} completed, ${employee.progress}%. ${labels.selectHint}`}
                aria-pressed={selected}
                title={employee.name}
                sx={teamMemberRowSx(selected)}
              >
                <Box aria-hidden="true" sx={teamMemberAvatarSx}>
                  {employeeInitials(employee.name)}
                </Box>
                <Box sx={minWidthZeroSx}>
                  <Typography noWrap sx={teamMemberNameSx}>{employee.name}</Typography>
                  <Typography component="div" variant="caption" color="text.secondary" noWrap>
                    {[employee.total ? `${employee.completed} of ${employee.total} completed` : "No work due", getSubtitle?.(employee)]
                      .filter(Boolean)
                      .join(" · ")}
                  </Typography>
                </Box>
                <Box aria-hidden="true" sx={teamMemberRingSx}>
                  <CircularProgress variant="determinate" value={100} size={RING_SIZE} thickness={RING_THICKNESS} sx={teamMemberRingTrackSx} />
                  <CircularProgress variant="determinate" value={revealed ? employee.progress : 0} size={RING_SIZE} thickness={RING_THICKNESS} />
                  <Box component="span" sx={teamMemberRingTextSx}>{employee.total ? `${Math.round(employee.progress)}%` : "—"}</Box>
                </Box>
                <Box sx={teamMemberBarsSx}>
                  <WorkTypeProgress label={labels.workTypes[0]} counts={employee.worklet} revealed={revealed} />
                  <WorkTypeProgress label={labels.workTypes[1]} counts={employee.dolist} revealed={revealed} />
                </Box>
              </MotionButtonBase>
            );
          })
        ) : (
          <Box sx={emptyStateSx}>
            <Box>
              <EventAvailableOutlinedIcon sx={largeMutedIcon} />
              <Typography fontWeight={600}>{labels.empty}</Typography>
            </Box>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
