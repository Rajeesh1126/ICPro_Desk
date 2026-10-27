import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Dialog, Typography } from "@mui/material";
import { insetSx } from "@/styles/tokens";
import { VirtualizedTable } from "@/components/common/TableView";
import type { ApprovalRow, TaskRow } from "@/types/dataTypes";
import api from "@/api/axios";
import {
  approveDetailDialogPaperSx,
  approvalLoadingSx,
  approvalLoadingTextSx,
  approvalTableAreaSx,
  fullHeightSx,
} from "@/styles/common";
import { useNotification } from "@/context/notificationContext";
import {
  applyActionResult,
  buildWeekDays,
  getActionRating,
  getDayTotals,
  getVisibleRows,
  groupApprovalRows,
  setRowRating,
  toggleId,
  type ApprovalAction,
  type ApprovalDetailResponse,
} from "@/components/approval/detail/approvalData";
import { useApprovalColumns } from "@/components/approval/detail/useApprovalColumns";
import { ApprovalTotalsRow } from "@/components/approval/detail/ApprovalTableCells";
import { ApprovalComments, ApprovalDetailHeader } from "@/components/approval/detail/ApprovalDetailSections";
import RejectReasonDialog from "@/components/approval/detail/RejectReasonDialog";

interface ApprovalDetailedViewProps {
  open: boolean;
  employee: ApprovalRow | null;
  onClose: () => void;
  weekStart: string;
}

const TABLE_MIN_WIDTH = 1480;

/**
 * One employee's week for approval: hours per job and task, a rating per
 * task, and accept / reject actions. Grouping, totals and rating rules live
 * in ./detail/approvalData.
 */
const ApprovalDetailedView: React.FC<ApprovalDetailedViewProps> = ({ open, employee, onClose, weekStart }) => {
  const { showNotification } = useNotification();

  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState("");
  const [updating, setUpdating] = useState<{ rowId: number; action: ApprovalAction } | null>(null);
  // `key` remounts the reject dialog per task so its field starts fresh.
  const [rejecting, setRejecting] = useState<{ row: TaskRow | null; open: boolean; key: number }>({
    row: null,
    open: false,
    key: 0,
  });

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
    void api
      .get<ApprovalDetailResponse>("/approval-detail-data/", {
        params: { weekStart, employeeId: employee.id },
        signal: controller.signal,
      })
      .then((response) => {
        if (!active) return;
        const { rows, projectIds } = groupApprovalRows(response.data?.rows || []);
        setComments(response.data?.comments || "");
        setTasks(rows);
        setExpandedProjects(projectIds);
      })
      .catch(() => {
        if (active) {
          setTasks([]);
          setExpandedProjects([]);
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

  const visibleTasks = useMemo(() => getVisibleRows(tasks, expandedProjects), [tasks, expandedProjects]);
  const totals = useMemo(() => getDayTotals(tasks, days.length), [tasks, days.length]);

  const handleToggleProject = useCallback((projectId: number) => {
    setExpandedProjects((previous) => toggleId(previous, projectId));
  }, []);

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

  const handleAccept = useCallback((row: TaskRow) => void submitAction(row, "Accepted"), [submitAction]);

  const openRejectDialog = useCallback((row: TaskRow) => {
    setRejecting((current) => ({ row, open: true, key: current.key + 1 }));
  }, []);

  const closeRejectDialog = useCallback(() => {
    setRejecting((current) => ({ ...current, open: false }));
  }, []);

  const submitReject = useCallback(
    async (reason: string) => {
      if (!rejecting.row) return;
      if (await submitAction(rejecting.row, "Rejected", reason)) closeRejectDialog();
    },
    [rejecting.row, submitAction, closeRejectDialog],
  );

  const columns = useApprovalColumns({
    days,
    expandedProjects,
    onToggleProject: handleToggleProject,
    onRatingChange: handleRatingChange,
    onAccept: handleAccept,
    onReject: openRejectDialog,
    updating,
  });

  const footerContent = useCallback(
    () => <ApprovalTotalsRow columns={columns} days={days} totals={totals} />,
    [columns, days, totals],
  );

  if (!employee) {
    return null;
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth={false}
        PaperProps={{
          sx: () => ({
            ...approveDetailDialogPaperSx,
            height: "min(92dvh, 760px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }),
        }}
      >
        <ApprovalDetailHeader employee={employee} onClose={onClose} />

        <Box
          sx={(theme) => ({
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            ...insetSx,
            overflow: "hidden",
            backgroundColor: theme.palette.background.default,
          })}
        >
          {loading ? (
            <Box sx={approvalLoadingSx}>
              <Typography sx={approvalLoadingTextSx}>Loading...</Typography>
            </Box>
          ) : (
            <Box sx={approvalTableAreaSx}>
              <Box sx={fullHeightSx}>
                <VirtualizedTable<TaskRow>
                  columns={columns}
                  rows={visibleTasks}
                  tableHead="Submitted Data"
                  height="100%"
                  tableMinWidth={TABLE_MIN_WIDTH}
                  fixedFooterContent={footerContent}
                  stickyFirstColumn
                />
              </Box>
            </Box>
          )}
          <ApprovalComments comments={comments} />
        </Box>
      </Dialog>

      <RejectReasonDialog
        key={rejecting.key}
        open={rejecting.open}
        taskName={rejecting.row?.task}
        initialReason={rejecting.row?.rejectionReason || ""}
        busy={updating !== null}
        onCancel={closeRejectDialog}
        onSubmit={(reason) => void submitReject(reason)}
        onMissingReason={() => showNotification("Please enter a rejection reason.", "warning")}
      />
    </>
  );
};

export default ApprovalDetailedView;
