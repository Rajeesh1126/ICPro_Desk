import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    IconButton,
    MenuItem,
    Select,
    Stack,
    Tab,
    Tabs,
    Tooltip,
    Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

import type {
    UsersData,
    groupData
} from "../types/dataTypes";

import UserCreateModal from "../components/Users/userCreateModal"
import GroupCreateModal from "../components/Users/groupCreateModal"

import {
    appPageBox,
    flexColumnFillSx,
    inlineCenterGapSx,
    modalPrimaryActionButtonSx,
    pageHeaderSx,
    selfTicketsPageBoxSx4,
    selfTicketsPageStackSx1,
} from "../styles/common";
import api from "../api/axios";
import {
    VirtualizedTable,
    type ColumnData,
} from "../components/common/TableView";
import { showNotification } from "../api/NotificationService";


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
    const [users, setUsers] = useState<UsersData[]>([]);
    const [groups, setGroups] = useState<groupData[]>([]);
    const [savingGroupId, setSavingGroupId] = useState<number | null>(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [selectedRow, setSelectedRow] = useState<UsersData | null>(null);

    const [groupDialogOpen, setGroupDialogOpen] = useState(false);
    const [groupEditing, setGroupEditing] = useState(false);
    const [selectedGroupRow, setSelectedGroupRow] = useState<groupData | null>(null);

    const [tabValue, setTabValue] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);


    // api Request
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


    // Groups
    useEffect(() => {
        let active = true;

        void api
            .get<groupData[]>("/departments/")
            .then((response) => {
                if (!active) return;

                setGroups(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );
            })
            .catch((error) => {
                console.error("Failed to load departments", error);
            });

        return () => {
            active = false;
        };
    }, [userId, refreshKey]);



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

    const openCreateGroup = useCallback(() => {
        setSelectedGroupRow(null);
        setGroupEditing(false);
        setGroupDialogOpen(true);
    }, []);

    const openEditGroup = useCallback((group: groupData) => {
        setSelectedGroupRow(group);
        setGroupEditing(true);
        setGroupDialogOpen(true);
    }, []);

    const updateGroupManager = useCallback(
        async (group: groupData, managerId: number | null) => {
            setSavingGroupId(group.id);

            try {
                await api.patch(`/departments/${group.id}/`, {
                    manager_id: managerId,
                });

                const manager = managerId === null
                    ? null
                    : users.find((user) => user.id === managerId);
                const managerName = manager
                    ? `${manager.first_name ?? ""} ${manager.last_name ?? ""}`.trim() || manager.username
                    : "";

                setGroups((currentGroups) =>
                    currentGroups.map((item) =>
                        item.id === group.id
                            ? {
                                ...item,
                                manager: manager
                                    ? {
                                        id: manager.id,
                                        username: manager.username,
                                        name: managerName,
                                    }
                                    : null,
                            }
                            : item,
                    ),
                );

            showNotification({
                type: "success",
                message: managerId ? "Manger Mapped successfully." : "Managre Updated successfully.",
                });
            } catch (error) {
                console.error("Failed to update department manager", error);
            } finally {
                setSavingGroupId(null);
            }
        },
        [users],
    );


    const closeDialog = useCallback(() => {
        setDialogOpen(false);
        setEditing(false);
        setSelectedRow(null);
        setRefreshKey((key) => key + 1);
    }, []);

    const closeGroupDialog = useCallback(() => {
        setGroupDialogOpen(false);
        setGroupEditing(false);
        setSelectedGroupRow(null);
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
                width: 100,
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
            { label: "First Name", dataKey: "first_name" },
            { label: "Last Name", dataKey: "last_name" },
            { label: "Email", dataKey: "email" },
            { label: "Role", dataKey: "role" },
            { label: "Exe_Teams", dataKey: "groups" },
            { label: "Designation", dataKey: "designation" },
            { label: "ReportIng To", dataKey: "reporting_to" },
            { label: "Location", dataKey: "location" },
        ],
        [openDetails, openEdit],
    );

    const columnsGroup = useMemo<ColumnData<groupData>[]>(
        () => [
            {
                label: "#",
                width: 10,
                render: (_row, index) => index + 1,
                number: true,
            },
            {
                label: "Name",
                width: 200,
                render: (row) => (
                    <Box sx={inlineCenterGapSx}>
                        <Tooltip title="Edit team">
                            <IconButton
                                aria-label={`Edit ${row.name || row.id}`}
                                size="small"
                                onClick={() => openEditGroup(row)}
                            >
                                <EditRoundedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Typography variant="body2">
                            {row.name}
                        </Typography>
                    </Box>
                ),
            },
            {
                label: "Manager",
                render: (row) => (
                    <Select
                        size="small"
                        fullWidth
                        displayEmpty
                        disabled={savingGroupId === row.id}
                        value={row.manager?.id === undefined ? "" : String(row.manager.id)}
                        onChange={(event) =>
                            void updateGroupManager(
                                row,
                                event.target.value === ""
                                    ? null
                                    : Number(event.target.value),
                            )
                        }
                    >
                        <MenuItem value="">
                            <em>Select Manager</em>
                        </MenuItem>

                        {users.map((user) => (
                            <MenuItem key={user.id} value={String(user.id)}>
                                {`${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.username}
                            </MenuItem>
                        ))}
                    </Select>
                ),
            },
        ],
        [openEditGroup, savingGroupId, updateGroupManager, users],
    );



    return (
        <Box sx={appPageBox}>
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
                            {tabValue === 0 ? (
                                <Button
                                    startIcon={<AddRoundedIcon />}
                                    variant="contained"
                                    onClick={openCreate}
                                    sx={modalPrimaryActionButtonSx}
                                >
                                    New User
                                </Button>
                            ) : null}
                            {tabValue === 1 ? (
                                <Button
                                    startIcon={<AddRoundedIcon />}
                                    variant="contained"
                                    onClick={openCreateGroup}
                                    sx={modalPrimaryActionButtonSx}
                                >
                                    New Team
                                </Button>
                            ) : null}

                        </Stack>
                    </Stack>
                </Box>

                <Box sx={{ mx: 2 }}>
                    <Tabs
                        value={tabValue}
                        onChange={(_, value: number) => {
                            setTabValue(value);
                        }}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                    >
                        <Tab label={`Users `} />
                        <Tab label={`Teams `} />
                    </Tabs>
                </Box>
                {tabValue === 0 && (
                    <Box sx={selfTicketsPageBoxSx4}>
                        <VirtualizedTable
                            columns={columns}
                            rows={users}
                            height="100%"
                            tableHead="Users"
                        />
                    </Box>
                )}
                {tabValue === 1 && (
                    <Box sx={selfTicketsPageBoxSx4}>
                        <VirtualizedTable
                            columns={columnsGroup}
                            rows={groups}
                            height="100%"
                            tableHead="Teams"
                        />
                    </Box>
                )}

            </Box>
            {!selectedRow && !editing && (
                <UserCreateModal
                    open={dialogOpen}
                    handleClose={closeDialog}
                    Data={null}
                />
            )}
            {selectedRow && editing && (
                <UserCreateModal
                    open={dialogOpen}
                    handleClose={closeDialog}
                    Data={selectedRow}
                />
            )}
            {!selectedGroupRow && !groupEditing && (
                <GroupCreateModal
                    open={groupDialogOpen}
                    handleClose={closeGroupDialog}
                    Data={null}
                />
            )}
            {selectedGroupRow && groupEditing && (
                <GroupCreateModal
                    open={groupDialogOpen}
                    handleClose={closeGroupDialog}
                    Data={selectedGroupRow}
                />
            )}

        </Box>



    );
}
