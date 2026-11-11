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

interface EmployeeProgressPanelProps {
  employees: EmployeePerformance[];
  loading: boolean;
  /** Employee the due-work table is narrowed to, if any. */
  selectedId: number | null;
  onSelect: (employee: EmployeePerformance) => void;
}

/** Direct reportees with Work Let and Do List completion; a row narrows the due-work table to that employee. */
export default function EmployeeProgressPanel({ employees, loading, selectedId, onSelect }: EmployeeProgressPanelProps) {
  const revealed = useRevealed(!loading);

  return (
    <Paper elevation={0} sx={surfacePanel}>
      <Stack direction="row" spacing={1.25} alignItems="center" sx={panelTitleRowFull}>
        <Box sx={flexFillSx}>
          <Typography fontWeight={600}>Subordinate progress</Typography>
          <Typography variant="caption" color="text.secondary">
            Select an employee to show only their due work.
          </Typography>
        </Box>
        <Chip
          variant="outlined"
          label={loading ? "Employees" : `${employees.length} employees`}
          sx={teamWorkloadTotalSx}
        />
      </Stack>
      <Stack role="region" aria-label="Subordinate progress list" spacing={0.75} sx={teamMemberListSx}>
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
                aria-label={`${employee.name}: ${employee.completed} of ${employee.total} work items completed, ${employee.progress}%. Show only this employee's due work`}
                aria-pressed={selected}
                title={employee.name}
                sx={teamMemberRowSx(selected)}
              >
                <Box aria-hidden="true" sx={teamMemberAvatarSx}>
                  {employeeInitials(employee.name)}
                </Box>
                <Box sx={minWidthZeroSx}>
                  <Typography noWrap sx={teamMemberNameSx}>{employee.name}</Typography>
                  <Typography component="div" variant="caption" color="text.secondary">
                    {employee.total ? `${employee.completed} of ${employee.total} completed` : "No work due"}
                  </Typography>
                </Box>
                <Box aria-hidden="true" sx={teamMemberRingSx}>
                  <CircularProgress variant="determinate" value={100} size={RING_SIZE} thickness={RING_THICKNESS} sx={teamMemberRingTrackSx} />
                  <CircularProgress variant="determinate" value={revealed ? employee.progress : 0} size={RING_SIZE} thickness={RING_THICKNESS} />
                  <Box component="span" sx={teamMemberRingTextSx}>{employee.total ? `${Math.round(employee.progress)}%` : "—"}</Box>
                </Box>
                <Box sx={teamMemberBarsSx}>
                  <WorkTypeProgress label="Work Let" counts={employee.worklet} revealed={revealed} />
                  <WorkTypeProgress label="Do List" counts={employee.dolist} revealed={revealed} />
                </Box>
              </MotionButtonBase>
            );
          })
        ) : (
          <Box sx={emptyStateSx}>
            <Box>
              <EventAvailableOutlinedIcon sx={largeMutedIcon} />
              <Typography fontWeight={600}>No direct reportees found</Typography>
            </Box>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
