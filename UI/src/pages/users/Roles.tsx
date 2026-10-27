import { useCallback, useMemo, useState } from "react";
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
  Chip,
  MenuItem,
  FormControlLabel,
  InputAdornment,
  TextField,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import KeyIcon from "@mui/icons-material/Key";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import type { rolesData, permissionData } from "@/types/dataTypes";
import {
  buttonLabelCompact,
  buttonLabelFull,
  deleteIconSx,
  rowDeleteButtonSx,
  page,
  pageContent,
  tabs,
  tabsContainer,
  tablePageContent,
  flexColumnSx,
  rolesFilterBarSx,
  rolesFilterLabelSx,
  rolesMobileActionBarSx,
  rolesSearchFieldSx,
  rolesSelectFieldSx,
  smUpBlockSx,
} from "@/styles/common";
import ActionDivider from "@/components/common/ActionDivider";
import api from "@/api/axios";
import { asArray, useApiQuery } from "@/api/useApiQuery";
import { queryClient } from "@/api/queryClient";
import {
  VirtualizedTable,
  type ColumnData,
} from "@/components/common/TableView";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RoleModel from "@/components/roles/RoleModel";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { showNotification } from "@/api/notificationService";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { getStoredPermissions } from "@/utils/permissions";
import PageHeader from "@/components/common/PageHeader";

const formatPermissionLabel = (permission: permissionData) => {
  const label = permission.name || permission.codename;

  return label
    .replace(/^can\s+access\s+/i, "")
    .replace(/\s+page$/i, "")
    .trim();
};

export default function Roles() {
  const storedPermissions = getStoredPermissions();
  const canAddRole = storedPermissions.has("add_role");
  const canChangeRole = storedPermissions.has("change_role");
  const canDeleteRole = storedPermissions.has("delete_role");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedRow, setSelectedRow] = useState<rolesData | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState<rolesData | null>(null);
  const [saving, setSaving] = useState(false);
  const [permissionQuery, setPermissionQuery] = useState("");
  const [permissionGroup, setPermissionGroup] = useState("all");

  // Roles and permissions load independently and are cached. The server copy
  // (`savedRoles`) lives in the query cache; checkbox edits go into a local
  // draft, so a background refresh never overwrites unsaved changes.
  const rolesQuery = useApiQuery<rolesData[]>("/roles/");
  const permissionsQuery = useApiQuery<permissionData[]>("/permissions/");
  const savedRoles = useMemo(
    () => asArray<rolesData>(rolesQuery.data),
    [rolesQuery.data],
  );
  const permissions = useMemo(
    () => asArray<permissionData>(permissionsQuery.data),
    [permissionsQuery.data],
  );
  const rolesLoading = rolesQuery.isPending;
  const [draftRoles, setDraftRoles] = useState<rolesData[] | null>(null);
  const roles = draftRoles ?? savedRoles;
  const setRoles = useCallback(
    (update: (current: rolesData[]) => rolesData[]) =>
      setDraftRoles((current) => update(current ?? savedRoles)),
    [savedRoles],
  );

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
  }, []);

  const openDelete = useCallback((row: rolesData) => {
    setDeleteRow(row);
    setDeleteDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteRow) return;
    try {
      await api.delete(`/roles/${deleteRow.id}/`);
      setDeleteDialogOpen(false);
      setDeleteRow(null);
      showNotification({
        type: "success",
        message: "Roles deleted successfully.",
      });
    } catch {
      // The shared request error UI handles failures.
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
    [setRoles],
  );

  // ========================================================
  // SELECT / UNSELECT ALL PERMISSIONS FOR ONE ROLE
  // ========================================================

  const visiblePermissions = useMemo(() => {
    const query = permissionQuery.trim().toLowerCase();
    return permissions.filter((permission) => {
      const normalizedCode = permission.codename.replace(
        /^(add|change|delete|view|can_access)_/i,
        "",
      );
      const group = normalizedCode.split("_")[0] || "other";
      return (
        (permissionGroup === "all" || group === permissionGroup) &&
        (!query ||
          `${formatPermissionLabel(permission)} ${permission.codename}`
            .toLowerCase()
            .includes(query))
      );
    });
  }, [permissions, permissionQuery, permissionGroup]);
  const permissionGroups = useMemo(
    () =>
      [
        ...new Set(
          permissions.map(
            (permission) =>
              permission.codename
                .replace(/^(add|change|delete|view|can_access)_/i, "")
                .split("_")[0] || "other",
          ),
        ),
      ].sort(),
    [permissions],
  );

  /** Roles whose permission set differs from the last saved state. */
  const changedRoles = useMemo(() => {
    const savedById = new Map(savedRoles.map((role) => [role.id, role]));
    return roles.filter((role) => {
      const saved = savedById.get(role.id);
      if (!saved) return true;
      const current = new Set(role.permissions);
      return (
        current.size !== new Set(saved.permissions).size ||
        saved.permissions.some((id) => !current.has(id))
      );
    });
  }, [roles, savedRoles]);

  const handleSelectAllForRole = useCallback(
    (roleId: number, checked: boolean) => {
      const visiblePermissionIds = visiblePermissions.map(
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
    [setRoles, visiblePermissions],
  );

  const handleSave = async () => {
    if (!changedRoles.length) return;
    try {
      setSaving(true);

      for (const role of changedRoles) {
        await api.patch(`/roles/${role.id}/`, {
          permissions: role.permissions,
        });
      }
      // Commit the draft to the cache so the grid doesn't flash old values
      // before the background refresh returns.
      queryClient.setQueryData(["/roles/"], roles);
      setDraftRoles(null);
      showNotification({
        type: "success",
        message: `Permissions saved for ${changedRoles.length} role${changedRoles.length === 1 ? "" : "s"}.`,
      });
    } catch {
      // The shared request error UI handles failures.
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo<ColumnData<rolesData>[]>(
    () => [
      { label: "Name", dataKey: "name", width: "auto" },
      { label: "Description", dataKey: "description", width: "auto" },
      {
        label: "Actions",
        width: 90,
        render: (row) => {
          // System role: deleting it would lock everyone out of administration.
          const isSystemRole = row.name?.trim().toLowerCase() === "superadmin";
          return (
            <Stack direction="row" spacing={0.5}>
              {canChangeRole && (
                <Tooltip title="Edit role">
                  <IconButton
                    aria-label={`Edit ${row.name || row.id}`}
                    color="primary"
                    onClick={() => openEdit(row)}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              <ActionDivider />

              {canDeleteRole && (
                <Tooltip
                  title={
                    isSystemRole
                      ? "The SuperAdmin role cannot be deleted"
                      : "Delete role"
                  }
                >
                  <span>
                    <IconButton
                      sx={rowDeleteButtonSx}
                      aria-label={`Delete ${row.name || row.id}`}
                      onClick={() => openDelete(row)}
                      disabled={isSystemRole}
                    >
                      <DeleteOutlinedIcon fontSize="small" sx={deleteIconSx} />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Stack>
          );
        },
      },
    ],
    [canChangeRole, canDeleteRole, openEdit, openDelete],
  );

  const permissionColumns = useMemo<ColumnData<rolesData>[]>(() => {
    const roleColumn: ColumnData<rolesData> = {
      label: "Roles",
      width: { xs: 180, sm: 200 },
      render: (row) => {
        const visiblePermissionIds = visiblePermissions.map(
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
                color="warning"
                slotProps={{
                  input: {
                    "aria-label": `Grant all ${permissionQuery ? "filtered " : ""}permissions to ${row.name}`,
                  },
                }}
                checked={allSelected}
                indeterminate={selectedVisibleCount > 0 && !allSelected}
                onChange={(event) =>
                  handleSelectAllForRole(row.id, event.target.checked)
                }
              />
            }
            label={
              <Box
                component="span"
                sx={flexColumnSx}
              >
                <span>{row.name}</span>
                <Typography
                  component="span"
                  variant="caption"
                  color="warning.dark"
                >
                  Grant all visible ·{" "}
                  {
                    permissions.filter((permission) =>
                      row.permissions.includes(permission.id),
                    ).length
                  }{" "}
                  of {permissions.length} granted
                </Typography>
              </Box>
            }
          />
        );
      },
    };

    const permissionColumns = visiblePermissions.map(
      (permission): ColumnData<rolesData> => ({
        label: formatPermissionLabel(permission),
        // Wide enough for the longest single word ("CONFIGURATION") once the
        // header wraps.
        width: 120,
        render: (row) => (
          <Checkbox
            slotProps={{
              input: {
                "aria-label": `${formatPermissionLabel(permission)} for ${row.name}`,
              },
            }}
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
  }, [
    permissions,
    visiblePermissions,
    permissionQuery,
    handleSelectAllForRole,
    handlePermissionChange,
  ]);

  const saveButton = (
    <Button
      variant="contained"
      startIcon={<SaveOutlinedIcon />}
      onClick={handleSave}
      disabled={saving || changedRoles.length === 0}
    >
      {saving ? (
        "Saving..."
      ) : (
        <>
          <Box component="span" sx={buttonLabelFull}>
            {changedRoles.length === 0
              ? "No changes"
              : `Save ${changedRoles.length} ${changedRoles.length === 1 ? "role" : "roles"}`}
          </Box>
          <Box component="span" sx={buttonLabelCompact}>
            Save
          </Box>
        </>
      )}
    </Button>
  );

  return (
    <Box sx={page}>
      <Box sx={pageContent}>
        <PageHeader
          title="Roles & Permissions"
          subtitle={
            tabValue === 0
              ? "Manage roles, permissions, and access"
              : "Manage permissions and access page"
          }
          actions={[
            tabValue === 0 && canAddRole && {
              key: "new",
              priority: "high",
              node: (
                <Button
                  startIcon={<AddOutlinedIcon />}
                  variant="contained"
                  onClick={openCreate}
                >
                  <Box component="span" sx={buttonLabelFull}>
                    New Role
                  </Box>
                  <Box component="span" sx={buttonLabelCompact}>
                    New
                  </Box>
                </Button>
              ),
            },
            // Phones save from the bar under the permissions table instead.
            tabValue === 1 && {
              key: "save",
              priority: "high",
              node: <Box sx={smUpBlockSx}>{saveButton}</Box>,
            },
          ]}
        />

        <Box sx={tabsContainer}>
          <Tabs
            value={tabValue}
            onChange={(_, value: number) => setTabValue(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={tabs}
          >
            <Tab
              icon={
                tabValue === 0 ? (
                  <AdminPanelSettingsIcon />
                ) : (
                  <AdminPanelSettingsOutlinedIcon />
                )
              }
              iconPosition="start"
              label="Roles"
            />
            <Tab
              icon={tabValue === 1 ? <KeyIcon /> : <KeyOutlinedIcon />}
              iconPosition="start"
              label="Permissions"
            />
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
                loading={rolesLoading}
                emptyTitle="No roles yet"
                emptyDescription="Create a role to start assigning permissions."
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
            />
          </>
        )}
        {tabValue === 1 && (
          <>
            <Box sx={tablePageContent}>
              <Box
                sx={rolesFilterBarSx}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1.5}
                  alignItems={{ md: "center" }}
                >
                  <Box sx={rolesFilterLabelSx}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Find permissions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Filter permission columns; use “Find roles” above the
                      matrix to search roles.
                    </Typography>
                  </Box>
                  <TextField
                    label="Find permissions"
                    placeholder="e.g. approve timesheet"
                    size="small"
                    value={permissionQuery}
                    onChange={(event) => setPermissionQuery(event.target.value)}
                    sx={rolesSearchFieldSx}
                    slotProps={{
                      htmlInput: {
                        "aria-label": "Find permission columns by name",
                      },
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchOutlinedIcon
                              fontSize="small"
                              color="action"
                            />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <TextField
                    select
                    size="small"
                    label="Permission group"
                    value={permissionGroup}
                    onChange={(event) => setPermissionGroup(event.target.value)}
                    sx={rolesSelectFieldSx}
                  >
                    <MenuItem value="all">All groups</MenuItem>
                    {permissionGroups.map((group) => (
                      <MenuItem key={group} value={group}>
                        {group.replace(/\b\w/g, (letter) =>
                          letter.toUpperCase(),
                        )}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    role="status"
                  >
                    {visiblePermissions.length} of {permissions.length} columns
                    shown
                  </Typography>
                  {changedRoles.length > 0 && (
                    <Chip
                      color="warning"
                      variant="outlined"
                      title={changedRoles.map((role) => role.name).join(", ")}
                      label={`Unsaved changes in ${changedRoles.length} role${changedRoles.length === 1 ? "" : "s"}`}
                    />
                  )}
                </Stack>
              </Box>

              <VirtualizedTable
                columns={permissionColumns}
                rows={roles}
                height="100%"
                tableHead="Role Permissions"
                tableHeadSub="Find roles to focus the matrix. Grant all affects every visible permission in that row."
                searchPlaceholder="Find roles"
                searchLabel="Search role rows"
                stickyFirstColumn
                loading={rolesLoading}
              />
            </Box>
            <Box
              sx={rolesMobileActionBarSx}
            >
              {saveButton}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
