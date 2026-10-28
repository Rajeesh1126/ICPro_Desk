import { useCallback, useMemo, useState } from "react";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import type { UsersData, groupData } from "@/types/dataTypes";

import UserCreateModal from "@/components/users/UserCreateModal";
import GroupCreateModal from "@/components/users/GroupCreateModal";

import {
  buttonLabelCompact,
  buttonLabelFull,
  editIconSx,
  inlineCenterGapSx,
  page,
  pageContent,
  tabs,
  tabsContainer,
  tablePageContent,
  toggleButton,
} from "@/styles/common";
import api from "@/api/axios";
import { asArray, useApiQuery } from "@/api/useApiQuery";
import { queryClient } from "@/api/queryClient";
import {
  VirtualizedTable,
  type ColumnData,
} from "@/components/common/TableView";
import { CollapsibleTableView } from "@/components/common/CollapsibleTableView";
import { showNotification } from "@/api/notificationService";
import { getStoredPermissions } from "@/utils/permissions";
import { StatusPill } from "@/components/common/StatusPill";
import PageHeader from "@/components/common/PageHeader";

export default function Users() {
  const permissions = getStoredPermissions();
  const canAddUser = permissions.has("add_user");
  const canChangeUser = permissions.has("change_user");
  const canAddDepartmentManager = permissions.has("add_departmentmanager");
  const canChangeDepartmentManager = permissions.has("change_departmentmanager");
  const [savingGroupId, setSavingGroupId] = useState<number | null>(null);
  const [userStatusFilter, setUserStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedRow, setSelectedRow] = useState<UsersData | null>(null);

  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [groupEditing, setGroupEditing] = useState(false);
  const [selectedGroupRow, setSelectedGroupRow] = useState<groupData | null>(
    null,
  );

  const [tabValue, setTabValue] = useState(0);

  // Users and teams load independently, so each tab renders as soon as its
  // own data arrives. Both are cached reference data shared with the
  // dialogs and other pages that use the same endpoints.
  const usersQuery = useApiQuery<UsersData[]>("/users/");
  const groupsQuery = useApiQuery<groupData[]>("/departments/");
  const users = useMemo(() => asArray<UsersData>(usersQuery.data), [usersQuery.data]);
  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        userStatusFilter === "all"
          ? true
          : userStatusFilter === "active"
            ? user.is_active === true
            : user.is_active === false,
      ),
    [userStatusFilter, users],
  );
  const groups = useMemo(() => asArray<groupData>(groupsQuery.data), [groupsQuery.data]);
  const usersLoading = usersQuery.isPending;
  const groupsLoading = groupsQuery.isPending;

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

        const manager =
          managerId === null
            ? null
            : users.find((user) => user.id === managerId);
        const managerName = manager
          ? `${manager.first_name ?? ""} ${manager.last_name ?? ""}`.trim() ||
            manager.username
          : "";

        // Show the new manager immediately; the background refresh confirms it.
        queryClient.setQueryData<groupData[]>(["/departments/"], (currentGroups = []) =>
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
          message: managerId
            ? "Manager assigned successfully."
            : "Manager removed successfully.",
        });
      } catch {
        // The shared request error UI handles failures.
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
  }, []);

  const closeGroupDialog = useCallback(() => {
    setGroupDialogOpen(false);
    setGroupEditing(false);
    setSelectedGroupRow(null);
  }, []);

  const columns = useMemo<ColumnData<UsersData>[]>(
    () => [
      {
        label: "User",
        dataKey: "username",
        width: 220,
        render: (row) => {
          const name = `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim();
          return <Stack spacing={0.25}><Typography variant="body2" fontWeight={600}>{name || row.username || "Unnamed user"}</Typography><Typography variant="caption" color="text.secondary">{row.username}</Typography></Stack>;
        },
        searchValue: (row) => `${row.first_name ?? ""} ${row.last_name ?? ""} ${row.username ?? ""}`,
      },
      { label: "First Name", dataKey: "first_name" },
      { label: "Last Name", dataKey: "last_name" },
      { label: "Email", dataKey: "email", width: 200 },
      { label: "Role", dataKey: "role", width: 150, render: (row) => row.role ? <Chip label={row.role} variant="outlined" /> : "—" },
      {
        label: "Status",
        width: 100,
        render: (row) => (
          <StatusPill status={row.is_active === false ? "inactive" : "active"} label={row.is_active === false ? "Inactive" : "Active"} />
        ),
      },
      { label: "Execution Teams", dataKey: "groups", render: (row) => <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" title={row.groups?.join(", ")}>{(row.groups ?? []).slice(0, 2).map((group) => <Chip key={group} label={group} variant="outlined" />)}{(row.groups?.length ?? 0) > 2 && <Chip label={`+${row.groups!.length - 2}`} />}{!row.groups?.length ? "—" : null}</Stack> },
      { label: "Designation", dataKey: "designation" },
      { label: "Reporting To", dataKey: "reporting_to" },
      { label: "Location", dataKey: "location" },
      ...(canChangeUser
        ? [
            {
              label: "Actions",
              width: 40,
              render: (row: UsersData) => (
                <Tooltip title="Edit user">
                  <IconButton
                    aria-label={`Edit ${row.username || row.id}`}
                    onClick={() => openEdit(row)}
                  >
                    <EditOutlinedIcon fontSize="small" sx={editIconSx} />
                  </IconButton>
                </Tooltip>
              ),
            },
          ]
        : []),
    ],
    [canChangeUser, openEdit],
  );

  const columnsGroup = useMemo<ColumnData<groupData>[]>(
    () => [
      {
        label: "Name",
        width: "auto",
        render: (row) => (
          <Box sx={inlineCenterGapSx}>
            {canChangeDepartmentManager && (
              <Tooltip title="Edit team">
                <IconButton
                  aria-label={`Edit ${row.name || row.id}`}
                  onClick={() => openEditGroup(row)}
                >
                  <EditOutlinedIcon fontSize="small" sx={editIconSx} />
                </IconButton>
              </Tooltip>
            )}
            <Typography variant="body2">{row.name}</Typography>
          </Box>
        ),
      },
      {
        label: "Manager",
        width: "auto",
        render: (row) => (
          <Select
            fullWidth
            displayEmpty
            disabled={!canChangeDepartmentManager || savingGroupId === row.id}
            value={row.manager?.id === undefined ? "" : String(row.manager.id)}
            onChange={(event) =>
              void updateGroupManager(
                row,
                event.target.value === "" ? null : Number(event.target.value),
              )
            }
          >
            <MenuItem value="">
              <em>Select Manager</em>
            </MenuItem>

            {users.map((user) => (
              <MenuItem key={user.id} value={String(user.id)}>
                {`${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
                  user.username}
              </MenuItem>
            ))}
          </Select>
        ),
      },
    ],
    [canChangeDepartmentManager, openEditGroup, savingGroupId, updateGroupManager, users],
  );
  const primaryUserColumns = useMemo(
    () =>
      columns.filter((column) =>
        ["User", "Email", "Role", "Status", "Actions"].includes(
          column.label,
        ),
      ),
    [columns],
  );
  const detailUserColumns = useMemo(
    () =>
      columns.filter((column) =>
        [
          "First Name",
          "Last Name",
          "Execution Teams",
          "Designation",
          "Reporting To",
          "Location",
        ].includes(column.label),
      ),
    [columns],
  );

  return (
    <Box sx={page}>
      <Box sx={pageContent}>
        <PageHeader
          title="Users"
          subtitle={
            tabValue === 0
              ? "Manage user accounts, profiles, access, and assignments"
              : "Manage teams and their managers"
          }
          actions={[
            tabValue === 0 && {
              key: "status",
              priority: "medium",
              node: (
                <ToggleButtonGroup
                  exclusive
                  value={userStatusFilter}
                  onChange={(_, value: "all" | "active" | "inactive" | null) => {
                    if (value) setUserStatusFilter(value);
                  }}
                  aria-label="Filter users by status"
                  sx={toggleButton}
                >
                  <ToggleButton value="all">All</ToggleButton>
                  <ToggleButton value="active">Active</ToggleButton>
                  <ToggleButton value="inactive">Inactive</ToggleButton>
                </ToggleButtonGroup>
              ),
              menuLabel: "Status",
              menuItems: (["all", "active", "inactive"] as const).map((status) => ({
                key: status,
                label: status === "all" ? "All" : status === "active" ? "Active" : "Inactive",
                onClick: () => setUserStatusFilter(status),
                selected: userStatusFilter === status,
              })),
            },
            tabValue === 0 && canAddUser && {
              key: "new-user",
              priority: "high",
              node: (
                <Button
                  startIcon={<AddOutlinedIcon />}
                  variant="contained"
                  onClick={openCreate}
                >
                  <Box component="span" sx={buttonLabelFull}>
                    New User
                  </Box>
                  <Box component="span" sx={buttonLabelCompact}>
                    New
                  </Box>
                </Button>
              ),
            },
            tabValue === 1 && canAddDepartmentManager && {
              key: "new-team",
              priority: "high",
              node: (
                <Button
                  startIcon={<AddOutlinedIcon />}
                  variant="contained"
                  onClick={openCreateGroup}
                >
                  <Box component="span" sx={buttonLabelFull}>
                    New Team
                  </Box>
                  <Box component="span" sx={buttonLabelCompact}>
                    New
                  </Box>
                </Button>
              ),
            },
          ]}
        />

        <Box sx={tabsContainer}>
          <Tabs
            value={tabValue}
            onChange={(_, value: number) => {
              setTabValue(value);
            }}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={tabs}
          >
            <Tab
              icon={
                tabValue === 0
                  ? <PersonIcon fontSize="small" />
                  : <PersonOutlineOutlinedIcon fontSize="small" />
              }
              iconPosition="start"
              label={usersLoading ? "Users" : `Users (${users.length})`}
            />
            <Tab
              icon={
                tabValue === 1
                  ? <GroupsIcon fontSize="small" />
                  : <GroupsOutlinedIcon fontSize="small" />
              }
              iconPosition="start"
              label={groupsLoading ? "Teams" : `Teams (${groups.length})`}
            />
          </Tabs>
        </Box>
        {tabValue === 0 && (
          <Box sx={tablePageContent}>
            <CollapsibleTableView
              columns={primaryUserColumns}
              expandedColumns={detailUserColumns}
              rows={filteredUsers}
              getRowId={(row) => row.id}
              height="100%"
              tableMinWidth={760}
              tableHead="Users"
              tableHeadSub="User accounts, roles and team assignments · Expand a row to view profile details"
              loading={usersLoading}
              emptyTitle="No users yet"
              emptyDescription="Create a user to give someone access to ICProDesk."
            />
          </Box>
        )}
        {tabValue === 1 && (
          <Box sx={tablePageContent}>
            <VirtualizedTable
              columns={columnsGroup}
              rows={groups}
              height="100%"
              tableHead="Teams"
              tableHeadSub="Teams and their managers"
              loading={groupsLoading}
              emptyTitle="No teams yet"
              emptyDescription="Create a team and assign a manager."
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
