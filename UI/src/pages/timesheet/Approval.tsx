import React, { useCallback, useMemo, useState } from "react";
import Pill from "@/components/common/Pill";
import { statusColor, statusLabel } from "@/components/common/pillValues";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";

import {
  splitPanelContent,
  tableHeaderLinkSx,
  approvalPanelSx,
  iconMediumSx,
  inlineCenterGapSx,
} from "@/styles/common";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import {
  VirtualizedTable,
  type ColumnData,
} from "@/components/common/TableView";

import { formatDate } from "@/components/common/formatDate";
import api from "@/api/axios";
import { asArray, useApiQuery } from "@/api/useApiQuery";
import { showNotification } from "@/api/notificationService";

import type { ApprovalRow, timesheetStatusData } from "@/types/dataTypes";

import ApprovalDetailedView from "@/components/approval/ApprovalDetailedView";
import UnlockComponent from "@/components/approval/UnlockComponent";
import RatingsDistribution from "@/components/timesheet/RatingsDistribution";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface ApprovalProps {
  weekStart: string;
  onPreviousWeek: () => void;
}

type ApprovalReportee = { id: number; username: string };

const Approval: React.FC<ApprovalProps> = ({ weekStart, onPreviousWeek }) => {
  const isSuperAdmin = (localStorage.getItem("role") ?? "")
    .replace(/\s+/g, "").toLowerCase() === "superadmin";
  // Scope this page only. /teams/ returns the current user's direct reportees.
  const reporteesQuery = useApiQuery<ApprovalReportee[]>("/teams/", undefined, {
    enabled: !isSuperAdmin,
  });
  const reportees = useMemo(() => {
    const users = reporteesQuery.isError ? [] : asArray<ApprovalReportee>(reporteesQuery.data);
    return {
      ids: new Set(users.map((user) => user.id)),
      usernames: new Set(users.map((user) => user.username)),
    };
  }, [reporteesQuery.data, reporteesQuery.isError]);
  // Both lists are cached per week; switching weeks or leaving the page
  // cancels in-flight requests. Approving or unlocking refreshes them via
  // the shared after-mutation invalidation.
  const approvalsQuery = useApiQuery<ApprovalRow[]>("/approvals/", {
    weekStart,
  });
  const unlockQuery = useApiQuery<timesheetStatusData[]>(
    "/timesheet-week-logs/",
    {
      weekStart,
      timesheet_status: "Requested",
    },
  );
  const approvalData = useMemo(
    () => asArray<ApprovalRow>(approvalsQuery.data)
      .filter((row) => isSuperAdmin || reportees.ids.has(row.id)),
    [approvalsQuery.data, isSuperAdmin, reportees],
  );
  const unlockRequests = useMemo(
    () => asArray<timesheetStatusData>(unlockQuery.data)
      .filter((request) => isSuperAdmin || reportees.usernames.has(request.uid)),
    [unlockQuery.data, isSuperAdmin, reportees],
  );

  const [selectedEmployee, setSelectedEmployee] = useState<ApprovalRow | null>(
    null,
  );

  const [detailOpen, setDetailOpen] = useState<boolean>(false);
  const [ratingsOpen, setRatingsOpen] = useState<boolean>(false);
  const isLoading = approvalsQuery.isPending || (!isSuperAdmin && reporteesQuery.isPending);

  const handleUnlockStatus = useCallback(
    async (id: number, status: string, comments?: string): Promise<boolean> => {
      try {
        const payload: {
          timesheet_status: string;
          comments?: string;
        } = {
          timesheet_status: status,
        };

        if (comments?.trim()) {
          payload.comments = comments.trim();
        }
        await api.patch(`/timesheet-week-logs/${id}/`, payload);

        // Wait for the refreshed unlock list so the handled request disappears at once.
        await unlockQuery.refetch();

        showNotification({
          type: "success",
          message:
            status === "Unlocked"
              ? "Unlock request accepted successfully."
              : status === "Unlock Rejected"
                ? "Unlock request rejected successfully."
                : "Unlock request updated successfully.",
        });

        return true;
      } catch {
        return false;
      }
    },
    [unlockQuery],
  );

  const handleViewEmployee = useCallback((row: ApprovalRow) => {
    setSelectedEmployee(row);
    setDetailOpen(true);
  }, []);

  const columns = useMemo<ColumnData<ApprovalRow>[]>(
    () => [
      // View + name in one column, like the ticket number column: on phone
      // cards the employee's name is the card's heading, not a lone icon.
      {
        dataKey: "name",
        label: "Name",
        width: { xs: "auto", sm: 200 },
        render: (row: ApprovalRow) => (
          <Box sx={inlineCenterGapSx}>
            <Tooltip title="View timesheet">
              <IconButton
                aria-label={`View timesheet for ${row.name ?? "employee"}`}
                onClick={() => handleViewEmployee(row)}
              >
                <VisibilityOutlinedIcon sx={iconMediumSx} color="primary" />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" fontWeight={600} noWrap>
              {row.name}
            </Typography>
          </Box>
        ),
      },

      {
        dataKey: "reporting_to",
        label: "Reporting To",
        width: { xs: "auto", sm: 150 },
      },

      {
        dataKey: "hours",
        label: "Hours",
        width: 90,
        numeric: true,
        format: "hours",
        // Centred so the figure doesn't run into the Overview pills.
        align: "center",
        mobileOrder: 2,
      },

      // Overview
      {
        dataKey: "overview",
        label: "Overview",
        width: 140,
        mobileOrder: 1,
        render: (row: ApprovalRow) => <Pill value={statusLabel(row.overview)} color={statusColor(row.overview)} dot />,
      },

      // Submission Status
      {
        dataKey: "submission_status",
        label: "Submission status",
        width: 180,
        mobileOrder: 3,

        render: (row: ApprovalRow) => (
          <Pill value={statusLabel(row.submission_status)} color={statusColor(row.submission_status)} dot />
        ),
      },

      // Approval Status
      {
        dataKey: "action_status",
        label: "Action status",
        width: 180,
        render: (row: ApprovalRow) => (
          <Pill value={statusLabel(row.action_status)} color={statusColor(row.action_status)} dot />
        ),
      },
    ],
    [handleViewEmployee],
  );

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedEmployee(null);
  };

  return (
    <Box sx={splitPanelContent}>
      {/* Approval Table */}
      <Box sx={approvalPanelSx}>
        <VirtualizedTable<ApprovalRow>
          columns={columns}
          rows={approvalData}
          height="100%"
          tableMinWidth={980}
          tableHead="Team timesheets"
          tableHeadSub={
            <Button
              startIcon={<InfoOutlinedIcon />}
              onClick={() => setRatingsOpen(true)}
              sx={tableHeaderLinkSx}
            >
              How ratings work
            </Button>
          }
          loading={isLoading}
          emptyTitle="No timesheets to approve"
          emptyDescription={!isSuperAdmin && reporteesQuery.isError
            ? "Could not load your reporting team. Please reload the page and try again."
            : `No submissions match the week starting ${formatDate(weekStart)}. Choose another week to review earlier or later submissions.`}
          emptyAction={<Button variant="outlined" onClick={onPreviousWeek}>View previous week</Button>}
        />
      </Box>

      {/* Right Unlock Requests */}
      {unlockRequests.length > 0 && (
        <UnlockComponent
          unlockRequests={unlockRequests}
          handleUnlockStatus={handleUnlockStatus}
        />
      )}

      {/* Employee Details */}
      <ApprovalDetailedView
        open={detailOpen}
        employee={selectedEmployee}
        employees={approvalData}
        onEmployeeChange={setSelectedEmployee}
        onClose={handleCloseDetail}
        weekStart={weekStart}
      />

      <RatingsDistribution
        open={ratingsOpen}
        onClose={() => setRatingsOpen(false)}
      />
    </Box>
  );
};

export default Approval;
