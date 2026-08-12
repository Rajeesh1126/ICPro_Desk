import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    IconButton,
    Stack,
    Tab,
    Tabs,
    Tooltip,
    Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import ViewKanbanRoundedIcon from "@mui/icons-material/ViewKanbanRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CreateSelfTicketModel from "../components/SelfTickets/CreateModel";
import type {
    UsersData
} from "../types/dataTypes";
import SelfTicketDetailModel from "../components/SelfTickets/DetailModel";
import {
    flexColumnFillSx,
    inlineCenterGapSx,
    modalActionButtonSx,
    pageHeaderSx,
    selfTicketsPageBoxSx2,
    selfTicketsPageBoxSx4,
    selfTicketsPageStackSx1,
} from "../styles/common";
import api from "../api/axios";
import {
    VirtualizedTable,
    type ColumnData,
} from "../components/common/TableView";




function storedUserId(): number | null {
    const value = localStorage.getItem("user");

    if (!value) {
        return null;
    }
    const id = Number(value);
    return Number.isInteger(id) ? id : null;
}

export default function Users() {
    const userId = useMemo(() => storedUserId(), []);
    const [selectedUser, setSelectedUser] = useState("");
    const [users, setUsers] = useState<UsersData[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [selectedRow, setSelectedRow] = useState<UsersData | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let active = true;

        void api
            .get<{ data: UsersData[] }>("/users/")
            .then((response) => {
                if (!active) return;
                setUsers((Array.isArray(response.data) ? response.data : []) as UsersData[]);
            })
            .catch((error) => {
                console.error("Failed to load users", error);
            });

        return () => {
            active = false;
        };
    }, [userId, refreshKey]);

    console.log("users list after set ", users);
    const openCreate = useCallback(() => {
        setSelectedRow(null);
        setEditing(false);
        setDialogOpen(true);
    }, []);

    const openEdit = useCallback((user: UsersData) => {
        setSelectedRow(user);
        setEditing(true);
        setDialogOpen(true);
    }, []);

    const openDetails = useCallback((user: UsersData) => {
        setSelectedRow(user);
        setEditing(false);
        setDialogOpen(true);
    }, []);

    const closeDialog = useCallback(() => {
        setDialogOpen(false);
        setEditing(false);
        setSelectedRow(null);
        setRefreshKey((key) => key + 1);
    }, []);

    const columns = useMemo<ColumnData<UsersData>[]>(
        () => [
            {
                label: "#",
                width: 10,
                render: (_row, index) => index + 1,
                number: true,
            },
            {
                label: "Employee ID",
                width: 145,
                render: (row) => (
                    <Box sx={inlineCenterGapSx}>
                        <Tooltip title="Edit task">
                            <IconButton
                                aria-label={`Edit ${row.id}`}
                                size="small"
                                onClick={() => openEdit(row)}
                            >
                                <EditRoundedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Typography variant="body2">{row.username}</Typography>
                    </Box>
                ),
            },
            { label: "Name", dataKey: "first_name" },
            { label: "Email", dataKey: "email" },
            { label: "Role", dataKey: "role" },
            { label: "Department", dataKey: "department" },
            { label: "Designation", dataKey: "designation" },
            { label: "ReportIng To", dataKey: "reporting_to" },
            { label: "Location", dataKey: "location" },
        ],
        [openDetails, openEdit],
    );

    return (
        <Box sx={selfTicketsPageBoxSx2}>
            <Box component="main" sx={flexColumnFillSx}>
                <Box sx={pageHeaderSx}>
                    <Box>
                        <Typography variant="h5">Users List</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage user accounts, profiles, access, and assignments
                        </Typography>
                    </Box>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        sx={selfTicketsPageStackSx1}
                    >
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                            {tabValue === 0 && (
                                <Button
                                    startIcon={<AddRoundedIcon />}
                                    variant="contained"
                                    onClick={openCreate}
                                    sx={modalActionButtonSx}
                                >
                                    New User
                                </Button>
                            )}

                        </Stack>
                    </Stack>
                </Box>

                <Box sx={{ mx: 2 }}>
                    <Tabs
                        value={tabValue}
                        onChange={(_, value: number) => {
                            setTabValue(value);
                            setSelectedUser("");
                        }}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                    >
                        <Tab label={`Users `} />
                        <Tab label={`Teams `} />
                    </Tabs>
                </Box>
                <Box sx={selfTicketsPageBoxSx4}>
                    <VirtualizedTable
                        columns={columns}
                        rows={users}
                        height="100%"
                        tableHead="Users"
                    />
                </Box>
            </Box>
        </Box>
    );
}
