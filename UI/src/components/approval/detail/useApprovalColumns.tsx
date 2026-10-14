import React, { useMemo } from "react";
import { MenuItem, Select } from "@mui/material";
import type { ColumnData } from "../../common/TableView";
import type { TaskRow } from "../../../types/dataTypes";
import {
  canDecideTask,
  canRejectTask,
  isOthersProject,
  RATING_OPTIONS,
  type ApprovalAction,
  type ApprovalWeekDay,
} from "./approvalData";
import { ActionButton, HourCell, JobCell, StatusBadge } from "./ApprovalTableCells";

interface ApprovalColumnsOptions {
  days: ApprovalWeekDay[];
  expandedProjects: number[];
  onToggleProject: (projectId: number) => void;
  onRatingChange: (rowId: number, rating: string) => void;
  onAccept: (row: TaskRow) => void;
  onReject: (row: TaskRow) => void;
  /** Row whose action is in flight, and which action. */
  updating: { rowId: number; action: ApprovalAction } | null;
}

/** Column definitions for the approval detail table. */
export function useApprovalColumns({
  days,
  expandedProjects,
  onToggleProject,
  onRatingChange,
  onAccept,
  onReject,
  updating,
}: ApprovalColumnsOptions): ColumnData<TaskRow>[] {
  return useMemo(() => {
    const taskOnly =
      (render: (row: TaskRow) => React.ReactNode) =>
      (row: TaskRow) =>
        row.rowType === "project" ? null : render(row);

    const busyAction = (row: TaskRow) => (updating?.rowId === row.id ? updating.action : null);
    const acceptDisabled = (row: TaskRow) =>
      !canDecideTask(row) || busyAction(row) !== null;
    const rejectDisabled = (row: TaskRow) =>
      !canRejectTask(row) || busyAction(row) !== null;

    return [
      {
        label: "Jobs",
        width: { xs: 160, sm: 220 },
        render: (row: TaskRow) => (
          <JobCell row={row} expanded={expandedProjects.includes(row.projectId)} onToggle={onToggleProject} />
        ),
      },
      { label: "Budget Owner", width: 150, render: taskOnly((row) => row.budgetOwner) },
      ...days.map((day, dayIndex) => ({
        label: day.label,
        width: 54,
        render: taskOnly((row) => <HourCell value={row.hours[dayIndex] || ""} />),
      })),
      {
        label: "Rating",
        width: 120,
        render: taskOnly((row) =>
          isOthersProject(row.project) ? null : (
            <Select
              value={row.rating || ""}
              displayEmpty
              inputProps={{ "aria-label": `Rating for ${row.task}` }}
              disabled={!canRejectTask(row) || busyAction(row) !== null}
              onChange={(event) => onRatingChange(row.id, String(event.target.value))}
              sx={{ width: 118, height: 32, fontSize: 12, "& .MuiSelect-select": { py: 0.5, px: 1 } }}
            >
              {RATING_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          ),
        ),
      },
      { label: "Status", width: 80, render: taskOnly((row) => <StatusBadge status={row.status} />) },
      {
        label: "Accept",
        width: 100,
        render: taskOnly((row) => (
          <ActionButton
            action="Accepted"
            busy={busyAction(row) === "Accepted"}
            disabled={acceptDisabled(row)}
            onClick={() => onAccept(row)}
          />
        )),
      },
      {
        label: "Reject",
        width: 100,
        render: taskOnly((row) => (
          <ActionButton
            action="Rejected"
            busy={busyAction(row) === "Rejected"}
            disabled={rejectDisabled(row)}
            onClick={() => onReject(row)}
          />
        )),
      },
    ];
  }, [days, expandedProjects, onToggleProject, onRatingChange, onAccept, onReject, updating]);
}
