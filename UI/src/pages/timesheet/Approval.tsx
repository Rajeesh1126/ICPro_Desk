import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
} from "@mui/material";

import {
  approvalPageContainerSx,
  approvalTableContainerSx,
  unlockRequestStyles 
} from "../../styles/common";

// import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { VirtualizedTable, type ColumnData, } from "../../components/common/TableView";
import api from "../../api/axios";
import type { ApprovalRow,timesheetStatusData } from "../../types/dataTypes";
import ApprovalDetailedView from "../../components/Approval/ApprovalDetailedView";

interface ApprovalProps {
    weekStart: string;
    refreshKey: number;
}
const Approval: React.FC<ApprovalProps> = ({ weekStart,refreshKey, }: ApprovalProps) => {
    const [unlockRequests, setUnlockRequests] = useState<timesheetStatusData[]>([]);
    const [approvalData, setApprovalData] = useState<ApprovalRow[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<ApprovalRow | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [weeknumber, setWeeknumber] = useState<number>(35);
    const [weekyear, setWeekyear] = useState<number>(2026);

    // Approval first table Data
    useEffect(() => {
        // if (!open) return;
        let active = true;
        void api
        .get("/approvals/", {
                params: {
                    weekStart,
                },
            })
        .then((response) => {
            console.log("Approval Data",response.data)
            if (!active) return;
            setApprovalData(response.data);
        })
        .catch((error) => {
            console.error("Failed to load roles", error)
        });
        return () => {
            active = false;
        };
    }, [weekStart, refreshKey]);

    // timesheet_status Data
    useEffect(() => {
        let active = true;

        void api
            .get("/timesheet-statuses/", {
                params: {
                    weekStart,
                    timesheetstatus:"locked"
                },
            })
            .then((response) => {
                if (!active) return;

                console.log("timesheet-statuses", response.data);

                setUnlockRequests(response.data);
            })
            .catch((error) => {
                console.error(
                    "Failed to load timesheet statuses",
                    error
                );
            });

        return () => {
            active = false;
        };
    }, [weekStart, refreshKey]);

    const handleAccept = (id: number) => {
        setUnlockRequests((previous) =>
            previous.filter((request) => request.id !== id)
        );
    };

    const handleReject = (id: number) => {
        setUnlockRequests((previous) =>
            previous.filter((request) => request.id !== id)
        );
    };

    const columns = useMemo(
        () => [
            { label: "#", width: 10, render: (_row: ApprovalRow, index: number) => index + 1, number: true, },
            { dataKey: "name",label: "Name", width: 200, },
            { dataKey: "reporting_to",label: "Reporting To", width: 210, },
            { dataKey: "hours", label: "Hours", width: 90, },
            {
                dataKey: "overview",
                label: "Overview",
                width: 130,
                render: (row: ApprovalRow) => (
                    <Typography
                        sx={{
                            fontSize: 12,
                            color:
                                row.overview === "Accepted"
                                    ? "#00c853"
                                    : row.overview === "Locked"
                                      ? "#2196f3"
                                      : "#2196f3",
                        }}
                    >
                        {row.overview}
                    </Typography>
                ),
            },
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
                                    : "#00c853",
                        }}
                    >
                        {row.submission_status}
                    </Typography>
                ),
            },
            {
                dataKey: "approval_status",
                label: "Approval status",
                width: 180,
                render: (row: ApprovalRow) => (
                    <Typography
                        sx={{
                            fontSize: 12,
                            color:
                                row.approval_status === "OnTime"
                                    ? "#00c853"
                                    : "#2196f3",
                        }}
                    >
                        {row.approval_status}
                    </Typography>
                ),
            },
            {
                dataKey: "view",
                label: "View",
                width: 60,
                render: (row: ApprovalRow) => (
                    <IconButton
                        size="small"
                        onClick={() => handleViewEmployee(row)}
                        sx={{
                            p: 0,
                            color: "#38b5d0",
                        }}
                    >
                        <VisibilityIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                ),
            },
        ],
        []
    );

    const handleViewEmployee = (row: ApprovalRow) => {
        setSelectedEmployee(row);
        setDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailOpen(false);
        setSelectedEmployee(null);
    };

    return (
        <Box sx={approvalPageContainerSx}>

        {/* Virtualized Table */}
        <Box sx={approvalTableContainerSx}>
            <VirtualizedTable<ApprovalRow>
            columns={columns}
            rows={approvalData}
            height="400px"
            />
        </Box>

        {/* ================= RIGHT UNLOCK REQUESTS ================= */}
        <Box sx={unlockRequestStyles.container}>

            {/* Header */}
            <Box sx={unlockRequestStyles.header}>
                <Typography sx={unlockRequestStyles.headerTitle}>
                    Unlock Requests ({unlockRequests.length})
                </Typography>
            </Box>

            {/* Request List */}
            <Box sx={unlockRequestStyles.requestList}>

                {unlockRequests.map((request) => (
                    <Card
                        key={request.id}
                        elevation={0}
                        sx={unlockRequestStyles.card}
                    >
                        {/* Request Header */}
                        <Box sx={unlockRequestStyles.cardHeader}>
                            <Typography
                                sx={unlockRequestStyles.cardHeaderText}
                            >
                                {request.first_name} - Unlock Request
                            </Typography>
                        </Box>

                        {/* Body */}
                        <CardContent sx={unlockRequestStyles.cardContent}>

                            <Typography sx={unlockRequestStyles.reason}>
                                <strong>Reason:</strong>{" "}
                                {request.unlock_reason}
                            </Typography>

                            <Box sx={unlockRequestStyles.buttonContainer}>

                                {/* ACCEPT */}
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() =>
                                        handleAccept(request.id)
                                    }
                                    sx={unlockRequestStyles.acceptButton}
                                >
                                    ACCEPT
                                </Button>

                                {/* REJECT */}
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() =>
                                        handleReject(request.id)
                                    }
                                    sx={unlockRequestStyles.rejectButton}
                                >
                                    REJECT
                                </Button>

                            </Box>
                        </CardContent>
                    </Card>
                ))}

                {/* Empty State */}
                {unlockRequests.length === 0 && (
                    <Box sx={unlockRequestStyles.emptyState}>
                        <Typography sx={unlockRequestStyles.emptyText}>
                            No unlock requests
                        </Typography>
                    </Box>
                )}

            </Box>

        </Box>

    <ApprovalDetailedView
        open={detailOpen}
        employee={selectedEmployee}
        onClose={handleCloseDetail}
    />
    </Box>
    );
};

export default Approval;