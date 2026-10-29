import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { isSelfTicketEditDisabled } from "@/utils/ticketEdit";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  TextField,
} from "@mui/material";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";

import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";

import api from "@/api/axios";
import { useState } from "react";
import type { SelfTicketData, SelfTicketLog } from "@/types/dataTypes";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  DetailChatMessage,
  DetailChatPanel,
  DetailDialogHeader,
  DetailField,
  DetailTextField,
} from "@/components/common/DetailDialogParts";
import { oldestFirst } from "@/utils/chatOrder";
import { compactFieldSx } from "@/styles/common";
import {
  detailActionButtonsSx,
  detailFactsSx,
  detailFooterSx,
  detailMainColumnSx,
} from "@/styles/detailDialog";
import { formatDate, formatDateTime } from "@/components/common/formatDate";
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
  const [closeModelOpen, setCloseModelOpen] = useState(false);
  const [cancelModelOpen, setCancelModelOpen] = useState(false);
  const [openCommentsModal, setOpenCommentsModal] = useState(false);
  const [openProgressModal, setOpenProgressModal] = useState(false);
  const [openTargetRevisionModal, setOpenTargetRevisionModal] = useState(false);
  const [comments, setcomments] = useState("");
  const [task, setTask] = useState(data);

  const currentUserParsed = Number(localStorage.getItem("user") || "null");
  const userId = currentUserParsed ?? null;

  const statusMessages: Record<string, string> = {
    closed: "Do List task closed successfully.",
    cancelled: "Do List task cancelled successfully.",
    "revised": "Target date revision request sent successfully.",
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
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <DetailDialogHeader
          eyebrow="Do List task"
          number={task.number}
          priority={task.priority}
          person={
            task.creator !== userId
              ? { label: "Owner", name: task.creator_name }
              : null
          }
          onClose={onClose}
        />

        <DialogContent>
          <Grid container spacing={2.5} alignItems="stretch">
            <Grid size={{ xs: 12, md: task.logs?.length > 0 ? 8 : 12 }}>
              <Box sx={detailMainColumnSx}>
                <DetailTextField
                  label="Subject"
                  value={task.task}
                />
                <DetailTextField
                  label="Description"
                  value={data.description}
                  multiline
                />

                <Box sx={detailFactsSx}>
                  {[
                    {
                      label: "Estimated hours",
                      value: formatDecimalHours(task.est_hours),
                    },
                    {
                      label: "Target date",
                      value: formatDate(task.target_date),
                    },
                    {
                      label: "Task type",
                      value: task.type || "Unassigned",
                      capitalize: true,
                    },
                    {
                      label: "Related ticket",
                      value: task.ticket_number || "N/A",
                    },
                    {
                      label: "Reminder interval",
                      value: task.reminder_interval
                        ? `${task.reminder_interval} ${task.reminder_interval === 1 ? "day" : "days"}`
                        : "N/A",
                    },
                    {
                      label: "Current status",
                      value: task.current_status || "Open",
                      status: true,
                    },
                  ].map(({ label, ...field }) => (
                    <DetailField key={label} label={label} {...field} />
                  ))}
                </Box>
              </Box>
            </Grid>
            {/* RIGHT SIDE (Timeline) */}
            {task.logs?.length ? (
              <Grid size={{ xs: 12, md: 4 }}>
                <DetailChatPanel
                  title="Status / Comments"
                  badge={task.logs.length}
                >
                  {oldestFirst(task.logs).map((log: SelfTicketLog) => (
                    <DetailChatMessage
                      key={log.id}
                      mine={log.creator === userId}
                      name={log.creator_name || "User"}
                      time={formatDateTime(log.created_at)}
                    >
                      {log.comments || "No comments"}
                    </DetailChatMessage>
                  ))}
                </DetailChatPanel>
              </Grid>
            ) : (
              ""
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          {onEdit && (
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
          )}
          {["open","revised"].includes(task.current_status) &&
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
                    onClick={() => setCloseModelOpen(true)}
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
                color="warning"
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
