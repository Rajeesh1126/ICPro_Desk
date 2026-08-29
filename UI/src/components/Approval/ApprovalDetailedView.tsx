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
    IconButton,
    MenuItem,
    Select,
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

interface ApprovalDetailResponse {
    rows: ApiTaskRow[];
    comments?: string;
    action_status?: boolean;
}

interface ApprovalDetailedViewProps {
    open: boolean;
    employee: ApprovalRow | null;
    onClose: () => void;
    weekStart: string;
}

const ApprovalDetailedView: React.FC<
    ApprovalDetailedViewProps
> = ({
    open,
    employee,
    onClose,
    weekStart,
}) => {

    const [tasks, setTasks] =
        useState<TaskRow[]>([]);

    const [expandedProjects, setExpandedProjects] =
        useState<number[]>([]);

    const [loading, setLoading] =
        useState(false);

    const [updatingTaskId, setUpdatingTaskId] =
        useState<number | null>(null);

    const [comments, setComments] =
        useState("");

    const [actionStatus, setActionStatus] =
        useState(false);

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
        setActionStatus(false);

        void api
            .get<ApprovalDetailResponse>(
                "/ApprovalDetailData/",
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

                setActionStatus(
                    Boolean(
                        response.data
                            ?.action_status
                    )
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

                                    project: "",

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
                    setActionStatus(false);
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

                            const value =
                                parseFloat(
                                    task.hours[
                                        dayIndex
                                    ] || "0"
                                );

                            if (
                                Number.isNaN(
                                    value
                                )
                            ) {
                                return total;
                            }

                            return (
                                total + value
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

    const actualHours = useMemo(
        () => {

            return totals.reduce(
                (
                    total,
                    value
                ) =>
                    total + value,
                0
            );

        },
        [totals]
    );

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
                    | "Rejected"
            ) => {

                if (!employee?.id) {
                    return;
                }

                if (
                    !row.rating ||
                    row.rating === "0"
                ) {

                    alert(
                        "Please select a rating."
                    );

                    return;
                }

                const ratingNumber =
                    Number(row.rating);

                if (
                    Number.isNaN(
                        ratingNumber
                    ) ||
                    ratingNumber < 1 ||
                    ratingNumber > 5
                ) {

                    alert(
                        "Please select a valid rating."
                    );

                    return;
                }

                if (
                    updatingTaskId !== null
                ) {
                    return;
                }

                try {

                    setUpdatingTaskId(
                        row.id
                    );

                    const response =
                        await api.patch(
                            "/ApprovalDetailData/",
                            {
                                weekStart,

                                employeeId:
                                    employee.id,

                                // row.id is AssignedTask.id
                                assignId:
                                    row.id,

                                action,

                                rating:
                                    ratingNumber,

                                comments,
                            }
                        );

                    console.log(
                        "Approval updated:",
                        response.data
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
                                    };
                                }
                            )
                    );

                    if (
                        typeof response
                            .data
                            ?.action_status ===
                        "boolean"
                    ) {

                        setActionStatus(
                            response.data
                                .action_status
                        );
                    }

                } catch (error) {

                    console.error(
                        `Failed to ${action.toLowerCase()} submission:`,
                        error
                    );

                    alert(
                        `Failed to ${action.toLowerCase()} submission.`
                    );

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

                            width: 240,

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
                                        row.id
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
                                        minWidth: 70,
                                        height: 32,
                                        fontSize: 12,
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

                            return (
                                <Typography
                                    sx={{
                                        fontSize: 12,
                                    }}
                                >
                                    {
                                        row.status
                                    }
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

                            return (
                                <Button
                                    size="small"

                                    variant="contained"

                                    disabled={
                                        isAccepted ||
                                        isUpdating
                                    }

                                    onClick={() =>
                                        void handleApprovalAction(
                                            row,
                                            "Accepted"
                                        )
                                    }

                                    sx={{
                                        minWidth: 65,
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

                            return (
                                <Button
                                    size="small"

                                    variant="contained"

                                    disabled={
                                        isRejected ||
                                        isUpdating
                                    }

                                    onClick={() =>
                                        void handleApprovalAction(
                                            row,
                                            "Rejected"
                                        )
                                    }

                                    sx={{
                                        minWidth: 65,
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
                updatingTaskId,
            ]
        );

    if (!employee) {
        return null;
    }

    return (
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
                    height: 40,

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
                        : employee.approval_status}
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
                            height: 300,

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

                    <VirtualizedTable<TaskRow>
                        columns={
                            columns
                        }

                        rows={
                            visibleTasks
                        }

                        height="300px"
                    />
                )}

                <Box
                    sx={(theme) => ({
                        mt: 1,

                        minWidth: 1080,

                        height: 42,

                        display: "flex",

                        alignItems:
                            "center",

                        borderTop:
                            `2px solid ${theme.palette.divider}`,

                        backgroundColor:
                            theme.palette
                                .background.paper,
                    })}
                >

                    <Typography
                        sx={(theme) => ({
                            width: 360,

                            textAlign:
                                "right",

                            pr: 2,

                            fontSize: 12,

                            fontWeight: 600,

                            color:
                                theme.palette
                                    .text.primary,
                        })}
                    >
                        Total
                    </Typography>


                    {totals.map(
                        (
                            total,
                            index
                        ) => (

                            <Typography
                                key={index}

                                sx={(theme) => ({
                                    width: 58,

                                    textAlign:
                                        "center",

                                    fontSize: 12,

                                    fontWeight: 600,

                                    color:
                                        theme.palette
                                            .text.secondary,
                                })}
                            >
                                {total.toFixed(2)}
                            </Typography>
                        )
                    )}


                    <Box
                        sx={{
                            ml: "auto",

                            display: "flex",

                            alignItems:
                                "center",

                            gap: 3,

                            pr: 2,
                        }}
                    >

                        <Typography
                            sx={(theme) => ({
                                fontSize: 12,

                                color:
                                    theme.palette
                                        .primary.main,

                                whiteSpace:
                                    "nowrap",
                            })}
                        >
                            Estimated Hours:{" "}
                            {Number(
                                employee.hours ||
                                0
                            ).toFixed(2)}
                        </Typography>


                        <Typography
                            sx={(theme) => ({
                                fontSize: 12,

                                color:
                                    theme.palette
                                        .primary.main,

                                whiteSpace:
                                    "nowrap",
                            })}
                        >
                            Actual Hours:{" "}
                            {actualHours.toFixed(2)}
                        </Typography>

                    </Box>

                </Box>

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

                        onChange={(event) =>
                            setComments(
                                event.target.value
                            )
                        }

                        placeholder={
                            "Enter your comments..."
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

            </Box>

        </Dialog>
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