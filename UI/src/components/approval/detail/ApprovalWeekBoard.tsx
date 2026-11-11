import { Fragment, useMemo, useState } from "react";
import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import type { TaskRow } from "@/types/dataTypes";
import Pill from "@/components/common/Pill";
import EmptyTableState from "@/components/common/EmptyTableState";
import { statusColor, statusLabel } from "@/components/common/pillValues";
import {
  formatHoursMinutes,
  hoursMinutesToSeconds,
} from "@/utils/hoursMinutes";
import { approvalActionButtonSx } from "@/styles/common";
import RejectReasonPanel from "@/components/approval/detail/RejectReasonPanel";
import {
  canDecideTask,
  canRejectTask,
  isOthersProject,
  notReviewableReason,
  RATING_OPTIONS,
  type ApprovalAction,
  type ApprovalWeekDay,
} from "@/components/approval/detail/approvalData";
import {
  reviewBoardSx,
  reviewDayCellSx,
  reviewDayGridSx,
  reviewDecisionSx,
  reviewHeadCellSx,
  reviewHeadDaySx,
  reviewHeadDaysSx,
  reviewHeadRowSx,
  reviewJobCountSx,
  reviewJobHoursSx,
  reviewJobNameSx,
  reviewJobRowSx,
  reviewRatingSelectSx,
  reviewRejectionSx,
  reviewTaskInfoSx,
  reviewTaskNameSx,
  reviewTaskRowSx,
  reviewTaskStatusSx,
  reviewTaskTotalSx,
  reviewToolbarCountSx,
  reviewToolbarSx,
  reviewTotalDaySx,
  reviewTotalsRowSx,
} from "@/styles/approvalReview";

/** A day in the header and task rows: Sat / Sun are dimmed like the Submission grid. */
const isWeekend = (day: ApprovalWeekDay) => {
  const weekday = new Date(`${day.date}T00:00:00`).getDay();
  return weekday === 0 || weekday === 6;
};

const dayName = (day: ApprovalWeekDay) => day.label.split("-")[0];
const dayNumber = (day: ApprovalWeekDay) => day.label.split("-")[1];

const sumSeconds = (hours: string[]) =>
  hours.reduce(
    (total, value) => total + hoursMinutesToSeconds(value || "0"),
    0,
  );

/**
 * One employee's week as a table, sized like the app's data tables: one header
 * row with the days, then every job and its tasks with nothing to expand. Each
 * task is a single line with its hours per day, total, status, rating and
 * accept / reject. Below 1200px a line folds under itself. Search and the
 * awaiting filter only change what is shown, never a decision.
 */
export default function ApprovalWeekBoard({
  rows,
  days,
  dayTotals,
  loading,
  employeeName,
  onRatingChange,
  onAccept,
  onReject,
  rejectingId,
  onCancelReject,
  onSubmitReject,
  onMissingReason,
  updating,
}: {
  rows: TaskRow[];
  days: ApprovalWeekDay[];
  /** Seconds per day across every task, filtered or not. */
  dayTotals: number[];
  loading: boolean;
  employeeName: string;
  onRatingChange: (rowId: number, rating: string) => void;
  onAccept: (row: TaskRow) => void;
  onReject: (row: TaskRow) => void;
  /** The task whose inline reject panel is open. */
  rejectingId: number | null;
  onCancelReject: () => void;
  onSubmitReject: (reason: string) => void;
  onMissingReason: () => void;
  updating: { rowId: number; action: ApprovalAction } | null;
}) {
  const [search, setSearch] = useState<string>("");
  const [awaitingOnly, setAwaitingOnly] = useState<boolean>(false);

  const allTasks = useMemo(
    () => rows.filter((row) => row.rowType === "milestone"),
    [rows],
  );
  const shownTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allTasks.filter(
      (task) =>
        (!awaitingOnly || canRejectTask(task)) &&
        (!query ||
          [task.task, task.project, task.description].some((text) =>
            (text ?? "").toLowerCase().includes(query),
          )),
    );
  }, [allTasks, awaitingOnly, search]);

  if (loading) {
    return (
      <Box role="status" aria-label="Loading timesheet entries">
        <Skeleton variant="rounded" height={240} />
      </Box>
    );
  }

  const jobs = rows.filter((row) => row.rowType === "project");
  if (!jobs.length) {
    return (
      <Box sx={reviewBoardSx}>
        <EmptyTableState
          title="No hours logged this week"
          description={`${employeeName} has no timesheet entries for this week yet.`}
        />
      </Box>
    );
  }

  return (
    <>
      <Box sx={reviewToolbarSx}>
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search tasks"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
            htmlInput: { "aria-label": "Search tasks" },
          }}
        />
        <ToggleButton
          value="awaiting"
          selected={awaitingOnly}
          onChange={() => setAwaitingOnly((current) => !current)}
        >
          Awaiting Review
        </ToggleButton>
        <Box component="span" role="status" sx={reviewToolbarCountSx}>
          {shownTasks.length} of {allTasks.length} task
          {allTasks.length === 1 ? "" : "s"}
        </Box>
      </Box>

      <Box
        sx={reviewBoardSx}
        role="table"
        aria-label={`Tasks for ${employeeName}`}
      >
        <Box sx={reviewHeadRowSx} role="row">
          <Box role="columnheader" sx={reviewHeadCellSx()}>
            Task
          </Box>
          <Box role="none" sx={reviewHeadDaysSx}>
            {days.map((day) => (
              <Box
                key={day.date}
                role="columnheader"
                sx={reviewHeadDaySx(isWeekend(day))}
              >
                {dayName(day)} {dayNumber(day)}
              </Box>
            ))}
          </Box>
          <Box role="columnheader" sx={reviewHeadCellSx("right")}>
            Total
          </Box>
          <Box role="columnheader" sx={reviewHeadCellSx()}>
            Status
          </Box>
          <Box role="columnheader" sx={reviewHeadCellSx("right")}>
            Rating and action
          </Box>
        </Box>

        {jobs.map((job) => {
          const tasks = shownTasks.filter(
            (row) => row.projectId === job.projectId,
          );
          // Filtered out entirely: the job row would only add noise.
          if (!tasks.length) return null;
          const jobSeconds = tasks.reduce(
            (total, task) => total + sumSeconds(task.hours),
            0,
          );
          const jobName = job.description || job.project;
          return (
            <Box key={job.projectId} role="rowgroup">
              <Box sx={reviewJobRowSx} role="row">
                <Box
                  role="rowheader"
                  sx={reviewJobNameSx}
                  title={
                    job.description ? `${jobName} · ${job.project}` : jobName
                  }
                >
                  <strong>{jobName}</strong>
                  {job.description && job.project}
                </Box>
                <Box role="cell" sx={reviewJobHoursSx}>
                  {formatHoursMinutes(jobSeconds)} h
                </Box>
                <Box role="cell" sx={reviewJobCountSx}>
                  {tasks.length} task{tasks.length === 1 ? "" : "s"}
                </Box>
              </Box>
              {tasks.map((task) => (
                <Fragment key={task.id}>
                  <TaskLine
                    task={task}
                    days={days}
                    onRatingChange={onRatingChange}
                    onAccept={onAccept}
                    onReject={onReject}
                    busy={updating?.rowId === task.id ? updating.action : null}
                  />
                  {rejectingId === task.id && (
                    <RejectReasonPanel
                      taskName={task.task}
                      initialReason={task.rejectionReason || ""}
                      busy={updating !== null}
                      onCancel={onCancelReject}
                      onSubmit={onSubmitReject}
                      onMissingReason={onMissingReason}
                    />
                  )}
                </Fragment>
              ))}
            </Box>
          );
        })}

        {!shownTasks.length && (
          <EmptyTableState
            title="No tasks match"
            description="Clear the search or turn off Awaiting Review to see every task."
          />
        )}

        <Box sx={reviewTotalsRowSx} role="row">
          <Box role="rowheader" sx={reviewHeadCellSx()}>
            Daily Total
          </Box>
          <Box role="none" sx={reviewHeadDaysSx}>
            {days.map((day, index) => (
              <Box
                key={day.date}
                role="cell"
                aria-label={`${dayName(day)} ${dayNumber(day)} total`}
                sx={reviewTotalDaySx}
              >
                {dayTotals[index] ? formatHoursMinutes(dayTotals[index]) : "–"}
              </Box>
            ))}
          </Box>
          <Box role="cell" sx={reviewHeadCellSx("right")}>
            {formatHoursMinutes(
              dayTotals.reduce((total, seconds) => total + seconds, 0),
            )}{" "}
            h
          </Box>
        </Box>
      </Box>
    </>
  );
}

/** Accept or Reject; when disabled, the tooltip says why. */
function ActionButton({
  action,
  busy,
  disabled,
  disabledReason,
  onClick,
}: {
  action: ApprovalAction;
  busy: boolean;
  disabled: boolean;
  /** Tooltip explaining why the button is disabled. */
  disabledReason?: string;
  onClick: () => void;
}) {
  const accept = action === "Accepted";
  const Icon = accept ? CheckCircleOutlinedIcon : HighlightOffOutlinedIcon;
  return (
    <Tooltip title={disabled && disabledReason ? disabledReason : ""}>
      {/* A span, so the tooltip still opens over a disabled button. */}
      <span>
        <Button
          variant="contained"
          color={accept ? "success" : "error"}
          startIcon={busy ? undefined : <Icon />}
          disabled={disabled}
          onClick={onClick}
          data-reject-button={accept ? undefined : true}
          sx={approvalActionButtonSx}
        >
          {busy ? "..." : accept ? "Accept" : "Reject"}
        </Button>
      </span>
    </Tooltip>
  );
}

function TaskLine({
  task,
  days,
  onRatingChange,
  onAccept,
  onReject,
  busy,
}: {
  task: TaskRow;
  days: ApprovalWeekDay[];
  onRatingChange: (rowId: number, rating: string) => void;
  onAccept: (row: TaskRow) => void;
  onReject: (row: TaskRow) => void;
  busy: ApprovalAction | null;
}) {
  const others = isOthersProject(task.project);
  const reviewable = canRejectTask(task);
  const rejected = task.status.trim().toLowerCase() === "rejected";
  const reason = rejected ? task.rejectionReason : null;
  const seconds = sumSeconds(task.hours);
  const maxCell = Math.max(
    ...task.hours.map((value) => hoursMinutesToSeconds(value || "0")),
    1,
  );

  return (
    <Box
      sx={reviewTaskRowSx}
      role="row"
      data-review-task={task.id}
      data-reviewable={reviewable}
    >
      <Box
        role="cell"
        sx={reviewTaskInfoSx}
      >
        <Box component="span" sx={reviewTaskNameSx}>
          {task.task}
        </Box>
        {reason && (
          <Box component="span" sx={reviewRejectionSx}>
            <ErrorOutlineOutlinedIcon aria-hidden="true" />
            {reason}
          </Box>
        )}
      </Box>

      {/* Hours per day: always seven cells, so it never scrolls sideways. */}
      <Box role="none" sx={reviewDayGridSx}>
        {days.map((day, index) => {
          const value = task.hours[index] || "";
          const cellSeconds = hoursMinutesToSeconds(value || "0");
          return (
            <Box
              key={day.date}
              role="cell"
              aria-label={`${dayName(day)} ${dayNumber(day)}: ${value ? `${value} hours` : "no hours"}`}
              sx={reviewDayCellSx(
                isWeekend(day),
                cellSeconds / maxCell,
                Boolean(value),
              )}
            >
              {value || "–"}
            </Box>
          );
        })}
      </Box>

      <Box role="cell" sx={reviewTaskTotalSx}>
        {formatHoursMinutes(seconds)} h
      </Box>

      <Box role="cell" sx={reviewTaskStatusSx}>
        <Pill
          value={statusLabel(task.status)}
          color={statusColor(task.status)}
          dot
        />
      </Box>

      <Box role="cell" sx={reviewDecisionSx}>
        {!others && (
          <Select
            value={task.rating || ""}
            displayEmpty
            size="small"
            inputProps={{ "aria-label": `Rating for ${task.task}` }}
            disabled={!reviewable || busy !== null}
            onChange={(event) =>
              onRatingChange(task.id, String(event.target.value))
            }
            sx={reviewRatingSelectSx}
          >
            {RATING_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.value === "0" ? "Select Rating" : option.label}
              </MenuItem>
            ))}
          </Select>
        )}
        <ActionButton
          action="Accepted"
          busy={busy === "Accepted"}
          disabled={!canDecideTask(task) || busy !== null}
          disabledReason={
            !reviewable
              ? notReviewableReason(task)
              : !canDecideTask(task)
                ? "Choose a rating to accept this task"
                : undefined
          }
          onClick={() => onAccept(task)}
        />
        <ActionButton
          action="Rejected"
          busy={busy === "Rejected"}
          disabled={!reviewable || busy !== null}
          disabledReason={!reviewable ? notReviewableReason(task) : undefined}
          onClick={() => onReject(task)}
        />
      </Box>
    </Box>
  );
}
