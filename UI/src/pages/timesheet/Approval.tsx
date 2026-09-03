import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box,
    IconButton,
    Typography,
} from "@mui/material";

import {
    approvalPageContainerSx,
    approvalTableContainerSx,
} from "../../styles/common";

import VisibilityIcon from "@mui/icons-material/Visibility";

import {
    VirtualizedTable,
} from "../../components/common/TableView";

import api from "../../api/axios";

import type {
    ApprovalRow,
    timesheetStatusData,
} from "../../types/dataTypes";

import ApprovalDetailedView from "../../components/Approval/ApprovalDetailedView";
import UnlockComponent from "../../components/Approval/UnlockComponent";

interface ApprovalProps {
    weekStart: string;
    refreshKey: number;
}

const Approval: React.FC<ApprovalProps> = ({
    weekStart,
    refreshKey,
}) => {
    const [unlockRequests, setUnlockRequests] = useState<
        timesheetStatusData[]
    >([]);

    const [approvalData, setApprovalData] = useState<ApprovalRow[]>([]);

    const [selectedEmployee, setSelectedEmployee] =
        useState<ApprovalRow | null>(null);

    const [detailOpen, setDetailOpen] = useState(false);

    useEffect(() => {
        let active = true;

        void api
            .get("/approvals/", {
                params: {
                    weekStart,
                },
            })
            .then((response) => {
                console.log("Approval Data", response.data);

                if (!active) return;

                setApprovalData(response.data);
            })
            .catch((error) => {
                console.error(
                    "Failed to load approval data",
                    error
                );
            });

        return () => {
            active = false;
        };
    }, [weekStart, refreshKey]);

    const fetchUnlockRequests = useCallback(async () => {
        try {
            const response = await api.get("/timesheet-statuses/", {
                params: {
                    weekStart,
                    timesheetstatus: "Requested",
                },
            });

            console.log("timesheet-statuses", response.data);

            setUnlockRequests(response.data);
        } catch (error) {
            console.error(
                "Failed to load timesheet statuses",
                error
            );
        }
    }, [weekStart]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchUnlockRequests();
        }, 0);

        return () => {
            window.clearTimeout(timer);
        };
    }, [fetchUnlockRequests, refreshKey]);

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
            console.log(payload)
            await api.patch(
                `/timesheet-statuses/${id}/`,
                payload
            );

            // Refresh unlock requests from backend
            await fetchUnlockRequests();

            return true;
        } catch (error) {
            console.error(
                "Failed to update unlock request:",
                error
            );

            return false;
        }
    }, [fetchUnlockRequests]);

    const handleViewEmployee = useCallback((row: ApprovalRow) => {
        setSelectedEmployee(row);
        setDetailOpen(true);
    }, []);

    const columns = useMemo(
        () => [
            {
                label: "#",
                width: 10,
                render: (
                    _row: ApprovalRow,
                    index: number
                ) => index + 1,
                number: true,
            },

            {
                dataKey: "name",
                label: "Name",
                width: 200,
            },

            {
                dataKey: "reporting_to",
                label: "Reporting To",
                width: 210,
            },

            {
                dataKey: "hours",
                label: "Hours",
                width: 90,
            },

            // Overview
            {
                dataKey: "overview",
                label: "Overview",
                width: 130,

                render: (row: ApprovalRow) => (
                    <Typography
                        sx={{
                            fontSize: 12,
                            color:
                                row.overview === "Rejected"
                                    ? "#dc3545"
                                    : row.overview === "Accepted"
                                    ? "#198754"
                                    : row.overview === "Submitted"
                                    ? "#0d6efd"
                                    : row.overview === "Not Submitted"
                                    ? "#dc3545"
                                    : "#0dcaf0",
                        }}
                    >
                        {row.overview}
                    </Typography>
                ),
            },

            // Submission Status
            {
                dataKey: "submission_status",
                label: "Submission status",
                width: 150,

                render: (row: ApprovalRow) => (
                    <Typography
                        sx={{
                            fontSize: 12,
                            color:
                                row.submission_status === "Delayed"
                                    ? "#ff3b3b"
                                    : row.submission_status === "OnTime"
                                    ? "#00c853"
                                    : "#0dcaf0",
                        }}
                    >
                        {row.submission_status}
                    </Typography>
                ),
            },

            // Approval Status
            {
                dataKey: "action_status",
                label: "Action status",
                width: 180,

                render: (row: ApprovalRow) => (
                    <Typography
                        sx={{
                            fontSize: 12,
                            color:
                                row.action_status === "OnTime"
                                    ? "#00c853"
                                    : row.action_status === "Delayed"
                                    ? "#ff3b3b"
                                    : "#0dcaf0",
                        }}
                    >
                        {row.action_status}
                    </Typography>
                ),
            },

            // View
            {
                dataKey: "view",
                label: "View",
                width: 60,

                render: (row: ApprovalRow) => (
                    <IconButton
                        size="small"
                        onClick={() =>
                            handleViewEmployee(row)
                        }
                        sx={{
                            p: 0,
                            color: "#38b5d0",
                        }}
                    >
                        <VisibilityIcon
                            sx={{ fontSize: 17 }}
                        />
                    </IconButton>
                ),
            },
        ],
        [handleViewEmployee]
    );

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelectedEmployee(null);
    };

    return (
        <Box sx={approvalPageContainerSx}>

            {/* Approval Table */}
            <Box sx={approvalTableContainerSx}>
                <VirtualizedTable<ApprovalRow>
                    columns={columns}
                    rows={approvalData}
                    height="70dvh"
                    tableHead="Submited User List"

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

        </Box>
    );
};

export default Approval;
