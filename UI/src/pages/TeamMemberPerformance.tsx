import React, { useMemo, useState } from "react";

import {
    Box,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { TableVirtuoso } from "react-virtuoso";

// =====================================================
// TYPES
// =====================================================

interface Ticket {
    id: number;
    ticketNo: string;
    title: string;
    project: string;
    priority: "Low" | "Medium" | "High" | "Critical";
    status: "Completed" | "Pending" | "Delayed";
    assignedDate: string;
    targetDate: string;
    completedDate?: string;
    hours: number;
}

interface TeamMember {
    id: number;
    employee: string;
    ticketsCompleted: number;
    ticketsPending: number;
    ticketsDelayed: number;
    todoList: number;
    hours: number;
    timesheetSubmitted: boolean;
    tickets: Ticket[];
}


// =====================================================
// DUMMY DATA
// =====================================================

const teamMembers: TeamMember[] = [
    {
        id: 1,
        employee: "Arun",
        ticketsCompleted: 6,
        ticketsPending: 1,
        ticketsDelayed: 1,
        todoList: 4,
        hours: 43.5,
        timesheetSubmitted: true,

        tickets: [
            {
                id: 101,
                ticketNo: "TKT-1001",
                title: "Login issue",
                project: "TSM",
                priority: "High",
                status: "Completed",
                assignedDate: "25-08-2026",
                targetDate: "27-08-2026",
                completedDate: "27-08-2026",
                hours: 6,
            },
            {
                id: 102,
                ticketNo: "TKT-1002",
                title: "Dashboard API integration",
                project: "TMS",
                priority: "Medium",
                status: "Completed",
                assignedDate: "24-08-2026",
                targetDate: "28-08-2026",
                completedDate: "28-08-2026",
                hours: 8,
            },
            {
                id: 103,
                ticketNo: "TKT-1003",
                title: "User permission issue",
                project: "TSM",
                priority: "High",
                status: "Delayed",
                assignedDate: "20-08-2026",
                targetDate: "26-08-2026",
                hours: 5,
            },
            {
                id: 104,
                ticketNo: "TKT-1004",
                title: "Timesheet validation",
                project: "TMS",
                priority: "Medium",
                status: "Pending",
                assignedDate: "29-08-2026",
                targetDate: "03-09-2026",
                hours: 3,
            },
        ],
    },

    {
        id: 2,
        employee: "Manu",
        ticketsCompleted: 5,
        ticketsPending: 1,
        ticketsDelayed: 0,
        todoList: 3,
        hours: 41,
        timesheetSubmitted: true,

        tickets: [
            {
                id: 201,
                ticketNo: "TKT-2001",
                title: "Employee creation API",
                project: "TMS",
                priority: "High",
                status: "Completed",
                assignedDate: "22-08-2026",
                targetDate: "27-08-2026",
                completedDate: "26-08-2026",
                hours: 7,
            },
            {
                id: 202,
                ticketNo: "TKT-2002",
                title: "Role management UI",
                project: "TSM",
                priority: "Medium",
                status: "Completed",
                assignedDate: "23-08-2026",
                targetDate: "28-08-2026",
                completedDate: "28-08-2026",
                hours: 6,
            },
            {
                id: 203,
                ticketNo: "TKT-2003",
                title: "Department dropdown",
                project: "TSM",
                priority: "Low",
                status: "Pending",
                assignedDate: "30-08-2026",
                targetDate: "04-09-2026",
                hours: 2,
            },
        ],
    },

    {
        id: 3,
        employee: "Raj",
        ticketsCompleted: 4,
        ticketsPending: 2,
        ticketsDelayed: 1,
        todoList: 5,
        hours: 38,
        timesheetSubmitted: true,

        tickets: [
            {
                id: 301,
                ticketNo: "TKT-3001",
                title: "Approval workflow",
                project: "TMS",
                priority: "Critical",
                status: "Completed",
                assignedDate: "21-08-2026",
                targetDate: "26-08-2026",
                completedDate: "26-08-2026",
                hours: 10,
            },
            {
                id: 302,
                ticketNo: "TKT-3002",
                title: "Approval status API",
                project: "TMS",
                priority: "High",
                status: "Delayed",
                assignedDate: "19-08-2026",
                targetDate: "25-08-2026",
                hours: 6,
            },
            {
                id: 303,
                ticketNo: "TKT-3003",
                title: "Weekly status page",
                project: "TMS",
                priority: "Medium",
                status: "Pending",
                assignedDate: "29-08-2026",
                targetDate: "05-09-2026",
                hours: 4,
            },
        ],
    },

    {
        id: 4,
        employee: "Suresh",
        ticketsCompleted: 3,
        ticketsPending: 2,
        ticketsDelayed: 1,
        todoList: 2,
        hours: 35,
        timesheetSubmitted: false,

        tickets: [
            {
                id: 401,
                ticketNo: "TKT-4001",
                title: "Report export functionality",
                project: "TSM",
                priority: "Medium",
                status: "Completed",
                assignedDate: "23-08-2026",
                targetDate: "28-08-2026",
                completedDate: "28-08-2026",
                hours: 5,
            },
            {
                id: 402,
                ticketNo: "TKT-4002",
                title: "Ticket filter issue",
                project: "TSM",
                priority: "High",
                status: "Delayed",
                assignedDate: "18-08-2026",
                targetDate: "24-08-2026",
                hours: 7,
            },
            {
                id: 403,
                ticketNo: "TKT-4003",
                title: "Comments UI",
                project: "TMS",
                priority: "Low",
                status: "Pending",
                assignedDate: "30-08-2026",
                targetDate: "06-09-2026",
                hours: 3,
            },
        ],
    },
];

// =====================================================
// MAIN COMPONENT
// =====================================================

const TeamMemberPerformance: React.FC = () => {
    const [selectedMember, setSelectedMember] =
        useState<TeamMember | null>(null);

    const columns = useMemo(
        () => [
            {
                key: "employee",
                label: "Employee",
                width: 220,
            },
            {
                key: "completed",
                label: "Completed",
                width: 130,
            },
            {
                key: "pending",
                label: "Pending",
                width: 120,
            },
            {
                key: "delayed",
                label: "Delayed",
                width: 120,
            },
            {
                key: "todo",
                label: "To Do List",
                width: 220,
            },
            {
                key: "hours",
                label: "Hours",
                width: 120,
            },
            {
                key: "timesheet",
                label: "Timesheet",
                width: 130,
            },
        ],
        []
    );

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                p: 2,
                backgroundColor: "#f8fafc",
            }}
        >
            {/* PAGE HEADER */}

            <Box sx={{ mb: 2 }}>
                <Typography
                    sx={{
                        fontSize: 22,
                        fontWeight: 600,
                        color: "#1e293b",
                    }}
                >
                    Team Member Performance
                </Typography>

                <Typography
                    sx={{
                        fontSize: 13,
                        color: "#64748b",
                        mt: 0.5,
                    }}
                >
                    Track team workload, ticket status and timesheet
                    submission.
                </Typography>
            </Box>


            {/* TABLE CARD */}

            <Box
                sx={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    overflow: "hidden",
                    height: "calc(100% - 75px)",
                    width:"100%"
                }}
            >
                <TableVirtuoso style={{ height: "100%" }}
                    data={teamMembers}
                    fixedHeaderContent={() => (
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    style={{
                                        width: `${column.width}%`,
                                        padding: "14px 16px",
                                        textAlign:
                                            column.key === "employee"
                                                ? "left"
                                                : "center",
                                        background: "#f8fafc",
                                        borderBottom:
                                            "1px solid #e2e8f0",
                                        color: "#475569",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                    }}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    )}
                    itemContent={(_, member) => (
                        <>
                            {/* EMPLOYEE */}

                            <td
                                onClick={() =>
                                    setSelectedMember(member)
                                }
                                style={{
                                    padding: "14px 16px",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    color: "#088da5",
                                    borderBottom:
                                        "1px solid #f1f5f9",
                                }}
                            >
                                {member.employee}
                            </td>


                            {/* COMPLETED */}

                            <td
                                style={{
                                    textAlign: "center",
                                    borderBottom:
                                        "1px solid #f1f5f9",
                                }}
                            >
                                <Chip
                                    label={member.ticketsCompleted}
                                    size="small"
                                    sx={{
                                        backgroundColor: "#dcfce7",
                                        color: "#166534",
                                        fontWeight: 600,
                                    }}
                                />
                            </td>


                            {/* PENDING */}

                            <td
                                style={{
                                    textAlign: "center",
                                    borderBottom:
                                        "1px solid #f1f5f9",
                                }}
                            >
                                <Chip
                                    label={member.ticketsPending}
                                    size="small"
                                    sx={{
                                        backgroundColor: "#fef3c7",
                                        color: "#92400e",
                                        fontWeight: 600,
                                    }}
                                />
                            </td>


                            {/* DELAYED */}

                            <td
                                style={{
                                    textAlign: "center",
                                    borderBottom:
                                        "1px solid #f1f5f9",
                                }}
                            >
                                {member.ticketsDelayed > 0 ? (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent:
                                                "center",
                                            alignItems:
                                                "center",
                                            gap: 0.5,
                                        }}
                                    >
                                        <WarningAmberIcon
                                            sx={{
                                                fontSize: 18,
                                                color: "#dc2626",
                                            }}
                                        />

                                        <Typography
                                            sx={{
                                                fontSize: 13,
                                                fontWeight: 600,
                                                color: "#dc2626",
                                            }}
                                        >
                                            {member.ticketsDelayed}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Typography
                                        sx={{
                                            color: "#64748b",
                                            fontSize: 13,
                                        }}
                                    >
                                        0
                                    </Typography>
                                )}
                            </td>


                            {/* TODO */}

                            <td
                                style={{
                                    textAlign: "center",
                                    borderBottom:
                                        "1px solid #f1f5f9",
                                }}
                            >
                                {member.todoList}
                            </td>


                            {/* HOURS */}

                            <td
                                style={{
                                    textAlign: "center",
                                    borderBottom:
                                        "1px solid #f1f5f9",
                                    fontWeight: 600,
                                }}
                            >
                                {member.hours}
                            </td>


                            {/* TIMESHEET */}

                            <td
                                style={{
                                    textAlign: "center",
                                    borderBottom:
                                        "1px solid #f1f5f9",
                                }}
                            >
                                {member.timesheetSubmitted ? (
                                    <CheckCircleOutlineIcon
                                        sx={{
                                            color: "#16a34a",
                                            fontSize: 21,
                                        }}
                                    />
                                ) : (
                                    <WarningAmberIcon
                                        sx={{
                                            color: "#f59e0b",
                                            fontSize: 21,
                                        }}
                                    />
                                )}
                            </td>
                        </>
                    )}
                />
            </Box>


            {/* DETAILS MODAL */}

            <Dialog
                open={Boolean(selectedMember)}
                onClose={() => setSelectedMember(null)}
                maxWidth="lg"
                fullWidth
            >
                {selectedMember && (
                    <>
                        <DialogTitle
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                borderBottom:
                                    "1px solid #e2e8f0",
                            }}
                        >
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: 20,
                                        fontWeight: 600,
                                    }}
                                >
                                    {selectedMember.employee}
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: 13,
                                        color: "#64748b",
                                        mt: 0.5,
                                    }}
                                >
                                    Ticket Details
                                </Typography>
                            </Box>

                            <IconButton
                                onClick={() =>
                                    setSelectedMember(null)
                                }
                            >
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>


                        <DialogContent sx={{ p: 2 }}>
                            {/* SUMMARY */}

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(5, 1fr)",
                                    gap: 1.5,
                                    mb: 2,
                                }}
                            >
                                <SummaryCard
                                    label="Completed"
                                    value={
                                        selectedMember.ticketsCompleted
                                    }
                                    type="success"
                                />

                                <SummaryCard
                                    label="Pending"
                                    value={
                                        selectedMember.ticketsPending
                                    }
                                    type="warning"
                                />

                                <SummaryCard
                                    label="Delayed"
                                    value={
                                        selectedMember.ticketsDelayed
                                    }
                                    type="error"
                                />

                                <SummaryCard
                                    label="Hours"
                                    value={selectedMember.hours}
                                    type="info"
                                />

                                <SummaryCard
                                    label="Timesheet"
                                    value={
                                        selectedMember.timesheetSubmitted
                                            ? "Submitted"
                                            : "Pending"
                                    }
                                    type={
                                        selectedMember.timesheetSubmitted
                                            ? "success"
                                            : "warning"
                                    }
                                />
                            </Box>


                            {/* TICKET TABLE */}

                            <Box
                                sx={{
                                    height: 400,
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "6px",
                                    overflow: "hidden",
                                    width: "100%",
                                }}
                            >
                                <TableVirtuoso
                                    style={{
                                        height: "100%",
                                        width: "100%",
                                    }}
                                    data={selectedMember.tickets}
                                    fixedHeaderContent={() => (
                                        <tr>
                                            <th
                                                style={
                                                    headerStyle
                                                }
                                            >
                                                Ticket
                                            </th>

                                            <th
                                                style={
                                                    headerStyle
                                                }
                                            >
                                                Title
                                            </th>

                                            <th
                                                style={
                                                    headerStyle
                                                }
                                            >
                                                Project
                                            </th>

                                            <th
                                                style={
                                                    headerStyle
                                                }
                                            >
                                                Priority
                                            </th>

                                            <th
                                                style={
                                                    headerStyle
                                                }
                                            >
                                                Status
                                            </th>

                                            <th
                                                style={
                                                    headerStyle
                                                }
                                            >
                                                Assigned Date
                                            </th>

                                            <th
                                                style={
                                                    headerStyle
                                                }
                                            >
                                                Target Date
                                            </th>

                                            <th
                                                style={
                                                    headerStyle
                                                }
                                            >
                                                Hours
                                            </th>
                                        </tr>
                                    )}
                                    itemContent={(_, ticket) => (
                                        <>
                                            <td
                                                style={{
                                                    ...cellStyle,
                                                    width: "30%"
                                                }}
                                                // style={
                                                //     cellStyle
                                                // }
                                            >
                                                <Typography
                                                    sx={{
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        color: "#088da5",
                                                    }}
                                                >
                                                    {
                                                        ticket.ticketNo
                                                    }
                                                </Typography>
                                            </td>

                                            <td
                                                style={{
                                                    ...cellStyle,
                                                    width: "20%"
                                                }}
                                            >
                                                {
                                                    ticket.title
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    ...cellStyle,
                                                    width: "10%"
                                                }}
                                            >
                                                {
                                                    ticket.project
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    ...cellStyle,
                                                    width: "10%"
                                                }}
                                            >
                                                <PriorityChip
                                                    priority={
                                                        ticket.priority
                                                    }
                                                />
                                            </td>

                                            <td
                                                style={{
                                                    ...cellStyle,
                                                    width: "10%"
                                                }}
                                            >
                                                <StatusChip
                                                    status={
                                                        ticket.status
                                                    }
                                                />
                                            </td>

                                            <td
                                                style={{
                                                    ...cellStyle,
                                                    width: "10%"
                                                }}
                                            >
                                                {
                                                    ticket.assignedDate
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    ...cellStyle,
                                                    width: "10%"
                                                }}
                                            >
                                                {
                                                    ticket.targetDate
                                                }
                                            </td>

                                            <td
                                                style={{
                                                    ...cellStyle,
                                                    textAlign:
                                                        "center",
                                                        width: "10%"
                                                }}
                                            >
                                                {ticket.hours}
                                            </td>
                                        </>
                                    )}
                                />
                            </Box>
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </Box>
    );
};


// =====================================================
// SUMMARY CARD
// =====================================================

interface SummaryCardProps {
    label: string;
    value: string | number;
    type: "success" | "warning" | "error" | "info";
}

const SummaryCard: React.FC<SummaryCardProps> = ({
    label,
    value,
    type,
}) => {
    const styles = {
        success: {
            background: "#f0fdf4",
            color: "#166534",
        },
        warning: {
            background: "#fffbeb",
            color: "#92400e",
        },
        error: {
            background: "#fef2f2",
            color: "#991b1b",
        },
        info: {
            background: "#f0f9ff",
            color: "#075985",
        },
    };

    return (
        <Box
            sx={{
                p: 1.5,
                borderRadius: "6px",
                backgroundColor: styles[type].background,
            }}
        >
            <Typography
                sx={{
                    fontSize: 12,
                    color: "#64748b",
                }}
            >
                {label}
            </Typography>

            <Typography
                sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: styles[type].color,
                    mt: 0.5,
                }}
            >
                {value}
            </Typography>
        </Box>
    );
};


// =====================================================
// STATUS CHIP
// =====================================================

const StatusChip: React.FC<{
    status: Ticket["status"];
}> = ({ status }) => {
    if (status === "Completed") {
        return (
            <Chip
                icon={
                    <CheckCircleOutlineIcon
                        sx={{ fontSize: 16 }}
                    />
                }
                label="Completed"
                size="small"
                sx={{
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                    fontWeight: 600,
                }}
            />
        );
    }

    if (status === "Delayed") {
        return (
            <Chip
                icon={
                    <WarningAmberIcon
                        sx={{ fontSize: 16 }}
                    />
                }
                label="Delayed"
                size="small"
                sx={{
                    backgroundColor: "#fee2e2",
                    color: "#991b1b",
                    fontWeight: 600,
                }}
            />
        );
    }

    return (
        <Chip
            icon={
                <AccessTimeIcon
                    sx={{ fontSize: 16 }}
                />
            }
            label="Pending"
            size="small"
            sx={{
                backgroundColor: "#fef3c7",
                color: "#92400e",
                fontWeight: 600,
            }}
        />
    );
};


// =====================================================
// PRIORITY CHIP
// =====================================================

const PriorityChip: React.FC<{ priority: Ticket["priority"]; }> = ({ priority }) => {
    return (
        <Chip
            label={priority}
            size="small"
            variant="outlined"
            sx={{
                fontSize: 11,
                fontWeight: 500,
            }}
        />
    ); 
};


// =====================================================
// TABLE STYLES
// =====================================================

const headerStyle: React.CSSProperties = {
    padding: "12px 14px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    color: "#475569",
    fontSize: "12px",
    fontWeight: 600,
    textAlign: "left",
    whiteSpace: "nowrap",
};

const cellStyle: React.CSSProperties = {
    padding: "12px 14px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "13px",
    color: "#334155",
    whiteSpace: "nowrap",
};


export default TeamMemberPerformance;