import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Stack, Tab, Tabs, Typography, Tooltip, IconButton, Checkbox, FormControlLabel,} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import type { rolesData, permissionData } from "../types/dataTypes";
import { deleteIconSx, editIconSx, flexColumnFillSx, inlineCenterGapSx, modalActionButtonSx, pageHeaderSx, selfTicketsPageBoxSx2, selfTicketsPageBoxSx4, selfTicketsPageStackSx1, } from "../styles/common";
import api from "../api/axios";
import { VirtualizedTable, type ColumnData, } from "../components/common/TableView";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import RoleModel from "../components/Roles/RoleModel";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { showNotification } from "../api/NotificationService";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

function storedUserId(): number | null {
    const value = localStorage.getItem("user");

    if (!value) {
        return null;
    }
    const id = Number(value);
    return Number.isInteger(id) ? id : null;
}

export default function Roles() {
    const userId = useMemo(() => storedUserId(), []);
    const [selectedUser, setSelectedUser] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [selectedRow, setSelectedRow] = useState<rolesData | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    const [roles, setRoles] = useState<rolesData[]>([]);
    const [permissions, setPermissions] = useState<permissionData[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteRow, setDeleteRow] = useState<rolesData | null>(null);
    const [saving, setSaving] = useState(false);

    // role Data
    useEffect(() => {
        // if (!open) return;
        let active = true;
        void api
        .get("/roles/")
        .then((response) => {
            console.log("Roles",response.data)
            if (!active) return;
            setRoles(response.data);
        })
        .catch((error) => {
            console.error("Failed to load roles", error)
        });
        return () => {
            active = false;
        };
    // }, [open, refreshKey]);
    }, [refreshKey]);

    // Permission Data
    useEffect(() => {
        // if (!open) return;
        let active = true;
        void api
        .get("/permissions/")
        .then((response) => {
            console.log("permissions",response.data)
            if (!active) return;
            setPermissions(response.data);
        })
        .catch((error) => {
            console.error("Failed to load permissions", error)
        });
        return () => {
            active = false;
        };
    // }, [open, refreshKey]);
    }, [refreshKey]);

    const openCreate = useCallback(() => {
        setSelectedRow(null);
        setEditing(false);
        setDialogOpen(true);
    }, []);

    const openEdit = useCallback((role: rolesData) => {
        setSelectedRow(role);
        setEditing(true);
        setDialogOpen(true);
    }, []);

    const closeDialog = useCallback(() => {
        setDialogOpen(false);
        setEditing(false);
        setSelectedRow(null);
        setRefreshKey((key) => key + 1);
    }, []);

    const openDelete = useCallback((row: rolesData) => {
        setDeleteRow(row);
        setDeleteDialogOpen(true);
        console.log("Delete role:", row);
    }, []);

    const handleDelete = useCallback(async () => {
        if (!deleteRow) return;
        try {
            await api.delete(`/roles/${deleteRow.id}/`);
            setDeleteDialogOpen(false);
            setDeleteRow(null);
            setRefreshKey((key) => key + 1);
            showNotification({
                type: "success",
                message: "Roles deleted successfully.",
            });
        } catch (error) {
            console.error("Failed to delete role", error);
        }
    }, [deleteRow]);

    // ========================================================
    // CHECK / UNCHECK PERMISSION
    // ========================================================

    const handlePermissionChange = useCallback(
        (
            roleId: number,
            permissionId: number,
            checked: boolean
        ) => {
            setRoles((previousRoles) =>
                previousRoles.map((role) => {
                    if (role.id !== roleId) {
                        return role;
                    }

                    let updatedPermissions: number[];

                    if (checked) {
                        updatedPermissions = [
                            ...new Set([
                                ...role.permissions,
                                permissionId,
                            ]),
                        ];
                    } else {
                        updatedPermissions =
                            role.permissions.filter(
                                (id) => id !== permissionId
                            );
                    }

                    return {
                        ...role,
                        permissions: updatedPermissions,
                    };
                })
            );
        },
        []
    );

    // ========================================================
    // SELECT / UNSELECT ALL PERMISSIONS FOR ONE ROLE
    // ========================================================

    const handleSelectAllForRole = useCallback(
        (roleId: number, checked: boolean) => {
            setRoles((previousRoles) =>
                previousRoles.map((role) => {
                    if (role.id !== roleId) {
                        return role;
                    }

                    return {
                        ...role,
                        permissions: checked
                            ? permissions.map(
                                    (permission) =>
                                        permission.id
                                )
                            : [],
                    };
                })
            );
        },
        [permissions]
    );

    const handleSave = async () => {
        try {
            setSaving(true);

            console.log("Roles to save:", roles);

            // Later:
            for (const role of roles) {
                await api.patch(`/roles/${role.id}/`, {
                    permissions: role.permissions,
                });
            }
        showNotification({
            type: "success",
            message: "Permissions saved successfully.",
        });
        } catch (error) {
            console.error("Failed to save permissions:", error);
        } finally {
            setSaving(false);
        }
    };

    const columns = useMemo<ColumnData<rolesData>[]>(
        () => [
            {
                label: "#",
                width: 10,
                render: (_row, index) => index + 1,
                number: true,
            },
            {
                label: "Action",
                width: 145,
                render: (row) => (
                    <Box sx={inlineCenterGapSx}>
                        {/* edit btn */}
                        <Tooltip title="Edit role">
                            <IconButton
                                aria-label={`Edit ${row.id}`}
                                size="small"
                                onClick={() => openEdit(row)}
                            >
                                <EditRoundedIcon fontSize="small" sx={editIconSx}/>
                            </IconButton>
                        </Tooltip>
                        {/* delete btn */}
                        <Tooltip title="Delete role">
                            <IconButton
                                aria-label={`Delete ${row.id}`}
                                size="small"
                                onClick={() => openDelete(row)}
                            >
                                <DeleteRoundedIcon fontSize="small" sx={deleteIconSx}/>
                            </IconButton>
                        </Tooltip>
                        {/* <Typography variant="body2">{row.name}</Typography> */}
                    </Box>
                ),
            },
            { label: "Name", dataKey: "name" },
            { label: "Description", dataKey: "description" },
        ],
        [openEdit, openDelete],
    );

    const permissionColumns = useMemo<ColumnData<rolesData>[]>(() => {
        const roleColumn: ColumnData<rolesData> = {
            label: "Roles",
            width: 180,

            render: (row) => {
                const allSelected =
                    row.permissions.length === permissions.length;

                return (
                    <FormControlLabel
                        control={
                            <Checkbox
                                size="small"
                                checked={allSelected}
                                indeterminate={
                                    row.permissions.length > 0 &&
                                    !allSelected
                                }
                                onChange={(event) =>
                                    handleSelectAllForRole(
                                        row.id,
                                        event.target.checked
                                    )
                                }
                            />
                        }
                        label={row.name}
                    />
                );
            },
        };

        const permissionColumns = permissions.map(
            (permission): ColumnData<rolesData> => ({
                label: permission.name,
                width: 125,

                render: (row) => (
                    <Checkbox
                        size="small"
                        checked={row.permissions.includes(permission.id)}
                        onChange={(event) =>
                            handlePermissionChange(
                                row.id,
                                permission.id,
                                event.target.checked
                            )
                        }
                    />
                ),
            })
        );

        return [
            roleColumn,
            ...permissionColumns,
        ];
    }, [
        permissions,
        handleSelectAllForRole,
        handlePermissionChange,
    ]);

    return (
        <Box sx={selfTicketsPageBoxSx2}>
            <Box component="main" sx={flexColumnFillSx}>
                <Box sx={pageHeaderSx}>
                    <Box>
                        <Typography variant="h5">{tabValue === 0 ? "Roles List" : "Permissions List"}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {tabValue === 0 ? "Manage roles, permissions, and access" : "Manage permissions and access"}
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
                                   New Role
                                </Button>
                            )}
                            {tabValue === 1 && (
                                <Button
                                    variant="contained"
                                    startIcon={<SaveRoundedIcon />}
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : "Save Changes"}
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
                            // setSelectedUser("");
                        }}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                    >
                        <Tab label="Roles" />
                        <Tab label="Permissions" />
                    </Tabs>
                </Box>
                {tabValue === 0 && (
                    <>
                        <Box sx={selfTicketsPageBoxSx4}>
                            <VirtualizedTable
                                columns={columns}
                                rows={roles}
                                height="100%"
                                tableHead="Roles"
                            />
                        </Box>
                        <RoleModel
                            open={dialogOpen}
                            editing={editing}
                            Data={selectedRow}
                            handleClose={closeDialog}
                        />
                        <ConfirmDialog
                            open={deleteDialogOpen}
                            onClose={() => {
                                setDeleteDialogOpen(false);
                                setDeleteRow(null);
                            }}
                            onConfirm={handleDelete}
                            title="Delete Role"
                            description={ deleteRow ? `Are you sure you want to delete the role "${deleteRow.name}"?` : "Are you sure you want to delete this role?" }
                            confirmLabel="Delete"
                            confirmColor="error"
                            confirmIcon={<DeleteRoundedIcon />}
                            tone="error"
                        />
                    </>
                )}
                {tabValue === 1 && (
                    <>
                        <Box sx={selfTicketsPageBoxSx4}>
                            <VirtualizedTable
                                columns={permissionColumns}
                                rows={roles}
                                height="100%"
                                tableHead="Role Permissions"
                            />
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}

