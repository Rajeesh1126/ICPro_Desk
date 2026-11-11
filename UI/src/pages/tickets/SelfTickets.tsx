import { loggedUser } from "@/utils/currentUser";
import { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Tooltip,
} from "@mui/material";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import {
  VirtualizedTable,
  type ColumnData,
} from "@/components/common/TableView";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import CreateSelfTicketModel from "@/components/selfTickets/CreateModel";
import TicketCardView from "@/components/common/CardView";
import {
  RecordNumberCell,
  TicketCalendar,
  type PageView,
} from "@/components/common/TicketPageParts";
import TableLoadingState from "@/components/common/TableLoadingState";
import {
  getSelfTicketAlertReason,
  isSelfTicketOverdue,
  selfTicketDisplayDueDate,
  shouldBlinkSelfTicket,
} from "@/components/selfTickets/highlight";
import {
  expandOccurrences,
  scheduleAgendaMeta,
  sourceTask,
} from "@/components/selfTickets/schedule";
import { selfTicketListColumns } from "@/components/selfTickets/listColumns";
import { isSelfTicketEditDisabled, selfTicketEditDisabledReason } from "@/utils/ticketEdit";
import type {
  SelfTicketCollections,
  SelfTicketData,
  ReportingEmployees,
} from "@/types/dataTypes";
import api from "@/api/axios";
import { asArray, useApiQuery } from "@/api/useApiQuery";
import { useSessionState, WORK_ITEM_VIEW_SESSION_KEY } from "@/utils/useSessionState";
import SelfTicketDetailModel from "@/components/selfTickets/DetailModel";
import {
  filterField,
  headerFilterFieldSx,
  page,
  pageContent,
  priorityAlarmRowHighlight,
  priorityDueRowHighlight,
  tabs,
  tabsContainer,
  tablePageContent,
} from "@/styles/common";
import { ContentSwap } from "@/animations/MotionPrimitives";
import PageHeader from "@/components/common/PageHeader";
import { overdueFilterAction, overdueJumpAction, viewToggleAction } from "@/components/common/headerActions";

const DO_LIST_VIEWS: readonly PageView[] = ["calendar", "card", "table"];


export default function SelfTickets() {
  const userId = useMemo(() => loggedUser(), []);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [view, setView] = useSessionState<PageView>(
    WORK_ITEM_VIEW_SESSION_KEY,
    "calendar",
    (value): value is PageView => DO_LIST_VIEWS.includes(value as PageView),
  );
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [createTargetDate, setCreateTargetDate] = useState<string | null>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<SelfTicketData | null>(null);
  const [tabValue, setTabValue] = useSessionState(
    "do-list:tab",
    0,
    (value): value is number => value === 0 || value === 1,
  );
  const [acknowledgeTarget, setAcknowledgeTarget] =
    useState<SelfTicketData | null>(null);
  const [acknowledging, setAcknowledging] = useState<boolean>(false);

  // Cached Do List: both tabs come from one response, and a return visit
  // renders immediately while refreshing in the background.
  const ticketsQuery = useApiQuery<SelfTicketData[]>("/self-tickets/", {
    do_List: true,
  });
  const tickets = useMemo<SelfTicketCollections>(() => {
    const all = asArray<SelfTicketData>(ticketsQuery.data);
    return {
      self: all.filter((ticket) => ticket.creator === userId),
      others: all.filter((ticket) => ticket.creator !== userId),
      all,
    };
  }, [ticketsQuery.data, userId]);
  const loading = ticketsQuery.isPending;

  // Team list is reference data shared with Timesheet Logs (same cache entry).
  const teamsQuery = useApiQuery<ReportingEmployees[]>("/teams/");
  const users = useMemo(
    () => asArray<ReportingEmployees>(teamsQuery.data),
    [teamsQuery.data],
  );

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

  const openEdit = useCallback((ticket: SelfTicketData) => {
    setSelectedRow(ticket);
    setEditing(true);
    setDialogOpen(true);
  }, []);

  const openDetails = useCallback((ticket: SelfTicketData) => {
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

  const requestAcknowledgeAlarm = useCallback((ticket: SelfTicketData) => {
    setAcknowledgeTarget(ticket);
  }, []);

  const closeAcknowledgeDialog = useCallback(() => {
    if (acknowledging) return;
    setAcknowledgeTarget(null);
  }, [acknowledging]);

  const confirmAcknowledgeAlarm = useCallback(async () => {
    const ticket = acknowledgeTarget;
    if (!ticket?.id) return;

    setAcknowledging(true);
    try {
      await api.post(`/self-tickets/${ticket.id}/acknowledge-alarm/`);
      setAcknowledgeTarget(null);
    } catch {
      // The shared request error dialog explains the failure.
    } finally {
      setAcknowledging(false);
    }
  }, [acknowledgeTarget]);

  const columns = useMemo<ColumnData<SelfTicketData>[]>(
    () =>
      selfTicketListColumns({
        numberColumn: {
          label: "Task Number",
          // This cell contains three action icons and the task number. Reserve
          // enough fixed-table width for an active reminder bell as well.
          width: 250,
          render: (row) => (
            <RecordNumberCell
              number={row.number}
              editTitle={selfTicketEditDisabledReason(row, userId) ?? "Edit task"}
              editDisabled={isSelfTicketEditDisabled(row, userId)}
              onView={() => openDetails(row)}
              onEdit={() => openEdit(row)}
            >
              {row.alarm && row.current_status === "open" && row.creator === userId && (
                <Tooltip title="Acknowledge reminder: marks it as seen and clears the alert">
                  <IconButton
                    aria-label={`Acknowledge reminder ${row.number}`}
                    color="warning"
                    onClick={() => requestAcknowledgeAlarm(row)}
                  >
                    <NotificationsActiveOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </RecordNumberCell>
          ),
        },
        dueDate: (row) => ({
          date: selfTicketDisplayDueDate(row),
          overdue: getSelfTicketAlertReason(row) === "target-date",
        }),
      }),
    [requestAcknowledgeAlarm, userId, openDetails, openEdit],
  );

  const activeRows = tabValue === 0 ? tickets.self : tickets.others;

  const filteredRows = useMemo(
    () =>
      [...activeRows.filter(
        (ticket) => !selectedUser || ticket.creator === Number(selectedUser),
      )].sort((left, right) => {
        const urgency = (ticket: SelfTicketData) => {
          const reason = getSelfTicketAlertReason(ticket);
          if (reason === "target-date") return 0;
          if (reason === "alarm") return 1;
          return 2;
        };
        return urgency(left) - urgency(right);
      }),
    [activeRows, selectedUser],
  );

  // "Overdue" narrows Board and List, and jumps to the date in the Calendar.
  const [overdueJump, setOverdueJump] = useState<number>(0);
  const [overdueOnly, setOverdueOnly] = useState<boolean>(false);
  const overdueRows = useMemo(
    () => filteredRows.filter((ticket) => isSelfTicketOverdue(ticket)),
    [filteredRows],
  );
  const listRows = overdueOnly ? overdueRows : filteredRows;

  // Calendar: one item per recurring occurrence, on its own day.
  const calendarRows = useMemo(() => expandOccurrences(filteredRows), [filteredRows]);
  const calendarOverdueCount = useMemo(
    () => calendarRows.filter((ticket) => isSelfTicketOverdue(ticket)).length,
    [calendarRows],
  );

  return (
    <Box sx={page}>
      <Box sx={pageContent}>
        <PageHeader
          title="Do List"
          subtitle="Organize personal actions, reminders, and follow-ups."
          actions={[
            tabValue !== 0 && {
              key: "employee",
              priority: "high",
              // A select needs width: its own row on phones.
              mobile: "row",
              node: (
                <FormControl sx={[filterField, headerFilterFieldSx]}>
                  <InputLabel>Employee</InputLabel>
                  <Select
                    inputProps={{ "aria-label": "Employee" }}
                    value={selectedUser}
                    label="Employee"
                    onChange={(event) => setSelectedUser(event.target.value)}
                  >
                    <MenuItem value="">
                      <em>All employees</em>
                    </MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.first_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ),
            },
            tabValue === 0 && {
              key: "new",
              priority: "high",
              node: (
                <Button
                  startIcon={<AddOutlinedIcon />}
                  variant="contained"
                  onClick={openCreate}
                >
                  New Task
                </Button>
              ),
            },
            view === "calendar"
              ? overdueJumpAction("task", calendarOverdueCount, () => setOverdueJump((jump) => jump + 1))
              : overdueFilterAction("task", overdueRows.length, overdueOnly, () =>
                  setOverdueOnly((current) => !current),
                ),
            viewToggleAction<PageView>(DO_LIST_VIEWS, view, setView),
          ]}
        />

        <Box sx={tabsContainer}>
          <Tabs
            value={tabValue}
            onChange={(_, value: number) => {
              setTabValue(value);
              setSelectedUser("");
            }}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={tabs}
          >
            <Tab
              icon={tabValue === 0 ? <AssignmentTurnedInIcon /> : <AssignmentTurnedInOutlinedIcon />}
              iconPosition="start"
              label={`My Do List (${tickets.self.length})`}
            />
            <Tab
              icon={tabValue === 1 ? <GroupsIcon /> : <GroupsOutlinedIcon />}
              iconPosition="start"
              label={`My Teams Do List (${tickets.others.length})`}
            />
          </Tabs>
        </Box>

        <ContentSwap key={view} appear swapKey={tabValue} sx={tablePageContent}>
          {view === "calendar" ? (
            <TicketCalendar
              overdueJump={overdueJump}
              tickets={calendarRows}
              loading={loading}
              error={ticketsQuery.isError}
              // A recurring occurrence opens its whole task (all occurrences).
              onOpen={(task) => openDetails(sourceTask(filteredRows, task))}
              agendaMetaOf={scheduleAgendaMeta}
              onCreate={openCreateForDate}
              noun="task"
              personOf={(task) => task.creator_name}
              isOverdue={isSelfTicketOverdue}
            />
          ) : view === "card" && loading ? (
            <TableLoadingState variant="cards" label="Loading tasks" />
          ) : view === "card" ? (
            <TicketCardView
              data={listRows}
              onCardClick={openDetails}
              cardType="Self"
              overdueOnly={overdueOnly}
              onAcknowledgeAlarm={requestAcknowledgeAlarm}
            />
          ) : (
            <VirtualizedTable
              columns={columns}
              rows={listRows}
              height="100%"
              // Every task on My Do List is the user's own: Owner only matters for the team.
              hiddenColumns={tabValue === 0 ? ["Owner"] : undefined}
              getRowSx={(row) =>
                row.alarm === true
                  ? priorityAlarmRowHighlight()
                  : shouldBlinkSelfTicket(row)
                  ? priorityDueRowHighlight()
                  : undefined
              }
              tableHead="Tasks"
              fitContent
              loading={loading}
              emptyTitle={overdueOnly ? "No overdue tasks" : "No tasks in this view"}
              emptyDescription={
                overdueOnly
                  ? "Turn off Overdue to see every task."
                  : "Add a task or reminder to start your Do List."
              }
            />
          )}
        </ContentSwap>
      </Box>

      {!selectedRow && !editing && (
        <CreateSelfTicketModel
          open={dialogOpen}
          handleClose={closeDialog}
          Data={null}
          initialTargetDate={createTargetDate}
        />
      )}
      {selectedRow && editing && (
        <CreateSelfTicketModel
          open={dialogOpen}
          handleClose={closeDialog}
          Data={selectedRow}
        />
      )}
      {selectedRow && !editing && (
        <SelfTicketDetailModel
          open={dialogOpen}
          onClose={closeDialog}
          data={selectedRow}
          onEdit={openEdit}
        />
      )}
      <ConfirmDialog
        open={Boolean(acknowledgeTarget)}
        title="Acknowledge Reminder"
        description={`Acknowledging marks the reminder for task ${
          acknowledgeTarget?.number ? `#${acknowledgeTarget.number}` : ""
        } as seen and clears its alert. The task stays open${
          acknowledgeTarget?.reminder_interval
            ? `, and the next reminder follows its ${acknowledgeTarget.reminder_interval}-day interval`
            : ""
        }.`}
        confirmLabel={acknowledging ? "Acknowledging..." : "Acknowledge"}
        confirmColor="warning"
        confirmIcon={<NotificationsActiveOutlinedIcon fontSize="small" />}
        confirmDisabled={acknowledging}
        onClose={closeAcknowledgeDialog}
        onConfirm={() => void confirmAcknowledgeAlarm()}
      />
    </Box>
  );
}
