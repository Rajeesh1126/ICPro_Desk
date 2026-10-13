import React, { useCallback, useMemo, useState } from "react";
import StatusIndicator from "../../components/common/StatusIndicator";
import {
    Box,
    IconButton,
} from "@mui/material";

import {
    flexFillPanel,
    splitPanelContent,
} from "../../styles/common";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import {
    VirtualizedTable,
    type ColumnData,
} from "../../components/common/TableView";

import api from "../../api/axios";
import { asArray, useApiQuery } from "../../api/useApiQuery";
import { showNotification } from "../../api/notificationService";

import type {
    ApprovalRow,
    timesheetStatusData,
} from "../../types/dataTypes";

import ApprovalDetailedView from "../../components/approval/ApprovalDetailedView";
import UnlockComponent from "../../components/approval/UnlockComponent";
import RatingsDistribution from "../../components/timesheet/RatingsDistribution";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface ApprovalProps {
    weekStart: string;
}

const Approval: React.FC<ApprovalProps> = ({
    weekStart,
}) => {
    // Both lists are cached per week; switching weeks or leaving the page
    // cancels in-flight requests. Approving or unlocking refreshes them via
    // the shared after-mutation invalidation.
    const approvalsQuery = useApiQuery<ApprovalRow[]>("/approvals/", { weekStart });
    const unlockQuery = useApiQuery<timesheetStatusData[]>("/timesheet-week-logs/", {
        weekStart,
        timesheet_status: "Requested",
    });
    const approvalData = useMemo(
        () => asArray<ApprovalRow>(approvalsQuery.data),
        [approvalsQuery.data],
    );
    const unlockRequests = useMemo(
        () => asArray<timesheetStatusData>(unlockQuery.data),
        [unlockQuery.data],
    );

    const [selectedEmployee, setSelectedEmployee] =
        useState<ApprovalRow | null>(null);

    const [detailOpen, setDetailOpen] = useState(false);
    const [ratingsOpen, setRatingsOpen] = useState(false);
    const isLoading = approvalsQuery.isPending;

    const handleUnlockStatus = useCallback(async (
        id: number,
        status: string,
        comments?: string
    ): Promise<boolean> => {
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
            await api.patch(
                `/timesheet-week-logs/${id}/`,
                payload
            );

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
    }, [unlockQuery]);

    const handleViewEmployee = useCallback((row: ApprovalRow) => {
        setSelectedEmployee(row);
        setDetailOpen(true);
    }, []);


    const columns = useMemo<ColumnData<ApprovalRow>[]>(
        () => [
            {
                label: "#",
                width: 40,
                render: (
                    _row: ApprovalRow,
                    index: number
                ) => index + 1,
                numeric: true,
            },
            // View
            {
                dataKey: "view",
                label: "",
                width: 54,

                render: (row: ApprovalRow) => (
                    <IconButton
                        size="small"
                        aria-label={`View timesheet for ${row.name ?? "employee"}`}
                        onClick={() =>
                            handleViewEmployee(row)
                        }
                    >
                        <VisibilityOutlinedIcon
                            sx={{ fontSize: 20 }}
                        />
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
            },

            // Overview
            {
                dataKey: "overview",
                label: "Overview",
                width: 130,
                render: (row: ApprovalRow) => <StatusIndicator status={row.overview} />,
            },

            // Submission Status
            {
                dataKey: "submission_status",
                label: "Submission status",
                width: 180,

                render: (row: ApprovalRow) => (
                    <StatusIndicator status={row.submission_status} />
                ),
            },

            // Approval Status
            {
                dataKey: "action_status",
                label: "Action status",
                width: 180,
                render: (row: ApprovalRow) => <StatusIndicator status={row.action_status} />,
            },

            
        ],
        [handleViewEmployee]
    );

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelectedEmployee(null);
    };

    return (
        <Box sx={splitPanelContent}>

            {/* Approval Table */}
            <Box sx={{ ...flexFillPanel, display: "flex", flexDirection: "column" }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        px: 1,
                        pb: 1,
                    }}
                >
                    <Box
                        component="button"
                        type="button"
                        onClick={() => setRatingsOpen(true)}
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            border: 0,
                            p: 0,
                            background: "none",
                            color: "primary.main",
                            cursor: "pointer",
                            font: "inherit",
                            fontSize: 13,
                            fontWeight: 700,
                            "&:hover": { textDecoration: "underline" },
                        }}
                    >
                        Rating info
                        <InfoOutlinedIcon sx={{ fontSize: 18 }} />
                    </Box>
                </Box>
                <VirtualizedTable<ApprovalRow>
                    columns={columns}
                    rows={approvalData}
                    height="100%"
                    tableMinWidth={980}
                    tableHead="Submitted User List"
                    loading={isLoading}
                    emptyTitle="No timesheets to approve"
                    emptyDescription={`No submissions match the week starting ${weekStart}. Choose another week to review earlier or later submissions.`}
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
