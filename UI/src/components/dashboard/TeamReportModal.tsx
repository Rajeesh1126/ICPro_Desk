import { useMemo, type ReactNode } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DialogHeader from "@/components/common/DialogHeader";
import {
  VirtualizedTable,
  type ColumnData,
} from "@/components/common/TableView";
import {
  formatStatusLabel,
  getStatusColor,
  teamReportCounterSx,
  teamReportCountersSx,
  teamReportModalLoadingSx,
  teamReportModalPaperSx,
  teamReportSectionCaptionSx,
  teamReportSectionHeaderSx,
  teamReportSectionTitleSx,
  teamReportSectionsSx,
  teamReportTableSx,
  teamReportTotalPillSx,
  teamReportTotalsSx,
} from "@/styles/common";

type TeamTicketRow = {
  number: string;
  task: string;
  current_status: string;
  priority?: string;
  creator_name?: string;
  assigned_to_name?: string;
};

type TeamDoListRow = {
  number: string;
  task: string;
  current_status: string;
  priority?: string;
  creator_name?: string;
};

export type TeamReportDetail = {
  department: {
    id: number | null;
    name: string;
    manager: string;
  };
  ticket_summary: Record<string, number>;
  dolist_summary: Record<string, number>;
  tickets: TeamTicketRow[];
  dolist: TeamDoListRow[];
};

type TeamReportModalProps = {
  open: boolean;
  loading: boolean;
  detail: TeamReportDetail | null;
  onClose: () => void;
};

const summaryOrder = ["Open", "InProgress", "Completed", "Closed"];
const summaryOrderDoList = ["Open", "Closed"];

/** Status counters for one section: dot, status label, count. */
function StatusCounters({
  data,
  order = summaryOrder,
}: {
  data: Record<string, number>;
  order?: string[];
}) {
  return (
    <Box sx={teamReportCountersSx}>
      {order.map((key) => (
        <Box key={key} component="span" sx={teamReportCounterSx(getStatusColor(key))}>
          {formatStatusLabel(key)}
          <strong>{data[key] ?? 0}</strong>
        </Box>
      ))}
    </Box>
  );
}

/** Title + caption on the left, status counters on the right. */
function SectionHeader({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <Box sx={teamReportSectionHeaderSx}>
      <Box minWidth={0}>
        <Typography component="h3" sx={teamReportSectionTitleSx}>
          {title}
        </Typography>
        <Typography sx={teamReportSectionCaptionSx}>{caption}</Typography>
      </Box>
      {children}
    </Box>
  );
}

export default function TeamReportModal({
  open,
  loading,
  detail,
  onClose,
}: TeamReportModalProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const ticketTotal = useMemo(
    () => Object.values(detail?.ticket_summary ?? {}).reduce((total, count) => total + count, 0),
    [detail?.ticket_summary],
  );
  const dolistTotal = useMemo(
    () => Object.values(detail?.dolist_summary ?? {}).reduce((total, count) => total + count, 0),
    [detail?.dolist_summary],
  );
  const ticketColumns = useMemo<ColumnData<TeamTicketRow>[]>(
    () => [
      { label: "Ticket Number", dataKey: "number", width: 170 },
      { label: "Subject", dataKey: "task", width: "auto" },
      { label: "Status", dataKey: "current_status", width: 140 },
    ],
    [],
  );

  const dolistColumns = useMemo<ColumnData<TeamDoListRow>[]>(
    () => [
      { label: "Task Number", dataKey: "number", width: 170 },
      { label: "Subject", dataKey: "task", width: "auto" },
      { label: "Status", dataKey: "current_status", width: 140 },
    ],
    [],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      fullScreen={fullScreen}
      PaperProps={{ sx: teamReportModalPaperSx }}
    >
      <DialogHeader
        title={detail?.department.name || "Team Report"}
        subtitle={`Manager: ${detail?.department.manager || "Not assigned"}`}
        actions={
          <Stack direction="row" spacing={0.75} sx={teamReportTotalsSx}>
            <Chip label={`${ticketTotal} tickets`} sx={teamReportTotalPillSx} />
            <Chip label={`${dolistTotal} tasks`} sx={teamReportTotalPillSx} />
          </Stack>
        }
        onClose={onClose}
      />
      <DialogContent>
        {loading ? (
          <Box sx={teamReportModalLoadingSx}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              Loading team report...
            </Typography>
          </Box>
        ) : (
          <Box sx={teamReportSectionsSx}>
            <Box component="section">
              <SectionHeader title="Tickets" caption="External ticket workload">
                <StatusCounters data={detail?.ticket_summary ?? {}} />
              </SectionHeader>
              <Box sx={teamReportTableSx}>
                <VirtualizedTable
                  columns={ticketColumns}
                  rows={detail?.tickets ?? []}
                  height="100%"
                  tableHead="External Tickets"
                  tableMinWidth={720}
                />
              </Box>
            </Box>

            <Box component="section">
              <SectionHeader title="Do List" caption="Manager task follow-ups">
                <StatusCounters
                  data={detail?.dolist_summary ?? {}}
                  order={summaryOrderDoList}
                />
              </SectionHeader>
              <Box sx={teamReportTableSx}>
                <VirtualizedTable
                  columns={dolistColumns}
                  rows={detail?.dolist ?? []}
                  height="100%"
                  tableHead="Manager Do List"
                  tableMinWidth={820}
                />
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
