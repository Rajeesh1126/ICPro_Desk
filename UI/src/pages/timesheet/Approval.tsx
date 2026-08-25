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

// import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { VirtualizedTable, type ColumnData, } from "../../components/common/TableView";
import api from "../../api/axios";
import type { ApprovalRow } from "../../types/dataTypes";
import ApprovalDetailModal from "../../components/Approval/ApprovalDetailModal";
// const [refreshKey, setRefreshKey] = useState(0);

interface UnlockRequest {
    id: number;
    employee_name: string;
    reason: string;
}

const initialUnlockRequests: UnlockRequest[] = [
    {
        id: 1,
        employee_name: "Sithosh TS",
        reason: "missed to enter",
    },
    {
        id: 2,
        employee_name: "Mamatha",
        reason: "forgot",
    },
    {
        id: 3,
        employee_name: "Arjun S",
        reason: "Not submitted",
    },
];

const Approval: React.FC = () => {
    // const [search, setSearch] = useState("");

    const [unlockRequests, setUnlockRequests] = useState<UnlockRequest[]>(initialUnlockRequests);
    const [approvalData, setApprovalData] = useState<ApprovalRow[]>([]);

    // role Data
    useEffect(() => {
        // if (!open) return;
        let active = true;
        void api
        .get("/approvals/")
        .then((response) => {
            console.log("Roles",response.data)
            if (!active) return;
            setApprovalData(response.data);
        })
        .catch((error) => {
            console.error("Failed to load roles", error)
        });
        return () => {
            active = false;
        };
    // }, [open, refreshKey]);
    }, []);

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
            {
                dataKey: "id",
                label: "#",
                width: 45,
                render: (row: ApprovalRow) => (
                    <Typography
                        sx={{
                            fontSize: 12,
                            color: "#ffffff",
                        }}
                    >
                        {row.id}
                    </Typography>
                ),
            },
            {
                dataKey: "name",
                label: "Name",
                width: 200,
                render: (row: ApprovalRow) => (
                    <Typography
                        sx={{
                            fontSize: 12,
                            color: "#168bd1",
                            cursor: "pointer",
                            "&:hover": {
                                textDecoration: "underline",
                            },
                        }}
                    >
                        {row.name}
                    </Typography>
                ),
            },
            {
                dataKey: "reporting_to",
                label: "Reporting To",
                width: 210,
                render: (row: ApprovalRow) => (
                    <Typography
                        sx={{
                            fontSize: 12,
                            color: "#168bd1",
                        }}
                    >
                        {row.reporting_to}
                    </Typography>
                ),
            },
            {
                dataKey: "hours",
                label: "Hours",
                width: 90,
                render: (row: ApprovalRow) => (
                    <Typography
                        sx={{
                            fontSize: 12,
                            color: "#ffffff",
                        }}
                    >
                        {row.hours.toFixed(2)}
                    </Typography>
                ),
            },
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
                        onClick={() =>
                            console.log("View employee:", row)
                        }
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

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                minHeight: 0,
                display: "flex",
                gap: "5px",
                overflow: "hidden",
                p: "4px",
            }}
        >
            {/* Virtualized Table */}
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflow: "hidden",
                }}
            >
                <VirtualizedTable<ApprovalRow>
                    columns={columns}
                    rows={approvalData}
                    height="100%"
                />
            </Box>

            {/* ================= RIGHT UNLOCK REQUESTS ================= */}
            <Box
                sx={{
                    width: 300,
                    flexShrink: 0,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    backgroundColor: "#111a28",
                    border: "1px solid #4b5665",
                    borderRadius:"10px"
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        height: 37,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        px: 1,
                        backgroundColor: "#111a28",
                        borderBottom: "1px solid #4b5665",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#ffffff",
                        }}
                    >
                        Unlock Requests ({unlockRequests.length})
                    </Typography>
                </Box>

                {/* Request List */}
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        p: 0.5,

                        "&::-webkit-scrollbar": {
                            width: 7,
                        },

                        "&::-webkit-scrollbar-track": {
                            backgroundColor: "#111a28",
                        },

                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "#4c5969",
                            borderRadius: 4,
                        },
                    }}
                >
                    {unlockRequests.map((request) => (
                        <Card
                            key={request.id}
                            elevation={0}
                            sx={{
                                mb: 0.75,
                                borderRadius: "4px",
                                overflow: "hidden",
                                backgroundColor: "#172232",
                                border: "1px solid #465568",
                            }}
                        >
                            {/* Blue Header */}
                            <Box
                                sx={{
                                    px: 1,
                                    py: 0.65,
                                    backgroundColor: "#3f78c9",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: "#ffffff",
                                    }}
                                >
                                    {request.employee_name} -
                                    Unlock Request
                                </Typography>
                            </Box>

                            {/* Body */}
                            <CardContent
                                sx={{
                                    p: 1,
                                    "&:last-child": {
                                        pb: 1,
                                    },
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: 12,
                                        color: "#ffffff",
                                        mb: 1,
                                    }}
                                >
                                    <strong>Reason:</strong>{" "}
                                    {request.reason}
                                </Typography>

                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 1,
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() =>
                                            handleAccept(request.id)
                                        }
                                        sx={{
                                            minWidth: 70,
                                            height: 28,
                                            fontSize: 10,
                                            fontWeight: 600,
                                            color: "#06120b",
                                            backgroundColor:
                                                "#00b84a",
                                            boxShadow: "none",
                                            "&:hover": {
                                                backgroundColor:
                                                    "#00a642",
                                                boxShadow: "none",
                                            },
                                        }}
                                    >
                                        ACCEPT
                                    </Button>

                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() =>
                                            handleReject(request.id)
                                        }
                                        sx={{
                                            minWidth: 70,
                                            height: 28,
                                            fontSize: 10,
                                            fontWeight: 600,
                                            backgroundColor:
                                                "#e84668",
                                            boxShadow: "none",
                                            "&:hover": {
                                                backgroundColor:
                                                    "#d63859",
                                                boxShadow: "none",
                                            },
                                        }}
                                    >
                                        REJECT
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}

                    {unlockRequests.length === 0 && (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: 100,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: 12,
                                    color: "#7f8da0",
                                }}
                            >
                                No unlock requests
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default Approval;