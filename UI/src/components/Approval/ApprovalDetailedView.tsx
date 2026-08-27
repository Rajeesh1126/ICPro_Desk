import React, {
    useCallback,
    useMemo,
    useState,
} from "react";

import {
    Box,
    Button,
    Dialog,
    IconButton,
    Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import {
    VirtualizedTable,
    type ColumnData,
} from "../../components/common/TableView";

import type { ApprovalRow } from "../../types/dataTypes";

interface ApprovalDetailedViewProps {
    open: boolean;
    employee: ApprovalRow | null;
    onClose: () => void;
}

interface TaskRow {
    [key: string]: unknown;

    id: number;
    projectId: number;

    project: string;
    task: string;
    budgetOwner: string;
    hours: string[];
    rating: string;

    status:
        | "Accepted"
        | "Rejected"
        | "Pending";
    rowType:
        | "project"
        | "milestone";
}

const ApprovalDetailedView: React.FC<ApprovalDetailedViewProps> = ({ open,employee,onClose,}) => {

    const [expandedProjects, setExpandedProjects] =
        useState<number[]>([1, 2, 3]);

    const handleToggleProject = useCallback(
        (projectId: number) => {
            setExpandedProjects((previous) => {
                if (
                    previous.includes(projectId)
                ) {
                    return previous.filter(
                        (id) => id !== projectId
                    );
                }

                return [
                    ...previous,
                    projectId,
                ];
            });
        },
        []
    );

    const tasks: TaskRow[] = useMemo(() => [
        {
            id: 1,
            projectId: 1,

            project:
                "ICP/UN/2022 - TICKET MANAGEMENT",

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

            status: "Pending",

            rowType: "project",
        },
        {
            id: 101,
            projectId: 1,

            project:
                "ICP/UN/2022 - TICKET MANAGEMENT",

            task:
                "Software-Development",

            budgetOwner:
                employee?.reporting_to ||
                "Rajeesh k",

            hours: [
                "09.00",
                "",
                "09.00",
                "09.00",
                "08.00",
                "",
                "",
            ],

            rating: "Good",

            status: "Accepted",

            rowType: "milestone",
        },
        {
            id: 2,
            projectId: 2,

            project: "Non Projects",

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

            status: "Pending",

            rowType: "project",
        },
        {
            id: 102,
            projectId: 2,

            project: "Non Projects",

            task: "Team building",

            budgetOwner:
                employee?.reporting_to ||
                "Rajeesh k",

            hours: [
                "09.00",
                "00.00",
                "00.00",
                "00.00",
                "00.00",
                "00.00",
                "00.00",
            ],

            rating: "",

            status: "Accepted",

            rowType: "milestone",
        },
        {
            id: 3,
            projectId: 3,

            project: "Training",

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

            status: "Pending",

            rowType: "project",
        },
        {
            id: 103,
            projectId: 3,

            project: "Training",

            task: "Internal Training",

            budgetOwner:
                employee?.reporting_to ||
                "Rajeesh k",

            hours: [
                "",
                "",
                "01.00",
                "01.00",
                "01.00",
                "",
                "",
            ],

            rating: "",

            status: "Accepted",

            rowType: "milestone",
        },],[employee]
    );

    const visibleTasks = useMemo(() => {
        const result: TaskRow[] = [];

        tasks.forEach((row) => {
            if (
                row.rowType === "project"
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
    const days = [
        "Mon-17",
        "Tue-18",
        "Wed-19",
        "Thu-20",
        "Fri-21",
        "Sat-22",
        "Sun-23",
    ];
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
                                    task
                                        .hours[
                                        dayIndex
                                    ] ||
                                        "0"
                                );

                            return (
                                total +
                                value
                            );
                        },
                        0
                    );
            }
        );
    }, [tasks]);
    const actualHours = useMemo(
        () => {
            return totals.reduce(
                (
                    total,
                    value
                ) =>
                    total +
                    value,
                0
            );
        },
        [totals]
    );
    const columns: ColumnData<TaskRow>[] =
        useMemo(
            () => [
                {
                    key: "project",
                    label: "Jobs",
                    width: 240,

                    render: (
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
                                        width:
                                            "100%",
                                        height:
                                            45,
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
                                            color:
                                                "#555",
                                        }}
                                    >
                                        <KeyboardArrowDownIcon
                                            sx={{
                                                fontSize: 18,

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
                                        sx={{
                                            fontSize:
                                                12,
                                            fontWeight:
                                                500,
                                            color:
                                                "#444",
                                            whiteSpace:
                                                "nowrap",
                                            overflow:
                                                "hidden",
                                            textOverflow:
                                                "ellipsis",
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
                            <Box
                                sx={{
                                    width:
                                        "100%",
                                    height:
                                        45,
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    pl: 3.5,
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize:
                                            12,
                                        color:
                                            "#555",
                                        whiteSpace:
                                            "nowrap",
                                        overflow:
                                            "hidden",
                                        textOverflow:
                                            "ellipsis",
                                    }}
                                >
                                    {row.task}
                                </Typography>
                            </Box>
                        );
                    },
                },
                {
                    key: "budgetOwner",
                    label: "Budget Owner",
                    width: 120,

                    render: (
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
                                    fontSize:
                                        12,
                                    color:
                                        "#555",
                                    whiteSpace:
                                        "nowrap",
                                }}
                            >
                                {
                                    row.budgetOwner
                                }
                            </Typography>
                        );
                    },
                },
                {
                    key: "mon",
                    label: "Mon-17",
                    width: 58,

                    render: (
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
                                    row.hours[0]
                                }
                            />
                        );
                    },
                },
                {
                    key: "tue",
                    label: "Tue-18",
                    width: 58,

                    render: (
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
                                    row.hours[1]
                                }
                            />
                        );
                    },
                },
                {
                    key: "wed",
                    label: "Wed-19",
                    width: 58,

                    render: (
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
                                    row.hours[2]
                                }
                            />
                        );
                    },
                },
                {
                    key: "thu",
                    label: "Thu-20",
                    width: 58,

                    render: (
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
                                    row.hours[3]
                                }
                            />
                        );
                    },
                },
                {
                    key: "fri",
                    label: "Fri-21",
                    width: 58,

                    render: (
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
                                    row.hours[4]
                                }
                            />
                        );
                    },
                },
                {
                    key: "sat",
                    label: "Sat-22",
                    width: 58,

                    render: (
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
                                    row.hours[5]
                                }
                            />
                        );
                    },
                },
                {
                    key: "sun",
                    label: "Sun-23",
                    width: 58,

                    render: (
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
                                    row.hours[6]
                                }
                            />
                        );
                    },
                },
                {
                    key: "rating",
                    label: "Rating",
                    width: 90,

                    render: (
                        row: TaskRow
                    ) => {
                        if (
                            row.rowType ===
                                "project" ||
                            !row.rating
                        ) {
                            return null;
                        }

                        return (
                            <Box
                                sx={{
                                    width:
                                        "100%",
                                    height:
                                        30,
                                    px: 1,
                                    boxSizing:
                                        "border-box",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "space-between",
                                    backgroundColor:
                                        "#eeeeee",
                                    border:
                                        "1px solid #ddd",
                                    borderRadius:
                                        "3px",
                                    fontSize:
                                        11,
                                    color:
                                        "#555",
                                }}
                            >
                                <span>
                                    {
                                        row.rating
                                    }
                                </span>

                                <KeyboardArrowDownIcon
                                    sx={{
                                        fontSize:
                                            15,
                                    }}
                                />
                            </Box>
                        );
                    },
                },
                {
                    key: "status",
                    label: "Status",
                    width: 90,

                    render: (
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
                                    fontSize:
                                        12,

                                    color:
                                        row.status ===
                                        "Accepted"
                                            ? "#00a651"
                                            : row.status ===
                                              "Rejected"
                                            ? "#ff3b3b"
                                            : "#168bd1",
                                }}
                            >
                                {
                                    row.status
                                }
                            </Typography>
                        );
                    },
                },
                {
                    key: "accept",
                    label: "Accept",
                    width: 65,

                    render: (
                        row: TaskRow
                    ) => {
                        if (
                            row.rowType ===
                            "project"
                        ) {
                            return null;
                        }

                        return (
                            <Button
                                size="small"
                                variant="contained"
                                disabled={
                                    row.status ===
                                    "Accepted"
                                }
                                sx={{
                                    minWidth:
                                        58,
                                    height:
                                        28,
                                    fontSize:
                                        9,
                                    fontWeight:
                                        600,
                                    backgroundColor:
                                        "#5fc58b",
                                    boxShadow:
                                        "none",

                                    "&:hover":
                                        {
                                            backgroundColor:
                                                "#4db77c",
                                            boxShadow:
                                                "none",
                                        },
                                }}
                            >
                                ACCEPT
                            </Button>
                        );
                    },
                },
                {
                    key: "reject",
                    label: "Reject",
                    width: 65,

                    render: (
                        row: TaskRow
                    ) => {
                        if (
                            row.rowType ===
                            "project"
                        ) {
                            return null;
                        }

                        return (
                            <Button
                                size="small"
                                variant="contained"
                                disabled={
                                    row.status ===
                                    "Rejected"
                                }
                                sx={{
                                    minWidth:
                                        58,
                                    height:
                                        28,
                                    fontSize:
                                        9,
                                    fontWeight:
                                        600,
                                    backgroundColor:
                                        "#e9819a",
                                    boxShadow:
                                        "none",

                                    "&:hover":
                                        {
                                            backgroundColor:
                                                "#db6f88",
                                            boxShadow:
                                                "none",
                                        },
                                }}
                            >
                                REJECT
                            </Button>
                        );
                    },
                },
            ],
            [
                expandedProjects,
                handleToggleProject,
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
            maxWidth="xl"
            PaperProps={{
                sx: {
                    width: "100%",
                    maxWidth: "1250px",
                    borderRadius: 0,
                    margin: 1,
                    overflow: "hidden",
                },
            }}
        >
            <Box
                sx={{
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    px: 1.5,
                    borderBottom:
                        "1px solid #ddd",
                }}
            >
                <Typography
                    sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#555",
                    }}
                >
                    Project Detailed View of{" "}
                    {employee.name}
                </Typography>

                <Typography
                    sx={{
                        ml: "auto",
                        mr: 2,
                        fontSize: 12,
                        color: "#168bd1",
                    }}
                >
                    {employee.overview ===
                    "Accepted"
                        ? "Timesheet is already Accepted"
                        : employee.approval_status}
                </Typography>

                <IconButton
                    size="small"
                    onClick={onClose}
                    sx={{
                        color: "#777",
                    }}
                >
                    <CloseIcon
                        sx={{
                            fontSize: 20,
                        }}
                    />
                </IconButton>
            </Box>
            <Box
                sx={{
                    p: 1.5,
                    overflowX: "auto",
                }}
            >
                <VirtualizedTable<TaskRow>
                    columns={columns}
                    rows={visibleTasks}
                    height="300px"
                />
                <Box
                    sx={{
                        mt: 1,
                        minWidth: 1080,
                        height: 42,
                        display: "flex",
                        alignItems: "center",
                        borderTop:
                            "2px solid #222",
                    }}
                >
                    <Typography
                        sx={{
                            width: 360,
                            textAlign:
                                "right",
                            pr: 2,
                            fontSize: 12,
                            fontWeight: 600,
                        }}
                    >
                        Total
                    </Typography>
                    {totals.map(
                        (
                            total,
                            index
                        ) => (
                            <Typography
                                key={
                                    index
                                }
                                sx={{
                                    width: 58,
                                    textAlign:
                                        "center",
                                    fontSize:
                                        12,
                                    fontWeight:
                                        600,
                                    color:
                                        "#555",
                                }}
                            >
                                {total.toFixed(
                                    2
                                )}
                            </Typography>
                        )
                    )}
                    <Box
                        sx={{
                            ml: "auto",
                            display:
                                "flex",
                            alignItems:
                                "center",
                            gap: 3,
                            pr: 2,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize:
                                    12,
                                color:
                                    "#168bd1",
                                whiteSpace:
                                    "nowrap",
                            }}
                        >
                            Estimated
                            Hours:{" "}
                            {Number(
                                employee.hours ||
                                    0
                            ).toFixed(
                                2
                            )}
                        </Typography>

                        <Typography
                            sx={{
                                fontSize:
                                    12,
                                color:
                                    "#168bd1",
                                whiteSpace:
                                    "nowrap",
                            }}
                        >
                            Actual
                            Hours:{" "}
                            {actualHours.toFixed(
                                2
                            )}
                        </Typography>
                    </Box>
                </Box>
                <Box
                    sx={{
                        mt: 1,
                    }}
                >
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
                            width:
                                "100%",
                            height: 65,
                            resize:
                                "vertical",
                            border:
                                "1px solid #d5d5d5",
                            borderRadius:
                                "3px",
                            backgroundColor:
                                "#eeeeee",
                            outline:
                                "none",
                            p: 1,
                            fontFamily:
                                "inherit",
                            fontSize:
                                12,
                            boxSizing:
                                "border-box",
                        }}
                    />
                </Box>
            </Box>
        </Dialog>
    );
};
const HourCell: React.FC<{
    value: string;
}> = ({ value }) => {
    if (!value) {
        return null;
    }

    return (
        <Box
            sx={{
                width: 48,
                height: 30,
                display: "flex",
                alignItems:
                    "center",
                justifyContent:
                    "center",
                backgroundColor:
                    "#eeeeee",
                border:
                    "1px solid #d8d8d8",
                borderRadius:
                    "3px",
                fontSize: 12,
                color: "#555",
                mx: "auto",
            }}
        >
            {value}
        </Box>
    );
};

export default ApprovalDetailedView;