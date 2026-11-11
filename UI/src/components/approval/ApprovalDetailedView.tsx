import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, useMediaQuery, useTheme } from "@mui/material";
import type { ApprovalRow, TaskRow } from "@/types/dataTypes";
import api from "@/api/axios";
import {
  approveDetailDialogPaperSx,
} from "@/styles/common";
import { useNotification } from "@/context/notificationContext";
import {
  applyActionResult,
  buildWeekDays,
  getActionRating,
  getDayTotals,
  getReviewSummary,
  groupApprovalRows,
  setRowRating,
  type ApprovalAction,
  type ApprovalDetailResponse,
} from "@/components/approval/detail/approvalData";
import ApprovalWeekBoard from "@/components/approval/detail/ApprovalWeekBoard";
import {
  ApprovalComments,
  ApprovalDetailHeader,
  REVIEW_DIALOG_LABEL,
} from "@/components/approval/detail/ApprovalDetailSections";
import ReviewSummary from "@/components/approval/detail/ReviewSummary";

interface ApprovalDetailedViewProps {
  open: boolean;
  employee: ApprovalRow | null;
  onClose: () => void;
  weekStart: string;
  /** The team list, for moving between employees without closing. */
  employees?: ApprovalRow[];
  onEmployeeChange?: (employee: ApprovalRow) => void;
}

/** After a decision, keyboard focus moves on to the next task still to review. */
function focusNextReviewable(rowId: number) {
  const rows = [...document.querySelectorAll<HTMLElement>("[data-review-task]")];
  const index = rows.findIndex((row) => row.dataset.reviewTask === String(rowId));
  const next = [...rows.slice(index + 1), ...rows.slice(0, index)].find(
    (row) => row.dataset.reviewable === "true",
  );
  next?.querySelector<HTMLElement>('[role="combobox"], button:not(:disabled)')?.focus();
}

/**
 * One employee's week for approval: a one-line summary, then every job's tasks
 * as single-line table rows with a rating and accept / reject. Grouping, totals
 * and rating rules live in ./detail/approvalData; the rows in ApprovalWeekBoard.
 */
const ApprovalDetailedView: React.FC<ApprovalDetailedViewProps> = ({
  open,
  employee,
  onClose,
  weekStart,
  employees = [],
  onEmployeeChange,
}) => {
  const { showNotification } = useNotification();
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down("sm"));

  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [comments, setComments] = useState<string>("");
  const [updating, setUpdating] = useState<{ rowId: number; action: ApprovalAction } | null>(null);
  // The task whose inline reject panel is open.
  const [rejecting, setRejecting] = useState<TaskRow | null>(null);

  const days = useMemo(() => buildWeekDays(weekStart), [weekStart]);

  useEffect(() => {
    if (!open || !employee?.id || !weekStart) {
      return;
    }
    let active = true;
    // Cancel the request if the dialog closes or another employee is opened.
    const controller = new AbortController();
    setLoading(true);
    setTasks([]);
    setComments("");
    setRejecting(null);
    void api
      .get<ApprovalDetailResponse>("/approval-detail-data/", {
        params: { weekStart, employeeId: employee.id },
        signal: controller.signal,
      })
      .then((response) => {
        if (!active) return;
        setComments(response.data?.comments || "");
        setTasks(groupApprovalRows(response.data?.rows || []));
      })
      .catch(() => {
        if (active) {
          setTasks([]);
          setComments("");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [open, employee?.id, weekStart]);

  const totals = useMemo(() => getDayTotals(tasks, days.length), [tasks, days.length]);
  const summary = useMemo(() => getReviewSummary(tasks, totals), [tasks, totals]);

  const handleRatingChange = useCallback((rowId: number, rating: string) => {
    setTasks((previous) => setRowRating(previous, rowId, rating));
  }, []);

  /** Sends one decision; resolves true when it was saved. */
  const submitAction = useCallback(
    async (row: TaskRow, action: ApprovalAction, actionComments = comments) => {
      if (!employee?.id || updating !== null) return false;

      const check = getActionRating(row, action);
      if ("error" in check) {
        showNotification(check.error, "warning");
        return false;
      }

      try {
        setUpdating({ rowId: row.id, action });
        await api.patch("/approval-detail-data/", {
          weekStart,
          employeeId: employee.id,
          assignId: row.id,
          action,
          rating: check.rating,
          comments: actionComments,
        });
        showNotification(`Submission ${action.toLowerCase()} successfully.`, "success");
        setTasks((previous) => applyActionResult(previous, row.id, action, check.rating, actionComments));
        return true;
      } catch {
        // The shared request error dialog explains the failure.
        return false;
      } finally {
        setUpdating(null);
      }
    },
    [employee?.id, weekStart, comments, updating, showNotification],
  );

  const handleAccept = useCallback(
    (row: TaskRow) => {
      void submitAction(row, "Accepted").then((saved) => {
        if (saved) focusNextReviewable(row.id);
      });
    },
    [submitAction],
  );

  const cancelReject = useCallback(() => {
    const rowId = rejecting?.id;
    setRejecting(null);
    // Back to the Reject button that opened the panel.
    window.setTimeout(() => {
      document
        .querySelector<HTMLElement>(`[data-review-task="${rowId}"] [data-reject-button]`)
        ?.focus();
    });
  }, [rejecting?.id]);

  const submitReject = useCallback(
    async (reason: string) => {
      if (!rejecting) return;
      if (await submitAction(rejecting, "Rejected", reason)) {
        setRejecting(null);
        focusNextReviewable(rejecting.id);
      }
    },
    [rejecting, submitAction],
  );

  if (!employee) {
    return null;
  }

  const position = employees.findIndex((row) => row.id === employee.id);
  const previous = position > 0 ? employees[position - 1] : undefined;
  const next = position >= 0 ? employees[position + 1] : undefined;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        // Phones get the whole screen for the rows.
        fullScreen={phone}
        maxWidth={false}
        aria-labelledby={REVIEW_DIALOG_LABEL}
        PaperProps={{
          sx: () => ({
            ...(phone ? {} : approveDetailDialogPaperSx),
            // Tall on purpose: long weeks should show as many rows as fit.
            height: phone ? "100%" : "92dvh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }),
        }}
      >
        <ApprovalDetailHeader
          employee={employee}
          weekStart={weekStart}
          onClose={onClose}
          onPrevious={previous && onEmployeeChange ? () => onEmployeeChange(previous) : undefined}
          onNext={next && onEmployeeChange ? () => onEmployeeChange(next) : undefined}
        />

        {/* Padding comes from the theme's MuiDialogContent. */}
        <DialogContent
          sx={(theme) => ({
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            // One scroll for the summary and jobs: nothing is squeezed into a
            // small inner scroller on short screens.
            overflowY: "auto",
            backgroundColor: theme.palette.background.default,
          })}
        >
          {/* The week in one line: total, stats and review progress. */}
          <ReviewSummary summary={summary} dayCount={days.length} loading={loading} />
          {/* Above the rows, so it is read before deciding on a long week. */}
          <ApprovalComments comments={comments} />

          {/* Every job's tasks, always shown, one line per task. */}
          <ApprovalWeekBoard
            rows={tasks}
            days={days}
            dayTotals={totals}
            loading={loading}
            employeeName={employee.name}
            onRatingChange={handleRatingChange}
            onAccept={handleAccept}
            onReject={setRejecting}
            rejectingId={rejecting?.id ?? null}
            onCancelReject={cancelReject}
            onSubmitReject={(reason) => void submitReject(reason)}
            onMissingReason={() => showNotification("Please enter a rejection reason.", "warning")}
            updating={updating}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApprovalDetailedView;
