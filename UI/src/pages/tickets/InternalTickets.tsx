import { useCallback, useMemo, useState } from "react";
import { isOverdueTicket } from "@/utils/ticketDue";
import {
  Box,
  Button,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CancelIcon from "@mui/icons-material/Cancel";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
// import UndoIcon from "@mui/icons-material/Undo";
// import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
// import TaskAltIcon from "@mui/icons-material/TaskAlt";
// import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { VirtualizedTable } from "@/components/common/TableView";
import {
  DEFAULT_HIDDEN_TICKET_COLUMNS,
  OPTIONAL_TICKET_COLUMNS,
  useTicketTableColumns,
} from "@/components/tickets/ticketTableColumns";
import CreateTicketModal from "@/components/tickets/CreateModal";
import TicketDetailModal from "@/components/tickets/DetailModal";
import TicketCardView from "@/components/common/CardView";
import {
  ColumnPicker,
  TicketCalendar,
  type PageView,
} from "@/components/common/TicketPageParts";

const WORK_LET_VIEWS: readonly PageView[] = ["table", "card", "calendar"];
import PageNotice from "@/components/common/PageNotice";
import TableLoadingState from "@/components/common/TableLoadingState";
import type {
  groupData,
  TicketData,
  UserSummary,
} from "@/types/dataTypes";
import { asArray, useApiQuery } from "@/api/useApiQuery";
import { buildTicketCollections } from "@/pages/tickets/ticketCollections";
import { useSessionState, WORK_ITEM_VIEW_SESSION_KEY } from "@/utils/useSessionState";
import {
  buttonLabelCompact,
  buttonLabelFull,
  page,
  pageContent,
  priorityAlarmRowHighlight,
  priorityDueRowHighlight,
  tabs,
  tabsContainer,
  tablePageContent,
  viewEnterSx,
  workLetEmptyIconSx,
  workLetEmptySx,
  workLetEmptyTextSx,
} from "@/styles/common";
import PageHeader from "@/components/common/PageHeader";
import { viewToggleAction } from "@/components/common/headerActions";

type CurrentUserGroupsResponse = {
  departments?: groupData[];
  managed_departments?: groupData[];
  reportees?: UserSummary[];
  can_create_internal_ticket?: boolean;
};


function loggedUser(): number | null {
  const value = localStorage.getItem("user");
  const id = value ? Number(value) : NaN;

  return Number.isInteger(id) ? id : null;
}

export default function InternalTickets() {
  const userId = useMemo(() => loggedUser(), []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createTargetDate, setCreateTargetDate] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TicketData | null>(null);
  const [view, setView] = useSessionState<PageView>(
    WORK_ITEM_VIEW_SESSION_KEY,
    "card",
    (value): value is PageView => WORK_LET_VIEWS.includes(value as PageView),
  );
  const [tabValue, setTabValue] = useState(0);
  // List-only tabs are unavailable on the board; remember where the user was.
  const [tableTabBeforeBoard, setTableTabBeforeBoard] = useState<number | null>(null);
  // Reference data, cached and shared with other pages using the same endpoint.
  const groupsQuery = useApiQuery<CurrentUserGroupsResponse>(
    "/users/currentUserGroups/",
  );
  const { departments, reportees, canCreateInternalTicket } = useMemo(() => {
    const data = groupsQuery.data;
    const managed = asArray<groupData>(data?.managed_departments);
    return {
      departments: managed.length ? managed : asArray<groupData>(data?.departments),
      reportees: asArray<UserSummary>(data?.reportees),
      canCreateInternalTicket: Boolean(data?.can_create_internal_ticket),
    };
  }, [groupsQuery.data]);
  const createAccessChecked = !groupsQuery.isPending;

  // One cached response feeds every tab, so tab switches are instant and a
  // return visit renders immediately while refreshing in the background.
  const ticketsQuery = useApiQuery<TicketData[]>("/tickets/", {
    is_internal: true,
  });
  const tickets = useMemo(
    () => buildTicketCollections(ticketsQuery.data, userId),
    [ticketsQuery.data, userId],
  );
  const loading = ticketsQuery.isPending;

  const openCreate = useCallback(() => {
    setCreateTargetDate(null);
    setSelectedRow(null);
    setEditing(false);
    setDialogOpen(true);
  }, []);

  const openCreateForDate = useCallback((targetDate: string) => {
    setCreateTargetDate(targetDate);
    setSelectedRow(null);
    setEditing(false);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((ticket: TicketData) => {
    setSelectedRow(ticket);
    setEditing(true);
    setDialogOpen(true);
  }, []);

  const openDetails = useCallback((ticket: TicketData) => {
    setSelectedRow(ticket);
    setEditing(false);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setCreateTargetDate(null);
    setEditing(false);
    setSelectedRow(null);
  }, []);

  const columns = useTicketTableColumns({
    userId,
    onView: openDetails,
    onEdit: openEdit,
    withTeam: true,
    withActualHours: false,
  });
  const [hiddenColumnsValue, setHiddenColumnsValue] = useSessionState(
    "work-let:hidden-columns",
    DEFAULT_HIDDEN_TICKET_COLUMNS,
    (value): value is string => typeof value === "string",
  );
  const hiddenColumns = useMemo(
    () => hiddenColumnsValue.split(",").filter(Boolean),
    [hiddenColumnsValue],
  );

  const rowsForTab =
    [
      tickets.all,
      tickets.assigned,
      tickets.created,
      tickets.rejected,
      tickets.recalled,
      tickets.closed,
    ][tabValue] ?? tickets.all;
  const activeRows = rowsForTab;
  const canOpenCreate = canCreateInternalTicket && reportees.length > 0 && departments.length > 0;
  const changeView = (next: PageView) => {
    setView(next);
    if (next === "card" && tabValue > 2) {
      setTableTabBeforeBoard(tabValue);
      setTabValue(0);
    } else if (next !== "card" && tableTabBeforeBoard !== null) {
      setTabValue(tableTabBeforeBoard);
      setTableTabBeforeBoard(null);
    }
  };

  return (
    <Box sx={page}>
      <Box sx={pageContent}>
        <PageHeader
          title="Work Let"
          subtitle="Your team's internal tickets: raise them for immediate reportees and track them to completion."
          actions={[
            tabValue === 0 && {
              key: "new",
              priority: "high",
              node: (
                <Tooltip
                  title={
                    canOpenCreate
                      ? "Create internal ticket"
                      : "Internal tickets require a managed department and immediate reportees"
                  }
                >
                  <span>
                    <Button
                      startIcon={<AddOutlinedIcon />}
                      variant="contained"
                      onClick={openCreate}
                      disabled={!canOpenCreate}
                    >
                      <Box component="span" sx={buttonLabelFull}>New Internal Ticket</Box>
                      <Box component="span" sx={buttonLabelCompact}>New Ticket</Box>
                    </Button>
                  </span>
                </Tooltip>
              ),
            },
            viewToggleAction<PageView>(WORK_LET_VIEWS, view, changeView),
          ]}
        />

        <Box sx={tabsContainer}>
          <Tabs
            value={tabValue}
            onChange={(_, value: number) => {
              setTabValue(value);
              setTableTabBeforeBoard(null);
            }}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={tabs}
          >
            <Tab icon={tabValue === 0 ? <DashboardIcon /> : <DashboardOutlinedIcon />} iconPosition="start" label={`Overview (${tickets.all.length})`} />
            <Tab icon={tabValue === 1 ? <AssignmentIndIcon /> : <AssignmentIndOutlinedIcon />} iconPosition="start" label={`Assigned To Me (${tickets.assigned.length})`} />
            <Tab icon={tabValue === 2 ? <AssignmentIcon /> : <AssignmentOutlinedIcon />} iconPosition="start" label={`Assigned By Me (${tickets.created.length})`} />
            <Tab
              icon={tabValue === 3 ? <CancelIcon /> : <CancelOutlinedIcon />}
              iconPosition="start"
              label={`Rejected (${tickets.rejected.length})`}
              disabled={view === "card"}
            />
            {/* <Tab
              icon={tabValue === 4 ? <UndoIcon /> : <UndoOutlinedIcon />}
              iconPosition="start"
              label={`Recalled (${tickets.recalled.length})`}
              disabled={view === "card"}
            />
            <Tab
              icon={tabValue === 5 ? <TaskAltIcon /> : <TaskAltOutlinedIcon />}
              iconPosition="start"
              label={`Closed (${tickets.closed.length})`}
              disabled={view === "card"}
            /> */}
          </Tabs>
        </Box>
        {tabValue === 0 && tickets.all.length > 0 && createAccessChecked && !canOpenCreate && (
          <PageNotice>
            New internal tickets need a department you manage and at least one
            immediate reportee. Ask an administrator to update your team setup.
          </PageNotice>
        )}


        <Box key={view} sx={[tablePageContent, viewEnterSx]}>
          {view === "calendar" ? (
            <TicketCalendar
              tickets={activeRows}
              loading={loading}
              error={ticketsQuery.isError}
              onOpen={openDetails}
              onCreate={canOpenCreate ? openCreateForDate : undefined}
            />
          ) : tabValue === 0 && !loading && !ticketsQuery.isError && tickets.all.length === 0 ? (
            <Box role="status" sx={workLetEmptySx}>
              <InboxOutlinedIcon sx={workLetEmptyIconSx} />
              <Typography component="h2" variant="h6">No internal tickets yet</Typography>
              <Typography color="text.secondary" variant="body2" sx={workLetEmptyTextSx}>
                Internal tickets track work assigned to your immediate reportees. {createAccessChecked
                  ? canOpenCreate
                    ? "Create one to start tracking team work here."
                    : "To create one, you need a managed department and at least one immediate reportee. Ask an administrator to update your team setup."
                  : "Checking your team access…"}
              </Typography>
              {createAccessChecked && canOpenCreate && (
                <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={openCreate}>
                  Create internal ticket
                </Button>
              )}
            </Box>
          ) : view === "card" && loading ? (
            <TableLoadingState variant="cards" label="Loading tickets" />
          ) : view === "card" ? (
            <TicketCardView
              data={activeRows}
              onCardClick={openDetails}
              cardType="Ticket"
            />
          ) : (
            <VirtualizedTable
              columns={columns}
              rows={activeRows}
              height="100%"
              getRowSx={(row) =>
                row.alarm === true
                  ? priorityAlarmRowHighlight()
                  : isOverdueTicket(row)
                  ? priorityDueRowHighlight()
                  : undefined
              }
              tableHead="Internal tickets"
              loading={loading}
              emptyTitle="No tickets in this view"
              emptyDescription="Tickets you create or are assigned will appear here."
              hideSearch
              fitContent
              hiddenColumns={hiddenColumns}
              headerAction={
                <ColumnPicker
                  options={OPTIONAL_TICKET_COLUMNS.filter((label) => label !== "Act Hrs")}
                  hidden={hiddenColumns}
                  onChange={(next) => setHiddenColumnsValue(next.join(","))}
                />
              }
            />
          )}
        </Box>
      </Box>

      {!selectedRow && !editing && (
        <CreateTicketModal
          open={dialogOpen}
          handleClose={closeDialog}
          Data={null}
          initialTargetDate={createTargetDate}
          internalMode
          departmentsOverride={departments}
          assignableUsers={reportees}
        />
      )}
      {selectedRow && !editing && (
        <TicketDetailModal
          open={dialogOpen}
          onClose={closeDialog}
          data={selectedRow}
        />
      )}
      {selectedRow && editing && (
        <CreateTicketModal
          open={dialogOpen}
          handleClose={closeDialog}
          Data={selectedRow}
          internalMode
          departmentsOverride={departments}
          assignableUsers={reportees}
        />
      )}
    </Box>
  );
}
