import React, { useCallback, useMemo, useState } from "react";
import { StatusPill } from "@/components/common/StatusPill";
import { Box, Button, IconButton } from "@mui/material";

import {
  splitPanelContent,
  tableHeaderLinkSx,
  approvalPanelSx,
  iconMediumSx,
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

const Approval: React.FC<ApprovalProps> = ({ weekStart, onPreviousWeek }) => {
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
    () => asArray<ApprovalRow>(approvalsQuery.data),
    [approvalsQuery.data],
  );
  const unlockRequests = useMemo(
    () => asArray<timesheetStatusData>(unlockQuery.data),
    [unlockQuery.data],
  );

  const [selectedEmployee, setSelectedEmployee] = useState<ApprovalRow | null>(
    null,
  );

  const [detailOpen, setDetailOpen] = useState(false);
  const [ratingsOpen, setRatingsOpen] = useState(false);
  const isLoading = approvalsQuery.isPending;

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
      // View
      {
        dataKey: "view",
        label: "",
        width: 54,

        render: (row: ApprovalRow) => (
          <IconButton
            aria-label={`View timesheet for ${row.name ?? "employee"}`}
            onClick={() => handleViewEmployee(row)}
          >
            <VisibilityOutlinedIcon sx={iconMediumSx} />
          </IconButton>
        ),
      },

      {
        dataKey: "name",
        label: "Name",
        width: { xs: "auto", sm: 140 },
      },

      {
        dataKey: "reporting_to",
        label: "Reporting To",
        width: { xs: "auto", sm: 150 },
      },

      {
        dataKey: "hours",
        label: "Hours",
        width: 80,
        numeric: true,
      },

      // Overview
      {
        dataKey: "overview",
        label: "Overview",
        width: 130,
        render: (row: ApprovalRow) => <StatusPill status={row.overview} />,
      },

      // Submission Status
      {
        dataKey: "submission_status",
        label: "Submission status",
        width: 180,

        render: (row: ApprovalRow) => (
          <StatusPill status={row.submission_status} />
        ),
      },

      // Approval Status
      {
        dataKey: "action_status",
        label: "Action status",
        width: 180,
        render: (row: ApprovalRow) => (
          <StatusPill status={row.action_status} />
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
          tableHead="Submitted timesheets"
          tableHeadSub={
            <Button
              size="small"
              startIcon={<InfoOutlinedIcon />}
              onClick={() => setRatingsOpen(true)}
              sx={tableHeaderLinkSx}
            >
              How ratings work
            </Button>
          }
          loading={isLoading}
          emptyTitle="No timesheets to approve"
          emptyDescription={`No submissions match the week starting ${formatDate(weekStart)}. Choose another week to review earlier or later submissions.`}
          emptyAction={<Button size="small" variant="outlined" onClick={onPreviousWeek}>View previous week</Button>}
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
