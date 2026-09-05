import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Stack,
  Tab,
  Tabs,
  Typography,
  Tooltip,
  IconButton,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import type { rolesData, permissionData } from "../types/dataTypes";
import {
  buttonLabelCompact,
  buttonLabelFull,
  deleteIconSx,
  editIconSx,
  inlineCenterGapSx,
  pageHeaderActions,
  pageHeaderContent,
  pageHeader,
  page,
  pageContent,
  pageSubtitle,
  pageTitle,
  tabs,
  tabsContainer,
  tablePageContent,
} from "../styles/common";
import api from "../api/axios";
import {
  VirtualizedTable,
  type ColumnData,
} from "../components/common/TableView";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RoleModel from "../components/roles/RoleModel";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { showNotification } from "../api/notificationService";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

const formatPermissionLabel = (permission: permissionData) => {
  const label = permission.name || permission.codename;

  return label
    .replace(/^can\s+access\s+/i, "")
    .replace(/\s+page$/i, "")
    .trim();
};

export default function Roles() {
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
        console.log("Roles", response.data);
        if (!active) return;
        setRoles(response.data);
      })
      .catch((error) => {
        console.error("Failed to load roles", error);
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
        console.log("permissions", response.data);
        if (!active) return;
        setPermissions(response.data);
      })
      .catch((error) => {
        console.error("Failed to load permissions", error);
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
    (roleId: number, permissionId: number, checked: boolean) => {
      setRoles((previousRoles) =>
        previousRoles.map((role) => {
          if (role.id !== roleId) {
            return role;
          }

          let updatedPermissions: number[];

          if (checked) {
            updatedPermissions = [
              ...new Set([...role.permissions, permissionId]),
            ];
          } else {
            updatedPermissions = role.permissions.filter(
              (id) => id !== permissionId,
            );
          }

          return {
            ...role,
            permissions: updatedPermissions,
          };
        }),
      );
    },
    [],
  );

  // ========================================================
  // SELECT / UNSELECT ALL PERMISSIONS FOR ONE ROLE
  // ========================================================

  const handleSelectAllForRole = useCallback(
    (roleId: number, checked: boolean) => {
      const visiblePermissionIds = permissions.map(
        (permission) => permission.id,
      );

      setRoles((previousRoles) =>
        previousRoles.map((role) => {
          if (role.id !== roleId) {
            return role;
          }

          const hiddenPermissions = role.permissions.filter(
            (permissionId) => !visiblePermissionIds.includes(permissionId),
          );

          return {
            ...role,
            permissions: checked
              ? [...hiddenPermissions, ...visiblePermissionIds]
              : hiddenPermissions,
          };
        }),
      );
    },
    [permissions],
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
        width: { xs: 20, sm: 50 },
        render: (_row, index) => index + 1,
        numeric: true,
      },
      {
        label: "",
        width: { xs: 80, sm: 80 },
        render: (row) => (
          <Box sx={inlineCenterGapSx}>
            {/* edit btn */}
            <Tooltip title="Edit role">
              <IconButton
                aria-label={`Edit ${row.id}`}
                onClick={() => openEdit(row)}
              >
                <EditOutlinedIcon sx={editIconSx} />
              </IconButton>
            </Tooltip>
            {/* delete btn */}
            <Tooltip title="Delete role">
              <IconButton
                aria-label={`Delete ${row.id}`}
                onClick={() => openDelete(row)}
              >
                <DeleteOutlinedIcon sx={deleteIconSx} />
              </IconButton>
            </Tooltip>
            {/* <Typography variant="body2">{row.name}</Typography> */}
          </Box>
        ),
      },
      { label: "Name", dataKey: "name", width: 'auto' },
      { label: "Description", dataKey: "description", width: 'auto' },
    ],
    [openEdit, openDelete],
  );

  const permissionColumns = useMemo<ColumnData<rolesData>[]>(() => {
    const roleColumn: ColumnData<rolesData> = {
      label: "Roles",
      width: 180,

      render: (row) => {
        const visiblePermissionIds = permissions.map(
          (permission) => permission.id,
        );
        const selectedVisibleCount = visiblePermissionIds.filter(
          (permissionId) => row.permissions.includes(permissionId),
        ).length;
        const allSelected =
          visiblePermissionIds.length > 0 &&
          selectedVisibleCount === visiblePermissionIds.length;

        return (
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={selectedVisibleCount > 0 && !allSelected}
                onChange={(event) =>
                  handleSelectAllForRole(row.id, event.target.checked)
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
        label: formatPermissionLabel(permission),
        width: 125,

        render: (row) => (
          <Checkbox
            size="small"
            checked={row.permissions.includes(permission.id)}
            onChange={(event) =>
              handlePermissionChange(
                row.id,
                permission.id,
                event.target.checked,
              )
            }
          />
        ),
      }),
    );

    return [roleColumn, ...permissionColumns];
  }, [permissions, handleSelectAllForRole, handlePermissionChange]);

  return (
    <Box sx={page}>
      <Box component="main" sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Typography variant="h5" sx={pageTitle}>
              {tabValue === 0 ? "Roles List" : "Permissions List"}
            </Typography>
            <Typography variant="body2" sx={pageSubtitle}>
              {tabValue === 0
                ? "Manage roles, permissions, and access"
                : "Manage permissions and access page"}
            </Typography>
          </Box>
          <Stack
            direction={{ xs: "row-reverse", sm: "row" }}
            spacing={1}
            sx={pageHeaderActions}
          >
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              {tabValue === 0 && (
                <Button
                  startIcon={<AddOutlinedIcon />}
                  variant="contained"
                  onClick={openCreate}
                >
                  <Box component="span" sx={buttonLabelFull}>New Role</Box>
                  <Box component="span" sx={buttonLabelCompact}>New</Box>
                </Button>
              )}
              {tabValue === 1 && (
                <Button
                  variant="contained"
                  startIcon={<SaveOutlinedIcon />}
                  onClick={handleSave}
                  disabled={saving}
              >
                  {saving ? "Saving..." : (
                    <>
                      <Box component="span" sx={buttonLabelFull}>Save Changes</Box>
                      <Box component="span" sx={buttonLabelCompact}>Save</Box>
                    </>
                  )}
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>

        <Box sx={tabsContainer}>
          <Tabs
            value={tabValue}
            onChange={(_, value: number) => {
              setTabValue(value);
              // setSelectedUser("");
            }}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={tabs}
          >
            <Tab label="Roles" />
            <Tab label="Permissions" />
          </Tabs>
        </Box>
        {tabValue === 0 && (
          <>
            <Box sx={tablePageContent}>
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
              description={
                deleteRow
                  ? `Are you sure you want to delete the role "${deleteRow.name}"?`
                  : "Are you sure you want to delete this role?"
              }
              confirmLabel="Delete"
              confirmColor="error"
              confirmIcon={<DeleteOutlinedIcon />}
              tone="error"
            />
          </>
        )}
        {tabValue === 1 && (
          <>
            <Box sx={tablePageContent}>
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
