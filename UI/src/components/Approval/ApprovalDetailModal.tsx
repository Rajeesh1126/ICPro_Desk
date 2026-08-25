import React, { useMemo, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    IconButton,
    MenuItem,
    Select,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export interface ApprovalRow {
    [key: string]: unknown;

    id: number;
    name: string;
    reporting_to: string;
    hours: number;

    overview:
        | "Submitted"
        | "Accepted"
        | "Rejected"
        | "Unlocked"
        | "Not Submitted";

    submission_status:
        | "OnTime"
        | "Delayed"
        | `Due by ${string}`;

    approval_status:
        | "OnTime"
        | "Delayed"
        | `Due by ${string}`;
}

interface TaskRow {
    id: number;
    project: string;
    task: string;
    budgetOwner: string;
    hours: number[];
    rating: string;
    status: "Accepted" | "Rejected" | "Pending";
}

interface ApprovalDetailModalProps {
    open: boolean;
    employee: ApprovalRow | null;
    onClose: () => void;
}

const ApprovalDetailModal: React.FC<
    ApprovalDetailModalProps
> = ({ open, employee, onClose }) => {
    const [tasks, setTasks] = useState<TaskRow[]>([
        {
            id: 1,
            project: "ICP/SD/0935",
            task: "Application development",
            budgetOwner: "Ranjan K",
            hours: [0, 9, 8, 8, 8, 0, 0],
            rating: "Good",
            status: "Accepted",
        },
        {
            id: 2,
            project: "Non Projects",
            task: "Team building",
            budgetOwner: "Rajeesh k",
            hours: [9, 0, 0, 0, 0, 0, 0],
            rating: "",
            status: "Accepted",
        },
        {
            id: 3,
            project: "Training",
            task: "Internal Training",
            budgetOwner: "Rajeesh k",
            hours: [0, 0, 1, 1, 1, 0, 0],
            rating: "",
            status: "Accepted",
        },
    ]);

    const days = [
        "Mon-17",
        "Tue-18",
        "Wed-19",
        "Thu-20",
        "Fri-21",
        "Sat-22",
        "Sun-23",
    ];

    const dailyTotals = useMemo(() => {
        return days.map((_, index) =>
            tasks.reduce(
                (total, task) =>
                    total + (task.hours[index] || 0),
                0
            )
        );
    }, [tasks]);

    const actualHours = useMemo(() => {
        return dailyTotals.reduce(
            (total, value) => total + value,
            0
        );
    }, [dailyTotals]);

    const handleRatingChange = (
        taskId: number,
        value: string
    ) => {
        setTasks((previous) =>
            previous.map((task) =>
                task.id === taskId
                    ? {
                          ...task,
                          rating: value,
                      }
                    : task
            )
        );
    };

    const handleAccept = (taskId: number) => {
        setTasks((previous) =>
            previous.map((task) =>
                task.id === taskId
                    ? {
                          ...task,
                          status: "Accepted",
                      }
                    : task
            )
        );
    };

    const handleReject = (taskId: number) => {
        setTasks((previous) =>
            previous.map((task) =>
                task.id === taskId
                    ? {
                          ...task,
                          status: "Rejected",
                      }
                    : task
            )
        );
    };

    if (!employee) {
        return null;
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xl"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 0,
                    width: "100%",
                    maxWidth: "1250px",
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    px: 1.5,
                    borderBottom: "1px solid #ddd",
                }}
            >
                <Typography
                    sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#555",
                    }}
                >
                    Project Detailed View of {employee.name}
                </Typography>

                <Typography
                    sx={{
                        ml: "auto",
                        mr: 2,
                        fontSize: 12,
                        color: "#168bd1",
                    }}
                >
                    {employee.overview === "Accepted"
                        ? "Timesheet is already Accepted"
                        : employee.approval_status}
                </Typography>

                <IconButton
                    size="small"
                    onClick={onClose}
                    sx={{ p: 0.3 }}
                >
                    <CloseIcon
                        sx={{
                            fontSize: 20,
                            color: "#777",
                        }}
                    />
                </IconButton>
            </Box>

            {/* Table */}
            <Box
                sx={{
                    px: 1.5,
                    py: 1,
                    overflowX: "auto",
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns:
                            "minmax(280px, 1fr) 120px repeat(7, 58px) 90px 85px 65px 65px",
                        minWidth: 1120,
                        height: 36,
                        alignItems: "center",
                        borderBottom: "2px solid #222",
                    }}
                >
                    <HeaderCell align="left">
                        Jobs
                    </HeaderCell>

                    <HeaderCell>
                        Budget Owner
                    </HeaderCell>

                    {days.map((day) => (
                        <HeaderCell key={day}>
                            {day}
                        </HeaderCell>
                    ))}

                    <HeaderCell>Rating</HeaderCell>
                    <HeaderCell>Status</HeaderCell>
                    <HeaderCell>Accept</HeaderCell>
                    <HeaderCell>Reject</HeaderCell>
                </Box>

                {/* Rows */}
                {tasks.map((task) => (
                    <React.Fragment key={task.id}>
                        {/* Project */}
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns:
                                    "minmax(280px, 1fr) 120px repeat(7, 58px) 90px 85px 65px 65px",
                                minWidth: 1120,
                                height: 35,
                                alignItems: "center",
                                borderBottom:
                                    "1px solid #ddd",
                                backgroundColor: "#fafafa",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.3,
                                }}
                            >
                                <KeyboardArrowDownIcon
                                    sx={{
                                        fontSize: 18,
                                    }}
                                />

                                <Typography
                                    sx={{
                                        fontSize: 12,
                                    }}
                                >
                                    {task.project}
                                </Typography>
                            </Box>

                            <Box />

                            {days.map((day) => (
                                <Box key={day} />
                            ))}

                            <Box />
                            <Box />
                            <Box />
                            <Box />
                        </Box>

                        {/* Task */}
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns:
                                    "minmax(280px, 1fr) 120px repeat(7, 58px) 90px 85px 65px 65px",
                                minWidth: 1120,
                                height: 50,
                                alignItems: "center",
                                borderBottom:
                                    "1px solid #ddd",
                            }}
                        >
                            {/* Task name */}
                            <Typography
                                sx={{
                                    fontSize: 12,
                                    pl: 4.5,
                                    color: "#555",
                                }}
                            >
                                {task.task}
                            </Typography>

                            {/* Owner */}
                            <Typography
                                sx={{
                                    fontSize: 12,
                                    color: "#555",
                                }}
                            >
                                {task.budgetOwner}
                            </Typography>

                            {/* Hours */}
                            {task.hours.map(
                                (hour, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: "flex",
                                            justifyContent:
                                                "center",
                                        }}
                                    >
                                        {hour > 0 && (
                                            <Box
                                                sx={{
                                                    width: 48,
                                                    height: 30,
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                    backgroundColor:
                                                        "#eeeeee",
                                                    border:
                                                        "1px solid #d7d7d7",
                                                    borderRadius:
                                                        "3px",
                                                    fontSize: 12,
                                                }}
                                            >
                                                {hour.toFixed(
                                                    2
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                )
                            )}

                            {/* Rating */}
                            <Box>
                                {task.rating && (
                                    <Select
                                        size="small"
                                        value={
                                            task.rating
                                        }
                                        onChange={(event) =>
                                            handleRatingChange(
                                                task.id,
                                                event.target
                                                    .value
                                            )
                                        }
                                        sx={{
                                            width: 80,
                                            height: 30,
                                            fontSize: 11,
                                            backgroundColor:
                                                "#eeeeee",
                                        }}
                                    >
                                        <MenuItem value="Good">
                                            Good
                                        </MenuItem>
                                        <MenuItem value="Average">
                                            Average
                                        </MenuItem>
                                        <MenuItem value="Poor">
                                            Poor
                                        </MenuItem>
                                    </Select>
                                )}
                            </Box>

                            {/* Status */}
                            <Typography
                                sx={{
                                    fontSize: 12,
                                    color:
                                        task.status ===
                                        "Accepted"
                                            ? "#00a651"
                                            : "#ff3b3b",
                                }}
                            >
                                {task.status}
                            </Typography>

                            {/* Accept */}
                            <Button
                                size="small"
                                variant="contained"
                                disabled={
                                    task.status ===
                                    "Accepted"
                                }
                                onClick={() =>
                                    handleAccept(task.id)
                                }
                                sx={{
                                    minWidth: 58,
                                    height: 28,
                                    fontSize: 9,
                                    backgroundColor:
                                        "#5fc58b",
                                }}
                            >
                                ACCEPT
                            </Button>

                            {/* Reject */}
                            <Button
                                size="small"
                                variant="contained"
                                onClick={() =>
                                    handleReject(task.id)
                                }
                                sx={{
                                    minWidth: 58,
                                    height: 28,
                                    fontSize: 9,
                                    backgroundColor:
                                        "#e9819a",
                                }}
                            >
                                REJECT
                            </Button>
                        </Box>
                    </React.Fragment>
                ))}

                {/* Total */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns:
                            "minmax(280px, 1fr) 120px repeat(7, 58px) 90px 85px 65px 65px",
                        minWidth: 1120,
                        height: 35,
                        alignItems: "center",
                        borderTop: "2px solid #222",
                    }}
                >
                    <Typography
                        sx={{
                            textAlign: "right",
                            pr: 2,
                            fontSize: 12,
                            fontWeight: 600,
                        }}
                    >
                        Total
                    </Typography>

                    <Box />

                    {dailyTotals.map((total, index) => (
                        <Typography
                            key={index}
                            sx={{
                                textAlign: "center",
                                fontSize: 12,
                                fontWeight: 600,
                            }}
                        >
                            {total.toFixed(2)}
                        </Typography>
                    ))}

                    <Box />

                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            whiteSpace: "nowrap",
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 12,
                                color: "#168bd1",
                            }}
                        >
                            Estimated Hours:{" "}
                            {employee.hours.toFixed(2)}
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: 12,
                                color: "#168bd1",
                            }}
                        >
                            Actual Hours:{" "}
                            {actualHours.toFixed(2)}
                        </Typography>
                    </Box>
                </Box>

                {/* Comments */}
                <Box sx={{ mt: 1 }}>
                    <Typography
                        sx={{
                            fontSize: 12,
                            color: "#666",
                            mb: 0.5,
                        }}
                    >
                        Comments
                    </Typography>

                    <Box
                        component="textarea"
                        sx={{
                            width: "100%",
                            height: 60,
                            resize: "vertical",
                            backgroundColor: "#eeeeee",
                            border:
                                "1px solid #d5d5d5",
                            borderRadius: "3px",
                            outline: "none",
                            padding: 1,
                            boxSizing: "border-box",
                        }}
                    />
                </Box>
            </Box>
        </Dialog>
    );
};

const HeaderCell = ({
    children,
    align = "center",
}: {
    children: React.ReactNode;
    align?: "left" | "center";
}) => (
    <Typography
        sx={{
            fontSize: 11,
            fontWeight: 600,
            color: "#444",
            textAlign: align,
            whiteSpace: "nowrap",
        }}
    >
        {children}
    </Typography>
);

export default ApprovalDetailModal;