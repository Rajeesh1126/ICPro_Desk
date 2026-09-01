import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
    Box,
    Button,
    Checkbox,
    FormControl,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";

import type { SelectChangeEvent } from "@mui/material";

import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

import axios from "axios";

import {
    VirtualizedTable,
    type ColumnData,
} from "../../components/common/TableView";

/* =========================================================
   TYPES
========================================================= */

type WeekStatusType =
    | "ontime"
    | "delayed"
    | "not_submitted"
    | "na";

interface ApiWeekStatus {
    action_status: boolean | null;
    submission_status: boolean | null;
    timesheet_status: string | null;
    approval_status: string | null;
}

interface ApiEmployee {
    first_name: string;
    joinedWeek: number | null;
    joinedYear: number | null;
    resignedWeek: number | null;
    resignedYear: number | null;
    weekYear?: number;

    [week: string]:
        | string
        | number
        | null
        | ApiWeekStatus
        | undefined;
}

interface ApiEmployeeListItem {
    id: number;
    first_name: string;
}

interface WeeklyStatusApiResponse {
    employees: Record<string, ApiEmployee>;
    year: number;
    current_week: number;
    DropDownWeekStart: number;
    DropDownWeekEnd: number;
    employeeList: ApiEmployeeListItem[];
    selectedYear: number;
    selectedWeekStart: number;
    selectedWeekEnd: number;
    selectedEmployee: string | number;
    selectedEmpStatus: boolean;
}

interface WeeklyStatusRow
    extends Record<string, unknown> {
    id: number;
    name: string;
    [key: string]: unknown;
}

/* =========================================================
   STATUS CONFIG
========================================================= */

const statusConfig: Record<
    WeekStatusType,
    {
        symbol: string;
        color: string;
    }
> = {
    ontime: {
        symbol: "✓",
        color: "#00A651",
    },

    delayed: {
        symbol: "✓",
        color: "#F5A000",
    },

    not_submitted: {
        symbol: "×",
        color: "#FF4057",
    },

    na: {
        symbol: "N/A",
        color: "#555",
    },
};

/* =========================================================
   HELPERS
========================================================= */

/**
 * Convert backend approval/submission information
 * into the status used by the UI.
 */
const getWeekStatus = (
    weekData?: ApiWeekStatus
): WeekStatusType => {
    if (!weekData) {
        return "na";
    }

    const {
        submission_status,
        approval_status,
        timesheet_status,
    } = weekData;

    /*
     * Not submitted
     */
    if (!submission_status) {
        return "not_submitted";
    }

    /*
     * Approval status returned by backend.
     *
     * Adjust these strings if your
     * getApprovalStatusFromCache() returns
     * different values.
     */
    if (approval_status) {
        const approval = approval_status
            .toString()
            .toLowerCase()
            .trim();

        if (
            approval.includes("delay") ||
            approval.includes("late")
        ) {
            return "delayed";
        }

        if (
            approval.includes("ontime") ||
            approval.includes("on time") ||
            approval.includes("on-time")
        ) {
            return "ontime";
        }
    }

    /*
     * Fallback based on timesheet status.
     */
    if (timesheet_status) {
        const timesheet = timesheet_status
            .toString()
            .toLowerCase()
            .trim();

        if (
            timesheet.includes("delay") ||
            timesheet.includes("late")
        ) {
            return "delayed";
        }

        if (
            timesheet.includes("submit") ||
            timesheet.includes("complete") ||
            timesheet.includes("ontime") ||
            timesheet.includes("on time")
        ) {
            return "ontime";
        }
    }

    /*
     * If submission exists but no
     * specific approval information,
     * consider it submitted/on time.
     */
    return "ontime";
};

/* =========================================================
   COMPONENT
========================================================= */

const SubmissionStatus: React.FC = () => {
    /* =====================================================
       FILTER STATE
    ===================================================== */

    const [activeEmployees, setActiveEmployees] =
        useState(true);

    const [selectedEmployee, setSelectedEmployee] =
        useState("ALL EMPLOYEES");

    const [year, setYear] = useState("");

    const [weekStart, setWeekStart] =
        useState("");

    const [weekEnd, setWeekEnd] =
        useState("");

    /* =====================================================
       API DATA
    ===================================================== */

    const [employeeList, setEmployeeList] =
        useState<ApiEmployeeListItem[]>([]);

    const [employees, setEmployees] =
        useState<Record<string, ApiEmployee>>({});

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    /* =====================================================
       WEEK NUMBERS
    ===================================================== */

    const weekNumbers = useMemo(() => {
        const start = Number(weekStart);
        const end = Number(weekEnd);

        if (
            !Number.isFinite(start) ||
            !Number.isFinite(end) ||
            start <= 0 ||
            end <= 0 ||
            start > end
        ) {
            return [];
        }

        return Array.from(
            {
                length: end - start + 1,
            },
            (_, index) => start + index
        );
    }, [weekStart, weekEnd]);

    /* =====================================================
       API CALL
    ===================================================== */

    const fetchWeeklyStatus = useCallback(
        async (
            selectedYear?: number,
            selectedWeekStart?: number,
            selectedWeekEnd?: number,
            employeeId?: string,
            employeeStatus?: boolean
        ) => {
            try {
                setLoading(true);
                setError("");

                const payload = {
                    weekYear:
                        selectedYear ??
                        Number(year),

                    weekStart:
                        selectedWeekStart ??
                        Number(weekStart),

                    weekEnd:
                        selectedWeekEnd ??
                        Number(weekEnd),

                    employeeId:
                        employeeId ??
                        (
                            selectedEmployee ===
                            "ALL EMPLOYEES"
                                ? ""
                                : selectedEmployee
                        ),

                    selectedEmpStatus:
                        employeeStatus ??
                        activeEmployees,
                };

                const response =
                    await axios.post<WeeklyStatusApiResponse>(
                        "/api/weekly-timesheet-status/",
                        payload
                    );

                const data = response.data;
                console.log(data)

                setEmployees(
                    data.employees ?? {}
                );

                setEmployeeList(
                    data.employeeList ?? []
                );

                /*
                 * Set filter values from API
                 */
                setYear(
                    String(
                        data.selectedYear ??
                        data.year
                    )
                );

                setWeekStart(
                    String(
                        data.selectedWeekStart ??
                        data.DropDownWeekStart
                    )
                );

                setWeekEnd(
                    String(
                        data.selectedWeekEnd ??
                        data.DropDownWeekEnd
                    )
                );
            } catch (err) {
                console.error(
                    "Failed to fetch weekly timesheet status:",
                    err
                );

                setError(
                    "Failed to load weekly timesheet status."
                );
            } finally {
                setLoading(false);
            }
        },
        [
            year,
            weekStart,
            weekEnd,
            selectedEmployee,
            activeEmployees,
        ]
    );

    /* =====================================================
       INITIAL API CALL
    ===================================================== */

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await axios.get<WeeklyStatusApiResponse>(
                        "/weekly-timesheet-status/"
                    );
                    
                console.log("initial",response.data);
                const data = response.data;

                setEmployees(
                    data.employees ?? {}
                );

                setEmployeeList(
                    data.employeeList ?? []
                );

                setYear(
                    String(
                        data.selectedYear ??
                        data.year
                    )
                );

                setWeekStart(
                    String(
                        data.selectedWeekStart ??
                        data.DropDownWeekStart
                    )
                );

                setWeekEnd(
                    String(
                        data.selectedWeekEnd ??
                        data.DropDownWeekEnd
                    )
                );
            } catch (err) {
                console.error(
                    "Failed to load weekly status:",
                    err
                );

                setError(
                    "Failed to load weekly timesheet status."
                );
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    /* =====================================================
       EMPLOYEE CHANGE
    ===================================================== */

    const handleEmployeeChange = (
        event: SelectChangeEvent
    ) => {
        setSelectedEmployee(
            event.target.value
        );
    };

    /* =====================================================
       FILTER / SUBMIT
    ===================================================== */

    const handleSubmit = () => {
        fetchWeeklyStatus(
            Number(year),
            Number(weekStart),
            Number(weekEnd),
            selectedEmployee ===
                "ALL EMPLOYEES"
                ? ""
                : selectedEmployee,
            activeEmployees
        );
    };

    /* =====================================================
       FILTER EMPLOYEES
    ===================================================== */

    const filteredEmployees = useMemo(() => {
        const employeeArray =
            Object.entries(employees);

        if (
            selectedEmployee ===
            "ALL EMPLOYEES"
        ) {
            return employeeArray;
        }

        return employeeArray.filter(
            ([id]) =>
                id === selectedEmployee
        );
    }, [
        employees,
        selectedEmployee,
    ]);

    /* =====================================================
       VIRTUAL TABLE ROWS
    ===================================================== */

    const virtualRows = useMemo<
        WeeklyStatusRow[]
    >(() => {
        return filteredEmployees.map(
            ([id, employee]) => {
                const row: WeeklyStatusRow = {
                    id: Number(id),
                    name:
                        employee.first_name ??
                        "",
                };

                weekNumbers.forEach(
                    (week) => {
                        const weekData =
                            employee[
                                String(week)
                            ];

                        const status =
                            getWeekStatus(
                                weekData as
                                    | ApiWeekStatus
                                    | undefined
                            );

                        row[
                            `week${week}`
                        ] = status;
                    }
                );

                return row;
            }
        );
    }, [
        filteredEmployees,
        weekNumbers,
    ]);

    /* =====================================================
       TABLE COLUMNS
    ===================================================== */

    const columns = useMemo<
        ColumnData<WeeklyStatusRow>[]
    >(() => {
        return [
            {
                key: "name",
                label: "Name",
                width: 305,

                render: (
                    row: WeeklyStatusRow
                ) => {
                    const employeeIndex =
                        filteredEmployees.findIndex(
                            ([id]) =>
                                Number(id) ===
                                row.id
                        );

                    return (
                        <Box
                            sx={{
                                width:
                                    "100%",
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                height:
                                    "32px",
                                padding:
                                    "0 8px",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize:
                                        "12px",
                                    fontWeight:
                                        600,
                                    color:
                                        "#222",
                                    whiteSpace:
                                        "nowrap",
                                    overflow:
                                        "hidden",
                                    textOverflow:
                                        "ellipsis",
                                }}
                            >
                                {employeeIndex +
                                    1}
                                .{" "}
                                {row.name}
                            </Typography>
                        </Box>
                    );
                },
            },

            ...weekNumbers.map(
                (week) => ({
                    key:
                        `week${week}` as keyof WeeklyStatusRow,

                    label:
                        `Week-${week}`,

                    width: 114,

                    render: (
                        row: WeeklyStatusRow
                    ) => {
                        const status =
                            row[
                                `week${week}`
                            ] as WeekStatusType;

                        const config =
                            statusConfig[
                                status ??
                                    "na"
                            ];

                        return (
                            <Box
                                sx={{
                                    width:
                                        "100%",
                                    height:
                                        "32px",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize:
                                            status ===
                                            "na"
                                                ? "11px"
                                                : "21px",

                                        fontWeight:
                                            status ===
                                            "na"
                                                ? 400
                                                : 500,

                                        color:
                                            config.color,

                                        lineHeight:
                                            "25px",
                                    }}
                                >
                                    {
                                        config.symbol
                                    }
                                </Typography>
                            </Box>
                        );
                    },
                })
            ),
        ];
    }, [
        filteredEmployees,
        weekNumbers,
    ]);

    /* =====================================================
       EXPORT
    ===================================================== */

    const handleExport = () => {
        console.log(
            "Export Compliance Overview"
        );
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <>
            {/* ================= FILTER BAR ================= */}

            <Box
                sx={{
                    minHeight:
                        "48px",
                    display:
                        "flex",
                    alignItems:
                        "center",
                    justifyContent:
                        "center",
                    gap: "8px",
                    borderBottom:
                        "1px solid #ddd",
                    px: 2,
                    flexWrap:
                        "wrap",
                }}
            >
                {/* Active Employees */}

                <Box
                    sx={{
                        display:
                            "flex",
                        alignItems:
                            "center",
                        mr: 1,
                    }}
                >
                    <Checkbox
                        checked={
                            activeEmployees
                        }
                        onChange={(e) =>
                            setActiveEmployees(
                                e.target
                                    .checked
                            )
                        }
                        size="small"
                        sx={{
                            padding:
                                "3px",
                            color:
                                "#1976d2",

                            "&.Mui-checked":
                                {
                                    color:
                                        "#1976d2",
                                },
                        }}
                    />

                    <Typography
                        sx={{
                            fontSize:
                                "12px",
                            color:
                                "#444",
                        }}
                    >
                        Active Employees
                    </Typography>
                </Box>

                {/* Employee */}

                <Box
                    sx={{
                        position:
                            "relative",
                        width:
                            "180px",
                    }}
                >
                    <Box
                        sx={{
                            position:
                                "absolute",
                            top:
                                "-8px",
                            left:
                                "7px",
                            background:
                                "#fff",
                            px:
                                "3px",
                            zIndex: 1,
                            display:
                                "flex",
                            alignItems:
                                "center",
                            gap:
                                "2px",
                        }}
                    >
                        <FilterAltIcon
                            sx={{
                                fontSize:
                                    "14px",
                                color:
                                    "#555",
                            }}
                        />

                        <Typography
                            sx={{
                                fontSize:
                                    "10px",
                                color:
                                    "#555",
                            }}
                        >
                            Employees
                        </Typography>
                    </Box>

                    <FormControl
                        size="small"
                        fullWidth
                    >
                        <Select
                            value={
                                selectedEmployee
                            }
                            onChange={
                                handleEmployeeChange
                            }
                            sx={{
                                height:
                                    "30px",
                                fontSize:
                                    "12px",
                                backgroundColor:
                                    "#f7f7f7",

                                "& .MuiSelect-select":
                                    {
                                        padding:
                                            "6px 25px 6px 10px",
                                    },
                            }}
                        >
                            <MenuItem
                                value={
                                    "ALL EMPLOYEES"
                                }
                            >
                                ALL EMPLOYEES
                            </MenuItem>

                            {employeeList.map(
                                (
                                    employee
                                ) => (
                                    <MenuItem
                                        key={
                                            employee.id
                                        }
                                        value={String(
                                            employee.id
                                        )}
                                    >
                                        {
                                            employee.first_name
                                        }
                                    </MenuItem>
                                )
                            )}
                        </Select>
                    </FormControl>
                </Box>

                {/* Year */}

                <Box
                    sx={{
                        position:
                            "relative",
                        width:
                            "122px",
                    }}
                >
                    <Typography
                        sx={{
                            position:
                                "absolute",
                            top:
                                "-8px",
                            left:
                                "8px",
                            backgroundColor:
                                "#fff",
                            px:
                                "3px",
                            fontSize:
                                "10px",
                            color:
                                "#555",
                            zIndex: 1,
                        }}
                    >
                        Year
                    </Typography>

                    <TextField
                        value={year}
                        onChange={(e) =>
                            setYear(
                                e.target
                                    .value
                                    .replace(
                                        /\D/g,
                                        ""
                                    )
                            )
                        }
                        size="small"
                        fullWidth
                        sx={{
                            "& .MuiInputBase-root":
                                {
                                    height:
                                        "30px",
                                    fontSize:
                                        "12px",
                                },
                        }}
                    />
                </Box>

                {/* Week Start */}

                <Box
                    sx={{
                        position:
                            "relative",
                        width:
                            "130px",
                    }}
                >
                    <Typography
                        sx={{
                            position:
                                "absolute",
                            top:
                                "-8px",
                            left:
                                "8px",
                            backgroundColor:
                                "#fff",
                            px:
                                "3px",
                            fontSize:
                                "10px",
                            color:
                                "#555",
                            zIndex: 1,
                        }}
                    >
                        Week Start
                    </Typography>

                    <TextField
                        value={
                            weekStart
                                ? `Week ${weekStart}`
                                : ""
                        }
                        onChange={(e) =>
                            setWeekStart(
                                e.target
                                    .value
                                    .replace(
                                        /\D/g,
                                        ""
                                    )
                            )
                        }
                        size="small"
                        fullWidth
                        sx={{
                            "& .MuiInputBase-root":
                                {
                                    height:
                                        "30px",
                                    fontSize:
                                        "12px",
                                },
                        }}
                    />
                </Box>

                {/* Week End */}

                <Box
                    sx={{
                        position:
                            "relative",
                        width:
                            "130px",
                    }}
                >
                    <Typography
                        sx={{
                            position:
                                "absolute",
                            top:
                                "-8px",
                            left:
                                "8px",
                            backgroundColor:
                                "#fff",
                            px:
                                "3px",
                            fontSize:
                                "10px",
                            color:
                                "#555",
                            zIndex: 1,
                        }}
                    >
                        Week End
                    </Typography>

                    <TextField
                        value={
                            weekEnd
                                ? `Week ${weekEnd}`
                                : ""
                        }
                        onChange={(e) =>
                            setWeekEnd(
                                e.target
                                    .value
                                    .replace(
                                        /\D/g,
                                        ""
                                    )
                            )
                        }
                        size="small"
                        fullWidth
                        sx={{
                            "& .MuiInputBase-root":
                                {
                                    height:
                                        "30px",
                                    fontSize:
                                        "12px",
                                },
                        }}
                    />
                </Box>

                {/* Submit */}

                <Button
                    variant="contained"
                    onClick={
                        handleSubmit
                    }
                    disabled={loading}
                    sx={{
                        height:
                            "29px",
                        minWidth:
                            "66px",
                        textTransform:
                            "none",
                        fontSize:
                            "11px",
                        borderRadius:
                            "4px",
                        boxShadow:
                            "none",

                        "&:hover":
                            {
                                boxShadow:
                                    "none",
                            },
                    }}
                >
                    {loading
                        ? "Loading..."
                        : "Submit"}
                </Button>

                {/* Export */}

                <Button
                    variant="contained"
                    onClick={
                        handleExport
                    }
                    startIcon={
                        <FileDownloadOutlinedIcon
                            sx={{
                                fontSize:
                                    "16px !important",
                            }}
                        />
                    }
                    sx={{
                        height:
                            "29px",
                        minWidth:
                            "150px",
                        textTransform:
                            "none",
                        fontSize:
                            "11px",
                        borderRadius:
                            "4px",
                        boxShadow:
                            "none",

                        "&:hover":
                            {
                                boxShadow:
                                    "none",
                            },
                    }}
                >
                    Export Compliance Overview
                </Button>
            </Box>

            {/* ================= ERROR ================= */}

            {error && (
                <Box
                    sx={{
                        px: 2,
                        py: 1,
                        color:
                            "#d32f2f",
                        fontSize:
                            "12px",
                    }}
                >
                    {error}
                </Box>
            )}

            {/* ================= TABLE ================= */}

            <Box
                sx={{
                    px: "7px",
                    pt: "7px",
                }}
            >
                {loading ? (
                    <Box
                        sx={{
                            height:
                                "400px",
                            display:
                                "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize:
                                    "13px",
                                color:
                                    "#777",
                            }}
                        >
                            Loading weekly
                            status...
                        </Typography>
                    </Box>
                ) : (
                    <VirtualizedTable<WeeklyStatusRow>
                        columns={
                            columns
                        }
                        rows={
                            virtualRows
                        }
                        height="400px"
                    />
                )}
            </Box>

            {/* ================= LEGEND ================= */}

            <Box
                sx={{
                    display:
                        "flex",
                    justifyContent:
                        "flex-end",
                    alignItems:
                        "center",
                    gap: "5px",
                    px: "25px",
                    py: "16px",
                    flexWrap:
                        "wrap",
                }}
            >
                {/* Submitted - Ontime */}

                <Box
                    sx={{
                        display:
                            "flex",
                        alignItems:
                            "center",
                        gap: "5px",
                        padding:
                            "7px 10px",
                        backgroundColor:
                            "#fff",
                        borderRadius:
                            "4px",
                        boxShadow:
                            "0 1px 8px rgba(0,0,0,0.08)",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize:
                                "12px",
                            color:
                                "#555",
                        }}
                    >
                        Submitted -
                        Ontime
                    </Typography>

                    <Typography
                        sx={{
                            color:
                                "#00A651",
                            fontSize:
                                "18px",
                            fontWeight:
                                600,
                        }}
                    >
                        ✓
                    </Typography>
                </Box>

                {/* Submitted - Delayed */}

                <Box
                    sx={{
                        display:
                            "flex",
                        alignItems:
                            "center",
                        gap: "5px",
                        padding:
                            "7px 10px",
                        backgroundColor:
                            "#fff",
                        borderRadius:
                            "4px",
                        boxShadow:
                            "0 1px 8px rgba(0,0,0,0.08)",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize:
                                "12px",
                            color:
                                "#555",
                        }}
                    >
                        Submitted -
                        Delayed
                    </Typography>

                    <Typography
                        sx={{
                            color:
                                "#F5A000",
                            fontSize:
                                "18px",
                            fontWeight:
                                600,
                        }}
                    >
                        ✓
                    </Typography>
                </Box>

                {/* Not Submitted */}

                <Box
                    sx={{
                        display:
                            "flex",
                        alignItems:
                            "center",
                        gap: "5px",
                        padding:
                            "7px 10px",
                        backgroundColor:
                            "#fff",
                        borderRadius:
                            "4px",
                        boxShadow:
                            "0 1px 8px rgba(0,0,0,0.08)",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize:
                                "12px",
                            color:
                                "#555",
                        }}
                    >
                        Not Submitted
                    </Typography>

                    <Typography
                        sx={{
                            color:
                                "#FF4057",
                            fontSize:
                                "20px",
                            fontWeight:
                                500,
                        }}
                    >
                        ×
                    </Typography>
                </Box>
            </Box>
        </>
    );
};

export default SubmissionStatus;
