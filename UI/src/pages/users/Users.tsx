import { useCallback, useMemo, useState } from "react";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import {
  Box,
  Button,
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

import type { UsersData, groupData } from "../../types/dataTypes";

import UserCreateModal from "../../components/users/UserCreateModal";
import GroupCreateModal from "../../components/users/GroupCreateModal";

import {
  buttonLabelCompact,
  buttonLabelFull,
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
  toggleButton,
} from "../../styles/common";
import api from "../../api/axios";
import { asArray, useApiQuery } from "../../api/useApiQuery";
import { queryClient } from "../../api/queryClient";
import {
  VirtualizedTable,
  type ColumnData,
} from "../../components/common/TableView";
import { CollapsibleTableView } from "../../components/common/CollapsibleTableView";
import { showNotification } from "../../api/notificationService";

export default function Users() {
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
        label: "#",
        width: { xs: 10, sm: 40 },
        render: (_row, index) => index + 1,
        numeric: true,
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
                <EditOutlinedIcon fontSize="small" sx={editIconSx} />
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
      { label: "Execution Teams", dataKey: "groups" },
      { label: "Designation", dataKey: "designation" },
      { label: "Reporting To", dataKey: "reporting_to" },
      { label: "Location", dataKey: "location" },
    ],
    [openEdit],
  );

  const columnsGroup = useMemo<ColumnData<groupData>[]>(
    () => [
      {
        label: "#",
        width: { xs: 40, sm: 40 },
        render: (_row, index) => index + 1,
        numeric: true,
      },
      {
        label: "Name",
        width: "auto",
        render: (row) => (
          <Box sx={inlineCenterGapSx}>
            <Tooltip title="Edit team">
              <IconButton
                aria-label={`Edit ${row.name || row.id}`}
                size="small"
                onClick={() => openEditGroup(row)}
              >
                <EditOutlinedIcon fontSize="small" sx={editIconSx} />
              </IconButton>
            </Tooltip>
            <Typography variant="body2">{row.name}</Typography>
          </Box>
        ),
      },
      {
        label: "Manager",
        width: "auto",
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
    [openEditGroup, savingGroupId, updateGroupManager, users],
  );
  const primaryUserColumns = useMemo(
    () =>
      columns.filter((column) =>
        ["#", "Employee ID", "First Name", "Email", "Role"].includes(
          column.label,
        ),
      ),
    [columns],
  );
  const detailUserColumns = useMemo(
    () =>
      columns.filter((column) =>
        [
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
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Typography variant="h5" component="h1" sx={pageTitle}>
              {tabValue === 0 ? "User Management" : "Team Management"}
            </Typography>
            <Typography variant="body2" sx={pageSubtitle}>
              {tabValue === 0
                ? "Manage user accounts, profiles, access, and assignments"
                : "Manage teams and their managers"}
            </Typography>
          </Box>
          <Stack
            direction={{ xs: "row-reverse", sm: "row" }}
            spacing={1}
            sx={pageHeaderActions}
          >
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              {tabValue === 0 ? (
                <>
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
                    <ToggleButton value="inactive">In-Active</ToggleButton>
                  </ToggleButtonGroup>
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
                </>
              ) : null}
              {tabValue === 1 ? (
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
              ) : null}
            </Stack>
          </Stack>
        </Box>

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
              tableHeadSub="User accounts, roles and team assignments"
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
