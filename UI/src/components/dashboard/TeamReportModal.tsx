import { useMemo } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { useTheme } from "@mui/material/styles";
import {
  VirtualizedTable,
  type ColumnData,
} from "../common/TableView";
import {
  formatStatusLabel,
  getStatusColor,
  teamReportModalLoadingSx,
  teamReportModalPaperSx,
  teamReportModalSectionIconSx,
  teamReportModalSectionHeaderSx,
  teamReportModalSectionPanelSx,
  teamReportModalSectionStackSx,
  teamReportModalSubtitleSx,
  teamReportModalSummaryChipSx,
  teamReportModalSummaryStackSx,
  teamReportModalTableWrapSx,
  teamReportModalTitleContentSx,
  teamReportModalTitleIconSx,
  teamReportModalTitleMetaSx,
  teamReportModalTitleRowSx,
  teamReportModalTitleSx,
} from "../../styles/common";

type TeamTicketRow = Record<string, unknown> & {
  number: string;
  task: string;
  current_status: string;
  priority?: string;
  creator_name?: string;
  assigned_to_name?: string;
};

type TeamDoListRow = Record<string, unknown> & {
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

function SummaryChips({
  data,
  order = summaryOrder,
}: {
  data: Record<string, number>;
  order?: string[];
}) {
  return (
    <Stack direction="row" sx={teamReportModalSummaryStackSx}>
      {order.map((key) => (
        <Chip
          key={key}
          label={`${formatStatusLabel(key)}: ${data[key] ?? 0}`}
          size="small"
          variant="outlined"
          sx={teamReportModalSummaryChipSx(getStatusColor(key))}
        />
      ))}
    </Stack>
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
      {
        label: "#",
        width: 45,
        render: (_row, index) => index + 1,
        numeric: true,
      },
      { label: "Ticket Number", dataKey: "number", width: 170 },
      { label: "Subject", dataKey: "task", width: "auto" },
      { label: "Status", dataKey: "current_status", width: 140 },
    ],
    [],
  );

  const dolistColumns = useMemo<ColumnData<TeamDoListRow>[]>(
    () => [
      {
        label: "#",
        width: 45,
        render: (_row, index) => index + 1,
        numeric: true,
      },
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
      <DialogTitle component="div">
        <Stack direction="row" sx={teamReportModalTitleRowSx}>
          <Stack direction="row" spacing={1.25} sx={teamReportModalTitleContentSx}>
            <Box sx={teamReportModalTitleIconSx}>
              <GroupsOutlinedIcon fontSize="small" />
            </Box>
            <Box minWidth={0}>
              <Typography sx={teamReportModalTitleSx}>
                {detail?.department.name || "Team Report"}
              </Typography>
              <Stack direction="row" sx={teamReportModalTitleMetaSx}>
                <Typography sx={teamReportModalSubtitleSx}>
                  Manager: {detail?.department.manager || "Not assigned"}
                </Typography>
                <Chip label={`${ticketTotal} tickets`} size="small" variant="outlined" />
                <Chip label={`${dolistTotal} tasks`} size="small" variant="outlined" />
              </Stack>
            </Box>
          </Stack>
          <IconButton aria-label="Close team report" onClick={onClose}>
            <CloseOutlinedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={teamReportModalLoadingSx}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              Loading team report...
            </Typography>
          </Box>
        ) : (
          <Stack sx={teamReportModalSectionStackSx}>
            <Box sx={teamReportModalSectionPanelSx}>
              <Stack direction="row" spacing={1} sx={teamReportModalSectionHeaderSx}>
                <Box sx={teamReportModalSectionIconSx("primary")}>
                  <AssignmentOutlinedIcon fontSize="small" />
                </Box>
                <Box minWidth={0}>
                  <Typography fontWeight={900}>Tickets</Typography>
                  <Typography variant="caption" color="text.secondary">
                    External ticket workload
                  </Typography>
                </Box>
              </Stack>
              <SummaryChips data={detail?.ticket_summary ?? {}} />
              <Box sx={teamReportModalTableWrapSx}>
                <VirtualizedTable
                  columns={ticketColumns}
                  rows={detail?.tickets ?? []}
                  height="100%"
                  tableHead="External Tickets"
                  tableMinWidth={720}
                />
              </Box>
            </Box>

            <Box sx={teamReportModalSectionPanelSx}>
              <Stack direction="row" spacing={1} sx={teamReportModalSectionHeaderSx}>
                <Box sx={teamReportModalSectionIconSx("secondary")}>
                  <FormatListBulletedOutlinedIcon fontSize="small" />
                </Box>
                <Box minWidth={0}>
                  <Typography fontWeight={900}>Do List</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Manager task follow-ups
                  </Typography>
                </Box>
              </Stack>
              <SummaryChips
                data={detail?.dolist_summary ?? {}}
                order={summaryOrderDoList}
              />
              <Box sx={teamReportModalTableWrapSx}>
                <VirtualizedTable
                  columns={dolistColumns}
                  rows={detail?.dolist ?? []}
                  height="100%"
                  tableHead="Manager Do List"
                  tableMinWidth={820}
                />
              </Box>
            </Box>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
