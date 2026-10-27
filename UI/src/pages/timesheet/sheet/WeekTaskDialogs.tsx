import { useState } from "react";
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import api from "@/api/axios";
import { showNotification } from "@/api/notificationService";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import DateRange from "@/components/common/DateRange";
import TimeSheetUnlockRequestModal from "@/components/timesheet/TimeSheetUnlockRequestModal";
import { formatDate } from "@/utils/dateRange";
import { formatLocalDate } from "@/pages/timesheet/submission/timesheetMath";
import type { WeekTaskKind } from "@/pages/timesheet/sheet/TimesheetActionsMenu";

type RemoveTasksResponse = { blocked_task_ids?: number[] };

interface WeekTaskDialogsProps {
  open: WeekTaskKind | null;
  onClose: () => void;
  selectedTaskIds: number[];
  weekStartKey: string;
  weekNumber: number;
  weekStart: Date;
  weekEnd: Date;
  /** End of next week: "extend" moves selected tasks' end date here. */
  nextWeekEnd: Date;
  actionsDisabled: boolean;
  unlockDisabled: boolean;
  onLocked: (message?: string) => void;
  /** Tasks changed: clear the selection and refresh the grid. */
  onTasksChanged: () => void;
  /** Unlock requested: refresh. */
  onChanged: () => void;
}

const UNLOCK_UNAVAILABLE = "Unlock request is not available for this timesheet status.";

/** Week controls: extend selected tasks, remove selected tasks, request unlock. */
export default function WeekTaskDialogs({
  open,
  onClose,
  selectedTaskIds,
  weekStartKey,
  weekNumber,
  weekStart,
  weekEnd,
  nextWeekEnd,
  actionsDisabled,
  unlockDisabled,
  onLocked,
  onTasksChanged,
  onChanged,
}: WeekTaskDialogsProps) {
  const [busy, setBusy] = useState(false);
  const [unlockReason, setUnlockReason] = useState("");
  const count = selectedTaskIds.length;

  const run = async (work: () => Promise<void>) => {
    setBusy(true);
    try {
      await work();
    } catch {
      // The shared request error dialog explains the failure.
    } finally {
      setBusy(false);
    }
  };

  const extendTasks = () =>
    run(async () => {
      await api.post("/timesheet-entries/extend-tasks/", {
        assigned_task_ids: selectedTaskIds,
        end_date: formatLocalDate(nextWeekEnd),
      });
      showNotification({ type: "success", message: "Selected tasks extended to next week successfully." });
      onClose();
      onTasksChanged();
    });

  const removeTasks = () => {
    if (actionsDisabled) {
      onLocked();
      onClose();
      return;
    }
    return run(async () => {
      const response = await api.post<RemoveTasksResponse>("/timesheet-entries/remove-tasks/", {
        assigned_task_ids: selectedTaskIds,
        week_start: weekStartKey,
      });
      const blocked = Array.isArray(response.data?.blocked_task_ids) ? response.data.blocked_task_ids.length : 0;
      showNotification(
        blocked > 0
          ? { type: "warning", message: "Some selected tasks have time entries and cannot be removed." }
          : { type: "success", message: "Selected tasks removed successfully." },
      );
      onClose();
      onTasksChanged();
    });
  };

  const requestUnlock = () => {
    if (unlockDisabled) {
      onLocked(UNLOCK_UNAVAILABLE);
      onClose();
      return;
    }
    return run(async () => {
      await api.post("/timesheet-week-logs/request-unlock/", {
        week_start: weekStartKey,
        unlock_reason: unlockReason.trim(),
      });
      showNotification({ type: "success", message: "Unlock request submitted successfully." });
      setUnlockReason("");
      onClose();
      onChanged();
    });
  };

  return (
    <>
      <ConfirmDialog
        open={open === "extend"}
        title="Extend Tasks"
        description={`Update ${count} selected assigned task(s) end date to ${formatDate(nextWeekEnd)}?`}
        confirmLabel={busy ? "Extending..." : "Extend"}
        confirmDisabled={busy || count === 0}
        confirmIcon={<UpdateOutlinedIcon fontSize="small" />}
        onClose={onClose}
        onConfirm={extendTasks}
      />
      <ConfirmDialog
        open={open === "remove"}
        title="Remove Tasks"
        description={`Remove ${count} selected assigned task(s) from this week? Tasks with entries in this week cannot be removed.`}
        confirmLabel={busy ? "Removing..." : "Remove"}
        confirmColor="error"
        confirmDisabled={busy || count === 0}
        confirmIcon={<DeleteOutlineOutlinedIcon fontSize="small" />}
        onClose={onClose}
        onConfirm={async () => {
          await removeTasks();
        }}
      />
      <TimeSheetUnlockRequestModal
        open={open === "unlock"}
        weekNumber={weekNumber}
        weekRange={<DateRange start={weekStart} end={weekEnd} />}
        reason={unlockReason}
        submitting={busy}
        onReasonChange={setUnlockReason}
        onClose={onClose}
        onSubmit={async () => {
          await requestUnlock();
        }}
      />
    </>
  );
}
