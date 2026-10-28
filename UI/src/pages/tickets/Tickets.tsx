import { useCallback, useMemo, useState } from "react";
import { isOverdueTicket } from "@/utils/ticketDue";
import {
  Box,
  Button,
  Tab,
  Tabs,
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

/** The Tickets page is the one page with a Calendar view. */
type TicketsView = PageView;
const TICKETS_VIEWS: readonly TicketsView[] = ["table", "card", "calendar"];
import TableLoadingState from "@/components/common/TableLoadingState";
import type {
  TicketData,
} from "@/types/dataTypes";
import { useApiQuery } from "@/api/useApiQuery";
import { buildTicketCollections } from "@/pages/tickets/ticketCollections";
import { useSessionState, WORK_ITEM_VIEW_SESSION_KEY } from "@/utils/useSessionState";
import {
  page,
  pageContent,
  priorityAlarmRowHighlight,
  priorityDueRowHighlight,
  tabs,
  tabsContainer,
  tablePageContent,
  viewEnterSx,
} from "@/styles/common";
import PageHeader from "@/components/common/PageHeader";
import { viewToggleAction } from "@/components/common/headerActions";


function loggedUser(): number | null {
  const value = localStorage.getItem("user");
  const id = value ? Number(value) : NaN;

  return Number.isInteger(id) ? id : null;
}

export default function Tickets() {
  const userId = useMemo(() => loggedUser(), []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createTargetDate, setCreateTargetDate] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TicketData | null>(null);
  const [view, setView] = useSessionState<TicketsView>(
    WORK_ITEM_VIEW_SESSION_KEY,
    "card",
    (value): value is TicketsView => TICKETS_VIEWS.includes(value as TicketsView),
  );
  const [tabValue, setTabValue] = useSessionState(
    "tickets:tab",
    0,
    (value): value is number => typeof value === "number" && value >= 0 && value <= 5,
  );
  // List-only tabs are unavailable on the board; remember where the user was.
  const [tableTabBeforeBoard, setTableTabBeforeBoard] = useState<number | null>(null);
  // One cached response feeds every tab, so tab switches are instant and a
  // return visit renders immediately while refreshing in the background.
  const ticketsQuery = useApiQuery<TicketData[]>("/tickets/", {
    is_internal: false,
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

  const columns = useTicketTableColumns({ userId, onView: openDetails, onEdit: openEdit });
  const [hiddenColumnsValue, setHiddenColumnsValue] = useSessionState(
    "tickets:hidden-columns",
    DEFAULT_HIDDEN_TICKET_COLUMNS,
    (value): value is string => typeof value === "string",
  );
  const hiddenColumns = useMemo(
    () => hiddenColumnsValue.split(",").filter(Boolean),
    [hiddenColumnsValue],
  );

  const rowsForTab =
    [
      // tickets.all,
      tickets.overview,
      tickets.assigned,
      tickets.created,
      tickets.rejected,
      tickets.recalled,
      tickets.closed,
    ][tabValue] ?? tickets.all;
  const activeRows = rowsForTab;

  const changeView = (next: TicketsView) => {
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
          title="Tickets"
          subtitle="Track, assign, and complete team tickets from one workspace."
          actions={[
            tabValue === 0 && {
              key: "new",
              priority: "high",
              node: (
                <Button
                  startIcon={<AddOutlinedIcon />}
                  variant="contained"
                  onClick={openCreate}
                >
                  New Ticket
                </Button>
              ),
            },
            viewToggleAction<TicketsView>(TICKETS_VIEWS, view, changeView),
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
            <Tab icon={tabValue === 0 ? <DashboardIcon /> : <DashboardOutlinedIcon />} iconPosition="start" label={`Overview (${tickets.overview.length})`} />
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

        <Box key={view} sx={[tablePageContent, viewEnterSx]}>
          {view === "calendar" ? (
            <TicketCalendar
              tickets={activeRows}
              loading={loading}
              error={ticketsQuery.isError}
              onOpen={openDetails}
              onCreate={openCreateForDate}
            />
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
              tableHead="Tickets"
              loading={loading}
              emptyTitle="No tickets in this view"
              emptyDescription="Tickets you create or are assigned will appear here."
              hideSearch
              fitContent
              hiddenColumns={hiddenColumns}
              headerAction={
                <ColumnPicker
                  options={OPTIONAL_TICKET_COLUMNS.filter((label) => label !== "Team")}
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
        />
      )}
    </Box>
  );
}
