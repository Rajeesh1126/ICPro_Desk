import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Select,
    TableCell,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import {
    VirtualizedTable,
    type ColumnData,
} from "../../components/common/TableView";

import type {
    ApprovalRow,
    ApiTaskRow,
    TaskRow,
} from "../../types/dataTypes";

import api from "../../api/axios";

import {
    ApproveDetailDialogPaperSx,
} from "../../styles/common";
import { useNotification } from "../../context/NotificationContext";

interface ApprovalDetailResponse {
    rows: ApiTaskRow[];
    comments?: string;
    action_status?: boolean;
    is_action_completed?: boolean;
}

interface ApprovalDetailedViewProps {
    open: boolean;
    employee: ApprovalRow | null;
    onClose: () => void;
    weekStart: string;
}

const timeValueToSeconds = (value: number | string) => {
    const rawValue = String(value).trim();

    if (!rawValue) {
        return 0;
    }

    const [hoursPart = "0", minutesPart = ""] =
        rawValue.split(".");
    const hours = Number(hoursPart || 0);
    const minutes =
        minutesPart === ""
            ? 0
            : Number(minutesPart.padEnd(2, "0").slice(0, 2));

    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes) ||
        minutes < 0 ||
        minutes > 59
    ) {
        return 0;
    }

    return hours * 3600 + minutes * 60;
};

const secondsToTimeValue = (seconds: number) => {
    const totalSeconds = Number(seconds || 0);

    if (totalSeconds <= 0) {
        return 0;
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.round((totalSeconds % 3600) / 60);

    return Number(`${hours}.${String(minutes).padStart(2, "0")}`);
};

const isOthersProject = (project?: string) =>
    (project || "").trim().toLowerCase() === "others";

const ApprovalDetailedView: React.FC<
    ApprovalDetailedViewProps
> = ({
    open,
    employee,
    onClose,
    weekStart,
}) => {
        const { showNotification } = useNotification();

        const [tasks, setTasks] =
            useState<TaskRow[]>([]);

        const tableMinWidth = 1096;

        const [expandedProjects, setExpandedProjects] =
            useState<number[]>([]);

        const [loading, setLoading] =
            useState(false);

        const [updatingTaskId, setUpdatingTaskId] =
            useState<number | null>(null);

        const [comments, setComments] =
            useState("");

        const [rejectDialogOpen, setRejectDialogOpen] =
            useState(false);

        const [rejectReason, setRejectReason] =
            useState("");

        const [rejectReasonError, setRejectReasonError] =
            useState("");

        const [pendingRejectTask, setPendingRejectTask] =
            useState<TaskRow | null>(null);

        const days = useMemo(() => {

            if (!weekStart) {
                return [];
            }

            const startDate = new Date(
                `${weekStart}T00:00:00`
            );

            const dayNames = [
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
            ];

            const result: {
                label: string;
                date: string;
            }[] = [];

            for (
                let index = 0;
                index < 7;
                index++
            ) {

                const currentDate =
                    new Date(startDate);

                currentDate.setDate(
                    startDate.getDate() + index
                );

                const dayName =
                    dayNames[
                    currentDate.getDay()
                    ];

                const dayNumber =
                    String(
                        currentDate.getDate()
                    ).padStart(2, "0");

                result.push({
                    label:
                        `${dayName}-${dayNumber}`,

                    date:
                        currentDate
                            .toISOString()
                            .split("T")[0],
                });
            }

            return result;

        }, [weekStart]);

        useEffect(() => {

            if (
                !open ||
                !employee?.id ||
                !weekStart
            ) {
                return;
            }

            let active = true;

            setLoading(true);
            setTasks([]);
            setComments("");
            void api
                .get<ApprovalDetailResponse>(
                    "/approval-detail-data/",
                    {
                        params: {
                            weekStart,
                            employeeId:
                                employee.id,
                        },
                    }
                )
                .then((response) => {

                    if (!active) {
                        return;
                    }

                    console.log(
                        "Approval Detail Data:",
                        response.data
                    );

                    const apiRows =
                        response.data?.rows || [];

                    setComments(
                        response.data?.comments || ""
                    );

                    const projectMap =
                        new Map<
                            number,
                            {
                                projectId: number;
                                project: string;
                                tasks: ApiTaskRow[];
                            }
                        >();

                    apiRows.forEach((row) => {

                        if (
                            row.projectId === null ||
                            row.projectId === undefined
                        ) {
                            return;
                        }

                        if (
                            !projectMap.has(
                                row.projectId
                            )
                        ) {

                            projectMap.set(
                                row.projectId,
                                {
                                    projectId:
                                        row.projectId,

                                    project:
                                        row.project,

                                    tasks: [],
                                }
                            );
                        }

                        projectMap
                            .get(row.projectId)!
                            .tasks
                            .push(row);
                    });

                    const tableRows: TaskRow[] = [];

                    projectMap.forEach(
                        (projectData) => {

                            tableRows.push({
                                id:
                                    projectData.projectId,

                                projectId:
                                    projectData.projectId,

                                project:
                                    projectData.project,

                                task: "",

                                budgetOwner: "",

                                hours: [
                                    "",
                                    "",
                                    "",
                                    "",
                                    "",
                                    "",
                                    "",
                                ],

                                rating: "",

                                status: "",

                                rowType:
                                    "project",
                            });

                            projectData.tasks.forEach(
                                (task) => {

                                    tableRows.push({

                                        id:
                                            task.id,

                                        projectId:
                                            task.projectId,

                                        project:
                                            projectData.project,

                                        task:
                                            task.task,

                                        budgetOwner:
                                            task.budgetOwner,

                                        hours:
                                            Array.isArray(
                                                task.hours
                                            )
                                                ? task.hours
                                                : [
                                                    "",
                                                    "",
                                                    "",
                                                    "",
                                                    "",
                                                    "",
                                                    "",
                                                ],

                                        rating:
                                            String(
                                                task.rating ??
                                                ""
                                            ),

                                        status:
                                            task.status ||
                                            "Pending",

                                        rowType:
                                            "milestone",

                                        approvedStatus:
                                            task.approvedStatus,

                                        rejectionReason:
                                            task.rejectionReason,
                                    });
                                }
                            );
                        }
                    );

                    setTasks(tableRows);

                    setExpandedProjects(
                        Array.from(
                            projectMap.keys()
                        )
                    );
                })
                .catch((error) => {

                    console.error(
                        "Failed to load approval data",
                        error
                    );

                    if (active) {

                        setTasks([]);
                        setExpandedProjects([]);
                        setComments("");
                    }
                })
                .finally(() => {

                    if (active) {
                        setLoading(false);
                    }
                });

            return () => {
                active = false;
            };

        }, [
            open,
            employee?.id,
            weekStart,
        ]);

        const handleToggleProject =
            useCallback(
                (projectId: number) => {

                    setExpandedProjects(
                        (previous) => {

                            if (
                                previous.includes(
                                    projectId
                                )
                            ) {

                                return previous.filter(
                                    (id) =>
                                        id !==
                                        projectId
                                );
                            }

                            return [
                                ...previous,
                                projectId,
                            ];
                        }
                    );
                },
                []
            );

        const visibleTasks = useMemo(() => {

            const result: TaskRow[] = [];

            tasks.forEach((row) => {

                if (
                    row.rowType ===
                    "project"
                ) {

                    result.push(row);

                    return;
                }

                if (
                    row.rowType ===
                    "milestone" &&
                    expandedProjects.includes(
                        row.projectId
                    )
                ) {

                    result.push(row);
                }
            });

            return result;

        }, [
            tasks,
            expandedProjects,
        ]);

        const totals = useMemo(() => {

            return days.map(
                (_, dayIndex) => {

                    return tasks
                        .filter(
                            (task) =>
                                task.rowType ===
                                "milestone"
                        )
                        .reduce(
                            (
                                total,
                                task
                            ) => {

                                return (
                                    total +
                                    timeValueToSeconds(
                                        task.hours[
                                        dayIndex
                                        ] || "0"
                                    )
                                );
                            },
                            0
                        );
                }
            );

        }, [
            tasks,
            days,
        ]);

        const handleRatingChange =
            useCallback(
                (
                    taskId: number,
                    value: string
                ) => {

                    setTasks(
                        (previous) =>
                            previous.map(
                                (row) => {

                                    if (
                                        row.id !==
                                        taskId
                                    ) {
                                        return row;
                                    }

                                    return {
                                        ...row,
                                        rating:
                                            value,
                                    };
                                }
                            )
                    );
                },
                []
            );

        const handleApprovalAction =
            useCallback(
                async (
                    row: TaskRow,
                    action:
                        | "Accepted"
                        | "Rejected",
                    actionComments = comments
                ) => {

                    if (!employee?.id) {
                        return false;
                    }

                    if (
                        !isOthersProject(row.project) &&
                        (
                            !row.rating ||
                            row.rating === "0"
                        )
                    ) {

                        showNotification(
                            "Please select a rating before approving or rejecting.",
                            "warning"
                        );

                        return false;
                    }

                    const ratingNumber =
                        isOthersProject(row.project)
                            ? 0
                            : Number(row.rating);

                    const requiresRating =
                        !isOthersProject(row.project);

                    if (
                        requiresRating &&
                        (
                            Number.isNaN(
                                ratingNumber
                            ) ||
                            ratingNumber < 1 ||
                            ratingNumber > 5
                        )
                    ) {

                        showNotification(
                            "Please select a valid rating.",
                            "warning"
                        );

                        return false;
                    }

                    if (
                        updatingTaskId !== null
                    ) {
                        return false;
                    }

                    try {

                        setUpdatingTaskId(
                            row.id
                        );

                        const response =
                            await api.patch(
                                "/approval-detail-data/",
                                {
                                    weekStart,

                                    employeeId:
                                        employee.id,

                                    assignId:
                                        row.id,

                                    action,

                                    rating:
                                        ratingNumber,

                                    comments:
                                        actionComments,
                                }
                            );

                        console.log(
                            "Approval updated:",
                            response.data
                        );

                        showNotification(
                            `Submission ${action.toLowerCase()} successfully.`,
                            "success"
                        );

                        setTasks(
                            (previous) =>
                                previous.map(
                                    (task) => {

                                        if (
                                            task.id !==
                                            row.id
                                        ) {
                                            return task;
                                        }

                                        return {
                                            ...task,

                                            status:
                                                action,

                                            rating:
                                                String(
                                                    ratingNumber
                                                ),

                                            rejectionReason:
                                                action ===
                                                    "Rejected"
                                                    ? actionComments
                                                    : null,
                                        };
                                    }
                                )
                        );

                        return true;

                    } catch (error) {

                        console.error(
                            `Failed to ${action.toLowerCase()} submission:`,
                            error
                        );

                        showNotification(
                            `Failed to ${action.toLowerCase()} submission.`,
                            "error"
                        );

                        return false;

                    } finally {

                        setUpdatingTaskId(
                            null
                        );
                    }
                },
                [
                    employee?.id,
                    weekStart,
                    comments,
                    updatingTaskId,
                    showNotification,
                ]
            );

        const openRejectDialog = useCallback(
            (row: TaskRow) => {
                setPendingRejectTask(row);
                setRejectReason(row.rejectionReason || "");
                setRejectReasonError("");
                setRejectDialogOpen(true);
            },
            []
        );

        const closeRejectDialog = useCallback(
            () => {
                if (updatingTaskId !== null) {
                    return;
                }

                setRejectDialogOpen(false);
                setPendingRejectTask(null);
                setRejectReason("");
                setRejectReasonError("");
            },
            [updatingTaskId]
        );

        const submitRejectReason = useCallback(
            async () => {
                const reason = rejectReason.trim();

                if (!pendingRejectTask) {
                    return;
                }

                if (!reason) {
                    setRejectReasonError(
                        "Rejection reason is required."
                    );
                    showNotification(
                        "Please enter a rejection reason.",
                        "warning"
                    );
                    return;
                }

                const success = await handleApprovalAction(
                    pendingRejectTask,
                    "Rejected",
                    reason
                );

                if (!success) {
                    return;
                }

                setRejectDialogOpen(false);
                setPendingRejectTask(null);
                setRejectReason("");
                setRejectReasonError("");
            },
            [
                handleApprovalAction,
                pendingRejectTask,
                rejectReason,
                showNotification,
            ]
        );

        const columns:
            ColumnData<TaskRow>[] =
            useMemo(
                () => {

                    const result:
                        ColumnData<TaskRow>[] =
                        [

                            {
                                label: "Jobs",

                                width: 350,

                                render:
                                    (
                                        row: TaskRow
                                    ) => {

                                        if (
                                            row.rowType ===
                                            "project"
                                        ) {

                                            const isExpanded =
                                                expandedProjects.includes(
                                                    row.projectId
                                                );

                                            return (
                                                <Box
                                                    sx={{
                                                        display:
                                                            "flex",

                                                        alignItems:
                                                            "center",
                                                    }}
                                                >

                                                    <IconButton
                                                        size="small"

                                                        onClick={() =>
                                                            handleToggleProject(
                                                                row.projectId
                                                            )
                                                        }

                                                        sx={{
                                                            p: 0,
                                                            mr: 0.5,
                                                        }}
                                                    >

                                                        <KeyboardArrowDownIcon
                                                            sx={{
                                                                fontSize:
                                                                    18,

                                                                transition:
                                                                    "transform 0.2s ease",

                                                                transform:
                                                                    isExpanded
                                                                        ? "rotate(0deg)"
                                                                        : "rotate(-90deg)",
                                                            }}
                                                        />

                                                    </IconButton>

                                                    <Typography
                                                        component="span"

                                                        sx={{
                                                            fontSize:
                                                                13,

                                                            fontWeight:
                                                                500,
                                                        }}
                                                    >
                                                        {
                                                            row.project
                                                        }
                                                    </Typography>

                                                </Box>
                                            );
                                        }

                                        return (
                                            <Typography
                                                component="span"

                                                sx={{
                                                    marginLeft: 5,
                                                    fontSize:
                                                        13,
                                                }}
                                            >
                                                {
                                                    row.task
                                                }
                                            </Typography>
                                        );
                                    },
                            },

                            {
                                label:
                                    "Budget Owner",

                                width: 120,

                                render:
                                    (
                                        row: TaskRow
                                    ) => {

                                        if (
                                            row.rowType ===
                                            "project"
                                        ) {
                                            return null;
                                        }

                                        return row.budgetOwner;
                                    },
                            },
                        ];

                    days.forEach(
                        (
                            day,
                            dayIndex
                        ) => {

                            result.push({

                                label:
                                    day.label,

                                width: 58,

                                render:
                                    (
                                        row: TaskRow
                                    ) => {

                                        if (
                                            row.rowType ===
                                            "project"
                                        ) {
                                            return null;
                                        }

                                        return (
                                            <HourCell
                                                value={
                                                    row.hours[
                                                    dayIndex
                                                    ] || ""
                                                }
                                            />
                                        );
                                    },
                            });
                        }
                    );

                    result.push({

                        label: "Rating",

                        width: 90,

                        render:
                            (
                                row: TaskRow
                            ) => {

                                if (
                                    row.rowType ===
                                    "project"
                                ) {
                                    return null;
                                }

                                if (
                                    isOthersProject(
                                        row.project
                                    )
                                ) {
                                    return null;
                                }

                                const isAccepted =
                                    row.status ===
                                    "Accepted";
                                const isRejected =
                                    row.status ===
                                    "Rejected";

                                return (
                                    <Select
                                        size="small"

                                        value={
                                            row.rating ||
                                            ""
                                        }

                                        displayEmpty

                                        disabled={
                                            updatingTaskId ===
                                            row.id||
                                            isRejected||
                                            isAccepted

                                        }

                                        onChange={(
                                            event
                                        ) => {

                                            handleRatingChange(
                                                row.id,

                                                String(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            );
                                        }}

                                        sx={{
                                            width: 100,
                                            height: 32,
                                            fontSize: 12,
                                            "& .MuiSelect-select": {
                                                py: 0.5,
                                                px: 1,
                                            },
                                        }}
                                    >

                                        <MenuItem
                                            value="0"
                                        >
                                            Select
                                        </MenuItem>

                                        <MenuItem
                                            value="1"
                                        >
                                            Poor
                                        </MenuItem>

                                        <MenuItem
                                            value="2"
                                        >
                                            Average
                                        </MenuItem>

                                        <MenuItem
                                            value="3"
                                        >
                                            Good
                                        </MenuItem>

                                        <MenuItem
                                            value="4"
                                        >
                                            Very Good
                                        </MenuItem>

                                        <MenuItem
                                            value="5"
                                        >
                                            Excellent
                                        </MenuItem>

                                    </Select>
                                );
                            },
                    });

                    result.push({

                        label: "Status",

                        width: 70,

                        render:
                            (
                                row: TaskRow
                            ) => {

                                if (
                                    row.rowType ===
                                    "project"
                                ) {
                                    return null;
                                }

                                return (
                                    <Typography
                                        sx={{
                                            fontSize: 12,
                                            color: row.status === "Accepted"
                                                ? "success.main"
                                                : "error.main",
                                        }}
                                    >
                                        {row.status}
                                    </Typography>
                                );
                            },
                    });

                    result.push({

                        label: "Accept",

                        width: 75,

                        render:
                            (
                                row: TaskRow
                            ) => {

                                if (
                                    row.rowType ===
                                    "project"
                                ) {
                                    return null;
                                }

                                const isUpdating =
                                    updatingTaskId ===
                                    row.id;

                                const isAccepted =
                                    row.status ===
                                    "Accepted";
                                const isRejected =
                                    row.status ===
                                    "Rejected";

                                return (
                                    <Button
                                        size="small"

                                        variant="contained"
                                        color="success"
                                        disabled={
                                            isAccepted ||
                                            isRejected ||
                                            isUpdating
                                        }

                                        onClick={() =>
                                            void handleApprovalAction(
                                                row,
                                                "Accepted"
                                            )
                                        }

                                        sx={{
                                            width: 68,
                                            minWidth: 68,
                                            fontSize: 10,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {
                                            isUpdating
                                                ? "..."
                                                : "ACCEPT"
                                        }
                                    </Button>
                                );
                            },
                    });

                    result.push({

                        label: "Reject",

                        width: 75,

                        render:
                            (
                                row: TaskRow
                            ) => {

                                if (
                                    row.rowType ===
                                    "project"
                                ) {
                                    return null;
                                }

                                const isUpdating =
                                    updatingTaskId ===
                                    row.id;

                                const isRejected =
                                    row.status ===
                                    "Rejected";
                                const isAccepted =
                                    row.status ===
                                    "Accepted";
                                return (
                                    <Button
                                        size="small"

                                        variant="contained"
                                        color="error"

                                        disabled={
                                            isRejected ||
                                            isAccepted ||
                                            isUpdating
                                        }

                                        onClick={() =>
                                            openRejectDialog(
                                                row
                                            )
                                        }

                                        sx={{
                                            width: 68,
                                            minWidth: 68,
                                            fontSize: 10,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {
                                            isUpdating
                                                ? "..."
                                                : "REJECT"
                                        }
                                    </Button>
                                );
                            },
                    });
                    return result;

                },
                [
                    days,
                    expandedProjects,
                    handleToggleProject,
                    handleRatingChange,
                    handleApprovalAction,
                    openRejectDialog,
                    updatingTaskId,
                ]
            );

        const footerContent = useCallback(
            (_rows: TaskRow[]) => (
                <TableRow>
                    {columns.map((column) => {
                        const dayIndex = days.findIndex(
                            (day) => day.label === column.label
                        );

                        return (
                            <TableCell
                                key={column.label}
                                align={
                                    dayIndex >= 0
                                        ? "center"
                                        : "left"
                                }
                                sx={(theme) => ({
                                    width:
                                        column.width,

                                    minWidth:
                                        column.width,

                                    fontSize: 12,

                                    fontWeight: 700,

                                    color:
                                        theme.palette
                                            .text.primary,

                                    backgroundColor:
                                        theme.palette
                                            .background.paper,

                                    borderTop:
                                        `1px solid ${theme.palette.divider}`,
                                })}
                            >
                                {column.label ===
                                    "Budget Owner"
                                    ? "Total"
                                    : dayIndex >= 0
                                        ? secondsToTimeValue(
                                            totals[
                                            dayIndex
                                            ]
                                        ).toFixed(2)
                                        : ""}
                            </TableCell>
                        );
                    })}
                </TableRow>
            ),
            [
                columns,
                days,
                totals,
            ]
        );

        if (!employee) {
            return null;
        }

        return (
            <>
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth={false}

                PaperProps={{
                    sx:
                        ApproveDetailDialogPaperSx,
                }}
            >

                <Box
                    sx={(theme) => ({
                        height: 54,

                        display: "flex",

                        alignItems:
                            "center",

                        px: 1.5,

                        borderBottom:
                            `1px solid ${theme.palette.divider}`,

                        backgroundColor:
                            theme.palette
                                .background.paper,
                    })}
                >

                    <Typography
                        sx={(theme) => ({
                            fontSize: 13,

                            fontWeight: 600,

                            color:
                                theme.palette
                                    .text.primary,
                        })}
                    >
                        Project Detailed View of{" "}
                        {employee.name}
                    </Typography>


                    <Typography
                        sx={(theme) => ({
                            ml: "auto",

                            mr: 2,

                            fontSize: 12,

                            fontWeight: 500,

                            color:
                                theme.palette
                                    .primary.main,
                        })}
                    >
                        {employee.overview ===
                            "Accepted"
                            ? "Timesheet is already Accepted"
                            : employee.action_status}
                    </Typography>


                    <IconButton
                        size="small"
                        onClick={onClose}

                        sx={(theme) => ({
                            color:
                                theme.palette
                                    .text.secondary,

                            "&:hover": {
                                backgroundColor:
                                    theme.palette
                                        .action.hover,

                                color:
                                    theme.palette
                                        .text.primary,
                            },
                        })}
                    >
                        <CloseIcon
                            sx={{
                                fontSize: 20,
                            }}
                        />
                    </IconButton>

                </Box>

                <Box
                    sx={(theme) => ({
                        p: 1.5,

                        overflowX: "auto",

                        backgroundColor:
                            theme.palette
                                .background.default,
                    })}
                >

                    {loading ? (

                        <Box
                            sx={{
                                height: "40dvh",

                                display: "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    "center",
                            }}
                        >

                            <Typography
                                sx={{
                                    fontSize: 13,
                                }}
                            >
                                Loading...
                            </Typography>

                        </Box>

                    ) : (

                        <Box sx={{ minWidth: tableMinWidth }}>
                            <VirtualizedTable<TaskRow>
                                columns={
                                    columns
                                }

                                rows={
                                    visibleTasks
                                }
                                tableHead="Submitted Data"
                                height="60dvh"

                                fixedFooterContent={
                                    footerContent
                                }
                            />
                        </Box>
                    )}
                    {comments.trim() && (
                        <Box
                            sx={{
                                mt: 1.5,
                            }}
                        >

                        <Typography
                            sx={(theme) => ({
                                fontSize: 12,

                                fontWeight: 500,

                                color:
                                    theme.palette
                                        .text.secondary,

                                mb: 0.5,
                            })}
                        >
                            Comments
                        </Typography>


                        <Box
                            component="textarea"

                            value={comments}
                            disabled
                            onChange={(event) =>
                                setComments(
                                    event.target.value
                                )
                            }

                            placeholder={
                                "NO comments..."
                            }

                            sx={(theme) => ({
                                width: "100%",

                                minHeight: 65,

                                resize: "vertical",

                                border:
                                    `1px solid ${theme.palette.divider}`,

                                borderRadius: 1,

                                backgroundColor:
                                    theme.palette
                                        .background.paper,

                                color:
                                    theme.palette
                                        .text.primary,

                                outline: "none",

                                p: 1,

                                fontFamily: "inherit",

                                fontSize: 12,

                                boxSizing:
                                    "border-box",

                                "&::placeholder": {
                                    color:
                                        theme
                                            .palette
                                            .text
                                            .secondary,

                                    opacity: 0.7,
                                },

                                "&:focus": {
                                    borderColor:
                                        theme
                                            .palette
                                            .primary
                                            .main,

                                    boxShadow:
                                        `0 0 0 1px ${theme.palette.primary.main}`,
                                },
                            })}
                        />

                        </Box>
                    )}

                </Box>

            </Dialog>

            <Dialog
                open={rejectDialogOpen}
                onClose={closeRejectDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle
                    sx={{
                        fontSize: 16,
                        fontWeight: 700,
                    }}
                >
                    Rejection Reason
                </DialogTitle>

                <DialogContent>
                    <Typography
                        sx={{
                            fontSize: 13,
                            color: "text.secondary",
                            mb: 1.5,
                        }}
                    >
                        {pendingRejectTask?.task}
                    </Typography>

                    <TextField
                        autoFocus
                        fullWidth
                        multiline
                        minRows={4}
                        value={rejectReason}
                        onChange={(event) => {
                            setRejectReason(event.target.value);

                            if (rejectReasonError) {
                                setRejectReasonError("");
                            }
                        }}
                        error={Boolean(rejectReasonError)}
                        helperText={rejectReasonError}
                        placeholder="Enter rejection reason..."
                    />
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 2,
                    }}
                >
                    <Button
                        onClick={closeRejectDialog}
                        disabled={updatingTaskId !== null}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={() =>
                            void submitRejectReason()
                        }
                        disabled={updatingTaskId !== null}
                    >
                        {updatingTaskId !== null
                            ? "Submitting..."
                            : "Submit"}
                    </Button>
                </DialogActions>
            </Dialog>
            </>
        );
    };

const HourCell: React.FC<{
    value: string;
}> = ({
    value,
}) => {

        if (!value) {
            return null;
        }

        return (
            <Box
                sx={(theme) => ({
                    width: 48,

                    height: 28,

                    display: "flex",

                    alignItems:
                        "center",

                    justifyContent:
                        "center",

                    mx: "auto",

                    borderRadius: 1,

                    backgroundColor:
                        theme.palette.mode ===
                            "dark"
                            ? theme.palette
                                .grey[800]
                            : theme.palette
                                .grey[100],

                    border:
                        `1px solid ${theme.palette.divider}`,

                    color:
                        theme.palette
                            .text.primary,

                    fontSize: 11.5,

                    fontWeight: 500,

                    transition:
                        "background-color 0.15s ease, border-color 0.15s ease",

                    "&:hover": {
                        backgroundColor:
                            theme.palette
                                .action.hover,

                        borderColor:
                            theme.palette
                                .primary.main,
                    },
                })}
            >
                {value}
            </Box>
        );
    };


export default ApprovalDetailedView;
