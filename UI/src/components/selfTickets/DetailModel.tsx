import { DETAIL_DIALOG_LABEL } from "@/components/common/DetailDialogParts";
import {
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  TextField,
  Tooltip,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";

import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
import SkipNextOutlinedIcon from "@mui/icons-material/SkipNextOutlined";

import api from "@/api/axios";
import { useState } from "react";
import type { SelfTicketData, SelfTicketOccurrence } from "@/types/dataTypes";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  DetailDialogHeader,
  DetailField,
  DetailTextField,
} from "@/components/common/DetailDialogParts";
import TaskActivityPanel from "@/components/selfTickets/TaskActivityPanel";
import ScheduleCard from "@/components/selfTickets/ScheduleCard";
import {
  isSelfTicketEditDisabled,
  selfTicketEditDisabledReason,
} from "@/utils/ticketEdit";
import OccurrenceList from "@/components/selfTickets/OccurrenceList";
import {
  isSelfTicketOverdue,
  selfTicketDisplayDueDate,
} from "@/components/selfTickets/highlight";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import {
  dueDateLabel,
  reminderSummary,
  scheduleLabel,
  scheduleSummary,
} from "@/components/selfTickets/schedule";
import {
  boardCardTagSx,
  compactFieldSx,
  ticketDetailNoteSx,
} from "@/styles/common";
import {
  detailActionButtonsSx,
  detailFactsSx,
  detailFooterSx,
  detailColumnHeaderSx,
  detailMainColumnSx,
  detailPanelTitleSx,
} from "@/styles/detailDialog";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import { formatDate, formatOverdueLabel } from "@/components/common/formatDate";
import { formatDecimalHours } from "@/utils/hoursMinutes";
import { showNotification } from "@/api/notificationService";
import { buttonLabelCompact, buttonLabelFull } from "@/styles/layout";

export default function TicketDetailModal({
  open,
  onClose,
  data,
  onEdit,
}: {
  open: boolean;
  onClose: () => void;
  data: SelfTicketData;
  onEdit?: (ticket: SelfTicketData) => void;
}) {
  const [closeModelOpen, setCloseModelOpen] = useState<boolean>(false);
  const [cancelModelOpen, setCancelModelOpen] = useState<boolean>(false);
  const [openCommentsModal, setOpenCommentsModal] = useState<boolean>(false);
  const [openProgressModal, setOpenProgressModal] = useState<boolean>(false);
  const [openTargetRevisionModal, setOpenTargetRevisionModal] = useState<boolean>(false);
  const [comments, setcomments] = useState<string>("");
  const [task, setTask] = useState<SelfTicketData>(data);

  const currentUserParsed = Number(localStorage.getItem("user") || "null");
  const userId = currentUserParsed ?? null;

  const isRecurring = task.schedule_type === "recurring";
  const hasLogs = task.logs?.length > 0;
  // md+ column spans: details | occurrences (recurring) | status / comments.
  const columns = isRecurring
    ? hasLogs
      ? { main: 4, occurrences: 5, logs: 3 }
      : { main: 6, occurrences: 6, logs: 0 }
    : { main: hasLogs ? 8 : 12, occurrences: 0, logs: 4 };

  // A recurring task closes only once every occurrence is completed or skipped.
  const openOccurrences = isRecurring
    ? (task.occurrences ?? []).filter((item) => item.current_status === "open").length
    : 0;
  const [openOccurrencesAlert, setOpenOccurrencesAlert] = useState<boolean>(false);
  const [skippingAll, setSkippingAll] = useState<boolean>(false);
  const openCloseTask = () => {
    if (openOccurrences > 0) setOpenOccurrencesAlert(true);
    else setCloseModelOpen(true);
  };

  // Skips every open occurrence (the same request as a single Skip), then
  // continues to the Close Task form. If one fails, those already skipped
  // stay skipped and the alert shows how many are left.
  const skipAllAndClose = async () => {
    setSkippingAll(true);
    let occurrences = task.occurrences ?? [];
    try {
      for (const item of occurrences.filter((row) => row.current_status === "open")) {
        const response = await api.post<SelfTicketOccurrence>(`/self-tickets/${task.id}/occurrence-status/`, {
          occurrence_id: item.id,
          current_status: "cancelled",
        });
        occurrences = occurrences.map((row) => (row.id === item.id ? response.data : row));
        const next = occurrences;
        setTask((current) => ({
          ...current,
          occurrences: next,
          alarm: next.some((row) => row.alarm && row.current_status === "open"),
        }));
      }
      setOpenOccurrencesAlert(false);
      setCloseModelOpen(true);
    } catch {
      // The shared request error dialog explains the failure.
    } finally {
      setSkippingAll(false);
    }
  };

  const statusMessages: Record<string, string> = {
    closed: "Do List task closed successfully.",
    cancelled: "Do List task cancelled successfully.",
    revised: "Target date revision request sent successfully.",
  };

  const handleConfirm = async (
    status?: string,
    payload?: { comments?: string },
  ): Promise<boolean> => {
    try {
      const requestBody: {
        current_status?: string;
        comments?: string;
      } = {};

      if (status) {
        requestBody.current_status = status;
      }

      if (payload?.comments) {
        requestBody.comments = payload.comments;
      }
      const response = await api.patch<SelfTicketData>(
        `/self-tickets/${task.id}/?do_List=true`,
        requestBody,
      );

      showNotification({
        type: "success",
        message:
          statusMessages[status ?? ""] ??
          "Do List task marked as In Progress successfully.",
      });

      setTask(response.data);
      setcomments("");
      if (closeModelOpen || cancelModelOpen) {
        onClose();
      }

      return true;
    } catch {
      return false;
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth={isRecurring ? "xl" : "lg"}
        aria-labelledby={DETAIL_DIALOG_LABEL}
      >
        <DetailDialogHeader
          eyebrow="Do List task"
          number={task.number}
          status={task.current_status || "open"}
          priority={task.priority}
          person={
            task.creator !== userId
              ? { label: "Owner", name: task.creator_name }
              : null
          }
          onClose={onClose}
        />

        <DialogContent>
          <Grid container spacing={2} alignItems="stretch">
            <Grid size={{ xs: 12, md: columns.main }}>
              <Box sx={detailMainColumnSx}>
                {/* Titled like the Occurrences and Status & comments columns beside it. */}
                <Box sx={detailColumnHeaderSx}>
                  <AssignmentOutlinedIcon />
                  <Typography component="h3" sx={detailPanelTitleSx}>
                    Task details
                  </Typography>
                </Box>
                <DetailTextField label="Subject" value={task.task} />
                <DetailTextField
                  label="Description"
                  value={task.description}
                  multiline
                />

                <Box sx={detailFactsSx}>
                  {[
                    {
                      label: "Schedule",
                      value: scheduleLabel(task.schedule_type),
                    },
                    task.schedule_type === "period"
                      ? {
                          label: "Period",
                          value: scheduleSummary(task, task.target_date),
                        }
                      : {
                          label: dueDateLabel(task.schedule_type),
                          value: formatDate(selfTicketDisplayDueDate(task)),
                          // Same overdue tag as the ticket dialog's target date.
                          note: isSelfTicketOverdue(task) && (
                            <Box sx={ticketDetailNoteSx}>
                              <Box
                                component="span"
                                sx={boardCardTagSx("overdue")}
                              >
                                <EventBusyOutlinedIcon aria-hidden="true" />
                                {formatOverdueLabel(
                                  selfTicketDisplayDueDate(task),
                                ) ?? "Overdue"}
                              </Box>
                            </Box>
                          ),
                        },
                    {
                      label: "Estimated hours",
                      value: formatDecimalHours(task.est_hours),
                    },
                    {
                      label: "Reminder",
                      value: reminderSummary(task) ?? "Off",
                    },
                    {
                      label: "Related ticket",
                      value: task.ticket_number || "N/A",
                    },
                    // Status sits in the header (as on tickets); the sixth
                    // fact keeps the strip an even 3 × 2.
                    {
                      label: "Created",
                      value: formatDate(task.created_at),
                    },
                  ].map(({ label, ...field }) => (
                    <DetailField key={label} label={label} {...field} />
                  ))}
                </Box>

                {/* Recurring / period tasks: the rule, weekdays and range at a glance. */}
                <ScheduleCard schedule={task} anchor={task.target_date} />
              </Box>
            </Grid>
            {/* Recurring: occurrences get their own column, like the comments. */}
            {isRecurring && (
              <Grid size={{ xs: 12, md: columns.occurrences }}>
                <OccurrenceList
                  task={task}
                  canComplete={task.creator === userId}
                  onChange={setTask}
                />
              </Grid>
            )}
            {hasLogs ? (
              <Grid size={{ xs: 12, md: columns.logs }}>
                <TaskActivityPanel logs={task.logs} userId={userId} />
              </Grid>
            ) : (
              ""
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          {onEdit && (
            // Always first, on the left; the tooltip says why it is disabled.
            <Tooltip title={selfTicketEditDisabledReason(task, userId) ?? ""}>
              <Box component="span" sx={{ mr: "auto" }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EditOutlinedIcon />}
                  disabled={isSelfTicketEditDisabled(task, userId)}
                  onClick={() => {
                    if (isSelfTicketEditDisabled(task, userId)) return;
                    onClose();
                    onEdit(task);
                  }}
                >
                  Edit
                </Button>
              </Box>
            </Tooltip>
          )}
          {/* A recurring task is completed one occurrence at a time, above. */}
          {["open", "revised"].includes(task.current_status) &&
            task.creator === userId && (
              <Box sx={detailFooterSx}>
                <Box sx={detailActionButtonsSx}>
                  <Button
                    onClick={() => setOpenProgressModal(true)}
                    variant="contained"
                    color="info"
                    disabled={task.current_status === "closed"}
                    startIcon={<PendingActionsOutlinedIcon />}
                  >
                    <Box component="span" sx={buttonLabelCompact}>
                      Update
                    </Box>
                    <Box component="span" sx={buttonLabelFull}>
                      Update Progress
                    </Box>
                  </Button>
                  <Button
                    onClick={openCloseTask}
                    variant="contained"
                    color="success"
                    startIcon={<TaskAltOutlinedIcon />}
                  >
                    <Box component="span" sx={buttonLabelCompact}>
                      Close
                    </Box>
                    <Box component="span" sx={buttonLabelFull}>
                      Close Task
                    </Box>
                  </Button>
                  <Button
                    onClick={() => setCancelModelOpen(true)}
                    variant="outlined"
                    color="error"
                    startIcon={<CancelOutlinedIcon />}
                  >
                    <Box component="span" sx={buttonLabelCompact}>
                      Cancel
                    </Box>
                    <Box component="span" sx={buttonLabelFull}>
                      Cancel Task
                    </Box>
                  </Button>
                </Box>
              </Box>
            )}

          {task.creator !== userId && (
            <Box sx={detailActionButtonsSx}>
              <Button
                onClick={() => setOpenCommentsModal(true)}
                variant="outlined"
                color="secondary"
                disabled={task.current_status === "closed"}
                startIcon={<ChatBubbleOutlineOutlinedIcon />}
              >
                Comments
              </Button>
              <Button
                onClick={() => setOpenTargetRevisionModal(true)}
                variant="outlined"
                color="warning"
                disabled={["closed", "cancelled"].includes(task.current_status)}
                startIcon={<EventRepeatOutlinedIcon />}
              >
                Revise Target Date
              </Button>
            </Box>
          )}
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={openOccurrencesAlert}
        onClose={() => {
          if (!skippingAll) setOpenOccurrencesAlert(false);
        }}
        onConfirm={skipAllAndClose}
        title="Close Task"
        description={`All occurrences must be completed or skipped before this task can be closed. ${openOccurrences} ${openOccurrences === 1 ? "occurrence is" : "occurrences are"} still open. Skip ${openOccurrences === 1 ? "it" : "them all"} and continue to close the task?`}
        confirmLabel={skippingAll ? "Skipping..." : "Skip all & close task"}
        confirmColor="warning"
        confirmIcon={<SkipNextOutlinedIcon />}
        confirmDisabled={skippingAll}
      />

      <ConfirmDialog
        open={closeModelOpen}
        onClose={() => setCloseModelOpen(false)}
        onConfirm={async () => {
          if (await handleConfirm("closed", { comments }))
            setCloseModelOpen(false);
        }}
        title="Close Task"
        description="Please provide a reason for closing this task"
        confirmLabel="Confirm"
        confirmColor="success"
        confirmIcon={<TaskAltOutlinedIcon />}
        confirmDisabled={!comments.trim()}
      >
        <TextField
          autoFocus
          required
          multiline
          rows={4}
          fullWidth
          label="Reason for task closure"
          value={comments}
          onChange={(event) => setcomments(event.target.value)}
          placeholder="e.g., Task completed successfully, Issue resolved, Requirements fulfilled..."
          sx={compactFieldSx}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={openProgressModal}
        onClose={() => setOpenProgressModal(false)}
        onConfirm={async () => {
          if (await handleConfirm("", { comments }))
            setOpenProgressModal(false);
        }}
        title="Update Progress"
        description="Please provide an update on the current progress of this task."
        confirmLabel="Save update"
        confirmColor="info"
        confirmIcon={<SaveOutlinedIcon />}
        confirmDisabled={!comments.trim()}
      >
        <TextField
          autoFocus
          required
          multiline
          rows={4}
          fullWidth
          label="Progress Notes"
          value={comments}
          onChange={(event) => setcomments(event.target.value)}
          placeholder="Describe the current progress, completed work, and any pending tasks..."
          sx={compactFieldSx}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={cancelModelOpen}
        onClose={() => setCancelModelOpen(false)}
        onConfirm={async () => {
          if (await handleConfirm("cancelled", { comments }))
            setCancelModelOpen(false);
        }}
        title="Cancel Task"
        description="Please provide a reason for cancelling this task"
        confirmLabel="Confirm"
        confirmColor="error"
        confirmIcon={<CancelOutlinedIcon />}
        confirmDisabled={!comments.trim()}
      >
        <TextField
          autoFocus
          required
          multiline
          rows={4}
          fullWidth
          label="Reason for task cancellation"
          value={comments}
          onChange={(event) => setcomments(event.target.value)}
          placeholder="e.g., Insufficient information provided, Duplicate task, Out of scope..."
          sx={compactFieldSx}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={openCommentsModal}
        onClose={() => setOpenCommentsModal(false)}
        onConfirm={async () => {
          if (await handleConfirm("", { comments }))
            setOpenCommentsModal(false);
        }}
        title="Add Comments"
        description="Please provide comments for this task."
        confirmLabel="Add comment"
        confirmColor="warning"
        confirmIcon={<SendOutlinedIcon />}
        confirmDisabled={!comments.trim()}
      >
        <TextField
          autoFocus
          required
          multiline
          rows={4}
          fullWidth
          label="Give Comments"
          value={comments}
          onChange={(event) => setcomments(event.target.value)}
          placeholder="e.g., Insufficient information provided, Duplicate task, Out of scope..."
          sx={compactFieldSx}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={openTargetRevisionModal}
        onClose={() => setOpenTargetRevisionModal(false)}
        onConfirm={async () => {
          if (await handleConfirm("revised", { comments }))
            setOpenTargetRevisionModal(false);
        }}
        title="Request Target Date Revision"
        description="Please provide the reason for extending or revising the target date."
        confirmLabel="Send Request"
        confirmColor="warning"
        confirmIcon={<SendOutlinedIcon />}
        confirmDisabled={!comments.trim()}
      >
        <TextField
          autoFocus
          required
          multiline
          rows={4}
          fullWidth
          label="Reason for target date revision"
          value={comments}
          onChange={(event) => setcomments(event.target.value)}
          placeholder="Explain why the target date needs to be revised or extended..."
          sx={compactFieldSx}
        />
      </ConfirmDialog>
    </>
  );
}
