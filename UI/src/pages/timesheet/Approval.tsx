import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Badge,
    Box,
    Chip,
    IconButton,
    Typography,
} from "@mui/material";

import {
    flexFillPanel,
    formatStatusLabel,
    getStatusColor,
    splitPanelContent,
    tableViewBoxSx1,
    tableViewTypographySx1,
} from "../../styles/common";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import {
    VirtualizedTable,
    type ColumnData,
} from "../../components/common/TableView";

import api from "../../api/axios";

import type {
    ApprovalRow,
    timesheetStatusData,
} from "../../types/dataTypes";

import ApprovalDetailedView from "../../components/approval/ApprovalDetailedView";
import UnlockComponent from "../../components/approval/UnlockComponent";

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

    const getStatusChipColor = useCallback((status: string | undefined) => {
        if (status === "Rejected" || status === "Not Submitted" || status === "Delayed") {
            return "error";
        }

        if (status === "Accepted" || status === "OnTime") {
            return "success";
        }

        if (status === "Submitted") {
            return "primary";
        }

        return "info";
    }, []);

    const renderStatusText = useCallback((status: string | undefined) => (
        <Box sx={tableViewBoxSx1}>
            <Badge
                aria-hidden="true"
                variant="dot"
                sx={{
                    "& .MuiBadge-badge": {
                        backgroundColor: getStatusColor(status),
                    },
                }}
            />
            <Typography
                component="span"
                variant="body2"
                sx={tableViewTypographySx1}
            >
                {formatStatusLabel(status)}
            </Typography>
        </Box>
    ), []);

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
                        onClick={() =>
                            handleViewEmployee(row)
                        }
                        sx={{
                            p: 0,
                            color: "#38b5d0",
                        }}
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
                render: (row: ApprovalRow) => renderStatusText(row.overview),
            },

            // Submission Status
            {
                dataKey: "submission_status",
                label: "Submission status",
                width: 180,

                render: (row: ApprovalRow) => (
                    <Chip
                        size="small"
                        label={row.submission_status}
                        color={getStatusChipColor(row.submission_status)}
                        variant="outlined"
                        sx={{
                            height: 24,
                            borderRadius: 1,
                            fontSize: 11,
                            fontWeight: 800,
                        }}
                    />
                ),
            },

            // Approval Status
            {
                dataKey: "approval_status",
                label: "Approval status",
                width: 180,
                render: (row: ApprovalRow) => renderStatusText(row.approval_status),
            },

            
        ],
        [getStatusChipColor, handleViewEmployee, renderStatusText]
    );

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelectedEmployee(null);
    };

    return (
        <Box sx={splitPanelContent}>

            {/* Approval Table */}
            <Box sx={flexFillPanel}>
                <VirtualizedTable<ApprovalRow>
                    columns={columns}
                    rows={approvalData}
                    height="100%"
                    tableMinWidth={980}
                    tableHead="Submitted User List"

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
